const Attendance = require('../models/attendanceModel');
const Class = require('../models/classModel');
const Student = require('../models/studentModel');
const { normalizeDateOnly } = require('../utils/date');
const { isValidObjectId } = require('../utils/objectId');

const VALID_ENROLLMENT_STATUS = ['enrolled', 'dropped'];
const VALID_ATTENDANCE_STATUS = ['PRESENT', 'ABSENT'];

const getClassById = async (classId) => Class.findById(classId).lean();

const getStudentsByClass = async (req, res, next) => {
  try {
    const { classId } = req.params;
    const { status } = req.query;

    if (!isValidObjectId(classId)) {
      return res.status(400).json({ error: `Invalid classId: ${classId}` });
    }

    if (!status || !VALID_ENROLLMENT_STATUS.includes(status)) {
      return res.status(400).json({ error: `Invalid status: ${status || ''}`.trim() });
    }

    const foundClass = await getClassById(classId);

    if (!foundClass) {
      return res.status(404).json({ error: `Class with id = ${classId} not found` });
    }

    const studentIds = foundClass.enrollments
      .filter((enrollment) => enrollment.status === status)
      .map((enrollment) => enrollment.studentId);

    const students = await Student.find({ _id: { $in: studentIds } })
      .select('_id studentCode fullName email')
      .lean();

    const studentMap = new Map(students.map((student) => [student._id.toString(), student]));

    const response = studentIds
      .map((studentId) => studentMap.get(studentId.toString()))
      .filter(Boolean)
      .map((student) => ({
        studentId: student._id.toString(),
        studentCode: student.studentCode,
        fullName: student.fullName,
        email: student.email
      }));

    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

const getAttendanceSummary = async (req, res, next) => {
  try {
    const { classId } = req.params;

    if (!isValidObjectId(classId)) {
      return res.status(400).json({ error: `Invalid classId: ${classId}` });
    }

    const foundClass = await getClassById(classId);

    if (!foundClass) {
      return res.status(404).json({ error: `Class with id = ${classId} not found` });
    }

    const enrolledStudentIds = foundClass.enrollments
      .filter((enrollment) => enrollment.status === 'enrolled')
      .map((enrollment) => enrollment.studentId);

    const students = await Student.find({ _id: { $in: enrolledStudentIds } })
      .select('studentCode fullName')
      .lean();

    const attendanceRows = await Attendance.find({
      classId: foundClass._id,
      studentId: { $in: enrolledStudentIds },
    })
      .select('studentId status')
      .lean();

    const statsMap = new Map();

    for (const row of attendanceRows) {
      const key = row.studentId.toString();
      const current = statsMap.get(key) || { totalSessions: 0, present: 0, absent: 0 };
      current.totalSessions += 1;
      if (row.status === 'PRESENT') {
        current.present += 1;
      }
      if (row.status === 'ABSENT') {
        current.absent += 1;
      }
      statsMap.set(key, current);
    }

    const studentMap = new Map(students.map((student) => [student._id.toString(), student]));

    const response = enrolledStudentIds
      .map((studentId) => studentMap.get(studentId.toString()))
      .filter(Boolean)
      .map((student) => {
        const stats = statsMap.get(student._id.toString()) || {
          totalSessions: 0,
          present: 0,
          absent: 0,
        };

        const attendanceRate = stats.totalSessions === 0
          ? 0
          : Number(((stats.present / stats.totalSessions) * 100).toFixed(1));

        return {
          student: student.studentCode,
          totalSessions: stats.totalSessions,
          present: stats.present,
          absent: stats.absent,
          attendanceRate: attendanceRate,
          warning: attendanceRate < 80,
        };
      });

    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

const upsertAttendances = async (req, res, next) => {
  try {
    const { classId } = req.params;
    const { date, records } = req.body;

    if (!isValidObjectId(classId)) {
      return res.status(400).json({ error: `Invalid classId: ${classId}` });
    }

    const foundClass = await getClassById(classId);

    if (!foundClass) {
      return res.status(404).json({ error: `Class with id = ${classId} not found` });
    }

    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }

    const normalizedDate = normalizeDateOnly(date);

    if (!normalizedDate) {
      return res.status(400).json({ error: 'Invalid date' });
    }

    const today = normalizeDateOnly(new Date());
    if (normalizedDate.getTime() > today.getTime()) {
      return res.status(400).json({ error: 'Date cannot be in the future' });
    }

    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ error: 'records is required' });
    }

    const enrolledStudentIds = foundClass.enrollments
      .filter((enrollment) => enrollment.status === 'enrolled')
      .map((enrollment) => enrollment.studentId.toString());

    const enrolledSet = new Set(enrolledStudentIds);

    const students = await Student.find({ _id: { $in: enrolledStudentIds } })
      .select('studentCode fullName')
      .lean();
    const studentMap = new Map(students.map((student) => [student._id.toString(), student]));

    const seenStudentIds = new Set();

    for (const record of records) {
      if (!record.studentId || !record.status) {
        return res.status(400).json({ error: 'Each record must include studentId and status' });
      }

      if (!isValidObjectId(record.studentId)) {
        return res.status(400).json({ error: `Invalid studentId: ${record.studentId}` });
      }

      if (!enrolledSet.has(record.studentId)) {
        return res.status(400).json({ error: `Student ${record.studentId} does not belong to class` });
      }

      if (!VALID_ATTENDANCE_STATUS.includes(record.status)) {
        return res.status(400).json({ error: `Invalid status: ${record.status}` });
      }

      if (seenStudentIds.has(record.studentId)) {
        return res.status(400).json({ error: `Duplicate attendance for student ${record.studentId}` });
      }

      seenStudentIds.add(record.studentId);
    }

    for (const studentId of enrolledStudentIds) {
      if (!seenStudentIds.has(studentId)) {
        const student = studentMap.get(studentId);
        return res.status(400).json({
          error: `Missing attendance for student ${student?.studentCode || studentId} (${student?.fullName || 'Unknown'})`,
        });
      }
    }

    const existingAttendances = await Attendance.find({
      classId: foundClass._id,
      date: normalizedDate,
      studentId: { $in: enrolledStudentIds },
    })
      .select('studentId')
      .lean();

    const updatedCount = existingAttendances.length;

    const bulkOps = records.map((record) => ({
      updateOne: {
        filter: {
          classId: foundClass._id,
          studentId: record.studentId,
          date: normalizedDate,
        },
        update: {
          $set: {
            classId: foundClass._id,
            studentId: record.studentId,
            date: normalizedDate,
            status: record.status,
          },
        },
        upsert: true,
      },
    }));

    await Attendance.bulkWrite(bulkOps);

    const present = records.filter((record) => record.status === 'PRESENT').length;
    const absent = records.filter((record) => record.status === 'ABSENT').length;

    return res.status(201).json({
      message: 'Attendance recorded successfully',
      totalRecords: records.length,
      present,
      absent,
      updatedCount,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStudentsByClass,
  getAttendanceSummary,
  upsertAttendances,
};
