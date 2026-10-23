const pool = require("../../config/database");

async function appointmentSummary(from, to) {
    const [rows] = await pool.execute(
        `SELECT estado_cita, COUNT(*) AS total
         FROM cita
         WHERE fecha_cita BETWEEN ? AND ?
         GROUP BY estado_cita
         ORDER BY estado_cita`,
        [from, to]
    );
    return rows;
}

async function appointmentRows(from, to) {
    const [rows] = await pool.execute(
        `SELECT c.id_cita, c.fecha_cita, c.hora_cita, c.estado_cita,
                c.motivo_consulta, p.id_paciente, pu.nombre AS paciente,
                d.id_doctor, du.nombre AS doctor, d.especialidad
         FROM cita c
         INNER JOIN paciente p ON p.id_paciente = c.id_paciente_fk
         INNER JOIN usuario pu ON pu.id_usuario = p.id_usuario_fk
         INNER JOIN doctor d ON d.id_doctor = c.id_doctor_fk
         INNER JOIN usuario du ON du.id_usuario = d.id_usuario_fk
         WHERE c.fecha_cita BETWEEN ? AND ?
         ORDER BY c.fecha_cita, c.hora_cita`,
        [from, to]
    );
    return rows;
}

async function patientCounts() {
    const [rows] = await pool.execute(
        `SELECT COUNT(*) AS total,
                SUM(CASE WHEN u.estado = 1 THEN 1 ELSE 0 END) AS activos,
                SUM(CASE WHEN u.estado = 0 THEN 1 ELSE 0 END) AS inactivos
         FROM paciente p
         INNER JOIN usuario u ON u.id_usuario = p.id_usuario_fk
         WHERE u.deleted_at IS NULL`
    );
    return rows[0];
}

async function doctorAvailability(from, to) {
    const [rows] = await pool.execute(
        `SELECT d.id_doctor, u.nombre, d.especialidad,
                (SELECT COUNT(*) FROM doctor_disponibilidad h
                 WHERE h.id_doctor_fk = d.id_doctor AND h.activo = 1) AS bloques_activos,
                (SELECT COALESCE(SUM(TIMESTAMPDIFF(MINUTE, h.hora_inicio, h.hora_fin) / 30), 0)
                 FROM doctor_disponibilidad h
                 WHERE h.id_doctor_fk = d.id_doctor AND h.activo = 1) AS cupos_semanales,
                (SELECT COUNT(*) FROM cita c
                 WHERE c.id_doctor_fk = d.id_doctor AND c.fecha_cita BETWEEN ? AND ?
                   AND c.estado_cita <> 'Cancelada') AS citas_en_periodo
         FROM doctor d
         INNER JOIN usuario u ON u.id_usuario = d.id_usuario_fk
         WHERE u.deleted_at IS NULL AND u.estado = 1
         ORDER BY u.nombre`
        ,
        [from, to]
    );
    return rows;
}

module.exports = { appointmentSummary, appointmentRows, patientCounts, doctorAvailability };
