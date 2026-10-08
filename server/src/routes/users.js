const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, restrictTo } = require('../middleware/auth');

// GET /api/users/profile
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      _id: user._id,
      studentId: user.studentId,
      name: user.name,
      email: user.email,
      phone: user.phone,
      programme: user.programme,
      year: user.year,
      role: user.role,
      semester: user.semester,
      initials: user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase(),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/users/profile
router.patch('/profile', protect, async (req, res) => {
  try {
    const allowedFields = ['name', 'phone', 'programme', 'year'];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.json({
      _id: user._id,
      studentId: user.studentId,
      name: user.name,
      email: user.email,
      phone: user.phone,
      programme: user.programme,
      year: user.year,
      role: user.role,
      initials: user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase(),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/users/change-password
router.patch('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new password are required' });
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/users - Admin only: list all users
router.get('/', protect, restrictTo('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
