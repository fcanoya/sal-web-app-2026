const service = require("./patient.service");
const repository = require("./patient.repository");
const httpError = require("../../utils/httpError");

async function getOwn(req, res) {
    res.json({ data: await service.getOwn(req.user.id) });
}

async function updateOwn(req, res) {
    const patient = await service.getOwn(req.user.id);
    res.json({ data: await service.update(patient, req.body) });
}

async function list(req, res) {
    res.json({ data: await repository.findAll() });
}

async function getById(req, res) {
    res.json({ data: await service.getById(req.params.id) });
}

async function updateById(req, res) {
    const patient = await service.getById(req.params.id);
    res.json({ data: await service.update(patient, req.body) });
}

async function setStatus(req, res) {
    res.json({ data: await service.updateStatus(req.params.id, req.body.estado) });
}

async function history(req, res) {
    const patient = req.user.role === "PACIENTE"
        ? await service.getOwn(req.user.id)
        : await service.getById(req.params.id);
    if (req.user.role === "PACIENTE" && req.params.id &&
        req.params.id !== String(patient.id_paciente)) {
        throw httpError("Access denied", 403);
    }
    res.json({ data: await service.getHistory(patient.id_paciente) });
}

module.exports = { getOwn, updateOwn, list, getById, updateById, setStatus, history };
