const express = require("express");
const authenticate = require("../../middlewares/auth.middleware");
const authorizeRoles = require("../../middlewares/role.middleware");
const audit = require("../../middlewares/audit.middleware");
const validateId = require("../../middlewares/validateId.middleware");
const validateBody = require("../../middlewares/validateBody.middleware");
const controller = require("./appointment.controller");

const router = express.Router();
router.use(authenticate);
router.get("/", authorizeRoles("SYSTEM_ADMIN", "PACIENTE", "DOCTOR"), controller.list);
router.post("/", authorizeRoles("SYSTEM_ADMIN", "PACIENTE"), audit("CREATE", "appointment"), validateBody, controller.create);
router.get("/:id/history", authorizeRoles("SYSTEM_ADMIN", "PACIENTE", "DOCTOR"), validateId(), controller.history);
router.get("/:id", authorizeRoles("SYSTEM_ADMIN", "PACIENTE", "DOCTOR"), validateId(), controller.get);
router.patch("/:id/status", authorizeRoles("SYSTEM_ADMIN", "PACIENTE", "DOCTOR"), validateId(), audit("STATUS_CHANGE", "appointment"), validateBody, controller.changeStatus);

module.exports = router;
