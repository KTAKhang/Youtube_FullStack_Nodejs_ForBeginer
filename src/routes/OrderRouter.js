const express = require("express");
const routerOrder = express.Router();
const orderController = require("../controller/OrderController");

const {
    authMiddleware,
    authAdminMiddleware,
    authUserMiddleware,
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
 *     summary: Tạo đơn hàng mới (chỉ user)
 *     tags:
 *       - Orders
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: string
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     product_id:
 *                       type: string
 *                     quantity:
 *                       type: number
 *               shipping_address:
 *                 type: string
 *               total_price:
 *                 type: number
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
 *     summary: Cập nhật đơn hàng (chỉ admin)
 *     tags:
 *       - Orders
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID của đơn hàng cần cập nhật
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *               delivery_status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Đơn hàng đã được cập nhật thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 */
routerOrder.put("/update/:id", authAdminMiddleware, orderController.updateOrder);

/**
 * @swagger
 * /order:
 *   get:
 *     summary: Lấy danh sách đơn hàng (phân trang)
 *     tags:
 *       - Orders
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *       - in: query
 *         name: user_id
 *         required: false
 *         schema:
 *           type: string
 *         description: Lọc đơn hàng theo người dùng (dành cho admin hoặc người dùng lấy đơn của chính họ)
 *     responses:
 *       200:
 *         description: Lấy danh sách đơn hàng thành công
 *       400:
 *         description: Tham số không hợp lệ
 */
routerOrder.get("/", authAdminMiddleware, orderController.getAllOrders);

/**
 * @swagger
 * /order/user:
 *   get:
 *     summary: Lấy đơn hàng của người dùng đang đăng nhập (phân trang)
 *     tags:
 *       - Orders
 *     parameters:
 *       - in: query
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của người dùng đang đăng nhập
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *         description: "Trang hiện tại (mặc định: 1)"
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *         description: "Số đơn hàng mỗi trang (mặc định: 10)"
 *     responses:
 *       200:
 *         description: Lấy đơn hàng thành công
 *       400:
 *         description: Thiếu hoặc sai user_id
 *       403:
 *         description: Không được phép truy cập đơn hàng của người khác
 *       500:
 *         description: Lỗi máy chủ
 */
routerOrder.get("/user", authUserMiddleware, orderController.getOrderByUserID);

/**
 * @swagger
 * /order/{id}:
 *   get:
 *     summary: Lấy thông tin đơn hàng theo ID
 *     tags:
 *       - Orders
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID của đơn hàng
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lấy chi tiết đơn hàng thành công
 *       404:
 *         description: Không tìm thấy đơn hàng
 */
routerOrder.get("/:id", authMiddleware, orderController.getOrderById);



/**
 * @swagger
 * /order/cancel/{id}:
 *   put:
 *     summary: Hủy đơn hàng (chỉ user, chỉ khi đơn thuộc về họ và chưa xử lý)
 *     tags:
 *       - Orders
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID của đơn hàng cần hủy
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Đơn hàng đã được hủy
 *       403:
 *         description: Không có quyền hủy đơn
 *       400:
 *         description: Không thể hủy đơn hàng đã xử lý
 */
routerOrder.put("/cancel/:id", authUserMiddleware, orderController.cancelOrder);

module.exports = routerOrder;