const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  createNotification,
} = require('../controllers/notificationController');
const { protect, restrictTo } = require('../middleware/auth');

router.get('/', protect, getNotifications);
router.patch('/mark-all-read', protect, markAllAsRead);
router.patch('/:id/read', protect, markAsRead);
router.post('/', protect, restrictTo('admin', 'advisor'), createNotification);

module.exports = router;
