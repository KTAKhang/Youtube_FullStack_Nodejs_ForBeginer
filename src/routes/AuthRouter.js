const express = require("express");
const AuthController = require("../controller/AuthController");
const AuthRouter = express.Router();


/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: API quản lý xác thực người dùng
 */


/**
 * @swagger
 * /auth/register/send-otp:
 *   post:
 *     summary: Gửi OTP qua email để xác nhận đăng ký
 *     description: API gửi mã OTP đến email người dùng để xác nhận đăng ký tài khoản.
 *     tags:
 *       [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_name
 *               - email
 *               - password
 *             properties:
 *               user_name:
 *                 type: string
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 example: "johndoe@example.com"
 *               password:
 *                 type: string
 *                 example: "StrongPassword123"
 *     responses:
 *       200:
 *         description: OTP đã được gửi qua email.
 *       400:
 *         description: Email đã tồn tại hoặc dữ liệu không hợp lệ.
 */
AuthRouter.post("/register/send-otp", AuthController.sendRegisterOTP);


/**
 * @swagger
 * /auth/register/confirm:
 *   post:
 *     summary: Xác nhận OTP để hoàn tất đăng ký
 *     description: API xác minh mã OTP đã gửi trước đó và tạo tài khoản mới.
 *     tags:
 *       [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - otp
 *             properties:
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Đăng ký tài khoản thành công.
 *       400:
 *         description: OTP không hợp lệ hoặc đã hết hạn.
 */
AuthRouter.post("/register/confirm", AuthController.confirmRegisterOTP);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Gửi OTP đặt lại mật khẩu
 *     description: API gửi mã OTP 6 số về email để đặt lại mật khẩu.
 *     tags:
 *       [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: "example@gmail.com"
 *     responses:
 *       200:
 *         description: OTP đã được gửi thành công qua email
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "OTP đã được gửi qua email."
 *       400:
 *         description: Email không tồn tại trong hệ thống
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Email không tồn tại!"
 */
AuthRouter.post("/forgot-password", AuthController.forgotPassword);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Xác thực OTP và đặt lại mật khẩu mới
 *     description: API cho phép người dùng nhập email, OTP, và mật khẩu mới để đặt lại mật khẩu.
 *     tags:
 *       [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *                 example: "example@gmail.com"
 *               otp:
 *                 type: string
 *                 example: "738672"
 *               newPassword:
 *                 type: string
 *                 example: "ABC12345"
 *     responses:
 *       200:
 *         description: Mật khẩu đã được đặt lại thành công!
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Mật khẩu đã được đặt lại thành công!"
 *       400:
 *         description: Lỗi khi OTP không hợp lệ hoặc đã hết hạn
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "OTP không hợp lệ hoặc đã hết hạn!"
 */
AuthRouter.post("/reset-password", AuthController.resetPassword);



module.exports = AuthRouter;
