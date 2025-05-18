const UserServices = require("../services/UserService");
const UserModel = require("../models/UserModel");

const checkRole = async (userID) => {
    try {
        const user = await UserModel.findById(userID).populate("role_id", "name -_id");

        if (!user || !user.role_id || !user.role_id.name) {
            return { status: "ERR", message: "User or role not found" };
        }

        return {
            status: "OK",
            role: user.role_id.name,
            id: user._id,
        };
    } catch (error) {
        return { status: "ERR", message: "Error checking user role", detail: error.message };
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

const updateUser = async (req, res) => {
    try {
        const id = req.params.id;
        const data = req.body;
        const file = req.file;

        if (!req.user || !req.user.id) {
            return res.status(401).json({ status: "ERR", message: "Unauthorized" });
        }

        const userID = req.user.id;
        const roleResult = await checkRole(userID);

        if (roleResult.status === "ERR") {
            return res.status(404).json({ status: "ERR", message: roleResult.message });
        }

        const isAdmin = roleResult.role === "admin";

        if (!isAdmin && userID !== id) {
            return res.status(403).json({ status: "ERR", message: "You are not authorized to update this user" });
        }

        if (!id) {
            return res.status(400).json({ status: "ERR", message: "User ID is required" });
        }

        const response = await UserServices.updateUser(id, data, file, roleResult.role);
        return res.status(200).json(response);

    } catch (error) {
        console.error("Update user error:", error);
        return res.status(500).json({ status: "ERR", message: "Server error", detail: error.message });
    }
};

const getAllUser = async (req, res) => {
    try {
        let { page, limit } = req.query;

        // Convert to integer
        page = parseInt(page);
        limit = parseInt(limit);

        // Validate page and limit
        if (isNaN(page) || page <= 0 || isNaN(limit) || limit <= 0) {
            return res.status(400).json({
                status: "ERR",
                message: "Page and limit must be positive integers",
            });
        }

        const response = await UserServices.getAllUser(page, limit);

        if (response.status === "ERR") {
            return res.status(500).json(response);
        }

        return res.status(200).json({
            status: "OK",
            message: "Get all users successfully",
            data: response.data,
            pagination: {
                total: response.total,
                page,
                limit,
                totalPages: Math.ceil(response.total / limit),
            },
        });
    } catch (error) {
        return res.status(500).json({
            status: "ERR",
            message: "Internal Server Error",
            detail: error.message,
        });
    }
};


const getUserById = async (req, res) => {
    try {
        const id = req.params.id;

        if (!id) {
            return res.status(400).json({
                status: "ERR",
                message: "User ID is required",
            });
        }

        const response = await UserServices.getUserById(id);

        if (!response || response.status === "ERR") {
            return res.status(404).json({
                status: "ERR",
                message: response?.message || "User not found",
            });
        }

        return res.status(200).json({
            status: "OK",
            data: response.data || response,
        });
    } catch (error) {
        return res.status(500).json({
            status: "ERR",
            message: "Internal Server Error",
            detail: error.message,
        });
    }
};

const getUserByToken = async (req, res) => {
    try {
        const userID = req.user?.id;

        if (!userID) {
            return res.status(401).json({
                status: "ERR",
                message: "Unauthorized",
            });
        }

        const response = await UserServices.getUserById(userID);

        if (!response || response.status === "ERR") {
            return res.status(404).json({
                status: "ERR",
                message: response?.message || "User not found",
            });
        }

        return res.status(200).json({
            status: "OK",
            data: response.data || response,
        });
    } catch (error) {
        return res.status(500).json({
            status: "ERR",
            message: "Internal Server Error",
            detail: error.message,
        });
    }
};


const changePassword = async (req, res) => {
    try {
        const { old_password, new_password } = req.body;
        const userID = req.user.id;

        if (!old_password || !new_password) {
            return res.status(400).json({
                status: "ERR",
                message: "All fields are required",
            });
        }

        const isStrictPassword = (password) => {
            const regex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
            return regex.test(password);
        };

        if (!isStrictPassword(new_password)) {
            return res.status(400).json({
                status: "ERR",
                message:
                    "Password must contain at least 8 characters, including uppercase and number",
            });
        }

        const response = await UserServices.changePassword(
            userID,
            old_password,
            new_password
        );

        if (response.status === "ERR") {
            return res.status(400).json(response);
        }

        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({
            status: "ERR",
            message: "Internal Server Error",
            detail: error.message,
        });
    }
};



module.exports = {
    checkRole,
    createUser,
    loginUser,
    updateUser,
    getAllUser,
    getUserById,
    getUserByToken,
    changePassword,
};
