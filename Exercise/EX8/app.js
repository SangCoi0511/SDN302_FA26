const express = require('express');
const app = express();
const port = 3000;
const articleRouter = require('./routers/articleRouter');
const videoRouter = require('./routers/videoRouter');

app.use(express.json());
app.use('/articles', articleRouter);
app.use('/videos', videoRouter);

app.use((err, req, res, next) => {
    console.error(err.stack);
    if (res.headersSent) {
        return next(err);
    }

    const status = err.statusCode || err.status || 500;
    const message = status >= 500
        ? 'An error occurred, please try again later.'
        : err.message;
    res.status(status).json({ error: message });
});

app.listen(port, () => console.log(`Server running on http://localhost:${port}`));