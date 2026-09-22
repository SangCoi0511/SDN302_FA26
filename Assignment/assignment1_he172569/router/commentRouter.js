const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const router = express.Router();
const dataFile = path.join(__dirname, '..', 'data.json');

async function readData() {
    try {
        return JSON.parse(await fs.readFile(dataFile, 'utf-8'));
    } catch (error) {
        return { articles: [], comments: [] };
    }
}

async function writeData(data) {
    await fs.writeFile(dataFile, JSON.stringify(data, null, 2), 'utf-8');
}

router.get('/', async (req, res) => {
    try {
        const data = await readData();
        return res.status(200).json(data.comments || []);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const data = await readData();
        const comment = (data.comments || []).find((item) => item.id === Number(req.params.id));

        if (!comment) {
            return res.status(404).json({ message: 'Comment does not exist' });
        }

        return res.status(200).json({
            comment
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { author, content, date, articleId } = req.body;

        const data = await readData();
        const article = (data.articles || []).find((item) => item.id === Number(articleId));

        if (!article) {
            return res.status(404).json({ message: 'Article does not exist' });
        }

        if (!author || articleId === undefined || !content || !date) {
            return res.status(400).json({ message: 'Author, content, date and articleId are required' });
        }

        const comments = data.comments || [];
        const newComment = {
            id: comments.length ? Math.max(...comments.map((comment) => comment.id)) + 1 : 1,
            author,
            content,
            date,
            articleId: Number(articleId)
        };

        comments.push(newComment);
        data.comments = comments;
        await writeData(data);
        return res.status(201).json(newComment);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { author, content, date, articleId } = req.body;
        const data = await readData();
        const commentIndex = (data.comments || []).findIndex((item) => item.id === Number(req.params.id));

        if (commentIndex === -1) {
            return res.status(404).json({ message: 'Comment does not exist' });
        }

        if (!author || articleId === undefined || !content || !date) {
            return res.status(400).json({ message: 'Author, content, date and articleId are required' });
        }

        data.comments[commentIndex] = {
            ...data.comments[commentIndex],
            author,
            content,
            date,
            articleId: Number(articleId)
        };
        await writeData(data);
        return res.status(200).json(data.comments[commentIndex]);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const data = await readData();
        const commentIndex = (data.comments || []).findIndex((item) => item.id === Number(req.params.id));

        if (commentIndex === -1) {
            return res.status(404).json({ message: 'Comment does not exist' });
        }

        const [deletedComment] = data.comments.splice(commentIndex, 1);
        await writeData(data);
        return res.status(200).json({
            message: 'Comment deleted successfully!'
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

module.exports = router;