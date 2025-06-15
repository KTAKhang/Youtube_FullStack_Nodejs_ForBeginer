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
 *     summary: Lấy tất cả đơn hàng (phân quyền theo vai trò)
 *     description: |
 *       - **Admin** và **nhân viên** có thể xem tất cả đơn hàng.  
 *       - **Người dùng thường** chỉ xem đơn hàng của chính mình.  
 *       - Hỗ trợ **phân trang** và **tìm kiếm** theo mã đơn hàng, trạng thái đơn hàng, hoặc thông tin người dùng (username/email).
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Trang hiện tại
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *         description: Số lượng đơn hàng mỗi trang
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Từ khóa tìm kiếm theo order_id, trạng thái, username hoặc email
 *     responses:
 *       200:
 *         description: Lấy danh sách đơn hàng thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Lấy danh sách đơn hàng thành công
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     orders:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           order_id:
 *                             type: string
 *                           total_price:
 *                             type: number
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           receiver_name:
 *                             type: string
 *                           receiver_phone:
 *                             type: string
 *                           receiver_address:
 *                             type: string
 *                           user:
 *                             type: object
 *                             nullable: true
 *                             properties:
 *                               _id:
 *                                 type: string
 *                               name:
 *                                 type: string
 *                               email:
 *                                 type: string
 *                           order_status:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                               name:
 *                                 type: string
 *                               description:
 *                                 type: string
 *                           items:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 order_details_id:
 *                                   type: string
 *                                 product_id:
 *                                   type: string
 *                                 name:
 *                                   type: string
 *                                 image:
 *                                   type: string
 *                                 price:
 *                                   type: number
 *                                 quantity:
 *                                   type: integer
 *                                 subtotal:
 *                                   type: number
 *                                 review_status:
 *                                   type: boolean
 *                                   nullable: true
 *                                 product_reviews_id:
 *                                   type: string
 *                                   nullable: true
 *       401:
 *         description: Không có token hoặc token không hợp lệ
 *       500:
 *         description: Lỗi máy chủ khi lấy đơn hàng
 */
routerOrder.get("/", authUserMiddleware, orderController.getAllOrders);

/**
 * @swagger
 * /order/status:
 *   get:
 *     summary: Lấy tất cả đơn hàng (theo vai trò, có lọc và phân trang)
 *     description: Admin/nhân viên có thể xem tất cả, người dùng chỉ xem đơn của mình. Có thể lọc theo trạng thái và phân trang.
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED, RETURNED]
 *         description: Lọc theo trạng thái đơn hàng
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Trang hiện tại
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *         description: Số lượng đơn hàng mỗi trang
 *     responses:
 *       200:
 *         description: Lấy danh sách đơn hàng thành công
 *       401:
 *         description: Chưa đăng nhập
 */
routerOrder.get("/status", authUserMiddleware, orderController.getAllOrdersByStatus);

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

/**
 * @swagger
 * /order/{id}:
 *   get:
 *     summary: Lấy chi tiết đơn hàng theo ID
 *     description: Trả về chi tiết đơn hàng, bao gồm các sản phẩm và trạng thái.
 *     tags:
 *       - Orders
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID đơn hàng cần xem
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lấy chi tiết đơn hàng thành công
 *       400:
 *         description: Thiếu ID đơn hàng
 *       500:
 *         description: Lỗi máy chủ
 */
routerOrder.get("/:id", authUserMiddleware, orderController.getOrderDetailById);


module.exports = routerOrder;
