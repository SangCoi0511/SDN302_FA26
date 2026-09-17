const express = require('express');
const app = express();
const port = 3000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const articles = require('./articles');

app.get('/articles', async (req, res) => {
    try {
        res.status(200).json(articles);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
});

app.get('/articles/:id', async (req, res) => {
    try {

        const id = parseInt(req.params.id);

        const article = articles.find(article => article.id === id);

        if (!article) {
            return res.status(404).send('Article not found');
        }

        res.status(200).json(article);
    }
    catch (err) {
        res.status(404).json({ message: err.message });
    }
});

app.post('/articles', (req, res) => {

    const newArticle = {
        id: articles.length + 1,
        title: req.body.title,
        date: req.body.date,
        text: req.body.text
    };
    articles.push(newArticle);
    res.status(201).json(newArticle);
});

app.delete('/article/:id', (req, res) => {
    const index = articles.findIndex(article => article.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).send('Article not found');
    
    const deletedArticle = articles.splice(index, 1);
    res.status(204).json(deletedArticle);
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
module.exports = app;