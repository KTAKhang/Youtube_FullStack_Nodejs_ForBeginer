const OrderModel = require("../models/OrderModel");
const OrderDetailModel = require("../models/OrderDetailModel");
const OrderStatusModel = require("../models/OrderStatusModel");
const CartModel = require("../models/CartsModel");
const CartDetailModel = require("../models/CartDetailsModel");
const ProductModel = require("../models/ProductsModel");
const UserModel = require("../models/UserModel");

async function createOrderFromSelectedCartItems(user_id, selected_product_ids, receiverInfo) {
    const session = await OrderModel.startSession();
    session.startTransaction();

    try {
        // B1: Lấy giỏ hàng và các sản phẩm được chọn
        const cart = await CartModel.findOne({ user_id }).session(session);
        if (!cart) throw new Error("Không tìm thấy giỏ hàng");

        if (!selected_product_ids || selected_product_ids.length === 0) {
            throw new Error("Vui lòng chọn ít nhất một sản phẩm để đặt hàng");
        }

        const cartItems = await CartDetailModel.find({
            cart_id: cart._id,
            product_id: { $in: selected_product_ids }
        }).session(session);

        if (cartItems.length === 0) throw new Error("Không tìm thấy sản phẩm phù hợp trong giỏ hàng");

        // B2: Kiểm tra số lượng và trạng thái từng sản phẩm
        for (const item of cartItems) {
            const product = await ProductModel.findById(item.product_id).session(session);
            if (!product || !product.status || product.quantity < item.quantity) {
                throw new Error(`Sản phẩm '${product?.name || 'Không rõ'}' không còn đủ hàng hoặc đã ngừng bán`);
            }
        }

        // B3: Tính tổng tiền đơn hàng
        const totalPrice = cartItems.reduce((sum, item) => sum + item.quantity * item.price, 0);

        const statusId = await getDefaultStatusId();
        // B4: Tạo đơn hàng
        const order = await OrderModel.create([{
            user_id,
            total_price: totalPrice,
            receiver_name: receiverInfo.receiver_name,
            receiver_address: receiverInfo.receiver_address,
            receiver_phone: receiverInfo.receiver_phone,
            order_status_id: statusId
        }], { session });

        const orderId = order[0]._id;

        // B5: Tạo chi tiết đơn hàng
        const orderDetails = cartItems.map(item => ({
            order_id: orderId,
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.price
        }));

        await OrderDetailModel.insertMany(orderDetails, { session });

        // B6: Trừ kho
        for (const item of cartItems) {
            await ProductModel.findByIdAndUpdate(item.product_id, {
                $inc: { quantity: -item.quantity }
            }).session(session);
        }

        // B7: Xoá những sản phẩm đã chọn khỏi giỏ hàng
        await CartDetailModel.deleteMany({
            cart_id: cart._id,
            product_id: { $in: selected_product_ids }
        }).session(session);

        // B8: Tính lại tổng tiền giỏ hàng còn lại
        const remainingItems = await CartDetailModel.find({ cart_id: cart._id }).session(session);
        const newSum = remainingItems.reduce((total, item) => total + item.quantity * item.price, 0);
        cart.sum = newSum;
        await cart.save({ session });

        await session.commitTransaction();
        session.endSession();

        return {
            success: true,
            message: "Đã tạo đơn hàng thành công từ sản phẩm đã chọn",
            order_id: orderId
        };

    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        throw new Error("Tạo đơn hàng thất bại: " + err.message);
    }
}

async function updateOrder(order_id, updateData) {


    const { order_status_id, status } = updateData;

    const dataToUpdate = {};
    if (order_status_id) {
        const statusExist = await OrderStatusModel.findById(order_status_id);
        if (!statusExist) {
            throw new Error("Trạng thái đơn hàng không hợp lệ");
        }
        dataToUpdate.order_status_id = order_status_id;
    }

    if (typeof status === "boolean") {
        dataToUpdate.status = status;
    }

    if (Object.keys(dataToUpdate).length === 0) {
        throw new Error("Không có dữ liệu hợp lệ để cập nhật");
    }

    const updatedOrder = await OrderModel.findByIdAndUpdate(
        order_id,
        dataToUpdate,
        { new: true }
    );
    console.log("updatedOrder", updatedOrder);

    if (!updatedOrder) {
        throw new Error("Không tìm thấy đơn hàng để cập nhật");
    }

    return {
        success: true,
        message: "Đã cập nhật đơn hàng",
        order: updatedOrder
    };
}

// Hàm dùng để lấy _id của trạng thái "PENDING"
async function getDefaultStatusId() {
    const status = await OrderStatusModel.findOne({ name: "PENDING" });
    if (!status) throw new Error("Không tìm thấy trạng thái PENDING");
    return status._id;
}

