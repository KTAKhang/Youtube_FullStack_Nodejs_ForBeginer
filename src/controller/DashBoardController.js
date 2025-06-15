const DashboardService = require('../services/DashboardService');


const getRevenueByDate = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({
                status: "ERR",
                message: "Start date and end date are required"
            });
        }

        const response = await DashboardService.getRevenueByDate(startDate, endDate);
        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({
            status: "ERR",
            message: error.message || "Internal Server Error",
        });
    }
};

const getNewCustomersByDate = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({
                status: "ERR",
                message: "Start date and end date are required"
            });
        }

        const response = await DashboardService.getNewCustomersByDate(startDate, endDate);
        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({
            status: "ERR",
            message: error.message || "Internal Server Error",
        });
    }
};

// Doanh số theo ngày
const getSalesByDate = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({
                status: "ERR",
                message: "Start date and end date are required"
            });
        }

        const response = await DashboardService.getSalesByDate(startDate, endDate);
        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({
            status: "ERR",
            message: error.message || "Internal Server Error",
        });
    }
};

// Tổng quan dashboard
const getDashboardOverview = async (req, res) => {
    try {
        const response = await DashboardService.getDashboardOverview();
        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({
            status: "ERR",
            message: error.message || "Internal Server Error",
        });
    }
};

// Top sản phẩm bán chạy
const getTopSellingProducts = async (req, res) => {
    try {
        const { limit = 3 } = req.query;
        const response = await DashboardService.getTopSellingProducts(parseInt(limit));
        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({
            status: "ERR",
            message: error.message || "Internal Server Error",
        });
    }
};

// Lấy tất cả dữ liệu dashboard
const getCompleteDashboard = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({
                status: "ERR",
                message: "Start date and end date are required"
            });
        }

        const response = await DashboardService.getCompleteDashboard(startDate, endDate);
        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({
            status: "ERR",
            message: error.message || "Internal Server Error",
        });
    }
};

// Doanh thu theo tháng
const getRevenueByMonth = async (req, res) => {
    try {
        const { year } = req.query;

        // Kiểm tra đầu vào hợp lệ
        const parsedYear = parseInt(year);
        if (!year || isNaN(parsedYear)) {
            return res.status(400).json({
                status: "ERR",
                message: "Trường year là bắt buộc và phải là số"
            });
        }

        const response = await DashboardService.getRevenueByMonth(parsedYear);
        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({
            status: "ERR",
            message: error.message || "Lỗi server nội bộ",
        });
    }
};


// Top sản phẩm bán chạy theo danh mục
const getTopProductsByCategory = async (req, res) => {
    try {
        const response = await DashboardService.getTopProductsByCategory();
        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({
            status: "ERR",
            message: error.message || "Internal Server Error",
        });
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