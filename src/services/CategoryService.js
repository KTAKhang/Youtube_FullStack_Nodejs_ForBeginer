const CategoriesModel = require("../models/CategoriesModel");
const cloudinary = require("../config/cloudinaryConfig");

// Tạo mới danh mục
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

// Cập nhật danh mục
const updateCategory = async (id, data, file) => {
    try {
        const category = await CategoriesModel.findById(id);
        if (!category) {
            return { status: "ERR", message: "Category does not exist" };
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

// Lấy tất cả danh mục (có phân trang nếu truyền page & limit)
const getAllCategories = (page, limit) => {
    return new Promise(async (resolve, reject) => {
        try {
            const allCategories = await CategoriesModel.find();

            allCategories.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            let categoryList = allCategories;
            if (page && limit) {
                categoryList = categoryList.slice((page - 1) * limit, page * limit);
            }

            const dataOutput = {
                categories: categoryList,
                total: {
                    currentPage: page,
                    totalCategory: allCategories.length,
                    totalPage: limit ? Math.ceil(allCategories.length / limit) : 1,
                },
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
