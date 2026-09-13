const express = require("express");

const { saveProject } = require("../controllers/projectController");

const router = express.Router();

router.post("/save", saveProject);

module.exports = router;