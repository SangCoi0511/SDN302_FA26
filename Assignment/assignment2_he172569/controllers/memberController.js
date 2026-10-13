const Member = require('../models/member');

const getAllMember = async (req, res) => {
    try {
        const members = await Member.find();

        if (!members) {
            return res.status(404).json({ error: 'Member not found'});
        }

        return res.status(200).json(members);
    } catch (error) {
        return res.status(500).json({ error: error.message});
    }
}

const getMemberById = async (req, res) => {
    try {
        const { id } = req.params;

        const members = await Member.findById(id);

        if (!members){
            return res.status(404).json({ error: 'Member not found'});
        }

        return res.status(200).json(members);
    } catch (error) {
        return res.status(500).json({ error: error.message});
    }
}

const createMember = async (req, res) => {
    try {
        const { fullName, email, phone, membershipType } = req.body;

        if (!fullName || !email || !phone || !membershipType) {
            return res.status(400).json({ error: 'Fullname, email, phone, membershipType are required'});
        }

        const newMember = new Member({
            fullName,
            email,
            phone,
            membershipType
        });
        await newMember.save();

        return res.status(200).json({
            message: 'Add new member success',
            newMember: newMember
        });
    } catch (error) {
        return res.status(500).json({ error: error.message});
    }
}

const updateMember = async (req, res) => {
    try {
        const { id } = req.params;
        const { fullName, email, phone, membershipType } = req.body;

        if (!fullName || !email || !phone || !membershipType) {
            return res.status(400).json({ error: 'Fullname, email, phone, membershipType are required'});
        }
        
        const updatedMember = await Member.findByIdAndUpdate(
            id,
            { fullName,
            email,
            phone,
            membershipType
        },
            { new: true}
        );

        if (!updatedMember) {
            return res.status(404).json({ error: 'Member not found' });
        }

        return res.status(200).json({
            message: 'Updated member success',
            member: updatedMember
        });
    } catch (error) {
        return res.status(500).json({ error: error.message});
    }
}

const deleteMember = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedMember = await Member.findByIdAndDelete(id);

        if(!deletedMember) {
            return res.status(404).json({ error: 'Member not found' });
        }

        return res.status(200).json({ message: 'Deleted member success' });
        
    } catch (error) {
        return res.status(500).json({ error: error.message});
    }
}

module.exports = {
    getAllMember,
    getMemberById,
    createMember,
    updateMember,
    deleteMember
}