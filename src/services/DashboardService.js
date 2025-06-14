const OrderModel = require('../models/OrderModel');
const OrderDetailModel = require('../models/OrderDetailModel');
const ProductModel = require('../models/ProductsModel');
const UserModel = require('../models/UserModel');
const mongoose = require("mongoose");

const getRevenueByDate = async (startDate, endDate) => {
    try {
        const specificStatusId = new mongoose.Types.ObjectId("682c6ec003ffc771169ec2d0");

        const matchStage = {
            order_status_id: specificStatusId,
            updatedAt: {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
            },
        };

        const revenueByDate = await OrderModel.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: {
                        year: { $year: "$updatedAt" },
                        month: { $month: "$updatedAt" },
                        day: { $dayOfMonth: "$updatedAt" },
                    },
                    totalRevenue: { $sum: "$total_price" },
                    orderCount: { $sum: 1 },
                },
            },
            {
                $project: {
                    _id: 0,
                    date: {
                        $dateFromParts: {
                            year: "$_id.year",
                            month: "$_id.month",
                            day: "$_id.day",
                        },
                    },
                    totalRevenue: 1,
                    orderCount: 1,
                },
            },
            { $sort: { date: 1 } },
        ]);

        return { status: "OK", data: revenueByDate };
    } catch (error) {
        console.error("Error fetching revenue by date:", error);
        throw { status: "ERR", message: "Failed to fetch revenue by date" };
    }
};
// Khách hàng mới theo ngày
const getNewCustomersByDate = async (startDate, endDate) => {
    try {
        const matchStage = {
            status: true,
            createdAt: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        };

        const newCustomersByDate = await UserModel.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" },
                        day: { $dayOfMonth: "$createdAt" }
                    },
                    newCustomers: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    date: {
                        $dateFromParts: {
                            year: "$_id.year",
                            month: "$_id.month",
                            day: "$_id.day"
                        }
                    },
                    newCustomers: 1
                }
            },
            { $sort: { date: 1 } }
        ]);

        return { status: "OK", data: newCustomersByDate };
    } catch (error) {
        console.error("Error fetching new customers by date:", error);
        throw { status: "ERR", message: "Failed to fetch new customers by date" };
    }
};

// Doanh số theo ngày (số lượng đơn hàng)
const getSalesByDate = async (startDate, endDate) => {
    try {
        const matchStage = {
            status: true,
            createdAt: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        };

        const salesByDate = await OrderModel.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" },
                        day: { $dayOfMonth: "$createdAt" }
                    },
                    totalOrders: { $sum: 1 },
                    totalAmount: { $sum: "$total_price" }
                }
            },
            {
                $project: {
                    _id: 0,
                    date: {
                        $dateFromParts: {
                            year: "$_id.year",
                            month: "$_id.month",
                            day: "$_id.day"
                        }
                    },
                    totalOrders: 1,
                    totalAmount: 1
                }
            },
            { $sort: { date: 1 } }
        ]);

        return { status: "OK", data: salesByDate };
    } catch (error) {
        console.error("Error fetching sales by date:", error);
        throw { status: "ERR", message: "Failed to fetch sales by date" };
    }
};

// Tổng quan dashboard (tổng người dùng, doanh số, doanh thu, sản phẩm)
const getDashboardOverview = async () => {
    try {
        // Tổng người dùng
        const totalUsers = await UserModel.countDocuments({ status: true });
        const specificStatusId = new mongoose.Types.ObjectId("682c6ec003ffc771169ec2d0");
        // Tổng doanh số (số đơn hàng)
        const totalOrders = await OrderModel.countDocuments({ status: true });

        // Tổng doanh thu
        const revenueResult = await OrderModel.aggregate([
            { $match: { order_status_id: specificStatusId } },
            { $group: { _id: null, totalRevenue: { $sum: "$total_price" } } }
        ]);
        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

        // Tổng sản phẩm
        const totalProducts = await ProductModel.countDocuments({ status: true });

        return {
            status: "OK",
            data: {
                totalUsers,
                totalOrders,
                totalRevenue,
                totalProducts
            }
        };
    } catch (error) {
        console.error("Error fetching dashboard overview:", error);
        throw { status: "ERR", message: "Failed to fetch dashboard overview" };
    }
};

