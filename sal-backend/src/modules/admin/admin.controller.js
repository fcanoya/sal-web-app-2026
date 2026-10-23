const repository = require("./admin.repository");
const httpError = require("../../utils/httpError");

const editableKeys = new Set(["nombre_sistema", "correo_soporte", "telefono_soporte", "zona_horaria"]);

async function configuration(req, res) {
    res.json({ data: await repository.getConfiguration() });
}

async function updateConfiguration(req, res) {
    const { valor } = req.body;
    if (!editableKeys.has(req.params.key) ||
        typeof valor !== "string" || !valor.trim() || valor.length > 255) {
        throw httpError("Invalid configuration key or value", 400);
    }
    await repository.setConfiguration(req.params.key, valor.trim(), req.user.id);
    res.json({ message: "Configuration updated" });
}

async function roles(req, res) {
    res.json({ data: await repository.listRoles() });
}

async function changeRole(req, res) {
    const roleId = Number(req.body.id_rol);
    if (!Number.isInteger(roleId) || roleId <= 0) {
        throw httpError("A positive role ID is required", 400);
    }
    res.json({ data: await repository.changeRole(req.params.id, roleId, req.user.id) });
}

async function auditLog(req, res) {
    const requested = Number(req.query.limit || 100);
    const limit = Math.max(1, Math.min(Number.isInteger(requested) ? requested : 100, 500));
    res.json({ data: await repository.listAudit(limit) });
}

module.exports = { configuration, updateConfiguration, roles, changeRole, auditLog };
