const express = require("express");
const authenticate = require("../../middlewares/auth.middleware");
const authorizeRoles = require("../../middlewares/role.middleware");
const audit = require("../../middlewares/audit.middleware");
const validateId = require("../../middlewares/validateId.middleware");
const validateBody = require("../../middlewares/validateBody.middleware");
const controller = require("./service.controller");

const router = express.Router();
router.use(authenticate);
router.get("/", controller.list);
router.get("/:id", validateId(), controller.get);
router.post("/", authorizeRoles("SYSTEM_ADMIN"), audit("CREATE", "service"), validateBody, controller.create);
router.put("/:id", validateId(), authorizeRoles("SYSTEM_ADMIN"), audit("UPDATE", "service"), validateBody, controller.update);

module.exports = router;
