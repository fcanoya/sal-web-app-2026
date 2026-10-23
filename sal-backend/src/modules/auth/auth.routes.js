const express = require("express");
const authController = require("./auth.controller");
const { validateLogin, validateRegistration } = require("./auth.validator");
const audit = require("../../middlewares/audit.middleware");
const validateBody = require("../../middlewares/validateBody.middleware");

const router = express.Router();

router.post("/register", audit("REGISTER", "auth"), validateBody, validateRegistration, authController.register);
router.post("/login", audit("LOGIN", "auth"), validateBody, validateLogin, authController.login);

module.exports = router; 