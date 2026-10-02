const MIN_TEXT_LENGTH = 10;
const MAX_TEXT_LENGTH = 500;

module.exports = (req, res, next) => {
    const text = req.body.text.trim();

    if (text.length < MIN_TEXT_LENGTH || text.length > MAX_TEXT_LENGTH) {
        const error = new Error(`Text must be between ${MIN_TEXT_LENGTH} and ${MAX_TEXT_LENGTH} characters`);
        error.statusCode = 400;
        return next(error);
    }

    next();
};