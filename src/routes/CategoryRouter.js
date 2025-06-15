const express = require("express");
const routerCategory = express.Router();
const categoryController = require("../controller/CategoryController");
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
 *   name: Categories
 *   description: API quản lý danh mục (Category)
 */

/**
 * @swagger
 * /category/create:
 *   post:
 *     summary: Tạo danh mục mới (chỉ dành cho admin)
 *     description: Admin có quyền tạo mới danh mục (category).
 *     tags:
 *       - Categories
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Technology"
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Danh mục đã được tạo thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ERR"
 *                 message:
 *                   type: string
 *                   example: "Missing required field: name"
 */
routerCategory.post(
    "/create",
    authAdminMiddleware,
    upload.single("image"),
    categoryController.createCategory
);

/**
 * @swagger
 * /category/update/{id}:
 *   put:
 *     summary: Cập nhật danh mục (chỉ dành cho admin)
 *     description: Admin có thể cập nhật thông tin danh mục, bao gồm tên, trạng thái và hình ảnh.
 *     tags:
 *       - Categories
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID của danh mục cần cập nhật
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
 *                 example: "Updated Category Name"
 *               status:
 *                 type: boolean
 *                 example: true
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Danh mục đã được cập nhật thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ERR"
 *                 message:
 *                   type: string
 *                   example: "Name is required"
 *       500:
 *         description: Lỗi phía server
 */
routerCategory.put(
    "/update/:id",
    authAdminMiddleware,
    upload.single("image"),
    categoryController.updateCategory
);

/**
 * @swagger
 * /category:
 *   get:
 *     summary: Lấy tất cả danh mục
 *     description: Trả về danh sách các danh mục có phân trang và hỗ trợ tìm kiếm theo tên hoặc ID.
 *     tags:
 *       - Categories
 *     parameters:
 *       - in: query
 *         name: page
 *         required: true
 *         schema:
 *           type: integer
 *         description: Số trang hiện tại (bắt đầu từ 1)
 *       - in: query
 *         name: limit
 *         required: true
 *         schema:
 *           type: integer
 *         description: Số lượng danh mục trên mỗi trang
 *       - in: query
 *         name: search
 *         required: false
 *         schema:
 *           type: string
 *         description: Tìm kiếm theo tên danh mục hoặc ID (không phân biệt hoa thường)
 *     responses:
 *       200:
 *         description: Lấy danh sách danh mục thành công
 *       400:
 *         description: Tham số không hợp lệ
 *       500:
 *         description: Lỗi server
 */
routerCategory.get("/", categoryController.getAllCategories);



/**
 * @swagger
 * /category/{id}:
 *   get:
 *     summary: Lấy danh mục theo ID
 *     description: Trả về thông tin chi tiết của một danh mục theo ID.
 *     tags:
 *       - Categories
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của danh mục
 *     responses:
 *       200:
 *         description: Lấy danh mục thành công
 *       400:
 *         description: Thiếu ID danh mục
 *       500:
 *         description: Lỗi server
 */
routerCategory.get("/:id", categoryController.getCategoryById);


module.exports = routerCategory;
