const bcrypt = require("bcryptjs");
const User = require("../models/User");

// ==============================
// CREATE ACCOUNT / SIGNUP
// ==============================
const signup = async (req, res) => {
    try {
        const { name, password } = req.body;

        // Check required fields
        if (!name || !password) {
            return res.status(400).json({
                message: "Name and password are required"
            });
        }

        // Check if name already exists
        const existingUser = await User.findOne({ name });

        if (existingUser) {
            return res.status(400).json({
                message: "This name is already registered"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await User.create({
            name: name,
            password: hashedPassword
        });

        // Successful response
        return res.status(201).json({
            message: "Account created successfully",
            user: {
                id: user._id,
                name: user.name
            }
        });

    } catch (error) {
        console.error("Signup Error:", error);

        return res.status(500).json({
            message: error.message || "Server error"
        });
    }
};


// ==============================
// LOGIN
// ==============================
const login = async (req, res) => {
    try {
        const { name, password } = req.body;

        // Check required fields
        if (!name || !password) {
            return res.status(400).json({
                message: "Name and password are required"
            });
        }

        // Find user
        const user = await User.findOne({ name });

        if (!user) {
            return res.status(401).json({
                message: "Invalid name or password"
            });
        }

        // Check password
        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: "Invalid name or password"
            });
        }

        // Successful login
        return res.status(200).json({
            message: "Login successful",
            user: {
                id: user._id,
                name: user.name
            }
        });

    } catch (error) {
        console.error("Login Error:", error);

        return res.status(500).json({
            message: error.message || "Server error"
        });
    }
};


// ==============================
// EXPORT
// ==============================
module.exports = {
    signup,
    login
};