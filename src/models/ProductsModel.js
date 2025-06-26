const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        category_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "categories",
            required: [true, "Danh mục sản phẩm là bắt buộc"],
        },
        name: {
            type: String,
            required: [true, "Tên sản phẩm là bắt buộc"],
            trim: true,
            minlength: [2, "Tên sản phẩm phải có ít nhất 2 ký tự"],
            maxlength: [100, "Tên sản phẩm không được vượt quá 100 ký tự"],
        },
        image: {
            type: String,
            trim: true,
        },
        price: {
            type: Number,
            required: [true, "Giá sản phẩm là bắt buộc"],
            min: [0, "Giá sản phẩm không được âm"],
        },
        detail_desc: {
            type: String,
            required: [true, "Mô tả chi tiết là bắt buộc"],
            trim: true,
            minlength: [10, "Mô tả chi tiết phải có ít nhất 10 ký tự"],
        },
        short_desc: {
            type: String,
            required: [true, "Mô tả ngắn là bắt buộc"],
            trim: true,
            maxlength: [200, "Mô tả ngắn không được vượt quá 200 ký tự"],
        },
        quantity: {
            type: Number,
            required: [true, "Số lượng là bắt buộc"],
            min: [0, "Số lượng không được âm"],
        },
        sold: {
            type: Number,
            default: 0,
            min: [0, "Số lượng đã bán không được âm"],
        },
        factory: {
            type: String,
            required: [true, "Nhà sản xuất là bắt buộc"],
            trim: true,
            maxlength: [100, "Tên nhà sản xuất không được vượt quá 100 ký tự"],
        },
        target: {
            type: String,
            required: [true, "Đối tượng sử dụng là bắt buộc"],
            trim: true,
            maxlength: [100, "Đối tượng sử dụng không được vượt quá 100 ký tự"],
        },
        status: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

const ProductModel = mongoose.model("products", productSchema);
module.exports = ProductModel;
