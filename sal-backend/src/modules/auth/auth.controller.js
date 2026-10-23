const authService = require("./auth.service");

async function register(req, res, next) {
    try {
        const data = await authService.registerPatient(req.body);
        return res.status(201).json({
            message: "Patient registered successfully",
            data
        });
    } catch (error) {
        next(error);
    }
}

async function login(req, res, next) {
    try {
        const { correo, contrasena } = req.body;
        const result = await authService.login(
            correo,
            contrasena
        );
        return res.status(200).json({
            message: "Login successful",
            data: result
        });
    } catch (error) {
        next(error);
    }
}
module.exports = { register, login };