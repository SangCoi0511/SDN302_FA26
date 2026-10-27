const jwt = require('jsonwebtoken');

const members = [
    {
        name: 'storeadmin',
        pass: 'Store@123'
    }
];

const createToken = async (req, res) => {
    const { name, pass } = req.body || {};
    if (typeof name !== 'string' || typeof pass !== 'string') {
        return res.status(400).json({ message: 'name and pass are required.' });
    }

    if (!process.env.JWT_SECRET) {
        return res.status(500).json({ message: 'JWT_SECRET is not configured.' });
    }

    const member = members.find((entry) => entry.name === name && entry.pass === pass);
    if (!member) {
        return res.status(401).json({ message: 'Invalid name or password.' });
    }

    const token = jwt.sign({ name: member.name }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return res.json({ token });
};

module.exports = {
    createToken
};
