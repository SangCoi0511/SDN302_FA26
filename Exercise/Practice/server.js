require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Practical Exam!' });
});

app.use('/auth', require('./routes/authRouter'));
app.use('/api/products', require('./routes/productRouter'));
app.use('/api/orders', require('./routes/orderRouter'));

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ message: 'Internal server error.' });
});

const PORT = process.env.PORT || 9999;
connectDB().then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});