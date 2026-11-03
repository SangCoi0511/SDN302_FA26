const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    studentCode: {
      type: String,
      required: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
  },
  {
    versionKey: false,
    collection: 'students',
  }
);

module.exports = mongoose.model('Student', studentSchema);
