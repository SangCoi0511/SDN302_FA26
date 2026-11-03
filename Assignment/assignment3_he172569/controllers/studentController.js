const Attendance = require('../models/attendanceModel');
const Student = require('../models/studentModel');
require('../models/classModel');
require('../models/subjectModel');
const { isValidObjectId } = require('../utils/objectId');

const getStudentAttendanceHistory = async (req, res, next) => {
  try {
    const { studentId } = req.params;

    if (!isValidObjectId(studentId)) {
      return res.status(400).json({ error: `Invalid studentId: ${studentId}` });
    }

    const student = await Student.findById(studentId).lean();

    if (!student) {
      return res.status(404).json({ error: `Student with id = ${studentId} not found` });
    }

    const attendances = await Attendance.find({ studentId })
      .populate({
        path: 'classId',
        select: 'className subjectId',
        populate: {
          path: 'subjectId',
          select: 'name',
        },
      })
      .sort({ date: -1, _id: -1 })
      .lean();

    const response = attendances.map((attendance) => ({
      className: attendance.classId?.className || null,
      subjectName: attendance.classId?.subjectId?.name || null,
      date: new Date(attendance.date).toISOString(),
      status: attendance.status,
    }));

    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStudentAttendanceHistory,
};
