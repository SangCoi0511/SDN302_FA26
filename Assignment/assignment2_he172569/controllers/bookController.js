const Book = require('../models/book');

const getAllBook = async (req, res) => {
    try {
        const books = await Book.find();

        if (!books) {
            return res.status(404).json({ error: 'Book not found'});
        }

        return res.status(200).json(books);
    } catch (error) {
        return res.status(500).json({ error: error.message});
    }
}

const getBookById = async (req, res) => {
    try {
        const { id } = req.params;

        const books = await Book.findById(id);

        if (!books){
            return res.status(404).json({ error: 'Book not found'});
        }

        return res.status(200).json(books);
    } catch (error) {
        return res.status(500).json({ error: error.message});
    }
}

const createBook = async (req, res) => {
    try {
        const { title, author, category, isbn, publishedYear, totalCopies, availableCopies } = req.body;

        if (!title || !author || !category || !isbn || !publishedYear || !totalCopies || !availableCopies) {
            return res.status(400).json({ error: 'Title, author, category, isbn, publishedYear, totalCopies, availableCopies are required'});
        }

        const newBook = new Book({
            title,
            author,
            category,
            isbn,
            publishedYear,
            totalCopies,
            availableCopies
        });
        await newBook.save();

        return res.status(200).json({
            message: 'Add new book success',
            newBook: newBook
        });
    } catch (error) {
        return res.status(500).json({ error: error.message});
    }
}

const updateBook = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, author, category, isbn, publishedYear, totalCopies, availableCopies } = req.body;

        if (!title || !author || !category || !isbn || !publishedYear || !totalCopies || !availableCopies) {
            return res.status(400).json({ error: 'Title, author, category, isbn, publishedYear, totalCopies, availableCopies are required'});
        }
        
        const updatedBook = await Book.findByIdAndUpdate(
            id,
            { title,
            author,
            category,
            isbn,
            publishedYear,
            totalCopies,
            availableCopies
        },
            { new: true}
        );

        if (!updatedBook) {
            return res.status(404).json({ error: 'Book not found' });
        }

        return res.status(200).json({
            message: 'Updated book success',
            book: updatedBook
        });
    } catch (error) {
        return res.status(500).json({ error: error.message});
    }
}

const deleteBook = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedBook = await Book.findByIdAndDelete(id);

        if(!deletedBook) {
            return res.status(404).json({ error: 'Book not found' });
        }

        return res.status(200).json({ message: 'Deleted book success' });
        
    } catch (error) {
        return res.status(500).json({ error: error.message});
    }
}

module.exports = {
    getAllBook,
    getBookById,
    createBook,
    updateBook,
    deleteBook
}