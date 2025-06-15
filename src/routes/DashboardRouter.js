const express = require("express");
const DashboardController = require("../controller/DashBoardController");
const DashboardRouter = express.Router();
const {
    authAdminMiddleware,
} = require("../middleware/authMiddleware");
/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: API quản lý dashboard và thống kê
 */

/**
 * @swagger
 * /dashboard/revenue-by-date:
 *   get:
 *     summary: Lấy doanh thu theo ngày
 *     description: API lấy thống kê doanh thu theo từng ngày trong khoảng thời gian được chỉ định.
 *     tags:
 *       [Dashboard]
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         example: "2024-01-01"
 *         description: Ngày bắt đầu (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         example: "2024-01-31"
 *         description: Ngày kết thúc (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Lấy doanh thu theo ngày thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "OK"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                         format: date
 *                         example: "2024-01-01"
 *                       totalRevenue:
 *                         type: number
 *                         example: 1500000
 *                       orderCount:
 *                         type: number
 *                         example: 25
 *       400:
 *         description: Thiếu tham số startDate hoặc endDate
 *       500:
 *         description: Lỗi server
 */
DashboardRouter.get("/revenue-by-date", authAdminMiddleware, DashboardController.getRevenueByDate);

/**
 * @swagger
 * /dashboard/new-customers-by-date:
 *   get:
 *     summary: Lấy số khách hàng mới theo ngày
 *     description: API lấy thống kê số khách hàng mới đăng ký theo từng ngày trong khoảng thời gian được chỉ định.
 *     tags:
 *       [Dashboard]
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         example: "2024-01-01"
 *         description: Ngày bắt đầu (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         example: "2024-01-31"
 *         description: Ngày kết thúc (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Lấy số khách hàng mới theo ngày thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "OK"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                         format: date
 *                         example: "2024-01-01"
 *                       newCustomers:
 *                         type: number
 *                         example: 12
 *       400:
 *         description: Thiếu tham số startDate hoặc endDate
 *       500:
 *         description: Lỗi server
 */
DashboardRouter.get("/new-customers-by-date", authAdminMiddleware, DashboardController.getNewCustomersByDate);

/**
 * @swagger
 * /dashboard/sales-by-date:
 *   get:
 *     summary: Lấy doanh số theo ngày
 *     description: API lấy thống kê số đơn hàng và tổng tiền theo từng ngày trong khoảng thời gian được chỉ định.
 *     tags:
 *       [Dashboard]
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         example: "2024-01-01"
 *         description: Ngày bắt đầu (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         example: "2024-01-31"
 *         description: Ngày kết thúc (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Lấy doanh số theo ngày thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "OK"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                         format: date
 *                         example: "2024-01-01"
 *                       totalOrders:
 *                         type: number
 *                         example: 25
 *                       totalAmount:
 *                         type: number
 *                         example: 1500000
 *       400:
 *         description: Thiếu tham số startDate hoặc endDate
 *       500:
 *         description: Lỗi server
 */
DashboardRouter.get("/sales-by-date", authAdminMiddleware, DashboardController.getSalesByDate);

/**
 * @swagger
 * /dashboard/overview:
 *   get:
 *     summary: Lấy tổng quan dashboard
 *     description: API lấy thống kê tổng quan bao gồm tổng người dùng, tổng đơn hàng, tổng doanh thu và tổng sản phẩm.
 *     tags:
 *       [Dashboard]
 *     responses:
 *       200:
 *         description: Lấy tổng quan dashboard thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "OK"
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalUsers:
 *                       type: number
 *                       example: 1250
 *                       description: Tổng số người dùng
 *                     totalOrders:
 *                       type: number
 *                       example: 3450
 *                       description: Tổng số đơn hàng
 *                     totalRevenue:
 *                       type: number
 *                       example: 125000000
 *                       description: Tổng doanh thu
 *                     totalProducts:
 *                       type: number
 *                       example: 150
 *                       description: Tổng số sản phẩm
 *       500:
 *         description: Lỗi server
 */
DashboardRouter.get("/overview", authAdminMiddleware, DashboardController.getDashboardOverview);

