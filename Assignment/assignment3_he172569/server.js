require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const classRouter = require('./routes/classRouter');
const studentRouter = require('./routes/studentRouter');
const authRouter = require('./routes/authRouter')

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Welcome to Practical Exam!' });
});

app.use('/api/auth', authRouter)
app.use('/api/classes', classRouter);
app.use('/api/students', studentRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ error: error.message || 'Internal server error' });
});

const PORT = process.env.PORT || 9999;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
