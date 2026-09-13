const OpenAI = require("openai");

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});


// =====================================================
// GENERATE AI BLUEPRINT
// =====================================================

const generateBlueprint = async (req, res) => {
    try {
        const { idea } = req.body;

        if (!idea || !idea.trim()) {
            return res.status(400).json({
                message: "Project idea is required"
            });
        }

        const response = await openai.responses.create({
            model: "gpt-5.6-luna",

            input: [
                {
                    role: "system",
                    content: `
You are an expert software architect.

Convert the user's project idea into a complete and practical software blueprint.

Return ONLY valid JSON.

Use exactly these keys:

title
description
problem
objectives
targetUsers
features
modules
techStack
apis
database
workflow
suggestions

Rules:
- objectives must be an array of strings.
- targetUsers must be an array of strings.
- features must be an array of strings.
- modules must be an array of strings.
- suggestions must be an array of strings.
- techStack must be an array of strings.
- apis must be an array of strings.
- database must be an array of strings.
- workflow must be an array of strings.
- Keep the blueprint realistic and suitable for a student software project.
- Do not add markdown.
- Do not add explanations outside the JSON.
                    `
                },
                {
                    role: "user",
                    content: idea.trim()
                }
            ]
        });

        const text = response.output_text;

        let blueprint;

        try {
            blueprint = JSON.parse(text);
        } catch (parseError) {
            console.error("AI JSON Parse Error:", text);

            return res.status(500).json({
                message: "AI returned an invalid blueprint format."
            });
        }

        return res.status(200).json({
            blueprint
        });

    } catch (error) {
        console.error("AI Blueprint Error:", error);

        return res.status(500).json({
            message: error.message || "Failed to generate blueprint"
        });
    }
};


// =====================================================
// GENERATE AI VISUAL
// =====================================================

const generateVisual = async (req, res) => {
    try {
        const {
            title,
            description,
            features,
            modules,
            techStack
        } = req.body;

        if (!title) {
            return res.status(400).json({
                message: "Project title is required"
            });
        }

        const featureText = Array.isArray(features)
            ? features.join(", ")
            : "";

        const moduleText = Array.isArray(modules)
            ? modules.join(", ")
            : "";

        const techStackText = Array.isArray(techStack)
            ? techStack.join(", ")
            : "";

        const prompt = `
Create a professional software architecture visual for this project.

Project Title:
${title}

Description:
${description || ""}

Main Features:
${featureText}

Modules:
${moduleText}

Technology Stack:
${techStackText}

Show the major components and their relationships clearly.

The visual should include:
- Users
- Frontend
- Backend / API
- Database
- AI services if relevant
- Main system modules
- Data or request flow

Style:
Clean modern software architecture diagram,
professional SaaS product style,
dark premium technology aesthetic,
clear readable labels,
organized layout,
high quality.

Do not create a generic hospital photograph.

Create a software architecture visual based specifically
on the provided project information.
`;

        const result = await openai.images.generate({
            model: "gpt-image-2",
            prompt: prompt,
            size: "1024x1024"
        });

        const imageBase64 = result.data?.[0]?.b64_json;

        if (!imageBase64) {
            return res.status(500).json({
                message: "AI did not return an image"
            });
        }

        return res.status(200).json({
            image: `data:image/png;base64,${imageBase64}`
        });

    } catch (error) {
        console.error("AI Visual Error:", error);

        return res.status(500).json({
            message: error.message || "Failed to generate AI visual"
        });
    }
};


// =====================================================
// EXPORT FUNCTIONS
// =====================================================

module.exports = {
    generateBlueprint,
    generateVisual
};