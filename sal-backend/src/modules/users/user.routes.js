const express = require("express");
const authenticate = require("../../middlewares/auth.middleware");
const authorizeRoles = require("../../middlewares/role.middleware");
const audit = require("../../middlewares/audit.middleware");
const validateBody = require("../../middlewares/validateBody.middleware");
const userController = require("./user.controller");

const {
    validateCreateUser,
    validateUserId,
    validateUpdateUser,
    validateStatus,
} = require("./user.validator");
const router = express.Router();
// Todas las rutas requieren un token JWT válido
router.use(authenticate);
// Crear usuario - Solo administrador
router.post(
    "/",
    authorizeRoles("SYSTEM_ADMIN"),
    audit("CREATE", "user"),
    validateBody,
    validateCreateUser,
    userController.createUser
);
// Listar usuarios - Solo administrador
router.get(
    "/",
    authorizeRoles("SYSTEM_ADMIN"),
    userController.getUsers
);

router.get(
    "/me",
    userController.getMyProfile
);

// Consultar usuario por ID - Solo administrador
router.get(
    "/:id",
    authorizeRoles("SYSTEM_ADMIN"),
    audit("UPDATE", "user"),
    validateBody,
    validateUserId,
    userController.getUserById
);
// Actualizar usuario - Solo administrador
router.put(
    "/:id",
    authorizeRoles("SYSTEM_ADMIN"),
    validateUserId,
    validateUpdateUser,
    userController.updateUser
);
// Cambiar estado - Solo administrador
router.patch(
    "/:id/status",
    authorizeRoles("SYSTEM_ADMIN"),
    audit("STATUS_CHANGE", "user"),
    validateBody,
    validateUserId,
    validateStatus,
    userController.changeUserStatus
);
// Eliminación lógica - Solo administrador
router.delete(
    "/:id",
    authorizeRoles("SYSTEM_ADMIN"),
    audit("DELETE", "user"),
    validateUserId,
    userController.deleteUser
);



module.exports = router;