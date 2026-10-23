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
        'SELECT id_rol, nombre FROM rol WHERE id_rol = ?',
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
u.id_rol_fk,
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
        u.id_rol_fk,
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
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const [admins] = await connection.execute(
            `SELECT u.id_usuario
             FROM usuario u
             INNER JOIN rol r ON r.id_rol = u.id_rol_fk
             WHERE r.nombre = 'SYSTEM_ADMIN' AND u.estado = 1 AND u.deleted_at IS NULL
             ORDER BY u.id_usuario FOR UPDATE`
        );
        const [users] = await connection.execute(
            `SELECT u.id_usuario, u.estado, r.nombre AS rol
             FROM usuario u INNER JOIN rol r ON r.id_rol = u.id_rol_fk
             WHERE u.id_usuario = ? AND u.deleted_at IS NULL
             FOR UPDATE`,
            [id]
        );
        if (!users[0]) {
            await connection.commit();
            return 0;
        }
        if (estado === 0 && Number(users[0].estado) === 1 &&
            users[0].rol === "SYSTEM_ADMIN" &&
            admins.filter((admin) => Number(admin.id_usuario) !== Number(id)).length === 0) {
            const error = new Error("The last active administrator cannot be deactivated");
            error.status = 409;
            throw error;
        }
        const [result] = await connection.execute(
            `UPDATE usuario SET estado = ?
             WHERE id_usuario = ? AND deleted_at IS NULL`,
            [estado, id]
        );
        await connection.commit();
        return result.affectedRows || 1;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}
// Eliminación lógica 
async function softDelete(id) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const [admins] = await connection.execute(
            `SELECT u.id_usuario
             FROM usuario u
             INNER JOIN rol r ON r.id_rol = u.id_rol_fk
             WHERE r.nombre = 'SYSTEM_ADMIN' AND u.estado = 1 AND u.deleted_at IS NULL
             ORDER BY u.id_usuario FOR UPDATE`
        );
        const [users] = await connection.execute(
            `SELECT u.id_usuario, u.estado, r.nombre AS rol
             FROM usuario u INNER JOIN rol r ON r.id_rol = u.id_rol_fk
             WHERE u.id_usuario = ? AND u.deleted_at IS NULL
             FOR UPDATE`,
            [id]
        );
        if (!users[0]) {
            await connection.commit();
            return 0;
        }
        if (Number(users[0].estado) === 1 && users[0].rol === "SYSTEM_ADMIN" &&
            admins.filter((admin) => Number(admin.id_usuario) !== Number(id)).length === 0) {
            const error = new Error("The last active administrator cannot be deleted");
            error.status = 409;
            throw error;
        }
        const [result] = await connection.execute(
            `UPDATE usuario SET deleted_at = NOW(), estado = 0
             WHERE id_usuario = ? AND deleted_at IS NULL`,
            [id]
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