const ProductReviewModel = require("../models/ProductReviewsModel");
const OrderDetailModel = require("../models/OrderDetailModel");
const OrderModel = require("../models/OrderModel");
const OrderStatusModel = require("../models/OrderStatusModel");
const ProductModel = require("../models/ProductsModel");

async function createProductReview({ user_id, product_id, order_detail_id, rating, review_content }) {
    const orderDetail = await OrderDetailModel.findById(order_detail_id);
    if (!orderDetail || orderDetail.product_id.toString() !== product_id.toString()) {
        throw new Error("Chi tiết đơn hàng hoặc sẳn phẩm không hợp lệ");
    }

    const order = await OrderModel.findById(orderDetail.order_id);
    if (!order || order.user_id.toString() !== user_id.toString()) {
        throw new Error("Bạn không có quyền đánh giá đơn hàng này");
    }

    const deliveredStatus = await OrderStatusModel.findOne({ name: "DELIVERED" });
    if (!deliveredStatus || order.order_status_id.toString() !== deliveredStatus._id.toString()) {
        throw new Error("Chỉ có thể đánh giá sau khi đơn hàng đã giao thành công (DELIVERED)");
    }

    const existingReview = await ProductReviewModel.findOne({
        user_id,
        product_id,
        order_detail_id
    });

    if (existingReview) {
        throw new Error("Bạn đã đánh giá sản phẩm này rồi");
    }

    const newReview = await ProductReviewModel.create({
        user_id,
        product_id,
        order_detail_id,
        rating,
        review_content
    });

    return {
        success: true,
        message: "Đánh giá sản phẩm thành công",
        review: newReview
    };
}

async function updateReview(review_id, updateData, role, user_id) {
    const review = await ProductReviewModel.findById(review_id);
    if (!review) throw new Error("Không tìm thấy đánh giá");

    const updateFields = {};

    // Nếu là admin: chỉ được phép thay đổi status
    if (role === "admin") {
        if (typeof updateData.status === "boolean") {
            updateFields.status = updateData.status;
        } else {
            throw new Error("Admin chỉ có thể cập nhật trạng thái (status)");
        }
    }
    // Nếu là customer (chủ đánh giá): chỉ được cập nhật rating và review_content
    else if (role === "customer") {
        if (review.user_id.toString() !== user_id.toString()) {
            throw new Error("Bạn không có quyền chỉnh sửa đánh giá này");
        }
        if (updateData.rating) {
            if (updateData.rating < 1 || updateData.rating > 5) {
                throw new Error("Rating phải từ 1 đến 5");
            }
            updateFields.rating = updateData.rating;
        }
        if (typeof updateData.review_content === "string") {
            updateFields.review_content = updateData.review_content;
        }
    } else {
        throw new Error("Vai trò không hợp lệ");
    }

    if (Object.keys(updateFields).length === 0) {
        throw new Error("Không có dữ liệu hợp lệ để cập nhật");
    }

    const updatedReview = await ProductReviewModel.findByIdAndUpdate(
        review_id,
        updateFields,
        { new: true }
    );

    return {
        success: true,
        message: "Cập nhật đánh giá thành công",
        review: updatedReview
    };
}

async function getAllReviews(product_id) {
    const reviews = await ProductReviewModel.find({ product_id, status: true })
        .populate("user_id", "full_name")
        .sort({ createdAt: -1 });

    return reviews.map(review => ({
        _id: review._id,
        rating: review.rating,
        content: review.review_content,
        createdAt: review.createdAt,
        user: {
            _id: review.user_id._id,
            name: review.user_id.full_name
        }
    }));
}

async function getAllReviewsByUserId(user_id) {
    const reviews = await ProductReviewModel.find({ user_id, status: true })
        .populate("user_id", "full_name")
        .sort({ createdAt: -1 });
    return reviews.map(review => ({
        _id: review._id,
        product: {
            _id: review.product_id._id,
            name: review.product_id.name
        },
        rating: review.rating,
        content: review.review_content,
        createdAt: review.createdAt
    }));
}

async function getAllReviewsForAdmin() {
    const reviews = await ProductReviewModel.find()
        .populate("user_id", "full_name email")
        .populate("product_id", "name")
        .sort({ createdAt: -1 });

    return reviews.map(review => ({
        _id: review._id,
        product: {
            _id: review.product_id._id,
            name: review.product_id.name
        },
        user: {
            _id: review.user_id._id,
            name: review.user_id.full_name,
            email: review.user_id.email
        },
        rating: review.rating,
        content: review.review_content,
        status: review.status,
        createdAt: review.createdAt
    }));
}


module.exports = {
    createProductReview,
    getAllReviews,
    updateReview,
    getAllReviewsForAdmin,
    getAllReviewsByUserId
};