// Top 3 sản phẩm bán chạy nhất
const getTopSellingProducts = async (limit = 3) => {
    try {
        const topProducts = await OrderDetailModel.aggregate([
            {
                $lookup: {
                    from: "orders",
                    localField: "order_id",
                    foreignField: "_id",
                    as: "order"
                }
            },
            {
                $unwind: "$order"
            },
            {
                $match: {
                    "order.status": true
                }
            },
            {
                $group: {
                    _id: "$product_id",
                    totalQuantitySold: { $sum: "$quantity" },
                    totalRevenue: { $sum: { $multiply: ["$quantity", "$price"] } },
                    orderCount: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: "products",
                    localField: "_id",
                    foreignField: "_id",
                    as: "product"
                }
            },
            {
                $unwind: "$product"
            },
            {
                $match: {
                    "product.status": true
                }
            },
            {
                $project: {
                    _id: 0,
                    productId: "$_id",
                    productName: "$product.name",
                    productImage: "$product.image",
                    productPrice: "$product.price",
                    totalQuantitySold: 1,
                    totalRevenue: 1,
                    orderCount: 1
                }
            },
            { $sort: { totalQuantitySold: -1 } },
            { $limit: limit }
        ]);

        return { status: "OK", data: topProducts };
    } catch (error) {
        console.error("Error fetching top selling products:", error);
        throw { status: "ERR", message: "Failed to fetch top selling products" };
    }
};

// Hàm tổng hợp để lấy tất cả dữ liệu dashboard
const getCompleteDashboard = async (startDate, endDate) => {
    try {
        const [
            revenueByDate,
            newCustomersByDate,
            salesByDate,
            dashboardOverview,
            topSellingProducts
        ] = await Promise.all([
            getRevenueByDate(startDate, endDate),
            getNewCustomersByDate(startDate, endDate),
            getSalesByDate(startDate, endDate),
            getDashboardOverview(),
            getTopSellingProducts(3)
        ]);

        return {
            status: "OK",
            data: {
                revenueByDate: revenueByDate.data,
                newCustomersByDate: newCustomersByDate.data,
                salesByDate: salesByDate.data,
                overview: dashboardOverview.data,
                topSellingProducts: topSellingProducts.data
            }
        };
    } catch (error) {
        console.error("Error fetching complete dashboard:", error);
        throw { status: "ERR", message: "Failed to fetch dashboard data" };
    }
};

// Doanh thu theo tháng
const getRevenueByMonth = async (year) => {
    try {
        const startDate = new Date(year, 0, 1);
        const endDate = new Date(year, 11, 31, 23, 59, 59);

        const revenueByMonth = await OrderModel.aggregate([
            {
                $match: {
                    status: true,
                    createdAt: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    totalRevenue: { $sum: "$total_price" },
                    orderCount: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    month: "$_id",
                    totalRevenue: 1,
                    orderCount: 1
                }
            },
            { $sort: { month: 1 } }
        ]);

        return { status: "OK", data: revenueByMonth };
    } catch (error) {
        console.error("Error fetching revenue by month:", error);
        throw { status: "ERR", message: "Failed to fetch revenue by month" };
    }
};

// Sản phẩm bán chạy theo danh mục
const getTopProductsByCategory = async () => {
    try {
        const topProductsByCategory = await OrderDetailModel.aggregate([
            {
                $lookup: {
                    from: "orders",
                    localField: "order_id",
                    foreignField: "_id",
                    as: "order"
                }
            },
            { $unwind: "$order" },
            { $match: { "order.status": true } },
            {
                $lookup: {
                    from: "products",
                    localField: "product_id",
                    foreignField: "_id",
                    as: "product"
                }
            },
            { $unwind: "$product" },
            { $match: { "product.status": true } },
            {
                $lookup: {
                    from: "categories",
                    localField: "product.category_id",
                    foreignField: "_id",
                    as: "category"
                }
            },
            { $unwind: "$category" },
            {
                $group: {
                    _id: {
                        categoryId: "$product.category_id",
                        productId: "$product_id"
                    },
                    categoryName: { $first: "$category.name" },
                    productName: { $first: "$product.name" },
                    totalQuantitySold: { $sum: "$quantity" },
                    totalRevenue: { $sum: { $multiply: ["$quantity", "$price"] } }
                }
            },
            { $sort: { "_id.categoryId": 1, totalQuantitySold: -1 } },
            {
                $group: {
                    _id: "$_id.categoryId",
                    categoryName: { $first: "$categoryName" },
                    topProduct: {
                        $first: {
                            productId: "$_id.productId",
                            productName: "$productName",
                            totalQuantitySold: "$totalQuantitySold",
                            totalRevenue: "$totalRevenue"
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    categoryId: "$_id",
                    categoryName: 1,
                    topProduct: 1
                }
            }
        ]);

        return { status: "OK", data: topProductsByCategory };
    } catch (error) {
        console.error("Error fetching top products by category:", error);
        throw { status: "ERR", message: "Failed to fetch top products by category" };
    }
};

module.exports = {
    getRevenueByDate,
    getNewCustomersByDate,
    getSalesByDate,
    getDashboardOverview,
    getTopSellingProducts,
    getCompleteDashboard,
    getRevenueByMonth,
    getTopProductsByCategory
};