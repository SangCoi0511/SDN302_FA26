module.exports = (req, res, next) => {
    const { date } = req.body;
    const isIsoDate = /^\d{4}-\d{2}-\d{2}$/.test(date);
    const parsedDate = isIsoDate ? new Date(`${date}T00:00:00.000Z`) : null;

    if (!parsedDate || Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== date) {
        const error = new Error('Date must be a valid date in YYYY-MM-DD format');
        error.statusCode = 400;
        return next(error);
    }

    next();
};