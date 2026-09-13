const express = require("express");

const {
    generateBlueprint,
    generateVisual
} = require("../controllers/aiController");

const router = express.Router();

router.post("/generate-blueprint", generateBlueprint);

router.post("/generate-visual", generateVisual);

module.exports = router;