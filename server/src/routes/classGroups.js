const express = require('express');
const router = express.Router();
const ClassGroup = require('../models/ClassGroup');
const { protect, restrictTo } = require('../middleware/auth');

// GET /api/class-groups - Get all class groups (optionally filtered by module)
router.get('/', protect, async (req, res) => {
  try {
    const { moduleId, moduleCode } = req.query;
    const query = { isActive: true };

    if (moduleId) query.module = moduleId;
    if (moduleCode) query.moduleCode = moduleCode.toUpperCase();

    const classGroups = await ClassGroup.find(query)
      .populate('module', 'code name credits')
      .sort({ groupName: 1 });

    res.json(classGroups);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/class-groups/:id - Get single class group
router.get('/:id', protect, async (req, res) => {
  try {
    const classGroup = await ClassGroup.findById(req.params.id).populate('module', 'code name credits');

    if (!classGroup) {
      return res.status(404).json({ message: 'Class group not found' });
    }

    res.json(classGroup);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/class-groups/:id/alternatives - Get non-conflicting alternatives for a class group
router.get('/:id/alternatives', protect, async (req, res) => {
  try {
    const { conflictingGroupIds } = req.query;
    const targetGroup = await ClassGroup.findById(req.params.id);

    if (!targetGroup) {
      return res.status(404).json({ message: 'Class group not found' });
    }

    // Get all groups for the same module
    const allGroups = await ClassGroup.find({
      module: targetGroup.module,
      _id: { $ne: req.params.id },
      isActive: true,
    }).populate('module', 'code name credits');

    // Parse conflicting group IDs
    let conflictIds = [];
    if (conflictingGroupIds) {
      conflictIds = Array.isArray(conflictingGroupIds)
        ? conflictingGroupIds
        : conflictingGroupIds.split(',');
    }

    // Get conflicting groups' schedules
    const conflictingGroups = await ClassGroup.find({ _id: { $in: conflictIds } });

    const toMinutes = (time) => {
      const [h, m] = time.split(':').map(Number);
      return h * 60 + m;
    };

    const timesOverlap = (day1, start1, end1, day2, start2, end2) => {
      if (day1 !== day2) return false;
      const s1 = toMinutes(start1);
      const e1 = toMinutes(end1);
      const s2 = toMinutes(start2);
      const e2 = toMinutes(end2);
      return s1 < e2 && s2 < e1;
    };

    // Filter alternatives that don't clash with conflicting groups
    const alternatives = allGroups.map((group) => {
      const clashes = conflictingGroups.filter((cg) =>
        timesOverlap(group.dayOfWeek, group.startTime, group.endTime, cg.dayOfWeek, cg.startTime, cg.endTime)
      );
      return {
        ...group.toJSON(),
        hasClash: clashes.length > 0,
        availableSeats: group.totalSeats - group.enrolledCount,
        isBestMatch: clashes.length === 0 && group.totalSeats - group.enrolledCount > 0,
      };
    });

    res.json(alternatives);
  } catch (error) {
    console.error('Get alternatives error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/class-groups - Admin only
router.post('/', protect, restrictTo('admin'), async (req, res) => {
  try {
    const classGroup = await ClassGroup.create(req.body);
    await classGroup.populate('module', 'code name credits');
    res.status(201).json(classGroup);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PATCH /api/class-groups/:id - Admin only
router.patch('/:id', protect, restrictTo('admin'), async (req, res) => {
  try {
    const classGroup = await ClassGroup.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('module', 'code name credits');

    if (!classGroup) return res.status(404).json({ message: 'Class group not found' });
    res.json(classGroup);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
