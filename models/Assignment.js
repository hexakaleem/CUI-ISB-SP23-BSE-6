const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  fileUrl: {
    type: String
  },
  submissions: [{
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    fileUrl: {
      type: String
    },
    marks: {
      type: Number
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Assignment', assignmentSchema);
