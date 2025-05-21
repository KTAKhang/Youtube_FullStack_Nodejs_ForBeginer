const RoleModel = require('../models/RolesModel');

const getAllRole = async () => {
    try {
        const orderStatuses = await RoleModel.find();
        return { status: "OK", data: orderStatuses };
    } catch (error) {
        console.error("Error fetching order statuses:", error);
        throw { status: "ERR", message: "Failed to fetch order statuses" };
    }
}

module.exports = {
    getAllRole,
};