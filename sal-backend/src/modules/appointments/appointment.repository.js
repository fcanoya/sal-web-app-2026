const pool = require("../../config/database");
const notificationRepository = require("../notifications/notification.repository");

async function create(data) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const [doctorRows] = await connection.execute(
            `SELECT d.id_doctor
             FROM doctor d
             INNER JOIN usuario u ON u.id_usuario = d.id_usuario_fk
             WHERE d.id_doctor = ? AND u.estado = 1 AND u.deleted_at IS NULL
             FOR UPDATE`,
            [data.id_doctor]
        );
        if (!doctorRows[0]) {
            const error = new Error("Active doctor not found");
            error.status = 404;
            throw error;
        }
        const patientOwnerClause = data.actorRole === "PACIENTE"
            ? "AND p.id_usuario_fk = ?"
            : "";
        const patientParams = data.actorRole === "PACIENTE"
            ? [data.id_paciente, data.userId]
            : [data.id_paciente];
        const [patientRows] = await connection.execute(
            `SELECT p.id_paciente, p.id_usuario_fk
             FROM paciente p
             INNER JOIN usuario u ON u.id_usuario = p.id_usuario_fk
             WHERE p.id_paciente = ? ${patientOwnerClause}
               AND u.estado = 1 AND u.deleted_at IS NULL
             FOR UPDATE`,
            patientParams
        );
        if (!patientRows[0]) {
            const error = new Error("Active patient profile not found");
            error.status = 404;
            throw error;
        }
        const [scheduleRows] = await connection.execute(
            `SELECT id_disponibilidad
             FROM doctor_disponibilidad
             WHERE id_doctor_fk = ? AND dia_semana = ?
               AND activo = 1 AND hora_inicio <= ? AND hora_fin >= ADDTIME(?, '00:30:00')
             LIMIT 1`,
            [data.id_doctor, data.weekday, data.hora_cita, data.hora_cita]
        );
        if (!scheduleRows[0]) {
            const error = new Error("Requested time is outside doctor availability");
            error.status = 409;
            throw error;
        }
        const [serviceRows] = await connection.query(
            `SELECT id_servicio FROM servicio
             WHERE estado = 'Activo' AND id_servicio IN (${data.serviceIds.map(() => "?").join(",")})`,
            data.serviceIds
        );
        if (serviceRows.length !== data.serviceIds.length) {
            const error = new Error("One or more services are unavailable");
            error.status = 409;
            throw error;
        }
        const [conflicts] = await connection.execute(
            `SELECT id_cita
             FROM cita
             WHERE estado_cita <> 'Cancelada'
               AND fecha_cita = ?
               AND (
                    (id_doctor_fk = ? AND hora_cita < ADDTIME(?, '00:30:00')
                     AND ADDTIME(hora_cita, '00:30:00') > ?)
                    OR
                    (id_paciente_fk = ? AND hora_cita < ADDTIME(?, '00:30:00')
                     AND ADDTIME(hora_cita, '00:30:00') > ?)
               )
             LIMIT 1`,
            [
                data.fecha_cita, data.id_doctor, data.hora_cita, data.hora_cita,
                data.id_paciente, data.hora_cita, data.hora_cita
            ]
        );
        if (conflicts[0]) {
            const error = new Error("The doctor or patient already has an appointment at that time");
            error.status = 409;
            throw error;
        }
        const [appointment] = await connection.execute(
            `INSERT INTO cita
                (fecha_cita, hora_cita, motivo_consulta, id_paciente_fk, id_doctor_fk)
             VALUES (?, ?, ?, ?, ?)`,
            [data.fecha_cita, data.hora_cita, data.motivo_consulta || null,
                data.id_paciente, data.id_doctor]
        );
        for (const serviceId of data.serviceIds) {
            await connection.execute(
                "INSERT INTO cita_servicio (id_cita_fk, id_servicio_fk) VALUES (?, ?)",
                [appointment.insertId, serviceId]
            );
        }
        await connection.execute(
            `INSERT INTO historial_estado_cita (id_cita_fk, estado_cita, id_usuario_fk)
             VALUES (?, 'Pendiente', ?)`,
            [appointment.insertId, data.userId]
        );
        await notificationRepository.enqueue(
            connection,
            patientRows[0].id_usuario_fk,
            appointment.insertId,
            "CONFIRMACION",
            "Se recibió la solicitud de cita y está pendiente de confirmación."
        );
        await notificationRepository.enqueueForDoctor(
            connection,
            data.id_doctor,
            appointment.insertId,
            "NUEVA_CITA",
            "Se recibió una nueva solicitud de cita."
        );
        await connection.commit();
        return appointment.insertId;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

