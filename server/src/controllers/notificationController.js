const Notification = require('../models/Notification');

// GET /api/notifications
const getNotifications = async (req, res) => {
  try {
    const { filter } = req.query; // 'all' or 'unread'
    const query = { recipient: req.user._id };

    if (filter === 'unread') {
      query.isRead = false;
    }

    const notifications = await Notification.find(query).sort({ createdAt: -1 });
    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false,
    });

    res.json({ notifications, unreadCount });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// PATCH /api/notifications/:id/read
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// PATCH /api/notifications/mark-all-read
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/notifications - Create notification (admin/system)
const createNotification = async (req, res) => {
  try {
    const { recipientId, title, message, type, relatedModule } = req.body;

    const notification = await Notification.create({
      recipient: recipientId,
      title,
      message,
      type: type || 'info',
      relatedModule,
    });

    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getNotifications, markAsRead, markAllAsRead, createNotification };
