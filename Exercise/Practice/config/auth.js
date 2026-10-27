const jwt = require('jsonwebtoken');

const authorization = (req, res, next) => {
    const authorization = req.get('Authorization');
    const match = authorization && authorization.match(/^Bearer\s+(\S+)$/i);

    if (!match) {
        return res.status(401).json({ message: 'A valid Bearer token is required.' });
    }

    if (!process.env.JWT_SECRET) {
        return res.status(500).json({ message: 'JWT_SECRET is not configured.' });
    }

    try {
        req.user = jwt.verify(match[1], process.env.JWT_SECRET);
        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ message: 'The token is invalid or expired.' });
        }
        next(error);
    }
};

module.exports = authorization;