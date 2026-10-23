const { isValidDate } = require("../../utils/date");

function validateLogin(req, res, next) {
    const { correo, contrasena } = req.body;
    if (
        typeof correo !== "string" ||
        !correo.trim() ||
        typeof contrasena !== "string" ||
        !contrasena
    ) {
        return res.status(400).json({
            message: "Email and password are required"
        });
    }
    next();
}

function validateRegistration(req, res, next) {
    const { nombre, correo, contrasena } = req.body;
    if (typeof nombre !== "string" || nombre.trim().length < 2 || nombre.trim().length > 100) {
        return res.status(400).json({ message: "Name must contain at least 2 characters" });
    }
    if (typeof correo !== "string" || correo.trim().length > 150 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim())) {
        return res.status(400).json({ message: "Invalid email format" });
    }
    if (typeof contrasena !== "string" || contrasena.length < 8 ||
        Buffer.byteLength(contrasena, "utf8") > 72) {
        return res.status(400).json({ message: "Password must contain at least 8 characters and at most 72 UTF-8 bytes" });
    }
    if (req.body.tipo_afiliacion !== undefined && req.body.tipo_afiliacion !== null &&
        !["Contributivo", "Subsidiado", "Particular"].includes(req.body.tipo_afiliacion)) {
        return res.status(400).json({ message: "Invalid affiliation type" });
    }
    if (req.body.genero !== undefined && req.body.genero !== null &&
        !["M", "F", "Otro"].includes(req.body.genero)) {
        return res.status(400).json({ message: "Invalid gender" });
    }
    if (req.body.fecha_nacimiento !== undefined && req.body.fecha_nacimiento !== null &&
        !isValidDate(req.body.fecha_nacimiento)) {
        return res.status(400).json({ message: "Birth date must use YYYY-MM-DD" });
    }
    if (req.body.fecha_nacimiento && req.body.fecha_nacimiento > new Date().toISOString().slice(0, 10)) {
        return res.status(400).json({ message: "Birth date must not be in the future" });
    }
    if (req.body.direccion !== undefined && req.body.direccion !== null &&
        (typeof req.body.direccion !== "string" || req.body.direccion.length > 150)) {
        return res.status(400).json({ message: "Address must contain at most 150 characters" });
    }
    next();
}

module.exports = { validateLogin, validateRegistration };