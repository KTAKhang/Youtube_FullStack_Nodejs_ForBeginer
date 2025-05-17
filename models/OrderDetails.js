const mongoose = require("mongoose");

const orderDetailSchema = new mongoose.Schema({
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "products",
        required: true,
    },
    order_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "orders",
        required: true,
    },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }
});

const OrderDetailModel = mongoose.model("order_details", orderDetailSchema);
module.exports = OrderDetailModel;