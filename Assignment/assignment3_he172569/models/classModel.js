const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['enrolled', 'dropped'],
    },
  },
  {
    _id: false,
    versionKey: false,
  }
);

const classSchema = new mongoose.Schema(
  {
    className: {
      type: String,
      required: true,
      trim: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    lecturerName: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      required: true,
      trim: true,
    },
    enrollments: {
      type: [enrollmentSchema],
      default: [],
    },
  },
  {
    versionKey: false,
    collection: 'classes',
  }
);

module.exports = mongoose.model('Class', classSchema);
