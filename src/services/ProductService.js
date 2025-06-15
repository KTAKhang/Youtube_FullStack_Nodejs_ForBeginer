const ProductModel = require("../models/ProductsModel");
const CategoryModel = require("../models/CategoriesModel");
const cloudinary = require("../config/cloudinaryConfig");
const mongoose = require('mongoose'); // Đảm bảo đã import mongoose
const createProduct = async (newProduct, file) => {
    try {
        const {
            category_id,
            name,
            price,
            detail_desc,
            short_desc,
            quantity,
            sold = 0,
            factory,
            target,
        } = newProduct;


        const requiredFields = { category_id, name, price, detail_desc, short_desc, quantity, factory, target };
        for (const [key, value] of Object.entries(requiredFields)) {
            if (!value) {
                throw { status: "ERR", message: `Missing required field: ${key}` };
            }
        }


        const category = await CategoryModel.findById(category_id);
        if (!category) {
            throw { status: "ERR", message: "Category not found" };
        }


        const existingProduct = await ProductModel.findOne({ name });
        if (existingProduct) {
            throw { status: "ERR", message: "Product name already exists" };
        }


        let imageUrl = "";
        if (file) {
            const uploadResult = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { folder: "avatars" },
                    (error, result) => error ? reject(error) : resolve(result)
                );
                uploadStream.end(file.buffer);
            });
            imageUrl = uploadResult.secure_url;
        } else {
            throw { status: "ERR", message: "Product image is required" };
        }


        const product = await ProductModel.create({
            category_id,
            name,
            image: imageUrl,
            price,
            detail_desc,
            short_desc,
            quantity,
            sold,
            factory,
            target,
        });

        return {
            status: "OK",
            message: "Product created successfully",
            data: product,
        };
    } catch (error) {
        throw {
            status: error.status || "ERR",
            message: error.message || "Something went wrong",
        };
    }
};


const updateProduct = async (id, updateData, file) => {
    try {
        const existingProduct = await ProductModel.findById(id);
        if (!existingProduct) {
            return { status: "ERR", message: "Product not found" };
        }

        // Upload ảnh nếu có file mới
        let imageUrl = existingProduct.image;
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

        // Gộp dữ liệu cần cập nhật
        const updatedFields = {
            category_id: updateData.category_id || existingProduct.category_id,
            name: updateData.name || existingProduct.name,
            image: imageUrl,
            price: updateData.price || existingProduct.price,
            detail_desc: updateData.detail_desc || existingProduct.detail_desc,
            short_desc: updateData.short_desc || existingProduct.short_desc,
            quantity: updateData.quantity || existingProduct.quantity,
            sold: updateData.sold ?? existingProduct.sold,
            factory: updateData.factory || existingProduct.factory,
            target: updateData.target || existingProduct.target,
            status: updateData.status || existingProduct.status,
        };

        const updatedProduct = await ProductModel.findByIdAndUpdate(
            id,
            updatedFields,
            { new: true }
        ).populate("category_id", "name -_id");

        return {
            status: "OK",
            message: "Product updated successfully",
            data: updatedProduct,
        };
    } catch (error) {
        throw {
            status: error.status || "ERR",
            message: error.message || "Internal Server Error",
        };
    }
};


const getAllProducts = (page, limit, search = "") => {
    return new Promise(async (resolve, reject) => {
        try {
            let query = {};

            if (search) {
                if (mongoose.Types.ObjectId.isValid(search)) {
                    // Trường hợp 1: search là ID sản phẩm
                    query._id = search;
                } else {
                    // Trường hợp 2: Tìm theo tên sản phẩm
                    query.name = { $regex: search, $options: 'i' };

                    // Kiểm tra có sản phẩm nào khớp không
                    const matchedProducts = await ProductModel.find(query);
                    if (matchedProducts.length === 0) {
                        // Trường hợp 3: Không có sản phẩm nào -> tìm theo tên category
                        const matchingCategories = await CategoryModel.find({
                            name: { $regex: search, $options: 'i' }
                        });

                        const categoryIds = matchingCategories.map(cat => cat._id);

                        // Reset query
                        query = {
                            category_id: { $in: categoryIds }
                        };
                    }
                }
            }


            const allProducts = await ProductModel.find(query).populate("category_id", "name -_id");

            const listProductData = allProducts.map(product => ({
                _id: product._id,
                name: product.name,
                image: product.image,
                price: product.price,
                detail_desc: product.detail_desc,
                short_desc: product.short_desc,
                quantity: product.quantity,
                sold: product.sold,
                factory: product.factory,
                target: product.target,
                category_name: product.category_id.name,
                status: product.status,
                createdAt: product.createdAt,
                updatedAt: product.updatedAt,
            }));

            // Sắp xếp theo ngày tạo
            listProductData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            // Thống kê số lượng theo status
            const totalActive = listProductData.filter(p => p.status === true).length;
            const totalInactive = listProductData.filter(p => p.status === false).length;

            // Phân trang
            const totalProduct = listProductData.length;
            const totalPage = limit ? Math.ceil(totalProduct / limit) : 1;
            const currentPage = page || 1;

            const paginatedData =
                page && limit
                    ? listProductData.slice((page - 1) * limit, page * limit)
                    : listProductData;

            const dataOutput = {
                total: {
                    currentPage,
                    totalProduct,
                    totalPage,
                    totalActive,
                    totalInactive,
                },
                products: paginatedData,

            };

            resolve({
                status: "OK",
                message: "Successfully retrieved products",
                data: dataOutput,
            });
        } catch (error) {
            reject(error);
        }
    });
};



const getProductById = async (id) => {
    try {
        const product = await ProductModel.findById(id).populate("category_id", "name -_id");
        if (!product) {
            return { status: "ERR", message: "Product not found" };
        }
        return {
            status: "OK",
            message: "Product retrieved successfully",
            data: product,
        };
    } catch (error) {
        throw error;
    }
};

module.exports = {
    createProduct,
    updateProduct,
    getAllProducts,
    getProductById,
};
