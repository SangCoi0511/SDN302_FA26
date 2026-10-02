module.exports = (req, res, next) => {
    const { title, date, text } = req.body || {};
    const missingFields = ['title', 'date', 'text'].filter((field) => {
        const value = { title, date, text }[field];
        return typeof value !== 'string' || value.trim().length === 0;
    });

    if (missingFields.length > 0) {
        const error = new Error(`Missing or invalid required fields: ${missingFields.join(', ')}`);
        error.statusCode = 400;
        return next(error);
    }

    next();
};