const service = require("./service.service");
const repository = require("./service.repository");

async function list(req, res) {
    res.json({ data: await repository.list(req.query.available === "true") });
}

async function get(req, res) {
    res.json({ data: await service.getById(req.params.id) });
}

async function create(req, res) {
    res.status(201).json({ data: await service.create(req.body) });
}

async function update(req, res) {
    res.json({ data: await service.update(req.params.id, req.body) });
}

module.exports = { list, get, create, update };
