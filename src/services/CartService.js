const CartModel = require("../models/CartsModel");
const CartDetailModel = require("../models/CartDetailsModel");
const ProductModel = require("../models/ProductsModel");

const addItemToCart = async (user_id, product_id, quantity) => {
    // 1. Tìm sản phẩm
    const product = await ProductModel.findById(product_id);
    if (!product || !product.status) {
        throw new Error("Sản phẩm không tồn tại hoặc đã ngừng bán");
    }

    // 👉 Kiểm tra số lượng hàng tồn kho
    if (product.quantity < quantity) {
        throw new Error("Số lượng sản phẩm không đủ trong kho");
    }

    // 2. Tìm hoặc tạo giỏ hàng
    let cart = await CartModel.findOne({ user_id });
    if (!cart) {
        cart = await CartModel.create({ user_id, sum: 0 });
    }

    // 3. Kiểm tra sản phẩm đã có trong giỏ chưa
    let cartDetail = await CartDetailModel.findOne({
        cart_id: cart._id,
        product_id
    });

    if (cartDetail) {
        const totalQuantity = cartDetail.quantity + quantity;

        // 👉 Kiểm tra tổng số lượng sau khi cộng có vượt kho không
        if (totalQuantity > product.quantity) {
            throw new Error(`Chỉ còn ${product.quantity - cartDetail.quantity} sản phẩm trong kho`);
        }

        cartDetail.quantity = totalQuantity;
        await cartDetail.save();
    } else {
        // Nếu chưa có => thêm mới
        await CartDetailModel.create({
            cart_id: cart._id,
            product_id,
            quantity,
            price: product.price
        });
    }

    // 4. Tính lại tổng tiền (sum)
    const allItems = await CartDetailModel.find({ cart_id: cart._id });
    const newSum = allItems.reduce((total, item) => {
        return total + item.quantity * item.price;
    }, 0);

    cart.sum = allItems.length;
    await cart.save();

    return {
        message: "Thêm sản phẩm vào giỏ hàng thành công",
        cart_id: cart._id,
        total_items: allItems.length,
        sum: newSum
    };
};

// ✅ Cập nhật số lượng sản phẩm trong giỏ hàng
const updateItemInCart = async (user_id, product_id, newQuantity) => {
    const product = await ProductModel.findById(product_id);
    if (!product || !product.status) {
        throw new Error("Sản phẩm không tồn tại hoặc đã ngừng bán");
    }

    if (newQuantity > product.quantity) {
        throw new Error(`Chỉ còn ${product.quantity} sản phẩm trong kho`);
    }

    const cart = await CartModel.findOne({ user_id });
    if (!cart) throw new Error("Không tìm thấy giỏ hàng");

    const cartDetail = await CartDetailModel.findOne({
        cart_id: cart._id,
        product_id
    });

    if (!cartDetail) {
        throw new Error("Sản phẩm không có trong giỏ hàng");
    }

    if (newQuantity <= 0) {
        await cartDetail.remove();
    } else {
        cartDetail.quantity = newQuantity;
        await cartDetail.save();
    }

    // Tính lại tổng tiền
    const allItems = await CartDetailModel.find({ cart_id: cart._id });
    const newSum = allItems.reduce((total, item) => total + item.quantity * item.price, 0);

    cart.sum = newSum;
    await cart.save();

    return {
        message: "Cập nhật giỏ hàng thành công",
        sum: newSum,
        total_items: allItems.length
    };
};

// ❌ Xóa sản phẩm khỏi giỏ hàng
const removeItemFromCart = async (user_id, product_id) => {
    const cart = await CartModel.findOne({ user_id });
    if (!cart) throw new Error("Không tìm thấy giỏ hàng");

    const deleted = await CartDetailModel.findOneAndDelete({
        cart_id: cart._id,
        product_id
    });

    if (!deleted) {
        throw new Error("Sản phẩm không có trong giỏ hàng");
    }

    // Tính lại tổng tiền
    const allItems = await CartDetailModel.find({ cart_id: cart._id });
    const newSum = allItems.reduce((total, item) => total + item.quantity * item.price, 0);

    cart.sum = newSum;
    await cart.save();

    return {
        message: "Đã xóa sản phẩm khỏi giỏ hàng",
        sum: newSum,
        total_items: allItems.length
    };
};

const getCartItems = async (user_id) => {
    const cart = await CartModel.findOne({ user_id });
    if (!cart) {
        return {
            cart_id: null,
            sum: 0,
            items: []
        };
    }

    const items = await CartDetailModel.find({ cart_id: cart._id })
        .populate("product_id", "name image price quantity status");

    const formattedItems = items.map(item => ({
        product_id: item.product_id._id,
        name: item.product_id.name,
        image: item.product_id.image,
        price: item.price,
        quantity: item.quantity,
        in_stock: item.product_id.quantity,
        status: item.product_id.status,
        is_available: item.product_id.status && item.product_id.quantity > 0,
        warning: !item.product_id.status ? "Sản phẩm đã ngừng bán" :
            item.product_id.quantity <= 0 ? "Sản phẩm tạm hết hàng" : null,
        subtotal: item.quantity * item.price
    }));

    return {
        cart_id: cart._id,
        sum: cart.sum,
        item_count: formattedItems.length,
        items: formattedItems
    };
};

module.exports = {
    addItemToCart,
    updateItemInCart,
    removeItemFromCart,
    getCartItems
};
