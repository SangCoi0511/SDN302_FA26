const express = require('express');
const {
  getStudentsByClass,
  getAttendanceSummary,
  upsertAttendances,
} = require('../controllers/classController');
const authorization = require('../middleware/authorization');


const router = express.Router(authorization);

router.use(authorization);
router.get('/:classId/students', getStudentsByClass);
router.get('/:classId/attendance-summary', getAttendanceSummary);
router.post('/:classId/attendances', upsertAttendances);

module.exports = router;
