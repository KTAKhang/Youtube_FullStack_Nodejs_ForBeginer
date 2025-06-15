const ProductService = require("../services/ProductService");

const createProduct = async (req, res) => {
    try {
        const data = req.body;
        const file = req.file; // Nếu bạn muốn xử lý ảnh bằng multer

        const response = await ProductService.createProduct(data, file);
        if (response.status === "ERR") {
            return res.status(400).json(response);
        }

        return res.status(201).json(response);
    } catch (error) {
        return res.status(500).json({
            status: "ERR",
            message: error.message || "Internal server error",
        });
    }
};

const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const file = req.file;

        if (!id) {
            return res.status(400).json({ status: "ERR", message: "Product ID is required" });
        }

        const response = await ProductService.updateProduct(id, data, file);

        if (response.status === "ERR") {
            return res.status(400).json(response);
        }

        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({
            status: "ERR",
            message: error.message || "Internal server error",
        });
    }
};

const getAllProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || "";

        if (isNaN(page) || page <= 0 || isNaN(limit) || limit <= 0) {
            return res.status(400).json({
                status: "ERR",
                message: "Page and limit must be positive integers",
            });
        }
        const result = await ProductService.getAllProducts(page, limit, search);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ status: "ERR", message: error.message });
    }
};


const getProductById = async (req, res) => {
    try {
        const id = req.params.id;

        if (!id) {
            return res.status(400).json({
                status: "ERR",
                message: "Product ID is required",
            });
        }

        const response = await ProductService.getProductById(id);

        if (response.status === "ERR") {
            return res.status(500).json(response);
        }

        return res.status(200).json({
            status: "OK",
            message: "Get product successfully",
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
    createProduct,
    updateProduct,
    getAllProducts,
    getProductById,
};
