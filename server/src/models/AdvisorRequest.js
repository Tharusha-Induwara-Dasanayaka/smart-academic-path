const mongoose = require('mongoose');

const advisorRequestSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    advisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
    },
    conflictDetails: {
      moduleA: { type: String, default: null },
      moduleB: { type: String, default: null },
      conflictTime: { type: String, default: null },
      autoAttached: { type: Boolean, default: false },
    },
    suggestedAlternative: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['open', 'in_review', 'resolved', 'closed'],
      default: 'open',
    },
    resolution: {
      type: String,
      default: null,
    },
    resolvedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model('AdvisorRequest', advisorRequestSchema);
