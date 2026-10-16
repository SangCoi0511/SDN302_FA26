const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const articleRouter = require('./routes/articleRouter');
const commentRouter = require('./routes/commentRouter');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(morgan('dev'));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Routes
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/articles', articleRouter);
app.use('/comments', commentRouter);

// 404 handler
app.use((req, res, next) => {
    res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ message: err.message });
});

module.exports = app;
