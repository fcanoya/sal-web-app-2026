const pool = require("../../config/database");
async function findByEmail(correo) {
    const [rows] = await pool.execute(
        `SELECT 
            u.id_usuario,
            u.nombre,
            u.correo,
            u.contrasena,
            u.id_rol_fk,
            r.nombre AS rol,
            u.estado
         FROM usuario u
         INNER JOIN rol r ON r.id_rol = u.id_rol_fk
         WHERE u.correo = ?`,
        [String(correo).trim().toLowerCase()]
    );
    return rows[0];
}
async function findById(id) {
    const [rows] = await pool.execute(
        `SELECT 
            u.id_usuario,
            u.nombre,
            u.correo,
            u.id_rol_fk,
            r.nombre AS rol,
            u.estado
         FROM usuario u
         INNER JOIN rol r ON r.id_rol = u.id_rol_fk
         WHERE u.id_usuario = ?
           AND u.deleted_at IS NULL`,
        [id]
    );
    return rows[0];
}

async function findRoleByName(name) {
    const [rows] = await pool.execute(
        "SELECT id_rol, nombre FROM rol WHERE nombre = ?",
        [name]
    );
    return rows[0];
}

async function createPatient(user, patient) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const [userResult] = await connection.execute(
            `INSERT INTO usuario (nombre, correo, contrasena, id_rol_fk)
             VALUES (?, ?, ?, ?)`,
            [user.nombre, user.correo, user.contrasena, user.id_rol_fk]
        );
        const [patientResult] = await connection.execute(
            `INSERT INTO paciente
                (id_usuario_fk, tipo_afiliacion, fecha_nacimiento, genero, direccion)
             VALUES (?, ?, ?, ?, ?)`,
            [
                userResult.insertId,
                patient.tipo_afiliacion || null,
                patient.fecha_nacimiento || null,
                patient.genero || null,
                patient.direccion || null
            ]
        );
        await connection.commit();
        return { id_usuario: userResult.insertId, id_paciente: patientResult.insertId };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

module.exports = {
    findByEmail,
    findById,
    findRoleByName,
    createPatient
};