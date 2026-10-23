const service = require("./doctor.service");
const repository = require("./doctor.repository");
const httpError = require("../../utils/httpError");

async function list(req, res) {
    res.json({ data: await repository.list() });
}

async function get(req, res) {
    res.json({ data: await service.getById(req.params.id) });
}

async function create(req, res) {
    res.status(201).json({ data: await service.add(req.body) });
}

async function update(req, res) {
    res.json({ data: await service.update(req.params.id, req.body) });
}

async function schedules(req, res) {
    await service.getById(req.params.id);
    res.json({ data: await repository.findSchedules(req.params.id) });
}

async function addSchedule(req, res) {
    res.status(201).json({ data: await service.addSchedule(req.params.id, req.body) });
}

async function deleteSchedule(req, res) {
    const deleted = await repository.deleteSchedule(req.params.id, req.params.scheduleId);
    if (!deleted) throw httpError("Availability window not found", 404);
    res.status(204).end();
}

async function availableSlots(req, res) {
    res.json({ data: await service.availableSlots(req.params.id, req.query.date) });
}

module.exports = { list, get, create, update, schedules, addSchedule, deleteSchedule, availableSlots };
