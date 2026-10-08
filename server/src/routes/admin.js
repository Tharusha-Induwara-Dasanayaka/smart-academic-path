const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth');
const Registration = require('../models/Registration');
const User = require('../models/User');
const ClassGroup = require('../models/ClassGroup');
const AdvisorRequest = require('../models/AdvisorRequest');

// GET /api/admin/status - System status overview
router.get('/status', protect, restrictTo('admin'), async (req, res) => {
  try {
    const [
      totalStudents,
      totalRegistrations,
      confirmedRegistrations,
      draftRegistrations,
      openAdvisorCases,
      totalClassGroups,
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      Registration.countDocuments(),
      Registration.countDocuments({ status: 'confirmed' }),
      Registration.countDocuments({ status: 'draft' }),
      AdvisorRequest.countDocuments({ status: { $in: ['open', 'in_review'] } }),
      ClassGroup.countDocuments({ isActive: true }),
    ]);

    // Get registration activity over last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentRegistrations = await Registration.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Simulate system metrics
    const systemStatus = {
      uptime: '99.8%',
      syncLag: '1.2s',
      dbStatus: 'healthy',
      lastSync: new Date().toISOString(),
    };

    // Recent errors (simulated for demo)
    const recentErrors = [
      { id: 1, message: 'Seat feed timeout -- 3 retries', type: 'error', resolved: false, time: new Date(Date.now() - 3600000).toISOString() },
      { id: 2, message: 'Seat feed timeout -- 3 retries', type: 'success', resolved: true, time: new Date(Date.now() - 7200000).toISOString() },
    ];

    res.json({
      stats: {
        totalStudents,
        totalRegistrations,
        confirmedRegistrations,
        draftRegistrations,
        openAdvisorCases,
        totalClassGroups,
      },
      systemStatus,
      recentRegistrations,
      recentErrors,
    });
  } catch (error) {
    console.error('Admin status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/registrations/stats
router.get('/registrations/stats', protect, restrictTo('admin'), async (req, res) => {
  try {
    const stats = await Registration.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
