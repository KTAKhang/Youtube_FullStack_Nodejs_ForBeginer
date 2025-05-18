const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
    },
    total_price: { type: Number, required: true },
    note: String,
    receiver_address: { type: String, required: true },
    receiver_name: { type: String, required: true },
    receiver_phone: { type: Number, required: true },
    status: { type: Boolean, required: true }
}, {
    timestamps: true,
});

const OrderModel = mongoose.model("orders", orderSchema);
module.exports = OrderModel;