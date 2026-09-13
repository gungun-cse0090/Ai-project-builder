const express = require("express");

const { signup, login } = require("../controllers/authController");

const router = express.Router();

// Create account
router.post("/signup", signup);

// Login
router.post("/login", login);

module.exports = router;