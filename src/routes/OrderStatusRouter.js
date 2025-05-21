const express = require("express");
const routerOrderStatus = express.Router();
const orderStatusController = require("../controller/OrderStatusController");
const {
    authMiddleware,
    authAdminMiddleware,
    authUserMiddleware,
} = require("../middleware/authMiddleware");

/**
 * @swagger
 * /order-status:
 *   get:
 *     summary: Lấy danh sách trạng thái đơn hàng
 *     description: Trả về toàn bộ danh sách các trạng thái đơn hàng hiện có.
 *     tags:
 *       - Order Status
 *     responses:
 *       200:
 *         description: Lấy danh sách trạng thái đơn hàng thành công
 *       500:
 *         description: Lỗi server nội bộ
 */
routerOrderStatus.get("/", authUserMiddleware, orderStatusController.getAllOrderStatus);

module.exports = routerOrderStatus;
