const express = require("express");
const authenticate = require("../../middlewares/auth.middleware");
const authorizeRoles = require("../../middlewares/role.middleware");
const validateId = require("../../middlewares/validateId.middleware");
const controller = require("./notification.controller");

const router = express.Router();
router.use(authenticate);
router.get("/", controller.list);
router.patch("/:id/read", validateId(), controller.markRead);
router.get("/admin/all", authorizeRoles("SYSTEM_ADMIN"), controller.listAll);

module.exports = router;
