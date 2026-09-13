const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        title: {
            type: String,
            required: true
        },

        idea: {
            type: String,
            required: true
        },

        blueprint: {
            type: mongoose.Schema.Types.Mixed,
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Project", projectSchema);