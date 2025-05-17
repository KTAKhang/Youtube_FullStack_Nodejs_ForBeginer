const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    image: String,
    status: {
        type: Boolean,
        required: true,
    },
},
    {
        timestamps: true,
    });

const CategoriesModel = mongoose.model("categories", categorySchema);
module.exports = CategoriesModel;
