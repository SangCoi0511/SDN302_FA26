const express = require('express');
const mongoose = require('mongoose');
const Article = require('../models/article');

const articleRouter = express.Router();
articleRouter.use(express.json());
articleRouter.use(express.urlencoded({ extended: true }));

articleRouter.route('/')
  .get(async (req, res) => {
    try {
      const article = await Article.find();
      res.json(article);
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
  })
  // PUT a new article
  .put(async (req, res) => {
    try {
      res.status(403).json('PUT operation not supported on /articles');
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  })
  // DELETE all articles
  .delete(async (req, res) => {
    try {
      await Article.deleteMany({});
      res.status(200).send('All articles deleted successfully.');
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });

articleRouter.route('/:id')
  // GET a specific article
  .get(async (req, res) => {
    try {
      const article = await Article.findById(req.params.id);
      res.json(article);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  })
  // POST a specific article
  .post(async (req, res) => {
    try {
      res.status(403).send('POST operation not supported on /articles/' + req.params.id);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  })
  // PUT a new article
  .put(async (req, res) => {
    try {
      const article = await Article.findByIdAndUpdate(req.params.id, req.body, { new: true });
      res.json(article);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  })
  // DELETE an article
  .delete(async (req, res) => {
    try {
      await Article.findByIdAndDelete(req.params.id);
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

module.exports = articleRouter;