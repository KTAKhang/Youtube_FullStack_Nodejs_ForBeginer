const ProductReviewModel = require("../models/ProductReviewsModel");
const OrderDetailModel = require("../models/OrderDetailModel");
const OrderModel = require("../models/OrderModel");
const OrderStatusModel = require("../models/OrderStatusModel");
const ProductModel = require("../models/ProductsModel");
const UserModel = require("../models/UserModel");


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
        .populate("user_id", "user_name avatar")
        .sort({ createdAt: -1 });

    return reviews.map(review => ({
        _id: review._id,
        rating: review.rating,
        content: review.review_content,
        createdAt: review.createdAt,
        user: {
            _id: review.user_id._id,
            name: review.user_id.user_name,
            avatar: review.user_id.avatar
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

async function getAllReviewsForAdmin(page = 1, limit = 10, search = "") {
    const query = {};

    // Nếu có search
    if (search) {
        const searchRegex = new RegExp(search, "i");

        // Nếu search là số, kiểm tra để tìm theo rating
        const isNumeric = !isNaN(search);
        const ratingFilter = isNumeric ? { rating: Number(search) } : {};

        // Tìm user có user_name hoặc email giống search
        const matchingUsers = await UserModel.find({
            $or: [
                { user_name: { $regex: searchRegex } },
                { email: { $regex: searchRegex } }
            ]
        }).select("_id");

        const matchingUserIds = matchingUsers.map(user => user._id);

        // Thêm điều kiện vào query
        query.$or = [
            ...(isNumeric ? [{ rating: Number(search) }] : []),
            ...(matchingUserIds.length > 0 ? [{ user_id: { $in: matchingUserIds } }] : [])
        ];
    }

    const totalReview = await ProductReviewModel.countDocuments(query);
    const totalApproved = await ProductReviewModel.countDocuments({ ...query, status: true });
    const totalPending = await ProductReviewModel.countDocuments({ ...query, status: false });
    const totalPage = limit ? Math.ceil(totalReview / limit) : 1;
    const currentPage = page;

    const reviews = await ProductReviewModel.find(query)
        .populate("user_id", "user_name email avatar")
        .populate("product_id", "name")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

    const reviewList = reviews.map(review => ({
        _id: review._id,
        product: {
            _id: review.product_id._id,
            name: review.product_id.name
        },
        user: {
            _id: review.user_id._id,
            user_name: review.user_id.user_name,
            email: review.user_id.email,
            avatar: review.user_id.avatar
        },
        rating: review.rating,
        content: review.review_content,
        status: review.status,
        createdAt: review.createdAt
    }));

    return {
        total: {
            currentPage,
            totalReview,
            totalPage,
            totalApproved,
            totalPending
        },
        reviews: reviewList
    };
}


async function getProductReviewByOrderDetailId(order_detail_id) {
    const review = await ProductReviewModel.findOne({ order_detail_id })
        .populate("user_id", "full_name")
        .populate("product_id", "name");

    if (!review) {
        throw new Error("Không tìm thấy đánh giá cho chi tiết đơn hàng này");
    }

    return {
        _id: review._id,
        product: {
            _id: review.product_id._id,
            name: review.product_id.name
        },
        user: {
            _id: review.user_id._id,
            name: review.user_id.full_name
        },
        rating: review.rating,
        content: review.review_content,
        status: review.status,
        createdAt: review.createdAt
    };
}

async function getProductReviewByOrderId(order_id) {
    // Tìm tất cả order_detail thuộc order_id này
    const orderDetails = await OrderDetailModel.find({ order_id });

    if (!orderDetails || orderDetails.length === 0) {
        throw new Error("Không tìm thấy chi tiết đơn hàng cho order_id này");
    }

    const orderDetailIds = orderDetails.map(od => od._id);

    // Tìm các review tương ứng với các order_detail_id
    const reviews = await ProductReviewModel.find({ order_detail_id: { $in: orderDetailIds } })
        .populate("user_id", "full_name")
        .populate("product_id", "name");

    return reviews.map(review => ({
        _id: review._id,
        product: {
            _id: review.product_id._id,
            name: review.product_id.name
        },
        user: {
            _id: review.user_id._id,
            name: review.user_id.full_name
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
    getAllReviewsByUserId,
    getProductReviewByOrderDetailId,
    getProductReviewByOrderId
};
