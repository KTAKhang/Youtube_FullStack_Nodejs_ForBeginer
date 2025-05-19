const mongoose = require("mongoose");

const productReviewSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
    },
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "products",
        required: true,
    },
    order_detail_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "order_details",
        required: true,
    },
    rating: { type: Number, required: true, min: 1, max: 5 },
    review_content: String,
    status: { type: Boolean, required: true, default: true }
}, {
    timestamps: true,
});

const ProductReviewModel = mongoose.model("product_reviews", productReviewSchema);
module.exports = ProductReviewModel;
