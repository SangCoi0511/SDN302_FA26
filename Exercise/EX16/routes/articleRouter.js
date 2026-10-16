const express = require('express');
const router = express.Router();
const Article = require('../models/article');

// GET all articles
router.route('/')
    .get(async (req, res) => {
        try {
            const articles = await Article.find();
            res.json(articles);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    })
    // POST a new article
    .post(async (req, res) => {
        try {
            const article = new Article(req.body);
            await article.save();
            res.status(201).json(article);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    });

// GET article by ID
router.route('/:id')
    .get(async (req, res) => {
        try {
            const article = await Article.findById(req.params.id);
            if (!article) return res.status(404).json({ message: 'Article not found' });
            res.json(article);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    })
    // PUT update article by ID
    .put(async (req, res) => {
        try {
            const article = await Article.findByIdAndUpdate(req.params.id, req.body, {
                new: true,
                runValidators: true
            });
            if (!article) return res.status(404).json({ message: 'Article not found' });
            res.json(article);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    })
    // DELETE article by ID
    .delete(async (req, res) => {
        try {
            const article = await Article.findByIdAndDelete(req.params.id);
            if (!article) return res.status(404).json({ message: 'Article not found' });
            res.json({ message: 'Article deleted successfully' });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    });

module.exports = router;
