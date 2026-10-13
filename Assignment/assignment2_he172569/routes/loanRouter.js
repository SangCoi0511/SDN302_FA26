const express = require('express');
const router = express.Router();
const { getAllLoan, getLoanById, getLoanByMembership } = require('../controllers/loanController');

router.get('/', getAllLoan);
router.get('/:id', getLoanById);
router.get('/member/:memberId', getLoanByMembership)

module.exports = router;
