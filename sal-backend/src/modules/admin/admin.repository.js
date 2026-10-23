const pool = require("../../config/database");

async function getConfiguration() {
    const [rows] = await pool.execute(
        `SELECT clave, valor, actualizado_en
         FROM configuracion_sistema
         ORDER BY clave`
    );
    return rows;
}

async function setConfiguration(key, value, userId) {
    await pool.execute(
        `INSERT INTO configuracion_sistema (clave, valor, actualizado_por_fk)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE
            valor = VALUES(valor),
            actualizado_por_fk = VALUES(actualizado_por_fk),
            actualizado_en = CURRENT_TIMESTAMP`,
        [key, value, userId]
    );
}

async function listRoles() {
    const [rows] = await pool.execute(
        "SELECT id_rol, nombre, descripcion FROM rol ORDER BY id_rol"
    );
    return rows;
}

async function listAudit(limit) {
    const [rows] = await pool.execute(
        `SELECT a.id_auditoria, a.id_usuario_fk, u.nombre AS usuario,
                a.accion, a.entidad, a.id_entidad, a.resultado, a.creado_en
         FROM registro_auditoria a
         LEFT JOIN usuario u ON u.id_usuario = a.id_usuario_fk
         ORDER BY a.creado_en DESC
         LIMIT ?`,
        [limit]
    );
    return rows;
}

async function changeRole(userId, roleId, actorId) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const [activeAdmins] = await connection.execute(
            `SELECT u.id_usuario
             FROM usuario u
             INNER JOIN rol r ON r.id_rol = u.id_rol_fk
             WHERE r.nombre = 'SYSTEM_ADMIN' AND u.estado = 1 AND u.deleted_at IS NULL
             ORDER BY u.id_usuario FOR UPDATE`
        );
        const [roles] = await connection.execute(
            "SELECT id_rol, nombre FROM rol WHERE id_rol = ?",
            [roleId]
        );
        if (!roles[0]) {
            const error = new Error("Role not found");
            error.status = 404;
            throw error;
        }
        const [users] = await connection.execute(
            "SELECT id_rol_fk, estado FROM usuario WHERE id_usuario = ? AND deleted_at IS NULL FOR UPDATE",
            [userId]
        );
        if (!users[0]) {
            const error = new Error("User not found");
            error.status = 404;
            throw error;
        }
        if (Number(userId) === Number(actorId)) {
            const error = new Error("Administrators cannot change their own role");
            error.status = 409;
            throw error;
        }
        const [currentRole] = await connection.execute(
            "SELECT nombre FROM rol WHERE id_rol = ?",
            [users[0].id_rol_fk]
        );
        if (roles[0].nombre === "DOCTOR" || roles[0].nombre === "PACIENTE") {
            const table = roles[0].nombre === "DOCTOR" ? "doctor" : "paciente";
            const key = roles[0].nombre === "DOCTOR" ? "id_doctor" : "id_paciente";
            const [profiles] = await connection.execute(
                `SELECT ${key} FROM ${table} WHERE id_usuario_fk = ?`,
                [userId]
            );
            if (!profiles[0]) {
                const error = new Error(`A ${roles[0].nombre} profile is required before assigning this role`);
                error.status = 409;
                throw error;
            }
        }
        if (currentRole[0].nombre === "SYSTEM_ADMIN" && roles[0].nombre !== "SYSTEM_ADMIN") {
            const targetIsActive = Number(users[0].estado) === 1;
            if (targetIsActive && activeAdmins.length <= 1) {
                const error = new Error("The last active administrator cannot be demoted");
                error.status = 409;
                throw error;
            }
        }
        await connection.execute(
            "UPDATE usuario SET id_rol_fk = ? WHERE id_usuario = ?",
            [roleId, userId]
        );
        await connection.commit();
        return { id_usuario: Number(userId), id_rol: roleId, rol: roles[0].nombre };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

module.exports = { getConfiguration, setConfiguration, listRoles, listAudit, changeRole };
