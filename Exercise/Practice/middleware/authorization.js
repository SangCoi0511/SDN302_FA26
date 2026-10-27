const jwt = require('jsonwebtoken');

const authorization = (req, res, next) => {
    const authorizationHeader = req.get('Authorization');
    const match = authorizationHeader && authorizationHeader.match(/^Bearer\s+(\S+)$/i);

    if (!match) {
        return res.status(401).json({ message: 'A valid ****** is required.' });
    }

    if (!process.env.JWT_SECRET) {
        return res.status(500).json({ message: 'JWT_SECRET is not configured.' });
    }

    try {
        req.user = jwt.verify(match[1], process.env.JWT_SECRET);
        return next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ message: 'The token is invalid or expired.' });
        }
        return next(error);
    }
};

module.exports = authorization;
