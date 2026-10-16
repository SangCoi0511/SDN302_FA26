const express = require('express');
const router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.json({ message: 'Users endpoint - not implemented yet.' });
});

module.exports = router;
