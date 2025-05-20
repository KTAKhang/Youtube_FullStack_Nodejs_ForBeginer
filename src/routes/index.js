const UserRouter = require("./UserRouter");
const CategoryRouter = require("./CategoryRouter");
const productRouter = require("./ProductRouter");


const routes = (app) => {
    app.use("/api/user", UserRouter);
    app.use("/api/category", CategoryRouter);
    app.use("/api/product", productRouter);
};

module.exports = routes;