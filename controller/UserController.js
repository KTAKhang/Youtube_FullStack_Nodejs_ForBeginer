const UserServices = require("../services/UserService");
const UserModel = require("../models/UserModel");

// Check user's role by ID
const checkRole = async (userID) => {
    try {
        const user = await UserModel.findById(userID).populate("role_id", "name -_id");
        if (!user) {
            return { status: "ERR", message: "User not found" };
        }

        return {
            status: "OK",
            role: user.role_id.name,
            id: user._id,
        };
    } catch (error) {
        return { status: "ERR", message: error.message };
    }
};

// Create new user (API endpoint)
const createUser = async (req, res) => {
    try {
        const { user_name, password, email, role } = req.body;

        // Check required fields
        if (!user_name || !password || !email || !role) {
            return res.status(400).json({
                status: "ERR",
                message: "All fields are required",
            });
        }

        // Password strength validation
        const isStrictPassword = (password) => {
            const regex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
            return regex.test(password);
        };

        if (!isStrictPassword(password)) {
            return res.status(400).json({
                status: "ERR",
                message: "Password must contain at least 8 characters, including an uppercase letter and a number",
            });
        }

        // Email format validation
        const isStrictEmail = (email) => {
            const strictRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            return strictRegex.test(email);
        };

        if (!isStrictEmail(email)) {
            return res.status(400).json({
                status: "ERR",
                message: "Invalid email format",
            });
        }

        // Create user through service
        const response = await UserServices.createUser(req.body);
        return res.status(201).json(response);
    } catch (error) {
        return res.status(500).json({
            status: "ERR",
            message: error.message || "Internal server error",
        });
    }
};
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res
                .status(400)
                .json({ status: "ERR", message: "All fields are required" });
        }
        const isStrictEmail = (email) => {
            const strictRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            return strictRegex.test(email);
        };
        if (!isStrictEmail(email)) {
            return res.status(200).json({ status: "ERR", message: "Invalid email " });
        }
        const response = await UserServices.loginUser(req.body);
        return res.status(200).json(response);
    } catch (error) {
        return res.status(404).json({ message: error.message });
    }
};
module.exports = {
    checkRole,
    createUser,
    loginUser,
};
