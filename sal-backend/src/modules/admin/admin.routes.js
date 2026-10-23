const express = require("express");
const authenticate = require("../../middlewares/auth.middleware");
const authorizeRoles = require("../../middlewares/role.middleware");
const audit = require("../../middlewares/audit.middleware");
const validateId = require("../../middlewares/validateId.middleware");
const validateBody = require("../../middlewares/validateBody.middleware");
const controller = require("./admin.controller");

const router = express.Router();
router.use(authenticate, authorizeRoles("SYSTEM_ADMIN"));
router.get("/configuration", controller.configuration);
router.put("/configuration/:key", audit("CONFIG_UPDATE", "configuration"), validateBody, controller.updateConfiguration);
router.get("/roles", controller.roles);
router.patch("/users/:id/role", validateId(), audit("ROLE_CHANGE", "user"), validateBody, controller.changeRole);
router.get("/audit", controller.auditLog);

module.exports = router;
