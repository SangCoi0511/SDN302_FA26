const express = require('express');
const validateArticle = require('../middleware/validateArticle');
const validateDate = require('../middleware/validateDate');
const validateText = require('../middleware/validateText');

const router = express.Router();

router.post('/', validateArticle, validateDate, validateText, (req, res) => {
    res.status(201).json({
        message: 'Article validated successfully',
        article: req.body,
    });
});

module.exports = router;