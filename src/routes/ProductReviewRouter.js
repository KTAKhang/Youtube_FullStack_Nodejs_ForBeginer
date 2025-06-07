const express = require("express");
const routerReview = express.Router();
const productReviewController = require("../controller/ProductReviewController");
const { authMiddleware, authAdminMiddleware, authUserMiddleware } = require("../middleware/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: ProductReviews
 *   description: API đánh giá sản phẩm
 */

/**
 * @swagger
 * /product-review/create:
 *   post:
 *     summary: Tạo đánh giá cho sản phẩm (chỉ khi đơn hàng đã giao)
 *     tags: [ProductReviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product_id
 *               - order_detail_id
 *               - rating
 *               - review_content
 *             properties:
 *               product_id:
 *                 type: string
 *               order_detail_id:
 *                 type: string
 *               rating:
 *                 type: number
 *               review_content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Đánh giá thành công
 *       400:
 *         description: Dữ liệu không hợp lệ hoặc chưa đủ điều kiện đánh giá
 */
routerReview.post("/create", authUserMiddleware, productReviewController.createReview);

/**
 * @swagger
 * /product-review/update/{id}:
 *   put:
 *     summary: Cập nhật đánh giá (admin hoặc chủ đánh giá)
 *     tags: [ProductReviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của đánh giá
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: number
 *               review_content:
 *                 type: string
 *               status:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       400:
 *         description: Không hợp lệ
 */
routerReview.put("/update/:id", authUserMiddleware, productReviewController.updateReview);

/**
 * @swagger
 * /product-review/user:
 *   get:
 *     summary: Lấy tất cả đánh giá đã được duyệt của sản phẩm
 *     tags: [ProductReviews]
 *     parameters:
 *       - in: path
 *         name: product_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID sản phẩm
 *     responses:
 *       200:
 *         description: Thành công
 *       404:
 *         description: Không tìm thấy đánh giá
 */
routerReview.get("/user", authUserMiddleware, productReviewController.getProductReviewsByUserId);

/**
 * @swagger
 * /product-review/product/{product_id}:
 *   get:
 *     summary: Lấy tất cả đánh giá đã được duyệt của sản phẩm
 *     tags: [ProductReviews]
 *     parameters:
 *       - in: path
 *         name: product_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID sản phẩm
 *     responses:
 *       200:
 *         description: Thành công
 *       404:
 *         description: Không tìm thấy đánh giá
 */
routerReview.get("/product/:product_id", productReviewController.getProductReviews);

/**
 * @swagger
 * /product-review/all:
 *   get:
 *     summary: Lấy toàn bộ đánh giá (chỉ admin)
 *     tags: [ProductReviews]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lấy danh sách đánh giá thành công
 *       403:
 *         description: Không có quyền truy cập
 */
routerReview.get("/all", authAdminMiddleware, productReviewController.getAllReviewsForAdmin);

/**
 * @swagger
 * /product-review/order-detail/{order_detail_id}:
 *   get:
 *     summary: Lấy đánh giá theo ID chi tiết đơn hàng
 *     tags: [ProductReviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: order_detail_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID chi tiết đơn hàng
 *     responses:
 *       200:
 *         description: Lấy đánh giá thành công
 *       404:
 *         description: Không tìm thấy đánh giá
 */
routerReview.get(
    "/order-detail/:order_detail_id",
    authUserMiddleware,
    productReviewController.getProductReviewByOrderDetailId
);

/**
 * @swagger
 * /product-review/order/{order_id}:
 *   get:
 *     summary: Lấy danh sách đánh giá theo ID đơn hàng
 *     tags: [ProductReviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: order_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID đơn hàng
 *     responses:
 *       200:
 *         description: Lấy đánh giá theo đơn hàng thành công
 *       404:
 *         description: Không tìm thấy đánh giá
 */
routerReview.get(
    "/order/:order_id",
    authUserMiddleware,
    productReviewController.getProductReviewsByOrderId
);


module.exports = routerReview;
