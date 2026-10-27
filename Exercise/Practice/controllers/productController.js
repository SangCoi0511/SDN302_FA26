const mongoose = require('mongoose');
const Order = require('../models/order');
const Product = require('../models/product');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);
const productFields = ['name', 'price', 'category', 'stock'];
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const findAll = async (req, res, next) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        next(error);
    }
};

const findById = async (req, res, next) => {
    if (!isValidId(req.params.id)) {
        return res.status(404).json({ message: 'Product not found.' });
    }

    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found.' });
        }
        res.json(product);
    } catch (error) {
        next(error);
    }
};

const create = async (req, res, next) => {
    const input = req.body || {};
    const productData = Object.fromEntries(
        productFields.filter((field) => Object.prototype.hasOwnProperty.call(input, field))
            .map((field) => [field, input[field]])
    );

    try {
        if (typeof productData.name === 'string' && productData.name.trim()) {
            const duplicate = await Product.findOne({
                name: { $regex: `^${escapeRegex(productData.name.trim())}$`, $options: 'i' }
            });
            if (duplicate) {
                return res.status(409).json({ message: 'A product with this name already exists.' });
            }
        }

        const product = await Product.create(productData);
        res.status(201).json(product);
    } catch (error) {
        if (error.name === 'ValidationError' || error.name === 'CastError') {
            return res.status(400).json({ message: error.message });
        }
        next(error);
    }
};

const update = async (req, res, next) => {
    if (!isValidId(req.params.id)) {
        return res.status(404).json({ message: 'Product not found.' });
    }

    const input = req.body || {};
    const updates = Object.fromEntries(
        productFields.filter((field) => Object.prototype.hasOwnProperty.call(input, field))
            .map((field) => [field, input[field]])
    );
    if (Object.keys(updates).length === 0) {
        return res.status(400).json({ message: 'Provide at least one product field to update.' });
    }

    try {
        const product = await Product.findByIdAndUpdate(req.params.id, updates, {
            new: true,
            runValidators: true
        });
        if (!product) {
            return res.status(404).json({ message: 'Product not found.' });
        }
        res.json(product);
    } catch (error) {
        if (error.name === 'ValidationError' || error.name === 'CastError') {
            return res.status(400).json({ message: error.message });
        }
        next(error);
    }
};

const deleteProduct = async (req, res, next) => {
    if (!isValidId(req.params.id)) {
        return res.status(404).json({ message: 'Product not found.' });
    }

    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found.' });
        }

        const isReferenced = await Order.exists({ 'items.product_id': product._id });
        if (isReferenced) {
            return res.status(409).json({ message: 'Product is referenced by an order and cannot be deleted.' });
        }

        await product.deleteOne();
        res.json({ message: 'Product deleted successfully.' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    findAll,
    findById,
    create,
    update,
    delete: deleteProduct
};