/**
 * @swagger
 * /dashboard/top-selling-products:
 *   get:
 *     summary: Lấy danh sách sản phẩm bán chạy nhất
 *     description: API lấy danh sách top sản phẩm bán chạy nhất dựa trên số lượng đã bán.
 *     tags:
 *       [Dashboard]
 *     parameters:
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 20
 *         example: 3
 *         description: Số lượng sản phẩm muốn lấy (mặc định là 3)
 *     responses:
 *       200:
 *         description: Lấy danh sách sản phẩm bán chạy thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "OK"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       productId:
 *                         type: string
 *                         example: "64a7b8c9d1e2f3a4b5c6d7e8"
 *                       productName:
 *                         type: string
 *                         example: "iPhone 15 Pro Max"
 *                       productImage:
 *                         type: string
 *                         example: "iphone15promax.jpg"
 *                       productPrice:
 *                         type: number
 *                         example: 29999000
 *                       totalQuantitySold:
 *                         type: number
 *                         example: 150
 *                       totalRevenue:
 *                         type: number
 *                         example: 4499850000
 *                       orderCount:
 *                         type: number
 *                         example: 125
 *       500:
 *         description: Lỗi server
 */
DashboardRouter.get("/top-selling-products", authAdminMiddleware, DashboardController.getTopSellingProducts);

/**
 * @swagger
 * /dashboard/complete-dashboard:
 *   get:
 *     summary: Lấy tất cả dữ liệu dashboard
 *     description: API lấy tất cả thống kê dashboard bao gồm doanh thu theo ngày, khách hàng mới, doanh số, tổng quan và top sản phẩm.
 *     tags:
 *       [Dashboard]
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         example: "2024-01-01"
 *         description: Ngày bắt đầu (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         example: "2024-01-31"
 *         description: Ngày kết thúc (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Lấy tất cả dữ liệu dashboard thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "OK"
 *                 data:
 *                   type: object
 *                   properties:
 *                     revenueByDate:
 *                       type: array
 *                       description: Doanh thu theo ngày
 *                     newCustomersByDate:
 *                       type: array
 *                       description: Khách hàng mới theo ngày
 *                     salesByDate:
 *                       type: array
 *                       description: Doanh số theo ngày
 *                     overview:
 *                       type: object
 *                       description: Tổng quan dashboard
 *                     topSellingProducts:
 *                       type: array
 *                       description: Top 3 sản phẩm bán chạy
 *       400:
 *         description: Thiếu tham số startDate hoặc endDate
 *       500:
 *         description: Lỗi server
 */
DashboardRouter.get("/complete-dashboard", authAdminMiddleware, DashboardController.getCompleteDashboard);

/**
 * @swagger
 * /dashboard/revenue-by-month:
 *   get:
 *     summary: Thống kê doanh thu theo tháng
 *     description: API trả về doanh thu và số lượng đơn hàng của từng tháng trong năm được chỉ định.
 *     tags:
 *       - Dashboard
 *     parameters:
 *       - in: query
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 2000
 *           maximum: 2100
 *         example: 2024
 *         description: "Năm cần thống kê (ví dụ: 2024)"
 *     responses:
 *       200:
 *         description: Lấy thống kê doanh thu theo tháng thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       month:
 *                         type: integer
 *                         minimum: 1
 *                         maximum: 12
 *                         example: 1
 *                         description: Tháng trong năm (1 - 12)
 *                       totalRevenue:
 *                         type: number
 *                         example: 15000000
 *                         description: Tổng doanh thu của tháng (VNĐ)
 *                       orderCount:
 *                         type: integer
 *                         example: 250
 *                         description: Tổng số đơn hàng trong tháng
 *       400:
 *         description: Thiếu hoặc sai định dạng tham số year
 *       500:
 *         description: Lỗi server nội bộ
 */
DashboardRouter.get("/revenue-by-month", authAdminMiddleware, DashboardController.getRevenueByMonth);

/**
 * @swagger
 * /dashboard/top-products-by-category:
 *   get:
 *     summary: Lấy sản phẩm bán chạy nhất theo danh mục
 *     description: API lấy sản phẩm bán chạy nhất trong từng danh mục sản phẩm.
 *     tags:
 *       [Dashboard]
 *     responses:
 *       200:
 *         description: Lấy sản phẩm bán chạy theo danh mục thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "OK"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       categoryId:
 *                         type: string
 *                         example: "64a7b8c9d1e2f3a4b5c6d7e8"
 *                       categoryName:
 *                         type: string
 *                         example: "Điện thoại"
 *                       topProduct:
 *                         type: object
 *                         properties:
 *                           productId:
 *                             type: string
 *                             example: "64a7b8c9d1e2f3a4b5c6d7e9"
 *                           productName:
 *                             type: string
 *                             example: "iPhone 15 Pro Max"
 *                           totalQuantitySold:
 *                             type: number
 *                             example: 150
 *                           totalRevenue:
 *                             type: number
 *                             example: 4499850000
 *       500:
 *         description: Lỗi server
 */
DashboardRouter.get("/top-products-by-category", authAdminMiddleware, DashboardController.getTopProductsByCategory);

module.exports = DashboardRouter;