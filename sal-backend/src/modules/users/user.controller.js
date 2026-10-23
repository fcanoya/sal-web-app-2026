const userService = require('./user.service');
const authService = require("../auth/auth.service");


async function createUser(req, res, next) {
    try {
        const user = await userService.createUser(req.body);
        return res.status(201).json({
            message: 'User created successfully',
            data: user
        });
    } catch (error) {
        next(error);
    }
}//fin createUser

// Listar usuarios 
async function getUsers(req, res, next) {
    try {
        const users = await userService.getUsers();

        return res.status(200).json({
            data: users
        });
    } catch (error) {
        next(error);
    }
}

// Consultar usuario por ID 
async function getUserById(req, res, next) {
    try {
        const user =
            await userService.getUserById(req.params.id);

        return res.status(200).json({
            data: user
        });
    } catch (error) {
        next(error);
    }
}

// Actualizar usuario 
async function updateUser(req, res, next) {
    try {
        const user = await userService.updateUser(
            req.params.id,
            req.body
        );

        return res.status(200).json({
            message: 'User updated successfully',
            data: user
        });
    } catch (error) {
        next(error);
    }
}

// Cambiar estado 
async function changeUserStatus(req, res, next) {
    try {
        const user =
            await userService.changeUserStatus(
                req.params.id,
                req.body.estado
            );

        return res.status(200).json({
            message: 'User status updated successfully',
            data: user
        });
    } catch (error) {
        next(error);
    }
}
// Eliminación lógica 
async function deleteUser(req, res, next) {
    try {
        await userService.deleteUser(req.params.id);
        return res.status(200).json({
            message: 'User deleted successfully'
        });
    } catch (error) {
        next(error);
    }
}

async function getMyProfile(req, res, next) {
    try {
        const user = await authService.getProfile(req.user.id);
        return res.status(200).json({
            data: user
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    createUser,
    getUsers,
    getUserById,
    updateUser,
    changeUserStatus,
    deleteUser,
    getMyProfile
};
