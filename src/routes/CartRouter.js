const express = require("express");
const routerCart = express.Router();
const cartController = require("../controller/CartController");
const { authUserMiddleware } = require("../middleware/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: API quản lý giỏ hàng người dùng
 */

/**
 * @swagger
 * /cart/add:
 *   post:
 *     summary: Thêm sản phẩm vào giỏ hàng
 *     description: Cho phép người dùng thêm sản phẩm vào giỏ hàng.
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product_id
 *               - quantity
 *             properties:
 *               product_id:
 *                 type: string
 *                 example: "682be1da807cef0a2bcc5e0b"
 *               quantity:
 *                 type: number
 *                 example: 2
 *     responses:
 *       200:
 *         description: Thêm thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 */
routerCart.post("/add", authUserMiddleware, cartController.addItemToCart);

/**
 * @swagger
 * /cart/update:
 *   put:
 *     summary: Cập nhật số lượng sản phẩm trong giỏ hàng
 *     description: Cho phép người dùng cập nhật số lượng sản phẩm trong giỏ hàng.
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product_id
 *               - quantity
 *             properties:
 *               product_id:
 *                 type: string
 *                 example: "682be1da807cef0a2bcc5e0b"
 *               quantity:
 *                 type: number
 *                 example: 4
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 */
routerCart.put("/update", authUserMiddleware, cartController.updateItemInCart);

/**
 * @swagger
 * /cart/remove/{product_id}:
 *   delete:
 *     summary: Xóa một sản phẩm khỏi giỏ hàng
 *     description: Cho phép người dùng xóa một sản phẩm khỏi giỏ hàng.
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: product_id
 *         required: true
 *         schema:
 *           type: string
 *           example: "682be1da807cef0a2bcc5e0b"
 *     responses:
 *       200:
 *         description: Xóa thành công
 *       400:
 *         description: Tham số không hợp lệ
 */
routerCart.delete("/remove/:product_id", authUserMiddleware, cartController.removeItemFromCart);

/**
 * @swagger
 * /cart:
 *   get:
 *     summary: Lấy toàn bộ sản phẩm trong giỏ hàng của người dùng
 *     description: Người dùng xem toàn bộ sản phẩm trong giỏ hàng của mình.
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lấy giỏ hàng thành công
 */
routerCart.get("/", authUserMiddleware, cartController.getCartItems);

module.exports = routerCart;
