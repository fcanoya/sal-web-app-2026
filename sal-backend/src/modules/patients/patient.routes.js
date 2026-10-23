const express = require("express");
const authenticate = require("../../middlewares/auth.middleware");
const authorizeRoles = require("../../middlewares/role.middleware");
const audit = require("../../middlewares/audit.middleware");
const validateId = require("../../middlewares/validateId.middleware");
const validateBody = require("../../middlewares/validateBody.middleware");
const controller = require("./patient.controller");

const router = express.Router();
router.use(authenticate);
router.get("/me", authorizeRoles("PACIENTE"), controller.getOwn);
router.put("/me", authorizeRoles("PACIENTE"), audit("UPDATE", "patient"), validateBody, controller.updateOwn);
router.get("/me/appointments", authorizeRoles("PACIENTE"), controller.history);
router.get("/", authorizeRoles("SYSTEM_ADMIN"), controller.list);
router.get("/:id", authorizeRoles("SYSTEM_ADMIN"), validateId(), controller.getById);
router.get("/:id/appointments", authorizeRoles("SYSTEM_ADMIN"), validateId(), controller.history);
router.put("/:id", authorizeRoles("SYSTEM_ADMIN"), validateId(), audit("UPDATE", "patient"), validateBody, controller.updateById);
router.patch("/:id/status", authorizeRoles("SYSTEM_ADMIN"), validateId(), audit("STATUS_CHANGE", "patient"), validateBody, controller.setStatus);

module.exports = router;
