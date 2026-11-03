const jwt = require('jsonwebtoken');

const accounts = [
    {
        name: 'he172569@fpt.edu.vn',
        password: 'he172569@123'
    }
];

const createToken = async (req, res) => {
    const { name, password } = req.body || {};
    if (typeof name !== 'string' || typeof password !== 'string') {
        return res.status(400).json({ message: 'name and password are required.' });
    }

    if (!process.env.JWT_SECRET) {
        return res.status(500).json({ message: 'JWT_SECRET is not configured.' });
    }

    const account = accounts.find((entry) => entry.name === name && entry.password === password);
    if (!account) {
        return res.status(401).json({ message: 'Invalid name or passwordword.' });
    }

    const token = jwt.sign({ name: account.name }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return res.json({ 
        message: 'Login successfully',
        token: token
    });
};

module.exports = {
    createToken
};
