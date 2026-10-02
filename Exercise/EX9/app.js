const express = require('express');
const articleRouter = require('./routes/articleRouter');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use('/articles', articleRouter);

app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    const status = err.statusCode || err.status || 500;
    res.status(status).json({
        error: status >= 500 ? 'An error occurred, please try again later.' : err.message,
    });
});

app.listen(port, () => console.log(`Server running on http://localhost:${port}`));