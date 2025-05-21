const OrderService = require("../services/OrderService");

const createOrder = async (req, res) => {
    try {
        const orderData = req.body;

        const response = await OrderService.createOrder(orderData);

        if (response.status === "ERR") {
            return res.status(400).json(response);
        }

        return res.status(201).json(response);
    } catch (error) {
        return res.status(500).json({
            status: "ERR",
            message: error.message || "Internal Server Error",
        });
    }
};

const updateOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        if (!id) {
            return res.status(400).json({ status: "ERR", message: "Order ID is required" });
        }

        const response = await OrderService.updateOrder(id, updateData);

        if (response.status === "ERR") {
            return res.status(400).json(response);
        }

        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({
            status: "ERR",
            message: error.message || "Internal Server Error",
        });
    }
};

const getAllOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const user_id = req.query.user_id || "";

        if (isNaN(page) || page <= 0 || isNaN(limit) || limit <= 0) {
            return res.status(400).json({
                status: "ERR",
                message: "Page and limit must be positive integers",
            });
        }

        const response = await OrderService.getAllOrders(page, limit, user_id);
        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({
            status: "ERR",
            message: error.message || "Internal Server Error",
        });
    }
};

const getOrderByUserID = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const user_id = req.query.user_id;

        if (!user_id) {
            return res.status(400).json({
                status: "ERR",
                message: "Missing user_id",
            });
        }

        if (isNaN(page) || page <= 0 || isNaN(limit) || limit <= 0) {
            return res.status(400).json({
                status: "ERR",
                message: "Page and limit must be positive integers",
            });
        }


        if (String(user_id) !== String(req.user._id)) {
            return res.status(403).json({
                status: "ERR",
                message: "Unauthorized: user_id does not match authenticated user",
            });
        }

        const response = await OrderService.getOrderByUserID(user_id, page, limit);
        return res.status(200).json(response);

    } catch (error) {
        return res.status(500).json({
            status: "ERR",
            message: error.message || "Internal Server Error",
        });
    }
};


const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ status: "ERR", message: "Order ID is required" });
        }

        const response = await OrderService.getOrderById(id);

        if (response.status === "ERR") {
            return res.status(404).json(response);
        }

        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({
            status: "ERR",
            message: error.message || "Internal Server Error",
        });
    }
};

const cancelOrder = async (req, res) => {
    try {
        const orderId = req.params.id;
        const userId = req.user._id;
        console.log("User ID:", userId);

        const response = await OrderService.cancelOrderByCustomer(orderId, userId);
        if (response.status === "ERR") {
            return res.status(400).json(response);
        }

        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({ status: "ERR", message: error.message });
    }
};



module.exports = {
    createOrder,
    updateOrder,
    getAllOrders,
    getOrderById,
    cancelOrder,
    getOrderByUserID,
};
