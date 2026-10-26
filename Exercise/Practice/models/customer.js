const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    name: { type: String, trim: true, required: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true },
    address: { type: String, trim: true }
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);
