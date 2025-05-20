const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    category_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "categories",
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    image: String,
    price: {
        type: Number,
        required: true,
    },
    detail_desc: {
        type: String,
        required: true,
    },
    short_desc: {
        type: String,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    sold: Number,
    factory: {
        type: String,
        required: true,
    },
    target: {
        type: String,
        required: true,
    },
    status: {
        type: Boolean,
        default: true
    },
},
    {
        timestamps: true,
    });

const ProductModel = mongoose.model("products", productSchema);
module.exports = ProductModel;
