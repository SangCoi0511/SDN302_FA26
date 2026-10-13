const express = require('express');
const router = express.Router();
const { createLoan, returnLoan, getAllLoan, getLoanById, getLoanByMembership } = require('../controllers/loanController');

router.get('/', getAllLoan);
router.get('/member/:memberId', getLoanByMembership)
router.post('/', createLoan);
router.put('/:id/return', returnLoan);
router.get('/:id', getLoanById);

module.exports = router;
