const CategoriesModel = require("../models/CategoriesModel");
const cloudinary = require("../config/cloudinaryConfig");
const mongoose = require('mongoose');

const createCategory = async ({ name }, file) => {
    try {
        const existingCategory = await CategoriesModel.findOne({ name });
        if (existingCategory) {
            throw { status: "ERR", message: "Category already exists" };
        }

        let imageUrl = "";
        if (file) {
            const uploadResult = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { folder: "avatars" },
                    (error, result) => (error ? reject(error) : resolve(result))
                );
                uploadStream.end(file.buffer);
            });

            imageUrl = uploadResult.secure_url;
        }

        const createdCategory = await CategoriesModel.create({
            name,
            image: imageUrl,
        });

        return {
            status: "OK",
            message: "Category created successfully",
            data: createdCategory,
        };
    } catch (error) {
        throw error;
    }
};

const updateCategory = async (id, data, file) => {
    try {
        const category = await CategoriesModel.findById(id);
        if (!category) {
            return { status: "ERR", message: "Category does not exist" };
        }

        // Kiểm tra nếu name mới khác name cũ → cần kiểm tra trùng
        if (data.name && data.name !== category.name) {
            const existingCategory = await CategoriesModel.findOne({ name: data.name });
            if (existingCategory) {
                return { status: "ERR", message: "Category name already exists" };
            }
        }

        if (file) {
            if (category.image) {
                const oldImageId = category.image.split("/").pop().split(".")[0];
                await cloudinary.uploader.destroy(`categories/${oldImageId}`);
            }

            const uploadResult = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { folder: "categories" },
                    (error, result) => (error ? reject(error) : resolve(result))
                );
                uploadStream.end(file.buffer);
            });

            data.image = uploadResult.secure_url;
        }

        const updatedCategory = await CategoriesModel.findByIdAndUpdate(
            id,
            {
                name: data.name || category.name,
                status: data.status || category.status,
                image: data.image || category.image,
            },
            { new: true }
        );

        return {
            status: "OK",
            message: "Category updated successfully",
            data: updatedCategory,
        };
    } catch (error) {
        return { status: "ERR", message: error.message };
    }
};




const getAllCategories = (page, limit, search) => {
    return new Promise(async (resolve, reject) => {
        try {
            let query = {};

            if (search) {
                // Nếu search là ObjectId hợp lệ, tìm theo ID
                if (mongoose.Types.ObjectId.isValid(search)) {
                    query._id = search;
                } else {
                    // Ngược lại, tìm theo tên (không phân biệt hoa thường)
                    query.name = { $regex: search, $options: 'i' };
                }
            }

            // Truy vấn và sắp xếp
            const allCategories = await CategoriesModel.find(query).sort({ createdAt: -1 });

            // Đếm số lượng theo status
            const totalActive = allCategories.filter(cat => cat.status === true).length;
            const totalInactive = allCategories.filter(cat => cat.status === false).length;

            // Phân trang
            let categoryList = allCategories;
            if (page && limit) {
                categoryList = categoryList.slice((page - 1) * limit, page * limit);
            }

            const dataOutput = {
                total: {
                    currentPage: page,
                    totalCategory: allCategories.length,
                    totalPage: limit ? Math.ceil(allCategories.length / limit) : 1,
                    totalActive,
                    totalInactive
                },
                categories: categoryList,
            };

            resolve({
                status: "OK",
                message: "Successfully fetched all categories",
                data: dataOutput,
            });
        } catch (error) {
            reject(error);
        }
    });
};



// Lấy chi tiết danh mục theo ID
const getCategoryById = async (id) => {
    try {
        const category = await CategoriesModel.findById(id);
        if (!category) {
            return { status: "ERR", message: "Category does not exist" };
        }

        return {
            status: "OK",
            message: "Successfully fetched category",
            data: category,
        };
    } catch (error) {
        return { status: "ERR", message: error.message };
    }
};


module.exports = {
    createCategory,
    updateCategory,
    getAllCategories,
    getCategoryById,

};
