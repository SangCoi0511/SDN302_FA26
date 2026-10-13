const express = require('express');
const router = express.Router();
const { getAllMember, getMemberById, createMember, updateMember, deleteMember } = require('../controllers/memberController');

router.get('/', getAllMember);
router.get('/:id', getMemberById);
router.post('/', createMember);
router.put('/:id', updateMember);
router.delete('/', deleteMember);

module.exports = router;
