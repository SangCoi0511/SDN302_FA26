const express = require('express');
const app = express();
const PORT = 9999;
app.use(express.json());

const articleRouter = require('./router/articleRouter');
const commentRouter = require('./router/commentRouter');

app.use('/articles', articleRouter);
app.use('/comments', commentRouter);

app.listen(PORT, ()=> {
    console.log(`Server running in http://localhost:${PORT}/`)
})