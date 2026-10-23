const pool = require("../../config/database");

async function list() {
    const [rows] = await pool.execute(
        `SELECT d.id_doctor, d.id_usuario_fk, d.numero_licencia,
                d.especialidad, u.nombre, u.correo, u.estado
         FROM doctor d
         INNER JOIN usuario u ON u.id_usuario = d.id_usuario_fk
         WHERE u.deleted_at IS NULL
         ORDER BY u.nombre`
    );
    return rows;
}

async function findById(id) {
    const [rows] = await pool.execute(
        `SELECT d.id_doctor, d.id_usuario_fk, d.numero_licencia,
                d.especialidad, u.nombre, u.correo, u.estado
         FROM doctor d
         INNER JOIN usuario u ON u.id_usuario = d.id_usuario_fk
         WHERE d.id_doctor = ? AND u.deleted_at IS NULL`,
        [id]
    );
    return rows[0];
}

async function findSchedules(doctorId) {
    const [rows] = await pool.execute(
        `SELECT id_disponibilidad, dia_semana, hora_inicio, hora_fin, activo
         FROM doctor_disponibilidad
         WHERE id_doctor_fk = ?
         ORDER BY dia_semana, hora_inicio`,
        [doctorId]
    );
    return rows;
}

async function addSchedule(doctorId, weekday, start, end) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const [doctors] = await connection.execute(
            "SELECT id_doctor FROM doctor WHERE id_doctor = ? FOR UPDATE",
            [doctorId]
        );
        if (!doctors[0]) {
            const error = new Error("Doctor not found");
            error.status = 404;
            throw error;
        }
        const [overlaps] = await connection.execute(
            `SELECT id_disponibilidad
             FROM doctor_disponibilidad
             WHERE id_doctor_fk = ? AND dia_semana = ? AND activo = 1
               AND hora_inicio < ? AND hora_fin > ?
             LIMIT 1`,
            [doctorId, weekday, end, start]
        );
        if (overlaps[0]) {
            const error = new Error("Schedule overlaps an existing availability window");
            error.status = 409;
            throw error;
        }
        const [result] = await connection.execute(
            `INSERT INTO doctor_disponibilidad
                (id_doctor_fk, dia_semana, hora_inicio, hora_fin)
             VALUES (?, ?, ?, ?)`,
            [doctorId, weekday, start, end]
        );
        await connection.commit();
        return result.insertId;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

async function deleteSchedule(doctorId, scheduleId) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        await connection.execute(
            "SELECT id_doctor FROM doctor WHERE id_doctor = ? FOR UPDATE",
            [doctorId]
        );
        const [result] = await connection.execute(
            `DELETE FROM doctor_disponibilidad
             WHERE id_disponibilidad = ? AND id_doctor_fk = ?`,
            [scheduleId, doctorId]
        );
        await connection.commit();
        return result.affectedRows;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

async function addDoctor(data) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const [roleRows] = await connection.execute(
            "SELECT id_rol FROM rol WHERE nombre = 'DOCTOR' LIMIT 1"
        );
        if (!roleRows[0]) {
            const error = new Error("Required DOCTOR role is not configured");
            error.status = 500;
            throw error;
        }
        const [userResult] = await connection.execute(
            `INSERT INTO usuario (nombre, correo, contrasena, id_rol_fk)
             VALUES (?, ?, ?, ?)`,
            [data.nombre, data.correo, data.contrasena, roleRows[0].id_rol]
        );
        const [doctorResult] = await connection.execute(
            `INSERT INTO doctor (id_usuario_fk, numero_licencia, especialidad)
             VALUES (?, ?, ?)`,
            [userResult.insertId, data.numero_licencia, data.especialidad]
        );
        await connection.commit();
        return doctorResult.insertId;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

async function update(id, data) {
    const doctor = await findById(id);
    if (!doctor) return false;
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        await connection.execute(
            "UPDATE usuario SET nombre = ?, correo = ? WHERE id_usuario = ?",
            [data.nombre, data.correo, doctor.id_usuario_fk]
        );
        await connection.execute(
            `UPDATE doctor SET numero_licencia = ?, especialidad = ?
             WHERE id_doctor = ?`,
            [data.numero_licencia, data.especialidad, id]
        );
        await connection.commit();
        return true;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

async function availableSlots(doctorId, date, weekday) {
    const [windows] = await pool.execute(
        `SELECT hora_inicio, hora_fin
         FROM doctor_disponibilidad
         WHERE id_doctor_fk = ? AND dia_semana = ? AND activo = 1
         ORDER BY hora_inicio`,
        [doctorId, weekday]
    );
    const [booked] = await pool.execute(
        `SELECT hora_cita FROM cita
         WHERE id_doctor_fk = ? AND fecha_cita = ? AND estado_cita <> 'Cancelada'`,
        [doctorId, date]
    );
    const reserved = new Set(booked.map((row) => String(row.hora_cita).slice(0, 5)));
    const slots = [];
    for (const window of windows) {
        const start = String(window.hora_inicio).slice(0, 5).split(":").map(Number);
        const end = String(window.hora_fin).slice(0, 5).split(":").map(Number);
        let minutes = start[0] * 60 + start[1];
        const lastStart = end[0] * 60 + end[1] - 30;
        while (minutes <= lastStart) {
            const time = `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
            if (!reserved.has(time)) slots.push(time);
            minutes += 30;
        }
    }
    return slots;
}

module.exports = {
    list, findById, findSchedules, addSchedule,
    deleteSchedule, addDoctor, update, availableSlots
};
