const express = require("express");
const routerProduct = express.Router();
const productController = require("../controller/ProductController");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

const {
    authMiddleware,
    authAdminMiddleware,
    authUserMiddleware,
} = require("../middleware/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: API quản lý sản phẩm
 */

/**
 * @swagger
 * /product/create:
 *   post:
 *     summary: Tạo sản phẩm mới (chỉ dành cho admin)
 *     description: Admin có quyền tạo sản phẩm mới, bao gồm cả ảnh.
 *     tags:
 *       - Products
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               category_id:
 *                 type: string
 *               price:
 *                 type: number
 *               short_desc:
 *                 type: string
 *               detail_desc:
 *                 type: string
 *               quantity:
 *                 type: number
 *               sold:
 *                 type: number
 *               factory:
 *                 type: string
 *               target:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Sản phẩm đã được tạo thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 */
routerProduct.post(
    "/create",
    authAdminMiddleware,
    upload.single("image"),
    productController.createProduct
);

/**
 * @swagger
 * /product/update/{id}:
 *   put:
 *     summary: Cập nhật sản phẩm (chỉ dành cho admin)
 *     description: Admin có thể cập nhật sản phẩm và ảnh.
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID của sản phẩm cần cập nhật
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               category_id:
 *                 type: string
 *               price:
 *                 type: number
 *               short_desc:
 *                 type: string
 *               detail_desc:
 *                 type: string
 *               quantity:
 *                 type: number
 *               sold:
 *                 type: number
 *               factory:
 *                 type: string
 *               target:
 *                 type: string
 *               status:
 *                 type: boolean
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Sản phẩm đã được cập nhật thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 */
routerProduct.put(
    "/update/:id",
    authAdminMiddleware,
    upload.single("image"),
    productController.updateProduct
);

/**
 * @swagger
 * /product:
 *   get:
 *     summary: Lấy danh sách sản phẩm (phân trang)
 *     description: Trả về danh sách các sản phẩm với phân trang.
 *     tags:
 *       - Products
 *     parameters:
 *       - in: query
 *         name: page
 *         required: true
 *         schema:
 *           type: integer
 *         description: Trang hiện tại (bắt đầu từ 1)
 *       - in: query
 *         name: limit
 *         required: true
 *         schema:
 *           type: integer
 *         description: Số lượng sản phẩm mỗi trang
 *     responses:
 *       200:
 *         description: Lấy danh sách sản phẩm thành công
 *       400:
 *         description: Tham số không hợp lệ
 */
routerProduct.get("/", productController.getAllProducts);

/**
 * @swagger
 * /product/{id}:
 *   get:
 *     summary: Lấy thông tin sản phẩm theo ID
 *     description: Trả về thông tin chi tiết của một sản phẩm theo ID.
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID sản phẩm
 *     responses:
 *       200:
 *         description: Thành công
 *       404:
 *         description: Không tìm thấy sản phẩm
 */
routerProduct.get("/:id", authUserMiddleware, productController.getProductById);

module.exports = routerProduct;
