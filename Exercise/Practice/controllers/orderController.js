const mongoose = require('mongoose');
const Customer = require('../models/customer');
const Order = require('../models/order');
const Product = require('../models/product');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

async function buildOrderData(input, existingOrder) {
    const customerId = input.customer_id === undefined
        ? existingOrder && existingOrder.customer_id
        : input.customer_id;
    if (!customerId || !isValidId(customerId)) {
        return { error: 'A valid customer_id is required.', status: 400 };
    }

    const customer = await Customer.findById(customerId);
    if (!customer) {
        return { error: 'Customer not found.', status: 404 };
    }

    const requestedItems = input.items === undefined
        ? existingOrder && existingOrder.items
        : input.items;
    if (!Array.isArray(requestedItems) || requestedItems.length === 0) {
        return { error: 'Order must contain at least one item.', status: 400 };
    }

    const quantitiesByProduct = new Map();
    for (const requestedItem of requestedItems) {
        if (!requestedItem || !isValidId(requestedItem.product_id)) {
            return { error: 'Each item must have a valid product_id.', status: 400 };
        }
        if (!Number.isInteger(requestedItem.quantity) || requestedItem.quantity < 1) {
            return { error: 'Each item quantity must be an integer greater than or equal to 1.', status: 400 };
        }

        const productId = requestedItem.product_id.toString();
        quantitiesByProduct.set(
            productId,
            (quantitiesByProduct.get(productId) || 0) + requestedItem.quantity
        );
    }

    const items = [];
    for (const [productId, quantity] of quantitiesByProduct) {
        const product = await Product.findById(productId);
        if (!product) {
            return { error: `Product ${productId} not found.`, status: 404 };
        }
        if (quantity > product.stock) {
            return { error: `Insufficient stock for product ${product.name}.`, status: 400 };
        }

        const total = product.price * quantity;
        items.push({
            product_id: product._id,
            quantity,
            price_at_order: product.price,
            total
        });
    }

    const paymentMethod = input.payment_method === undefined
        ? existingOrder && existingOrder.payment_method
        : input.payment_method;
    const status = input.status === undefined
        ? existingOrder && existingOrder.status
        : input.status;
    if (typeof paymentMethod !== 'string' || !paymentMethod.trim()) {
        return { error: 'payment_method is required.', status: 400 };
    }
    if (typeof status !== 'string' || !status.trim()) {
        return { error: 'status is required.', status: 400 };
    }

    const orderDate = input.order_date === undefined
        ? (existingOrder ? existingOrder.order_date : new Date())
        : new Date(input.order_date);
    if (Number.isNaN(orderDate.getTime())) {
        return { error: 'order_date must be a valid date.', status: 400 };
    }

    return {
        data: {
            customer_id: customer._id,
            items,
            total_amount: items.reduce((sum, item) => sum + item.total, 0),
            payment_method: paymentMethod.trim(),
            status: status.trim(),
            order_date: orderDate
        }
    };
}

exports.findAll = async (req, res, next) => {
    try {
        const orders = await Order.find()
            .populate('customer_id')
            .populate('items.product_id');
        res.json(orders);
    } catch (error) {
        next(error);
    }
};

exports.findById = async (req, res, next) => {
    if (!isValidId(req.params.id)) {
        return res.status(404).json({ message: 'Order not found.' });
    }

    try {
        const order = await Order.findById(req.params.id)
            .populate('customer_id')
            .populate('items.product_id');
        if (!order) {
            return res.status(404).json({ message: 'Order not found.' });
        }
        res.json(order);
    } catch (error) {
        next(error);
    }
};

exports.create = async (req, res, next) => {
    try {
        const result = await buildOrderData(req.body || {});
        if (result.error) {
            return res.status(result.status).json({ message: result.error });
        }

        const order = await Order.create(result.data);
        await order.populate('customer_id items.product_id');
        res.status(201).json(order);
    } catch (error) {
        if (error.name === 'ValidationError' || error.name === 'CastError') {
            return res.status(400).json({ message: error.message });
        }
        next(error);
    }
};

exports.update = async (req, res, next) => {
    if (!isValidId(req.params.id)) {
        return res.status(404).json({ message: 'Order not found.' });
    }

    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found.' });
        }

        const result = await buildOrderData(req.body || {}, order);
        if (result.error) {
            return res.status(result.status).json({ message: result.error });
        }

        order.set(result.data);
        await order.save();
        await order.populate('customer_id items.product_id');
        res.json(order);
    } catch (error) {
        if (error.name === 'ValidationError' || error.name === 'CastError') {
            return res.status(400).json({ message: error.message });
        }
        next(error);
    }
};

exports.delete = async (req, res, next) => {
    if (!isValidId(req.params.id)) {
        return res.status(404).json({ message: 'Order not found.' });
    }

    try {
        const order = await Order.findByIdAndDelete(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found.' });
        }
        res.json({ message: 'Order deleted successfully.' });
    } catch (error) {
        next(error);
    }
};
