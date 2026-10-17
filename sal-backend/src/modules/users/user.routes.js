const express = require('express');
const userController = require('./user.controller');
const {
    validateCreateUser,
    validateUserId,
    validateUpdateUser,
    validateStatus
} = require('./user.validator');
const router = express.Router();
// Crear usuario 
router.post(
    '/',
    validateCreateUser,
    userController.createUser
);
// Listar todos los usuarios 
router.get(
    '/',
    userController.getUsers
);
// Consultar usuario especifico por ID
router.get(
    '/:id',
    validateUserId,
    userController.getUserById
);
// Actualizar usuario 
router.put(
    '/:id',
    validateUserId,
    validateUpdateUser,
    userController.updateUser
);
// Cambiar estado 
router.patch(
    '/:id/status',
    validateUserId,
    validateStatus,
    userController.changeUserStatus
);
// Eliminación lógica 
router.delete(
    '/:id',
    validateUserId,
    userController.deleteUser
);
module.exports = router; 