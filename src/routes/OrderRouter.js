const express = require("express");
const routerOrder = express.Router();
const orderController = require("../controller/OrderController");

const {
    authAdminMiddleware,
    authMiddleware,
    authUserMiddleware
} = require("../middleware/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: API quản lý đơn hàng
 */

/**
 * @swagger
 * /order/create:
 *   post:
 *     summary: Tạo đơn hàng mới (khách hàng)
 *     description: Người dùng đã đăng nhập có thể tạo đơn hàng từ các sản phẩm trong giỏ hàng.
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               selected_product_ids:
 *                 type: array
 *                 items:
 *                   type: string
 *               receiverInfo:
 *                 type: object
 *                 properties:
 *                   receiver_name:
 *                     type: string
 *                   receiver_phone:
 *                     type: string
 *                   receiver_address:
 *                     type: string
 *     responses:
 *       201:
 *         description: Đơn hàng đã được tạo thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 */
routerOrder.post("/create", authUserMiddleware, orderController.createOrder);

/**
 * @swagger
 * /order/update/{id}:
 *   put:
 *     summary: Cập nhật đơn hàng (admin hoặc nhân viên)
 *     description: Cho phép admin/nhân viên cập nhật thông tin đơn hàng.
 *     tags:
 *       - Orders
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID đơn hàng
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: true
 *     responses:
 *       200:
 *         description: Cập nhật đơn hàng thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 */
routerOrder.put("/update/:id", authAdminMiddleware, orderController.updateOrder);

/**
 * @swagger
 * /order:
 *   get:
 *     summary: Lấy tất cả đơn hàng (tùy vai trò)
 *     description: Admin/nhân viên có thể xem tất cả, người dùng chỉ xem đơn của mình.
 *     tags:
 *       - Orders
 *     responses:
 *       200:
 *         description: Lấy danh sách đơn hàng thành công
 */
routerOrder.get("/", authUserMiddleware, orderController.getAllOrders);

/**
 * @swagger
 * /order/cancel/{id}:
 *   put:
 *     summary: Hủy đơn hàng (chỉ customer)
 *     description: Người dùng có vai trò customer có thể hủy đơn hàng chưa xử lý.
 *     tags:
 *       - Orders
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID đơn hàng cần hủy
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Hủy đơn hàng thành công
 *       403:
 *         description: Không có quyền
 */
routerOrder.put("/cancel/:id", authUserMiddleware, orderController.cancelOrder);

module.exports = routerOrder;
