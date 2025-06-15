const CategoryService = require("../services/CategoryService");

const createCategory = async (req, res) => {
    try {
        const { name } = req.body;
        const file = req.file;


        if (!name) {
            return res.status(400).json({
                status: "ERR",
                message: "Name and status are required",
            });
        }


        const response = await CategoryService.createCategory({ name }, file);
        return res.status(201).json(response);
    } catch (error) {
        return res.status(500).json({
            status: "ERR",
            message: error.message || "Internal server error",
        });
    }
};

const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const file = req.file;


        if (!id) {
            return res.status(400).json({ status: "ERR", message: "User ID is required" });
        }

        const response = await CategoryService.updateCategory(id, data, file);

        if (response.status === "ERR") {
            return res.status(400).json(response);
        }

        return res.status(200).json(response);
    }
    catch (error) {
        return res.status(500).json({
            status: "ERR",
            message: error.message || "Internal server error",
        });
    }
};

const getAllCategories = async (req, res) => {
    try {
        let { page, limit, search } = req.query;

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

        const response = await CategoryService.getAllCategories(page, limit, search);


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

const getCategoryById = async (req, res) => {
    try {
        const id = req.params.id;
        if (!id) {
            return res.status(400).json({
                status: "ERR",
                message: "Category ID is required",
            });
        }

        const response = await CategoryService.getCategoryById(id);

        if (response.status === "ERR") {
            return res.status(500).json(response);
        }

        return res.status(200).json({
            status: "OK",
            message: "Get category successfully",
            data: response.data,
        });
    } catch (error) {
        return res.status(500).json({
            status: "ERR",
            message: error.message || "Internal server error",
        });
    }
};

module.exports = {
    createCategory,
    updateCategory,
    getAllCategories,
    getCategoryById,
};
