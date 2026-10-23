const pool = require("../../config/database");

async function findByUserId(userId) {
    const [rows] = await pool.execute(
        `SELECT p.id_paciente, p.id_usuario_fk, p.tipo_afiliacion,
                p.fecha_nacimiento, p.genero, p.direccion,
                u.nombre, u.correo, u.estado
         FROM paciente p
         INNER JOIN usuario u ON u.id_usuario = p.id_usuario_fk
         WHERE p.id_usuario_fk = ? AND u.deleted_at IS NULL`,
        [userId]
    );
    return rows[0];
}

async function findById(id) {
    const [rows] = await pool.execute(
        `SELECT p.id_paciente, p.id_usuario_fk, p.tipo_afiliacion,
                p.fecha_nacimiento, p.genero, p.direccion,
                u.nombre, u.correo, u.estado
         FROM paciente p
         INNER JOIN usuario u ON u.id_usuario = p.id_usuario_fk
         WHERE p.id_paciente = ? AND u.deleted_at IS NULL`,
        [id]
    );
    return rows[0];
}

async function findAll() {
    const [rows] = await pool.execute(
        `SELECT p.id_paciente, p.id_usuario_fk, p.tipo_afiliacion,
                p.fecha_nacimiento, p.genero, p.direccion,
                u.nombre, u.correo, u.estado
         FROM paciente p
         INNER JOIN usuario u ON u.id_usuario = p.id_usuario_fk
         WHERE u.deleted_at IS NULL
         ORDER BY u.nombre`
    );
    return rows;
}

async function update(patient, data) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        await connection.execute(
            "UPDATE usuario SET nombre = ?, correo = ? WHERE id_usuario = ? AND deleted_at IS NULL",
            [data.nombre, data.correo, patient.id_usuario_fk]
        );
        await connection.execute(
            `UPDATE paciente
             SET tipo_afiliacion = ?, fecha_nacimiento = ?, genero = ?, direccion = ?
             WHERE id_paciente = ?`,
            [
                data.tipo_afiliacion || null,
                data.fecha_nacimiento || null,
                data.genero || null,
                data.direccion || null,
                patient.id_paciente
            ]
        );
        await connection.commit();
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

async function updateStatus(id, status) {
    const [result] = await pool.execute(
        `UPDATE usuario u
         INNER JOIN paciente p ON p.id_usuario_fk = u.id_usuario
         SET u.estado = ?
         WHERE p.id_paciente = ? AND u.deleted_at IS NULL`,
        [status, id]
    );
    return result.affectedRows;
}

async function getAppointments(id) {
    const [rows] = await pool.execute(
        `SELECT c.id_cita, c.fecha_cita, c.hora_cita, c.motivo_consulta,
                c.estado_cita, d.id_doctor, u.nombre AS doctor,
                d.especialidad
         FROM cita c
         INNER JOIN doctor d ON d.id_doctor = c.id_doctor_fk
         INNER JOIN usuario u ON u.id_usuario = d.id_usuario_fk
         WHERE c.id_paciente_fk = ?
         ORDER BY c.fecha_cita DESC, c.hora_cita DESC`,
        [id]
    );
    return rows;
}

module.exports = { findByUserId, findById, findAll, update, updateStatus, getAppointments };
