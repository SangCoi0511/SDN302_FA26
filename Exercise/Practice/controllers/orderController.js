const mongoose = require('mongoose');
const Customer = require('../models/customer');
const Order = require('../models/order');
const Product = require('../models/product');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);
const isCompletedOrder = (order) => order.status.trim().toLowerCase() === 'completed';

const getQuantitiesByProduct = (items = []) => {
    const quantities = new Map();
    for (const item of items) {
        const productId = item.product_id._id
            ? item.product_id._id.toString()
            : item.product_id.toString();
        quantities.set(productId, (quantities.get(productId) || 0) + item.quantity);
    }
    return quantities;
};

const applyStockChanges = async (previousItems = [], nextItems = []) => {
    const previousQuantities = getQuantitiesByProduct(previousItems);
    const nextQuantities = getQuantitiesByProduct(nextItems);
    const productIds = new Set([...previousQuantities.keys(), ...nextQuantities.keys()]);
    const deductions = [];
    const restocks = [];

    for (const productId of productIds) {
        const quantityChange = (nextQuantities.get(productId) || 0)
            - (previousQuantities.get(productId) || 0);
        if (quantityChange > 0) {
            deductions.push({ productId, quantity: quantityChange });
        } else if (quantityChange < 0) {
            restocks.push({ productId, quantity: -quantityChange });
        }
    }

    const appliedChanges = [];
    try {
        for (const change of deductions) {
            const product = await Product.findOneAndUpdate(
                { _id: change.productId, stock: { $gte: change.quantity } },
                { $inc: { stock: -change.quantity } },
                { new: true }
            );
            if (!product) {
                const exists = await Product.exists({ _id: change.productId });
                const error = new Error(exists
                    ? `Insufficient stock for product ${change.productId}.`
                    : `Product ${change.productId} not found.`);
                error.status = exists ? 400 : 404;
                throw error;
            }
            appliedChanges.push({ ...change, type: 'deduction' });
        }

        for (const change of restocks) {
            const result = await Product.updateOne(
                { _id: change.productId },
                { $inc: { stock: change.quantity } }
            );
            if (result.matchedCount !== 1) {
                throw new Error(`Product ${change.productId} not found.`);
            }
            appliedChanges.push({ ...change, type: 'restock' });
        }
    } catch (error) {
        for (const change of appliedChanges.reverse()) {
            const rollback = change.type === 'deduction'
                ? { $inc: { stock: change.quantity } }
                : { $inc: { stock: -change.quantity } };
            const result = await Product.updateOne({ _id: change.productId }, rollback);
            if (result.matchedCount !== 1) {
                throw new Error(`Could not restore stock for product ${change.productId}: ${error.message}`);
            }
        }
        throw error;
    }
};

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
    const existingQuantities = getQuantitiesByProduct(existingOrder ? existingOrder.items : []);
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
        const availableStock = product.stock + (existingQuantities.get(productId) || 0);
        if (quantity > availableStock) {
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

const findAll = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate({path: 'customer_id', select: '-_id name phone'})
            .populate('items.product_id');
        return res.status(200).json(orders);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const findById = async (req, res) => {
    try {
        if (!isValidId(req.params.id)) {
            return res.status(404).json({ error: 'Order not found.' });
        }

        const order = await Order.findById(req.params.id)
            .populate('customer_id')
            .populate('items.product_id');
        if (!order) {
            return res.status(404).json({ error: 'Order not found.' });
        }
        return res.status(200).json(order);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const create = async (req, res) => {
    try {
        const result = await buildOrderData(req.body || {});
        if (result.error) {
            return res.status(result.status).json({ error: result.error });
        }

        await applyStockChanges([], result.data.items);
        let order;
        try {
            order = await Order.create(result.data);
        } catch (error) {
            await applyStockChanges(result.data.items, []);
            throw error;
        }
        await order.populate('customer_id items.product_id');
        return res.status(201).json(order);
    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({ error: error.message });
        }
        if (error.name === 'ValidationError' || error.name === 'CastError') {
            return res.status(400).json({ error: error.message });
        }
        return res.status(500).json({ error: error.message });
    }
};

const update = async (req, res) => {
    try {
        if (!isValidId(req.params.id)) {
            return res.status(404).json({ error: 'Order not found.' });
        }

        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ error: 'Order not found.' });
        }
        if (isCompletedOrder(order)) {
            return res.status(409).json({ error: 'Completed orders cannot be updated.' });
        }

        const result = await buildOrderData(req.body || {}, order);
        if (result.error) {
            return res.status(result.status).json({ error: result.error });
        }

        const previousItems = order.items.map((item) => ({
            product_id: item.product_id,
            quantity: item.quantity
        }));
        await applyStockChanges(previousItems, result.data.items);
        order.set(result.data);
        try {
            await order.save();
        } catch (error) {
            await applyStockChanges(result.data.items, previousItems);
            throw error;
        }
        await order.populate('customer_id items.product_id');
        return res.status(200).json(order);
    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({ error: error.message });
        }
        if (error.name === 'ValidationError' || error.name === 'CastError') {
            return res.status(400).json({ error: error.message });
        }
        return res.status(500).json({ error: error.message });
    }
};

const deleteOrder = async (req, res) => {
    try {
        if (!isValidId(req.params.id)) {
            return res.status(404).json({ error: 'Order not found.' });
        }

        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ error: 'Order not found.' });
        }
        if (order.status.trim().toLowerCase() !== 'pending') {
            return res.status(409).json({ error: 'Only pending orders can be deleted.' });
        }
        await applyStockChanges(order.items, []);
        let deletedOrder;
        try {
            deletedOrder = await Order.findByIdAndDelete(req.params.id);
        } catch (error) {
            await applyStockChanges([], order.items);
            throw error;
        }
        if (!deletedOrder) {
            await applyStockChanges([], order.items);
            return res.status(404).json({ error: 'Order not found.' });
        }
        return res.status(200).json({ message: 'Order deleted successfully.' });
    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({ error: error.message });
        }
        return res.status(500).json({ error: error.message });
    }
};

module.exports = {
    findAll,
    findById,
    create,
    update,
    delete: deleteOrder
};