async function getAllOrders(role, user_id) {
    let orders;

    if (role === 'admin') {
        orders = await OrderModel.find()
            .populate("order_status_id", "name description")
            .sort({ createdAt: -1 });
    } else {
        orders = await OrderModel.find({ user_id })
            .populate("order_status_id", "name description")
            .sort({ createdAt: -1 });
    }

    const results = [];

    for (const order of orders) {
        const orderDetails = await OrderDetailModel.find({ order_id: order._id })
            .populate("product_id", "name image price");

        const formattedItems = orderDetails.map(item => ({
            product_id: item.product_id._id,
            name: item.product_id.name,
            image: item.product_id.image,
            price: item.price,
            quantity: item.quantity,
            subtotal: item.price * item.quantity
        }));

        const userInfo = role === 'admin'
            ? await UserModel.findById(order.user_id).select("full_name email")
            : null;

        results.push({
            order_id: order._id,
            total_price: order.total_price,
            createdAt: order.createdAt,
            receiver_name: order.receiver_name,
            receiver_phone: order.receiver_phone,
            receiver_address: order.receiver_address,
            user: userInfo ? {
                _id: userInfo._id,
                name: userInfo.full_name,
                email: userInfo.email
            } : undefined,
            order_status: {
                _id: order.order_status_id._id,
                name: order.order_status_id.name,
                description: order.order_status_id.description
            },
            items: formattedItems
        });
    }

    return results;
}

async function cancelOrderByCustomer(order_id, user_id) {
    const session = await OrderModel.startSession();
    session.startTransaction();

    try {
        // B1: Tìm đơn hàng
        const order = await OrderModel.findById(order_id).session(session);
        if (!order) throw new Error("Không tìm thấy đơn hàng");

        // B2: Kiểm tra đơn hàng có thuộc về user đang đăng nhập không
        if (order.user_id.toString() !== user_id.toString()) {
            throw new Error("Bạn không có quyền hủy đơn hàng này");
        }

        // B3: Kiểm tra trạng thái có phải PENDING không
        const currentStatus = await OrderStatusModel.findById(order.order_status_id).session(session);
        if (!currentStatus || currentStatus.name !== "PENDING") {
            throw new Error("Chỉ có thể hủy đơn hàng khi trạng thái là PENDING");
        }

        // B4: Lấy trạng thái CANCELED
        const canceledStatus = await OrderStatusModel.findOne({ name: "CANCELLED" }).session(session);
        if (!canceledStatus) throw new Error("Không tìm thấy trạng thái CANCELLED");

        // B5: Cập nhật trạng thái đơn hàng
        order.order_status_id = canceledStatus._id;
        await order.save({ session });

        // B6: Lấy chi tiết đơn hàng để hoàn kho
        const orderDetails = await OrderDetailModel.find({ order_id }).session(session);

        for (const item of orderDetails) {
            await ProductModel.findByIdAndUpdate(
                item.product_id,
                { $inc: { quantity: item.quantity } },
                { session }
            );
        }

        await session.commitTransaction();
        session.endSession();

        return {
            success: true,
            message: "Hủy đơn hàng thành công"
        };

    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        throw new Error("Hủy đơn hàng thất bại: " + err.message);
    }
}

async function getOrderDetailByOrderId(order_id, user_id, role = "customer") {
    const order = await OrderModel.findById(order_id)
        .populate("order_status_id", "name description");

    if (!order) {
        throw new Error("Không tìm thấy đơn hàng");
    }

    // Nếu không phải admin, chỉ được xem đơn hàng của chính mình
    if (role !== 'admin' && order.user_id.toString() !== user_id.toString()) {
        throw new Error("Bạn không có quyền xem chi tiết đơn hàng này");
    }

    const orderDetails = await OrderDetailModel.find({ order_id })
        .populate("product_id", "name image price");

    const formattedItems = orderDetails.map(item => ({
        product_id: item.product_id._id,
        name: item.product_id.name,
        image: item.product_id.image,
        price: item.price,
        quantity: item.quantity,
        subtotal: item.price * item.quantity
    }));

    const userInfo = role === 'admin'
        ? await UserModel.findById(order.user_id).select("full_name email")
        : null;

    return {
        order_id: order._id,
        total_price: order.total_price,
        createdAt: order.createdAt,
        receiver_name: order.receiver_name,
        receiver_phone: order.receiver_phone,
        receiver_address: order.receiver_address,
        user: userInfo ? {
            _id: userInfo._id,
            name: userInfo.full_name,
            email: userInfo.email
        } : undefined,
        order_status: {
            _id: order.order_status_id._id,
            name: order.order_status_id.name,
            description: order.order_status_id.description
        },
        items: formattedItems
    };
}



module.exports = {
    createOrderFromSelectedCartItems,
    getAllOrders,
    updateOrder,
    cancelOrderByCustomer,
    getOrderDetailByOrderId

};