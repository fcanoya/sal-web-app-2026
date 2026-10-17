const pool = require('../../config/database');

// Buscar usuario por correo 
async function findByEmail(email) {
    const [rows] = await pool.execute(
        `SELECT id_usuario 
FROM usuario 
WHERE correo = ? 
AND deleted_at IS NULL`,
        [email]
    );
    return rows[0];
}
// Buscar rol por ID 
async function findRoleById(roleId) {
    const [rows] = await pool.execute(
        'SELECT id_rol FROM rol WHERE id_rol = ?',
        [roleId]
    );
    return rows[0];
}
// Crear usuario 
async function create(user) {
    const { nombre, correo, contrasena, id_rol } = user;
    const [result] = await pool.execute(
        `INSERT INTO usuario 
(nombre, correo, contrasena, id_rol_fk) 
VALUES (?, ?, ?, ?)`,
        [nombre, correo, contrasena, id_rol]
    );
    return result.insertId;
}
// Listar usuarios 
async function findAll() {
    const [rows] = await pool.execute(
        `SELECT 
u.id_usuario, 
        u.nombre, 
        u.correo, 
        u.estado, 
        r.id_rol, 
        r.nombre AS rol 
     FROM usuario u 
     INNER JOIN rol r ON u.id_rol_fk = r.id_rol 
     WHERE u.deleted_at IS NULL`
    );

    return rows;
}

// Buscar usuario por ID 
async function findById(id) {
    const [rows] = await pool.execute(
        `SELECT 
        u.id_usuario, 
        u.nombre, 
        u.correo, 
        u.estado, 
        r.id_rol, 
        r.nombre AS rol 
     FROM usuario u 
     INNER JOIN rol r ON u.id_rol_fk = r.id_rol 
     WHERE u.id_usuario = ? 
     AND u.deleted_at IS NULL`,
        [id]
    );

    return rows[0];
}

// Actualizar usuario 
async function update(id, user) {
    const { nombre, correo, id_rol } = user;

    const [result] = await pool.execute(
        `UPDATE usuario 
     SET nombre = ?, correo = ?, id_rol_fk = ? 
     WHERE id_usuario = ? 
     AND deleted_at IS NULL`,
        [nombre, correo, id_rol, id]
    );

    return result.affectedRows;
}

// Cambiar estado 
async function updateStatus(id, estado) {
    const [result] = await pool.execute(
        `UPDATE usuario 
     SET estado = ? 
     WHERE id_usuario = ? 
     AND deleted_at IS NULL`,
        [estado, id]
    );
    return result.affectedRows;
}
// Eliminación lógica 
async function softDelete(id) {
    const [result] = await pool.execute(
        `UPDATE usuario 
SET deleted_at = NOW(), 
estado = 0 
WHERE id_usuario = ? 
AND deleted_at IS NULL`,
        [id]
    );
    return result.affectedRows;
}
module.exports = {
    findByEmail,
    findRoleById,
    create,
    findAll,
    findById,
    update,
    updateStatus,
    softDelete
}; 