async function listForUser(user) {
    let sql = `SELECT c.id_cita, c.fecha_cita, c.hora_cita, c.motivo_consulta,
                      c.estado_cita, c.observaciones, c.id_paciente_fk, c.id_doctor_fk,
                      pu.nombre AS paciente, du.nombre AS doctor, d.especialidad
               FROM cita c
               INNER JOIN paciente p ON p.id_paciente = c.id_paciente_fk
               INNER JOIN usuario pu ON pu.id_usuario = p.id_usuario_fk
               INNER JOIN doctor d ON d.id_doctor = c.id_doctor_fk
               INNER JOIN usuario du ON du.id_usuario = d.id_usuario_fk`;
    const params = [];
    if (user.role === "PACIENTE") {
        sql += " WHERE p.id_usuario_fk = ?";
        params.push(user.id);
    } else if (user.role === "DOCTOR") {
        sql += " WHERE d.id_usuario_fk = ?";
        params.push(user.id);
    }
    sql += " ORDER BY c.fecha_cita DESC, c.hora_cita DESC";
    const [rows] = await pool.execute(sql, params);
    return rows;
}

async function findById(id) {
    const [rows] = await pool.execute(
        `SELECT c.id_cita, c.fecha_cita, c.hora_cita, c.motivo_consulta,
                c.estado_cita, c.observaciones, c.id_paciente_fk, c.id_doctor_fk,
                p.id_usuario_fk AS patient_user_id, d.id_usuario_fk AS doctor_user_id
         FROM cita c
         INNER JOIN paciente p ON p.id_paciente = c.id_paciente_fk
         INNER JOIN doctor d ON d.id_doctor = c.id_doctor_fk
         WHERE c.id_cita = ?`,
        [id]
    );
    if (!rows[0]) return undefined;
    const [services] = await pool.execute(
        `SELECT s.id_servicio, s.descripcion_servicio, s.costo_servicio
         FROM cita_servicio cs
         INNER JOIN servicio s ON s.id_servicio = cs.id_servicio_fk
         WHERE cs.id_cita_fk = ?`,
        [id]
    );
    return { ...rows[0], servicios: services };
}

async function getHistory(id) {
    const [rows] = await pool.execute(
        `SELECT h.estado_cita, h.observacion, h.creado_en, u.nombre AS actor
         FROM historial_estado_cita h
         LEFT JOIN usuario u ON u.id_usuario = h.id_usuario_fk
         WHERE h.id_cita_fk = ?
         ORDER BY h.creado_en`,
        [id]
    );
    return rows;
}

async function updateStatus(id, status, userId, message, expectedStatus) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const [appointments] = await connection.execute(
            "SELECT estado_cita FROM cita WHERE id_cita = ? FOR UPDATE",
            [id]
        );
        if (!appointments[0]) {
            const error = new Error("Appointment not found");
            error.status = 404;
            throw error;
        }
        if (appointments[0].estado_cita !== expectedStatus) {
            const error = new Error("Appointment status changed; reload before retrying");
            error.status = 409;
            throw error;
        }
        const [result] = await connection.execute(
            "UPDATE cita SET estado_cita = ? WHERE id_cita = ?",
            [status, id]
        );
        if (!result.affectedRows) {
            const error = new Error("Appointment not found");
            error.status = 404;
            throw error;
        }
        await connection.execute(
            `INSERT INTO historial_estado_cita
                (id_cita_fk, estado_cita, id_usuario_fk, observacion)
             VALUES (?, ?, ?, ?)`,
            [id, status, userId, message || null]
        );
        const [patientRows] = await connection.execute(
            `SELECT u.id_usuario
             FROM cita c
             INNER JOIN paciente p ON p.id_paciente = c.id_paciente_fk
             INNER JOIN usuario u ON u.id_usuario = p.id_usuario_fk
             WHERE c.id_cita = ?`,
            [id]
        );
        const [doctorRows] = await connection.execute(
            `SELECT u.id_usuario
             FROM cita c
             INNER JOIN doctor d ON d.id_doctor = c.id_doctor_fk
             INNER JOIN usuario u ON u.id_usuario = d.id_usuario_fk
             WHERE c.id_cita = ?`,
            [id]
        );
        if (patientRows[0]) {
            await notificationRepository.enqueue(
                connection, patientRows[0].id_usuario, id, "CAMBIO_ESTADO",
                `El estado de su cita cambió a ${status}.`
            );
        }
        if (doctorRows[0]) {
            await notificationRepository.enqueue(
                connection, doctorRows[0].id_usuario, id, "CAMBIO_ESTADO",
                `El estado de una cita asignada cambió a ${status}.`
            );
        }
        await connection.commit();
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

module.exports = { create, listForUser, findById, getHistory, updateStatus };
