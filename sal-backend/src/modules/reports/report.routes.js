const express = require("express");
const authenticate = require("../../middlewares/auth.middleware");
const authorizeRoles = require("../../middlewares/role.middleware");
const controller = require("./report.controller");

const router = express.Router();
router.use(authenticate, authorizeRoles("SYSTEM_ADMIN"));
router.get("/summary", controller.summary);
router.get("/appointments.csv", controller.appointments);

module.exports = router;
