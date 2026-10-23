const pool = require("../../config/database");

async function enqueue(connection, userId, appointmentId, type, message) {
    await connection.execute(
        `INSERT INTO notificacion (id_usuario_fk, id_cita_fk, canal, tipo, mensaje)
         VALUES (?, ?, 'EMAIL', ?, ?)`,
        [userId, appointmentId, type, message]
    );
}

async function enqueueForDoctor(connection, doctorId, appointmentId, type, message) {
    await connection.execute(
        `INSERT INTO notificacion (id_usuario_fk, id_cita_fk, canal, tipo, mensaje)
         SELECT u.id_usuario, ?, 'EMAIL', ?, ?
         FROM doctor d
         INNER JOIN usuario u ON u.id_usuario = d.id_usuario_fk
         WHERE d.id_doctor = ?`,
        [appointmentId, type, message, doctorId]
    );
}

async function listForUser(userId) {
    const [rows] = await pool.execute(
        `SELECT id_notificacion, id_cita_fk, canal, tipo, mensaje, estado,
                creado_en, leido_en
         FROM notificacion
         WHERE id_usuario_fk = ?
         ORDER BY creado_en DESC
         LIMIT 100`,
        [userId]
    );
    return rows;
}

async function markRead(id, userId) {
    const [rows] = await pool.execute(
        "SELECT id_notificacion FROM notificacion WHERE id_notificacion = ? AND id_usuario_fk = ?",
        [id, userId]
    );
    if (!rows[0]) return false;
    const [result] = await pool.execute(
        `UPDATE notificacion
         SET leido_en = CURRENT_TIMESTAMP
         WHERE id_notificacion = ? AND id_usuario_fk = ?`,
        [id, userId]
    );
    return result.affectedRows > 0 || Boolean(rows[0]);
}

async function listAll() {
    const [rows] = await pool.execute(
        `SELECT id_notificacion, id_usuario_fk, id_cita_fk, canal, tipo,
                mensaje, estado, creado_en, leido_en
         FROM notificacion
         ORDER BY creado_en DESC
         LIMIT 500`
    );
    return rows;
}

module.exports = { enqueue, enqueueForDoctor, listForUser, markRead, listAll };
