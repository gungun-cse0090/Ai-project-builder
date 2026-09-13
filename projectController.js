const Project = require("../models/Project");

// Save a project
const saveProject = async (req, res) => {
    try {
        const { userId, title, idea, blueprint } = req.body;

        if (!userId || !title || !idea || !blueprint) {
            return res.status(400).json({
                message: "userId, title, idea and blueprint are required"
            });
        }

        const project = await Project.create({
            userId,
            title,
            idea,
            blueprint
        });

        res.status(201).json({
            message: "Project saved successfully",
            project
        });

    } catch (error) {
        console.error("Save Project Error:", error);

        res.status(500).json({
            message: "Failed to save project"
        });
    }
};

module.exports = {
    saveProject
};