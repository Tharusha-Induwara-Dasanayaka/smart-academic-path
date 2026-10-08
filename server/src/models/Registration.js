const mongoose = require('mongoose');

const registrationItemSchema = new mongoose.Schema({
  module: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module',
    required: true,
  },
  moduleCode: { type: String, required: true },
  classGroup: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ClassGroup',
    required: true,
  },
  hasClash: { type: Boolean, default: false },
  clashWith: { type: String, default: null },
});

const registrationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    semester: {
      type: Number,
      required: true,
    },
    academicYear: {
      type: String,
      required: true,
    },
    items: [registrationItemSchema],
    status: {
      type: String,
      enum: ['draft', 'submitted', 'confirmed', 'cancelled'],
      default: 'draft',
    },
    totalClashes: {
      type: Number,
      default: 0,
    },
    confirmedAt: Date,
    deadline: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Registration', registrationSchema);
