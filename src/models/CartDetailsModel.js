const mongoose = require("mongoose");

const cartDetailSchema = new mongoose.Schema({
    cart_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "carts",
        required: true,
    },
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "products",
        required: true,
    },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }
});

const CartDetailModel = mongoose.model("cart_details", cartDetailSchema);
module.exports = CartDetailModel;
