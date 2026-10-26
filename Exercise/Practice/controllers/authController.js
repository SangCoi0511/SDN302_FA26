const fs = require('fs/promises');
const path = require('path');
const jwt = require('jsonwebtoken');

exports.createToken = async (req, res, next) => {
    const { name, pass } = req.body || {};
    if (typeof name !== 'string' || typeof pass !== 'string') {
        return res.status(400).json({ message: 'name and pass are required.' });
    }

    if (!process.env.JWT_SECRET) {
        return res.status(500).json({ message: 'JWT_SECRET is not configured.' });
    }

    try {
        const membersPath = path.join(__dirname, '..', 'members.json');
        const parsedMembers = JSON.parse(await fs.readFile(membersPath, 'utf8'));
        const members = Array.isArray(parsedMembers) ? parsedMembers : parsedMembers.members;

        if (!Array.isArray(members)) {
            return res.status(500).json({ message: 'members.json must contain a member array.' });
        }

        const member = members.find((entry) => entry.name === name && entry.pass === pass);
        if (!member) {
            return res.status(401).json({ message: 'Invalid name or password.' });
        }

        const token = jwt.sign({ name: member.name }, process.env.JWT_SECRET, { expiresIn: '1h' });
        return res.json({ token });
    } catch (error) {
        next(error);
    }
};
