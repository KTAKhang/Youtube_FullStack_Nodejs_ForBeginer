const OrderService = require("../services/OrderService");

const createOrder = async (req, res) => {
    try {
        const user_id = req.user._id;
        const { selected_product_ids, receiverInfo } = req.body;

        if (!selected_product_ids || !Array.isArray(selected_product_ids) || selected_product_ids.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng chọn ít nhất một sản phẩm để đặt hàng"
            });
        }

        if (!receiverInfo || !receiverInfo.receiver_name || !receiverInfo.receiver_phone || !receiverInfo.receiver_address) {
            return res.status(400).json({
                success: false,
                message: "Thiếu thông tin người nhận"
            });
        }

        const result = await OrderService.createOrderFromSelectedCartItems(user_id, selected_product_ids, receiverInfo);
        return res.status(201).json(result);
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Tạo đơn hàng thất bại"
        });
    }
};

const updateOrder = async (req, res) => {
    try {
        const order_id = req.params.id;
        console.log("order_id", order_id);
        const updateData = req.body;

        if (!order_id) {
            return res.status(400).json({ success: false, message: "Thiếu ID đơn hàng" });
        }

        const result = await OrderService.updateOrder(order_id, updateData);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Cập nhật đơn hàng thất bại"
        });
    }
};

const getAllOrders = async (req, res) => {
    try {
        const role = req.user.role;
        const user_id = req.user._id;

        const result = await OrderService.getAllOrders(role, user_id);
        return res.status(200).json({
            success: true,
            message: "Lấy danh sách đơn hàng thành công",
            data: result
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Lỗi máy chủ khi lấy đơn hàng"
        });
    }
};

const cancelOrder = async (req, res) => {
    try {
        const order_id = req.params.id;
        const user_id = req.user._id;
        const role = req.user.role;
        console.log("user_id", user_id);
        console.log("role", role);


        if (role !== 'customer') {
            return res.status(403).json({
                success: false,
                message: "Chỉ người dùng có vai trò customer mới có quyền hủy đơn hàng"
            });
        }

        const result = await OrderService.cancelOrderByCustomer(order_id, user_id);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || "Hủy đơn hàng thất bại"
        });
    }
};

const getOrderDetailById = async (req, res) => {
    try {
        const order_id = req.params.id;
        const role = req.user.role;

        if (!order_id) {
            return res.status(400).json({
                success: false,
                message: "Thiếu ID đơn hàng"
            });
        }

        const result = await OrderService.getOrderDetailByOrderId(order_id, role);
        return res.status(200).json({
            success: true,
            message: "Lấy chi tiết đơn hàng thành công",
            data: result
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Lỗi khi lấy chi tiết đơn hàng"
        });
    }
};


module.exports = {
    createOrder,
    updateOrder,
    getAllOrders,
    cancelOrder,
    getOrderDetailById
};
