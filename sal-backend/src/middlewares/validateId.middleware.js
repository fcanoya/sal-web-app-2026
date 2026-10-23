function validateId(parameter = "id") {
    return function validateRouteId(req, res, next) {
        const id = Number(req.params[parameter]);
        if (!Number.isSafeInteger(id) || id <= 0) {
            return res.status(400).json({ message: `Invalid ${parameter}` });
        }
        req.params[parameter] = id;
        next();
    };
}

module.exports = validateId;
