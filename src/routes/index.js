const UserRouter = require("./UserRouter");
const CategoryRouter = require("./CategoryRouter");
const productRouter = require("./ProductRouter");
const orderRouter = require("./OrderRouter");
const OrderStatusRouter = require("./OrderStatusRouter");
const RoleRouter = require("./RoleRouter");
const AuthRouter = require("./AuthRouter");

const routes = (app) => {
    app.use("/api/user", UserRouter);
    app.use("/api/category", CategoryRouter);
    app.use("/api/product", productRouter);
    app.use("/api/order", orderRouter);
    app.use("/api/order-status", OrderStatusRouter);
    app.use("/api/role", RoleRouter);
    app.use("/api/auth", AuthRouter);
};

module.exports = routes;