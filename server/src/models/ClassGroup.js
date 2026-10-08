const mongoose = require('mongoose');

const classGroupSchema = new mongoose.Schema(
  {
    module: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Module',
      required: true,
    },
    moduleCode: {
      type: String,
      required: true,
      uppercase: true,
    },
    groupName: {
      type: String,
      required: [true, 'Group name is required'],
      trim: true,
    },
    dayOfWeek: {
      type: String,
      required: [true, 'Day of week is required'],
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
      // Format: "HH:MM" e.g. "10:00"
    },
    endTime: {
      type: String,
      required: [true, 'End time is required'],
      // Format: "HH:MM" e.g. "12:00"
    },
    venue: {
      type: String,
      default: 'TBA',
    },
    totalSeats: {
      type: Number,
      required: true,
      min: 0,
    },
    enrolledCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Virtual for available seats
classGroupSchema.virtual('availableSeats').get(function () {
  return this.totalSeats - this.enrolledCount;
});

// Virtual for display label (e.g. "Mon 10-12")
classGroupSchema.virtual('displayTime').get(function () {
  const dayAbbr = this.dayOfWeek.substring(0, 3);
  const startHour = parseInt(this.startTime.split(':')[0]);
  const endHour = parseInt(this.endTime.split(':')[0]);
  return `${dayAbbr} ${startHour}-${endHour}`;
});

classGroupSchema.set('toJSON', { virtuals: true });
classGroupSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('ClassGroup', classGroupSchema);
