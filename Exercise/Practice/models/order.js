const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    customer_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    items: [{
        product_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity: { type: Number, required: true, min: 1, validate: Number.isInteger },
        price_at_order: { type: Number, required: true, min: 0 },
        total: { type: Number, required: true, min: 0 }
    }],
    total_amount: { type: Number, required: true, min: 0 },
    payment_method: { type: String, trim: true, required: true },
    status: { type: String, trim: true, required: true },
    order_date: { type: Date, required: true, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
