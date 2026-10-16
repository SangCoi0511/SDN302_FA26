const express = require('express');
const router = express.Router();
const Comment = require('../models/comment');

// GET all comments with populated article reference
router.route('/')
    .get(async (req, res) => {
        try {
            const comment = await Comment.find().populate('article');
            res.json(comment);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    })
    // POST a new comment
    .post(async (req, res) => {
        try {
            const comment = new Comment(req.body);
            await comment.save();
            res.status(201).json(comment);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    });

// GET comment by ID
router.route('/:id')
    .get(async (req, res) => {
        try {
            const comment = await Comment.findById(req.params.id).populate('article');
            if (!comment) return res.status(404).json({ message: 'Comment not found' });
            res.json(comment);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    })
    // PUT update comment by ID
    .put(async (req, res) => {
        try {
            const comment = await Comment.findByIdAndUpdate(req.params.id, req.body, {
                new: true,
                runValidators: true
            });
            if (!comment) return res.status(404).json({ message: 'Comment not found' });
            res.json(comment);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    })
    // DELETE comment by ID
    .delete(async (req, res) => {
        try {
            const comment = await Comment.findByIdAndDelete(req.params.id);
            if (!comment) return res.status(404).json({ message: 'Comment not found' });
            res.json({ message: 'Comment deleted successfully' });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    });

module.exports = router;
