const mongoose = require("mongoose");

const orderDetailSchema = new mongoose.Schema({
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "products",
        required: [true, "Sản phẩm là bắt buộc"],
    },
    order_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "orders",
        required: [true, "Đơn hàng là bắt buộc"],
    },
    quantity: {
        type: Number,
        required: [true, "Số lượng là bắt buộc"],
        min: [1, "Số lượng phải lớn hơn hoặc bằng 1"],
    },
    price: {
        type: Number,
        required: [true, "Giá là bắt buộc"],
        min: [0, "Giá không được âm"],
    },
});

const OrderDetailModel = mongoose.model("order_details", orderDetailSchema);
module.exports = OrderDetailModel;
