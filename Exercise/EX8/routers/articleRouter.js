const express = require('express');
const fs = require('node:fs/promises');
const path = require('node:path');

const router = express.Router();
const databasePath = path.join(__dirname, '..', 'db.json');

async function readArticles() {
    const database = JSON.parse(await fs.readFile(databasePath, 'utf8'));
    return database.articles;
}

async function writeArticles(articles) {
    const database = JSON.parse(await fs.readFile(databasePath, 'utf8'));
    database.articles = articles;
    await fs.writeFile(databasePath, `${JSON.stringify(database, null, 2)}\n`);
}

function validateArticle(article) {
    if (!article || typeof article !== 'object' || Array.isArray(article) || !article.title || !article.content) {
        const error = new Error('Article title and content are required');
        error.statusCode = 400;
        throw error;
    }
}

router.get('/', async (req, res, next) => {
    try {
        res.json(await readArticles());
    } catch (err) {
        next(err);
    }
});

router.get('/:id', async (req, res, next) => {
    try {
        const article = (await readArticles()).find((item) => item.id === Number(req.params.id));
        if (!article) {
            const error = new Error('Article not found');
            error.statusCode = 404;
            throw error;
        }
        res.json(article);
    } catch (err) {
        next(err);
    }
});

router.post('/', async (req, res, next) => {
    try {
        validateArticle(req.body);
        const articles = await readArticles();
        const article = {
            ...req.body,
            id: articles.reduce((highestId, item) => Math.max(highestId, item.id), 0) + 1,
        };
        articles.push(article);
        await writeArticles(articles);
        res.status(201).json(article);
    } catch (err) {
        next(err);
    }
});

router.put('/:id', async (req, res, next) => {
    try {
        const articles = await readArticles();
        const index = articles.findIndex((item) => item.id === Number(req.params.id));
        if (index === -1) {
            const error = new Error('Article not found');
            error.statusCode = 404;
            throw error;
        }
        const updatedArticle = { ...articles[index], ...req.body, id: articles[index].id };
        validateArticle(updatedArticle);
        articles[index] = updatedArticle;
        await writeArticles(articles);
        res.json(updatedArticle);
    } catch (err) {
        next(err);
    }
});

router.delete('/:id', async (req, res, next) => {
    try {
        const articles = await readArticles();
        const index = articles.findIndex((item) => item.id === Number(req.params.id));
        if (index === -1) {
            const error = new Error('Article not found');
            error.statusCode = 404;
            throw error;
        }
        const [deletedArticle] = articles.splice(index, 1);
        await writeArticles(articles);
        res.json(deletedArticle);
    } catch (err) {
        next(err);
    }
});

module.exports = router;