const express = require('express');
const connectDB = require('./config/db')
const app = express();

app.use(express.json());

const bookRouter = require('./routes/bookRouter')
const memberRouter = require('./routes/memberRouter')
const loanRouter = require('./routes/loanRouter')

app.use('/api/books', bookRouter);
app.use('/api/members', memberRouter)
app.use('/api/loans', loanRouter)

connectDB();
app.get('/', async(req, res)=>{
    try {
        res.send({message: 'Welcome to Practical Exam!'});
    } catch (error) {
        res.send({error: error.message});
    }
});

const PORT = process.env.PORT || 9999;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));