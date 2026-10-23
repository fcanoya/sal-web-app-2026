function validateBody(req, res, next) {
    if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
        return res.status(400).json({ message: "A JSON object body is required" });
    }
    next();
}

module.exports = validateBody;
