/**
 * operations.js
 * Standalone script to demonstrate direct MongoDB operations
 * using Mongoose models for Article and Comment (MVC version).
 *
 * Run with: node operations.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

const Article = require('./models/article');
const Comment = require('./models/comment');

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected');

        // --- CREATE an Article ---
        const article = new Article({
            title: 'My First Article',
            text: 'This is the body of my first article, longer than 10 chars.',
            tags: ['nodejs', 'mongodb']
        });
        await article.save();
        console.log('Article created:', article._id);

        // --- CREATE a Comment referencing the Article ---
        const comment = new Comment({
            body: 'Great article!',
            article: article._id
        });
        await comment.save();
        console.log('Comment created:', comment._id);

        // --- READ all Articles ---
        const articles = await Article.find();
        console.log('All articles:', articles);

        // --- READ all Comments with populated Article ---
        const comments = await Comment.find().populate('article');
        console.log('All comments with article:', JSON.stringify(comments, null, 2));

        // --- UPDATE an Article ---
        const updatedArticle = await Article.findByIdAndUpdate(
            article._id,
            { title: 'My Updated Article Title' },
            { new: true, runValidators: true }
        );
        console.log('Updated article:', updatedArticle.title);

        // --- DELETE the Comment ---
        await Comment.findByIdAndDelete(comment._id);
        console.log('Comment deleted');

        // --- DELETE the Article ---
        await Article.findByIdAndDelete(article._id);
        console.log('Article deleted');

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await mongoose.disconnect();
        console.log('MongoDB disconnected');
    }
};

run();
