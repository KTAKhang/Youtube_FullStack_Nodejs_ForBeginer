const UserRouter = require("./UserRouter");
const CategoryRouter = require("./CategoryRouter");
const routes = (app) => {
    app.use("/api/user", UserRouter);
    app.use("/api/category", CategoryRouter);

};

module.exports = routes;