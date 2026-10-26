const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, trim: true, required: true },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, trim: true, required: true },
    stock: { type: Number, required: true, min: 0, validate: Number.isInteger }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
