const pool = require("../config/database");

function audit(action, entity) {
    return function auditRequest(req, res, next) {
        res.on("finish", () => {
            pool.execute(
                `INSERT INTO registro_auditoria
                    (id_usuario_fk, accion, entidad, id_entidad, resultado)
                 VALUES (?, ?, ?, ?, ?)`,
                [
                    req.user ? req.user.id : null,
                    action,
                    entity,
                    req.params.id ? String(req.params.id) : null,
                    res.statusCode
                ]
            ).catch((error) => console.error("Audit log write failed:", error.message));
        });
        next();
    };
}

module.exports = audit;
