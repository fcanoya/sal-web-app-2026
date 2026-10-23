const repository = require("./notification.repository");
const httpError = require("../../utils/httpError");

async function list(req, res) {
    res.json({ data: await repository.listForUser(req.user.id) });
}

async function markRead(req, res) {
    const changed = await repository.markRead(req.params.id, req.user.id);
    if (!changed) throw httpError("Notification not found", 404);
    res.status(204).end();
}

async function listAll(req, res) {
    res.json({ data: await repository.listAll() });
}

module.exports = { list, markRead, listAll };
