const express = require('express');
const {
  getStudentsByClass,
  getAttendanceSummary,
  upsertAttendances,
} = require('../controllers/classController');
const authorization = require('../middleware/authorization');


const router = express.Router();

router.get('/:classId/students', authorization, getStudentsByClass);
router.get('/:classId/attendance-summary', authorization, getAttendanceSummary);
router.post('/:classId/attendances', upsertAttendances);

module.exports = router;
