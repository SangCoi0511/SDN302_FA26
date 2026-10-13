const Loan = require('../models/loan');

const getAllLoan = async (req, res) => {
    try {
        const loans = await Loan.find().populate({path: 'member_id', select: 'fullName email phone membershipType isActive'}).populate({path: 'items.book_id', select: 'title author category isbn publishedYear totalCopies availableCopies'});

        if (!loans) {
            return res.status(404).json({ error: 'Loan not found'});
        }

        return res.status(200).json(loans);
    } catch (error) {
        return res.status(500).json({ error: error.message});
    }
}

const getLoanById = async (req, res) => {
    try {
        const { id } = req.params;

        const loans = await Loan.findById(id).populate({path: 'member_id', select: 'fullName email phone membershipType isActive'}).populate({path: 'items.book_id', select: 'title author category isbn publishedYear totalCopies availableCopies'});

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

        const loans = await Loan.find({member_id: memberId}).populate({path: 'member_id', select: 'fullName email phone membershipType isActive'}).populate({path: 'items.book_id', select: 'title author category isbn publishedYear totalCopies availableCopies'});

        if (!loans){
            return res.status(404).json({ error: 'Loan not found'});
        }

        return res.status(200).json(loans);
    } catch (error) {
        return res.status(500).json({ error: error.message});
    }
}



module.exports = {
    getAllLoan,
    getLoanById,
    getLoanByMembership
}

//member active, referenced book exist, check sufficient copies of each book available, decrease availableCopies if create success
//put api/loans/:id/return : find, update ReturnDate set status = Returned, restore book quantity, same borrowing record from being returned more than once