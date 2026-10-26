const Loan = require('../models/loan');
const Book = require('../models/book');
const Member = require('../models/member');
const mongoose = require('mongoose');

const populateLoan = (query) => query
    .populate({ path: 'member_id', select: 'fullName email phone membershipType isActive' })
    .populate({ path: 'items.book_id', select: 'title author category isbn publishedYear totalCopies availableCopies' });

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const createLoan = async (req, res) => {
    const reservedBooks = [];
    let loanCreated = false;

    try {
        const { member_id, items, dueDate } = req.body;

        if (!member_id || !isValidId(member_id)) {
            return res.status(400).json({ error: 'A valid member_id is required' });
        }

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'At least one book item is required' });
        }

        if (!dueDate || Number.isNaN(Date.parse(dueDate))) {
            return res.status(400).json({ error: 'A valid dueDate is required' });
        }

        const itemQuantities = new Map();
        for (const item of items) {
            if (!item.book_id || !isValidId(item.book_id) || !Number.isInteger(item.quantity) || item.quantity < 1) {
                return res.status(400).json({ error: 'Each item needs a valid book_id and a positive integer quantity' });
            }

            const bookId = item.book_id.toString();
            itemQuantities.set(bookId, (itemQuantities.get(bookId) || 0) + item.quantity);
        }

        const member = await Member.findById(member_id);
        if (!member) {
            return res.status(404).json({ error: 'Member not found' });
        }
        if (!member.isActive) {
            return res.status(400).json({ error: 'Member is not active' });
        }

        for (const [bookId, quantity] of itemQuantities) {
            const book = await Book.findOneAndUpdate(
                { _id: bookId, availableCopies: { $gte: quantity } },
                { $inc: { availableCopies: -quantity } },
                { new: true }
            );

            if (!book) {
                const exists = await Book.exists({ _id: bookId });
                const error = new Error(exists
                    ? `Insufficient available copies for book ${bookId}`
                    : `Book ${bookId} not found`);
                error.statusCode = exists ? 400 : 404;
                throw error;
            }

            reservedBooks.push({ bookId, quantity });
        }

        const loan = await Loan.create({
            member_id,
            items: [...itemQuantities].map(([book_id, quantity]) => ({ book_id, quantity })),
            dueDate
        });
        loanCreated = true;

        return res.status(201).json(await populateLoan(Loan.findById(loan._id)));
    } catch (error) {
        if (!loanCreated) {
            await Promise.all(reservedBooks.map(({ bookId, quantity }) =>
                Book.updateOne({ _id: bookId }, { $inc: { availableCopies: quantity } })
            ));
        }

        if (error.statusCode) {
            return res.status(error.statusCode).json({ error: error.message });
        }
        if (error.name === 'ValidationError' || error.name === 'CastError') {
            return res.status(400).json({ error: error.message });
        }
        return res.status(500).json({ error: error.message });
    }
};

const returnLoan = async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidId(id)) {
            return res.status(400).json({ error: 'Invalid loan id' });
        }

        const loan = await Loan.findOneAndUpdate(
            { _id: id, status: { $in: ['Borrowing', 'Overdue'] } },
            { $set: { returnDate: new Date(), status: 'Returned' } },
            { new: true }
        );

        if (!loan) {
            const existingLoan = await Loan.findById(id);
            if (!existingLoan) {
                return res.status(404).json({ error: 'Loan not found' });
            }
            return res.status(400).json({ error: 'Loan has already been returned' });
        }

        const restoredBooks = [];
        try {
            for (const item of loan.items) {
                const result = await Book.updateOne(
                    { _id: item.book_id },
                    { $inc: { availableCopies: item.quantity } }
                );

                if (result.matchedCount === 0) {
                    throw new Error(`Book ${item.book_id} not found while restoring copies`);
                }
                restoredBooks.push(item);
            }
        } catch (error) {
            await Promise.all(restoredBooks.map((item) =>
                Book.updateOne({ _id: item.book_id }, { $inc: { availableCopies: -item.quantity } })
            ));
            await Loan.updateOne(
                { _id: loan._id, status: 'Returned' },
                { $set: { status: 'Borrowing', returnDate: null } }
            );
            throw error;
        }

        return res.status(200).json({ message: 'Loan returned successfully', loan: await populateLoan(Loan.findById(loan._id)) });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const getAllLoan = async (req, res) => {
    try {
        const loans = await Loan.find().populate({ path: 'member_id', select: 'fullName phone -_id' })
    .populate({ path: 'items.book_id', select: 'title author category isbn publishedYear totalCopies availableCopies' });

        return res.status(200).json(loans);
    } catch (error) {
        return res.status(500).json({ error: error.message});
    }
}

const getLoanById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            return res.status(400).json({ error: 'Invalid loan id' });
        }

        const loans = await populateLoan(Loan.findById(id));

        if (!loans){
            return res.status(404).json({ error: 'Loan not found'});
        }

        return res.status(200).json(loans);
    } catch (error) {
        return res.status(500).json({ error: error.message});
    }
}

const getLoanByMembership = async (req, res) => {
    try {
        const { memberId } = req.params;

        if (!isValidId(memberId)) {
            return res.status(400).json({ error: 'Invalid member id' });
        }

        const loans = await populateLoan(Loan.find({ member_id: memberId }));
        return res.status(200).json(loans);
    } catch (error) {
        return res.status(500).json({ error: error.message});
    }
}



module.exports = {
    createLoan,
    returnLoan,
    getAllLoan,
    getLoanById,
    getLoanByMembership
}
