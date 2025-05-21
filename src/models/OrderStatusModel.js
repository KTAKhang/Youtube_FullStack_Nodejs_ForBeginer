const mongoose = require('mongoose');
const orderStatusSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true
    }
});

const OrderStatusModel = mongoose.model('order_statuses', orderStatusSchema);
module.exports = OrderStatusModel;