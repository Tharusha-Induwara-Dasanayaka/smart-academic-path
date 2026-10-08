const express = require('express');
const router = express.Router();
const Module = require('../models/Module');
const ClassGroup = require('../models/ClassGroup');
const { protect, restrictTo } = require('../middleware/auth');

// GET /api/modules - Get all active modules
router.get('/', protect, async (req, res) => {
  try {
    const { semester, year } = req.query;
    const query = { isActive: true };

    if (semester) query.semester = Number(semester);
    if (year) query.year = Number(year);

    const modules = await Module.find(query).sort({ code: 1 });
    res.json(modules);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/modules/:id - Get single module with its class groups
router.get('/:id', protect, async (req, res) => {
  try {
    const module = await Module.findById(req.params.id);

    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }

    const classGroups = await ClassGroup.find({
      module: module._id,
      isActive: true,
    }).sort({ groupName: 1 });

    res.json({ module, classGroups });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/modules/code/:code - Get module by code
router.get('/code/:code', protect, async (req, res) => {
  try {
    const module = await Module.findOne({ code: req.params.code.toUpperCase() });

    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }

    const classGroups = await ClassGroup.find({
      module: module._id,
      isActive: true,
    }).sort({ groupName: 1 });

    res.json({ module, classGroups });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/modules - Admin only: create module
router.post('/', protect, restrictTo('admin'), async (req, res) => {
  try {
    const module = await Module.create(req.body);
    res.status(201).json(module);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Module code already exists' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PATCH /api/modules/:id - Admin only
router.patch('/:id', protect, restrictTo('admin'), async (req, res) => {
  try {
    const module = await Module.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!module) return res.status(404).json({ message: 'Module not found' });
    res.json(module);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
