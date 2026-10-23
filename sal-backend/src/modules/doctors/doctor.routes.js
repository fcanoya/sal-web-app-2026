const express = require("express");
const authenticate = require("../../middlewares/auth.middleware");
const authorizeRoles = require("../../middlewares/role.middleware");
const audit = require("../../middlewares/audit.middleware");
const validateId = require("../../middlewares/validateId.middleware");
const validateBody = require("../../middlewares/validateBody.middleware");
const controller = require("./doctor.controller");

const router = express.Router();
router.use(authenticate);
router.get("/", controller.list);
router.post("/", authorizeRoles("SYSTEM_ADMIN"), audit("CREATE", "doctor"), validateBody, controller.create);
router.post("/:id/schedules", validateId(), authorizeRoles("SYSTEM_ADMIN"), audit("CREATE", "doctor_schedule"), validateBody, controller.addSchedule);
router.delete("/:id/schedules/:scheduleId", validateId(), validateId("scheduleId"), authorizeRoles("SYSTEM_ADMIN"), audit("DELETE", "doctor_schedule"), controller.deleteSchedule);
router.get("/:id/availability", validateId(), controller.availableSlots);
router.get("/:id/schedules", validateId(), controller.schedules);
router.get("/:id", validateId(), controller.get);
router.put("/:id", validateId(), authorizeRoles("SYSTEM_ADMIN"), audit("UPDATE", "doctor"), validateBody, controller.update);

module.exports = router;
