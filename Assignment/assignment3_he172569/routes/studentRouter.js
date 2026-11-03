const express = require('express');
const { getStudentAttendanceHistory } = require('../controllers/studentController');
const authorization = require('../middleware/authorization');

const router = express.Router();

router.use(authorization);
router.get('/:studentId/attendances', getStudentAttendanceHistory);

module.exports = router;
