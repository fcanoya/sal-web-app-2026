function validateCreateUser(req, res, next) {
    const { nombre, correo, contrasena, id_rol } = req.body;
    // Campos obligatorios
    if (!nombre || !correo || !contrasena || id_rol === undefined) {
        return res.status(400).json({
            message: 'All fields are required'
        });
    }
    // Nombre
    if (typeof nombre !== 'string' || nombre.trim().length < 2) {
        return res.status(400).json({
            message: 'Name must contain at least 2 characters'
        });
    }
    // Correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
        return res.status(400).json({
            message: 'Invalid email format'
        });
    }
    // Contraseña
    if (typeof contrasena !== 'string' || contrasena.length < 8) {
        return res.status(400).json({
            message: 'Password must contain at least 8 characters'
        });
    }
    // Rol
    if (!Number.isInteger(id_rol) || id_rol <= 0) {
        return res.status(400).json({
            message: 'Role ID must be a positive integer'
        });
    }
    next();
}//fin validateCreateUser

// Validar ID 
function validateUserId(req, res, next) {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            message: 'Invalid user ID'
        });
    }
    next();
}
// Validar actualización 
function validateUpdateUser(req, res, next) {
    const { nombre, correo, id_rol } = req.body;
    if (!nombre || !correo || id_rol === undefined) {
        return res.status(400).json({
            message: 'All fields are required'
        });
    }

    if (typeof nombre !== 'string' || nombre.trim().length < 2) {
        return res.status(400).json({
            message: 'Invalid name'
        });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(correo)) {
        return res.status(400).json({
            message: 'Invalid email format'
        });
    }

    if (!Number.isInteger(id_rol) || id_rol <= 0) {
        return res.status(400).json({
            message: 'Invalid role ID'
        });
    }

    next();
}

// Validar estado 
function validateStatus(req, res, next) {
    const { estado } = req.body;

    if (estado !== 0 && estado !== 1) {
        return res.status(400).json({
            message: 'Status must be 0 or 1'
        });
    }

    next();
}

module.exports = {
    validateCreateUser,
    validateUserId,
    validateUpdateUser,
    validateStatus,
};