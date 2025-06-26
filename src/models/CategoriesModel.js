const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Tên danh mục là bắt buộc"],
        trim: true,
        minlength: [2, "Tên danh mục phải có ít nhất 2 ký tự"],
        maxlength: [100, "Tên danh mục không được vượt quá 100 ký tự"],
        unique: true,
    },
    image: {
        type: String,
        trim: true,
        required: [true, "Tên danh mục là bắt buộc"],
    },
    status: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});

const CategoriesModel = mongoose.model("categories", categorySchema);
module.exports = CategoriesModel;
