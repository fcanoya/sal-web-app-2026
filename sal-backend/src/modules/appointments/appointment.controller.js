const service = require("./appointment.service");
const repository = require("./appointment.repository");
const pool = require("../../config/database");
const httpError = require("../../utils/httpError");

async function create(req, res) {
    const data = { ...req.body, id_paciente: req.body.id_paciente };
    if (req.user.role === "PACIENTE") delete data.id_paciente;
    if (!data.id_paciente && req.user.role === "PACIENTE") {
        const [rows] = await pool.execute(
            "SELECT id_paciente FROM paciente WHERE id_usuario_fk = ?",
            [req.user.id]
        );
        if (!rows[0]) {
            throw httpError("Patient profile not found", 404);
        }
        data.id_paciente = rows[0].id_paciente;
    }
    res.status(201).json({ data: await service.create(req.user, data) });
}

async function history(req, res) {
    const appointment = await service.getAccessible(req.user, req.params.id);
    res.json({ data: await repository.getHistory(appointment.id_cita) });
}

async function get(req, res) {
    res.json({ data: await service.getById(req.user, req.params.id) });
}

async function list(req, res) {
    res.json({ data: await repository.listForUser(req.user) });
}

async function changeStatus(req, res) {
    res.json({
        data: await service.changeStatus(req.user, req.params.id, req.body.estado, req.body.observaciones)
    });
}

module.exports = { create, get, list, changeStatus, history };
