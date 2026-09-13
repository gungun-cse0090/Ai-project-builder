const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const aiRoutes = require("./routes/aiRoutes");
const projectRoutes = require("./routes/projectRoutes");

const app = express();

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/projects", projectRoutes);

// Test route
app.get("/", (req, res) => {
    res.json({
        message: "ProjectAI Backend is running 🚀"
    });
});

// Start server only after MongoDB connects
async function startServer() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        console.log("MongoDB Connected Successfully ✅");

        app.listen(PORT, () => {
            console.log(
                `ProjectAI Backend running on http://localhost:${PORT}`
            );
        });

    } catch (error) {
        console.error(
            "MongoDB Connection Failed ❌",
            error.message
        );
    }
}

startServer();