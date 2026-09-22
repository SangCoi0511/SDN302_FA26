const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();

const data_file = path.join(__dirname, '..', 'data.json');

async function readArticle() {
    try {
        const data = await fs.readFile(data_file, 'utf-8');
        const parsedData = JSON.parse(data);
        return parsedData.articles || [];
    } catch (error) {
        return [];
    }
}

async function readData() {
    try {
        return JSON.parse(await fs.readFile(data_file, 'utf-8'));
    } catch (error) {
        return { articles: [], comments: [] };
    }
}

async function writeArticle(articles) {
    let data = { articles, products: [] };

    try {
        data = JSON.parse(await fs.readFile(data_file, 'utf-8'));
    } catch (error) {
        // Use the default structure when the data file does not exist yet.
    }

    data.articles = articles;
    await fs.writeFile(data_file, JSON.stringify(data, null, 2), 'utf-8');
}

router.get('/', async (req, res) => {
    try {
        const articles = await readArticle();
        return res.status(200).json(articles);
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const articles = await readArticle();
        const article = articles.find((u) => u.id === Number(id));

        if (!article) {
            return res.status(404).json({ message: 'Article does not exist' });
        }

        return res.status(200).json(article);
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

router.post('/', async (req, res) => {
    try {
        const { title, content, author, date } = req.body;

        if (!title || !content || !author || !date) {
            return res.status(400).json({ message: 'Title, content, author, date are required' });
        }

        const articles = await readArticle();
        const newArticle = {
            id: articles.length ? Math.max(...articles.map((article) => article.id)) + 1 : 1,
            title,
            content,
            author,
            date
        };

        articles.push(newArticle);
        await writeArticle(articles);
        return res.status(201).json(newArticle);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { title, content, author, date } = req.body;
        const articles = await readArticle();
        const articleIndex = articles.findIndex((article) => article.id === Number(req.params.id));

        if (articleIndex === -1) {
            return res.status(404).json({ message: 'Article does not exist' });
        }

        if (!title || !content || !author || !date) {
            return res.status(400).json({ message: 'Title, content, author, date are required' });
        }

        articles[articleIndex] = { ...articles[articleIndex], title, content, author, date };
        await writeArticle(articles);
        return res.status(200).json(articles[articleIndex]);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const articles = await readArticle();
        const articleIndex = articles.findIndex((article) => article.id === Number(req.params.id));

        if (articleIndex === -1) {
            return res.status(404).json({ message: 'Article does not exist' });
        }

        const [deletedArticle] = articles.splice(articleIndex, 1);
        await writeArticle(articles);
        return res.status(200).json({
            message: 'Article deleted successfully!'
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

router.get('/:id/comments', async (req, res) => {
    try {
        const data = await readData();
        const article = (data.articles || []).find((item) => item.id === Number(req.params.id));

        if (!article) {
            return res.status(404).json({ message: 'Article does not exist' });
        }

        const comments = (data.comments || []).filter((item) => item.articleId === Number(req.params.id));

        return res.status(200).json(comments);
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

module.exports = router