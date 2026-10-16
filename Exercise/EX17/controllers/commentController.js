const Comment = require('../models/comment');

// GET all comments with populated article
exports.findAll = async (req, res) => {
    try {
        const comments = await Comment.find().populate('article');
        res.json(comments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET comment by ID
exports.findById = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id).populate('article');
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found.' });
        }
        res.json(comment);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// POST create a new comment
exports.create = async (req, res) => {
    try {
        const comment = new Comment(req.body);
        await comment.save();
        res.status(201).json(comment);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// PUT update comment by ID
exports.update = async (req, res) => {
    try {
        const comment = await Comment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found.' });
        }
        res.json(comment);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// DELETE comment by ID
exports.delete = async (req, res) => {
    try {
        const comment = await Comment.findByIdAndDelete(req.params.id);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found.' });
        }
        res.json({ message: 'Comment deleted successfully.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
