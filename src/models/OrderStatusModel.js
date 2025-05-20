const mongoose = require('mongoose');
const OrderStatusSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true
    }
});

const OrderStatusModel = mongoose.model('order_status', OrderStatusSchema);
module.exports = OrderStatusModel;