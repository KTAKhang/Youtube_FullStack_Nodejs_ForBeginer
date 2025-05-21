const express = require("express");
const routerRole = express.Router();
const roleController = require("../controller/RoleController");
const {
    authMiddleware,
    authAdminMiddleware,
    authUserMiddleware,
} = require("../middleware/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Roles
 *   description: API quản lý vai trò
 */


/**
 * @swagger
 * /role:
 *   get:
 *     summary: Lấy danh sách vai trò người dùng
 *     description: Trả về toàn bộ danh sách các role (vai trò) hiện có trong hệ thống.
 *     tags:
 *       - Roles
 *     responses:
 *       200:
 *         description: Lấy danh sách role thành công
 *       500:
 *         description: Lỗi server nội bộ
 */
routerRole.get("/", authUserMiddleware, roleController.getAllRole);

module.exports = routerRole;
