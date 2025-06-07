const ProductReviewService = require("../services/ProductReviewService");

const createReview = async (req, res) => {
    try {
        const user_id = req.user._id;
        const { product_id, order_detail_id, rating, review_content } = req.body;

        if (!product_id || !order_detail_id || !rating || !review_content) {
            return res.status(400).json({
                success: false,
                message: "Thiếu thông tin cần thiết để đánh giá"
            });
        }

        const result = await ProductReviewService.createProductReview({
            user_id,
            product_id,
            order_detail_id,
            rating,
            review_content
        });

        return res.status(201).json(result);
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Tạo đánh giá thất bại"
        });
    }
};

const updateReview = async (req, res) => {
    try {
        const review_id = req.params.id;
        const updateData = req.body;
        const role = req.user.role;
        const user_id = req.user._id;

        if (!review_id) {
            return res.status(400).json({ success: false, message: "Thiếu ID đánh giá" });
        }

        const result = await ProductReviewService.updateReview(review_id, updateData, role, user_id);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || "Cập nhật đánh giá thất bại"
        });
    }
};

const getProductReviewsByUserId = async (req, res) => {
    try {
        const user_id = req.user._id;

        if (!user_id) {
            return res.status(400).json({
                success: false,
                message: "Thiếu ID người dùng"
            });
        }

        const reviews = await ProductReviewService.getAllReviewsByUserId(user_id);
        return res.status(200).json({
            success: true,
            message: "Lấy danh sách đánh giá thành công",
            data: reviews
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Lỗi máy chủ khi lấy đánh giá"
        });
    }
}

const getProductReviews = async (req, res) => {
    try {
        const product_id = req.params.product_id;

        if (!product_id) {
            return res.status(400).json({
                success: false,
                message: "Thiếu ID sản phẩm"
            });
        }

        const reviews = await ProductReviewService.getAllReviews(product_id);
        return res.status(200).json({
            success: true,
            message: "Lấy danh sách đánh giá thành công",
            data: reviews
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Lỗi máy chủ khi lấy đánh giá"
        });
    }
};

const getAllReviewsForAdmin = async (req, res) => {
    try {

        console.log("User role:", req.user);
        if (req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Chỉ admin mới có quyền xem toàn bộ đánh giá"
            });
        }

        const reviews = await ProductReviewService.getAllReviewsForAdmin();
        return res.status(200).json({
            success: true,
            message: "Lấy tất cả đánh giá thành công",
            data: reviews
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Lỗi máy chủ khi lấy đánh giá"
        });
    }
};

const getProductReviewByOrderDetailId = async (req, res) => {
    try {
        const { order_detail_id } = req.params;

        if (!order_detail_id) {
            return res.status(400).json({
                success: false,
                message: "Thiếu ID chi tiết đơn hàng"
            });
        }

        const review = await ProductReviewService.getProductReviewByOrderDetailId(order_detail_id);
        return res.status(200).json({
            success: true,
            message: "Lấy đánh giá thành công",
            data: review
        });
    } catch (error) {
        return res.status(404).json({
            success: false,
            message: error.message || "Không tìm thấy đánh giá"
        });
    }
};

const getProductReviewsByOrderId = async (req, res) => {
    try {
        const { order_id } = req.params;

        if (!order_id) {
            return res.status(400).json({
                success: false,
                message: "Thiếu ID đơn hàng"
            });
        }

        const reviews = await ProductReviewService.getProductReviewByOrderId(order_id);

        return res.status(200).json({
            success: true,
            message: "Lấy đánh giá theo đơn hàng thành công",
            data: reviews
        });
    } catch (error) {
        return res.status(404).json({
            success: false,
            message: error.message || "Không tìm thấy đánh giá cho đơn hàng"
        });
    }
};



module.exports = {
    createReview,
    updateReview,
    getProductReviews,
    getAllReviewsForAdmin,
    getProductReviewsByUserId,
    getProductReviewByOrderDetailId,
    getProductReviewsByOrderId

};
