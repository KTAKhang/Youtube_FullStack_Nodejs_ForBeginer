const express = require("express");
const routerUser = express.Router();
const userController = require("../controller/UserController");
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
 *   name: Users
 *   description: API quản lý người dùng
 */

/**
 * @swagger
 * /api/user/sign-up:
 *   post:
 *     summary: Đăng ký tài khoản mới dành cho role Administrator
 *     description: |
 *       Admin tạo người dùng mới có các role là Claimer , Approver, Finance , Administrator.
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_name:
 *                 type: string
 *                 example: "user01"       
 *               role:
 *                 type: string
 *                 example: "admin"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "example@gmail.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "1234"
 *     responses:
 *       200:
 *         description: Tài khoản đã được tạo thành công
 *       400:
 *         description: Dữ liệu đầu vào không hợp lệ
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
 *                   example: "Invalid email format"
 */
routerUser.post("/sign-up", authAdminMiddleware, userController.createUser);

/**
 * @swagger
 * /api/user/sign-in:
 *   post:
 *     summary: Đăng nhập hệ thống
 *     description: Người dùng có thể đăng nhập vào hệ thống bằng tên đăng nhập và mật khẩu.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "example@gmail.com"
 *               password:
 *                 type: string
 *                 example: "1234"
 *     responses:
 *       200:
 *         description: Đăng nhập thành công, trả về thông tin người dùng và token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "OK"
 *                 message:
 *                   type: string
 *                   example: "Login success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "67b0927cf080d7de92db3baa"
 *                     user_name:
 *                       type: string
 *                       example: "test"
 *                     role_name:
 *                       type: string
 *                       example: "admin"
 *                     avatar:
 *                       type: string
 *                       example: "https://res.cloudinary.com/example/image/upload/avatar.jpg"
 *                     status:
 *                       type: boolean
 *                       example: true
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                 token:
 *                   type: object
 *                   properties:
 *                     access_token:
 *                       type: string
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       401:
 *         description: Sai tên đăng nhập hoặc mật khẩu.
 *       400:
 *         description: Thiếu thông tin đầu vào hoặc dữ liệu không hợp lệ.
 */
routerUser.post("/sign-in", userController.loginUser);


module.exports = routerUser;
