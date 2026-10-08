const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
    },
    type: {
      type: String,
      enum: ['deadline', 'clash', 'confirmation', 'info', 'warning', 'room_change'],
      default: 'info',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    relatedModule: {
      type: String,
      default: null,
    },
    actionUrl: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
