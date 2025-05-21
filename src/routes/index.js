const UserRouter = require("./UserRouter");
const CategoryRouter = require("./CategoryRouter");
const productRouter = require("./ProductRouter");
const orderRouter = require("./OrderRouter");
const OrderStatusRouter = require("./OrderStatusRouter");

const routes = (app) => {
    app.use("/api/user", UserRouter);
    app.use("/api/category", CategoryRouter);
    app.use("/api/product", productRouter);
    app.use("/api/order", orderRouter);
    app.use("/api/order-status", OrderStatusRouter);
};

module.exports = routes;