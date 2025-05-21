const OrderModel = require("../models/OrderModel");
const OrderStatusModel = require("../models/OrderStatusModel");
const UserModel = require("../models/UserModel");


const createOrder = async (newOrder) => {
    try {
        const {
            user_id,
            total_price,
            note,
            receiver_address,
            receiver_name,
            receiver_phone,
            order_status_id
        } = newOrder;

        const requiredFields = {
            user_id,
            total_price,
            receiver_address,
            receiver_name,
            receiver_phone,
            order_status_id
        };

        for (const [key, value] of Object.entries(requiredFields)) {
            if (!value) {
                throw {
                    status: "ERR",
                    message: `Missing required field: ${key}`
                };
            }
        }

        const userExists = await UserModel.findById(user_id);
        if (!userExists) throw { status: "ERR", message: "User not found" };

        const statusExists = await OrderStatusModel.findById(order_status_id);
        if (!statusExists) throw { status: "ERR", message: "Order status not found" };

        const order = await OrderModel.create({
            user_id,
            total_price,
            note,
            receiver_address,
            receiver_name,
            receiver_phone,
            order_status_id
        });

        return {
            status: "OK",
            message: "Order created successfully",
            data: order
        };

    } catch (error) {
        throw {
            status: error.status || "ERR",
            message: error.message || "Internal Server Error"
        };
    }
};


const updateOrder = async (id, updateData) => {
    try {
        const existingOrder = await OrderModel.findById(id);
        if (!existingOrder) {
            return { status: "ERR", message: "Order not found" };
        }

        // Chỉ cho phép cập nhật order_status_id và status
        const updatedFields = {};

        if (updateData.order_status_id) {
            const statusExists = await OrderStatusModel.findById(updateData.order_status_id);
            if (!statusExists) {
                return { status: "ERR", message: "Order status not found" };
            }
            updatedFields.order_status_id = updateData.order_status_id;
        }

        if (typeof updateData.status === "boolean") {
            updatedFields.status = updateData.status;
        }

        const updatedOrder = await OrderModel.findByIdAndUpdate(
            id,
            updatedFields,
            { new: true }
        ).populate("user_id", "name email -_id")
            .populate("order_status_id", "name -_id");

        return {
            status: "OK",
            message: "Order updated successfully",
            data: updatedOrder
        };

    } catch (error) {
        throw {
            status: error.status || "ERR",
            message: error.message || "Internal Server Error"
        };
    }
};



const getAllOrders = async (page = 1, limit = 10, user_id = "") => {
    try {
        const query = {};
        if (user_id) query.user_id = user_id;

        const allOrders = await OrderModel.find(query)
            .populate("user_id", "name email -_id")
            .populate("order_status_id", "name -_id")
            .sort({ createdAt: -1 });

        const totalOrders = allOrders.length;
        const totalPage = Math.ceil(totalOrders / limit);
        const currentPage = Number(page);

        const paginatedOrders = page && limit
            ? allOrders.slice((page - 1) * limit, page * limit)
            : allOrders;

        return {
            status: "OK",
            message: "Orders retrieved successfully",
            data: {
                orders: paginatedOrders,
                total: { currentPage, totalOrders, totalPage }
            }
        };

    } catch (error) {
        throw {
            status: error.status || "ERR",
            message: error.message || "Internal Server Error"
        };
    }
};

const getOrderByUserID = async (user_id, page = 1, limit = 10) => {
    try {
        if (!user_id) {
            throw { status: "ERR", message: "User ID is required" };
        }

        const query = { user_id };

        const allOrders = await OrderModel.find(query)
            .populate("user_id", "name email -_id")
            .populate("order_status_id", "name -_id")
            .sort({ createdAt: -1 });

        const totalOrders = allOrders.length;
        const totalPage = Math.ceil(totalOrders / limit);
        const currentPage = Number(page);

        const paginatedOrders = allOrders.slice((page - 1) * limit, page * limit);

        return {
            status: "OK",
            message: "Orders retrieved successfully for user",
            data: {
                orders: paginatedOrders,
                total: { currentPage, totalOrders, totalPage }
            }
        };

    } catch (error) {
        throw {
            status: error.status || "ERR",
            message: error.message || "Internal Server Error"
        };
    }
};



const getOrderById = async (id) => {
    try {
        const order = await OrderModel.findById(id)
            .populate("user_id", "name email -_id")
            .populate("order_status_id", "name -_id");

        if (!order) {
            return { status: "ERR", message: "Order not found" };
        }

        return {
            status: "OK",
            message: "Order retrieved successfully",
            data: order
        };

    } catch (error) {
        throw {
            status: error.status || "ERR",
            message: error.message || "Internal Server Error"
        };
    }
};

const cancelOrderByCustomer = async (orderId, userId) => {
    try {
        const order = await OrderModel.findById(orderId)
            .populate("order_status_id"); // lấy dữ liệu trạng thái

        if (!order) {
            return { status: "ERR", message: "Order not found" };
        }
        console.log("order.user_id:", order.user_id);
        console.log("userId:", userId);

        if (order.user_id.toString() !== userId.toString()) {
            return { status: "ERR", message: "Unauthorized to cancel this order" };
        }

        // So sánh theo tên trạng thái đã populate
        if (order.order_status_id.name !== "PENDING") {
            return { status: "ERR", message: "Only pending orders can be cancelled" };
        }

        order.order_status_id = "682c6edc03ffc771169ec2d1";
        await order.save();

        return { status: "OK", message: "Order cancelled successfully", data: order };
    } catch (error) {
        return { status: "ERR", message: error.message };
    }
};


module.exports = {
    createOrder,
    updateOrder,
    getAllOrders,
    getOrderById,
    cancelOrderByCustomer,
    getOrderByUserID
};
