const ClassGroup = require('../models/ClassGroup');
const Registration = require('../models/Registration');

// Helper: check if two time ranges overlap
const timesOverlap = (day1, start1, end1, day2, start2, end2) => {
  if (day1 !== day2) return false;

  const toMinutes = (time) => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  };

  const s1 = toMinutes(start1);
  const e1 = toMinutes(end1);
  const s2 = toMinutes(start2);
  const e2 = toMinutes(end2);

  return s1 < e2 && s2 < e1;
};

// GET /api/registrations - Get current student's registration
const getRegistration = async (req, res) => {
  try {
    const registration = await Registration.findOne({
      student: req.user._id,
      status: { $ne: 'cancelled' },
    })
      .populate('items.module', 'code name credits')
      .populate('items.classGroup', 'groupName dayOfWeek startTime endTime venue totalSeats enrolledCount')
      .sort({ createdAt: -1 });

    if (!registration) {
      return res.status(404).json({ message: 'No active registration found' });
    }

    res.json(registration);
  } catch (error) {
    console.error('Get registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/registrations/all - Admin: get all registrations
const getAllRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find()
      .populate('student', 'name studentId email')
      .populate('items.module', 'code name')
      .populate('items.classGroup', 'groupName dayOfWeek startTime endTime')
      .sort({ createdAt: -1 });

    res.json(registrations);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/registrations - Create or update registration
const createOrUpdateRegistration = async (req, res) => {
  try {
    const { semester, academicYear, items, deadline } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'At least one module is required' });
    }

    // Fetch all selected class groups
    const classGroupIds = items.map((item) => item.classGroup);
    const classGroups = await ClassGroup.find({ _id: { $in: classGroupIds } });

    if (classGroups.length !== items.length) {
      return res.status(400).json({ message: 'One or more class groups not found' });
    }

    // Detect clashes
    const processedItems = items.map((item) => ({
      ...item,
      hasClash: false,
      clashWith: null,
    }));

    let totalClashes = 0;

    for (let i = 0; i < classGroups.length; i++) {
      for (let j = i + 1; j < classGroups.length; j++) {
        const cg1 = classGroups[i];
        const cg2 = classGroups[j];

        if (
          timesOverlap(
            cg1.dayOfWeek,
            cg1.startTime,
            cg1.endTime,
            cg2.dayOfWeek,
            cg2.startTime,
            cg2.endTime
          )
        ) {
          processedItems[i].hasClash = true;
          processedItems[i].clashWith = cg2.moduleCode;
          processedItems[j].hasClash = true;
          processedItems[j].clashWith = cg1.moduleCode;
          totalClashes++;
        }
      }
    }

    // Find existing draft registration
    let registration = await Registration.findOne({
      student: req.user._id,
      status: { $in: ['draft', 'submitted'] },
    });

    if (registration) {
      registration.semester = semester || registration.semester;
      registration.academicYear = academicYear || registration.academicYear;
      registration.items = processedItems;
      registration.totalClashes = totalClashes;
      if (deadline) registration.deadline = new Date(deadline);
      await registration.save();
    } else {
      registration = await Registration.create({
        student: req.user._id,
        semester: semester || req.user.semester || 2,
        academicYear: academicYear || '2025/2026',
        items: processedItems,
        totalClashes,
        deadline: deadline ? new Date(deadline) : undefined,
      });
    }

    await registration.populate([
      { path: 'items.module', select: 'code name credits' },
      { path: 'items.classGroup', select: 'groupName dayOfWeek startTime endTime venue totalSeats enrolledCount' },
    ]);

    res.json(registration);
  } catch (error) {
    console.error('Create registration error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PATCH /api/registrations/:id/item - Update a single item (change class group)
const updateRegistrationItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { moduleId, classGroupId } = req.body;

    const registration = await Registration.findOne({
      _id: id,
      student: req.user._id,
    });

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    const itemIndex = registration.items.findIndex(
      (item) => item.module.toString() === moduleId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Module not found in registration' });
    }

    // Update the class group
    const newClassGroup = await ClassGroup.findById(classGroupId);
    if (!newClassGroup) {
      return res.status(404).json({ message: 'Class group not found' });
    }

    registration.items[itemIndex].classGroup = classGroupId;
    registration.items[itemIndex].moduleCode = newClassGroup.moduleCode;

    // Re-detect clashes
    const classGroupIds = registration.items.map((item) => item.classGroup);
    const classGroups = await ClassGroup.find({ _id: { $in: classGroupIds } });

    registration.items = registration.items.map((item) => ({
      ...item.toObject(),
      hasClash: false,
      clashWith: null,
    }));

    let totalClashes = 0;
    for (let i = 0; i < classGroups.length; i++) {
      for (let j = i + 1; j < classGroups.length; j++) {
        const cg1 = classGroups[i];
        const cg2 = classGroups[j];

        if (
          timesOverlap(
            cg1.dayOfWeek,
            cg1.startTime,
            cg1.endTime,
            cg2.dayOfWeek,
            cg2.startTime,
            cg2.endTime
          )
        ) {
          registration.items[i].hasClash = true;
          registration.items[i].clashWith = cg2.moduleCode;
          registration.items[j].hasClash = true;
          registration.items[j].clashWith = cg1.moduleCode;
          totalClashes++;
        }
      }
    }

    registration.totalClashes = totalClashes;
    await registration.save();

    await registration.populate([
      { path: 'items.module', select: 'code name credits' },
      { path: 'items.classGroup', select: 'groupName dayOfWeek startTime endTime venue totalSeats enrolledCount' },
    ]);

    res.json(registration);
  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/registrations/:id/item/:moduleId - Remove a module from registration
const removeRegistrationItem = async (req, res) => {
  try {
    const { id, moduleId } = req.params;

    const registration = await Registration.findOne({
      _id: id,
      student: req.user._id,
    });

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    registration.items = registration.items.filter(
      (item) => item.module.toString() !== moduleId
    );

    // Re-detect clashes
    const classGroupIds = registration.items.map((item) => item.classGroup);
    if (classGroupIds.length > 0) {
      const classGroups = await ClassGroup.find({ _id: { $in: classGroupIds } });

      registration.items = registration.items.map((item) => ({
        ...item.toObject(),
        hasClash: false,
        clashWith: null,
      }));

      let totalClashes = 0;
      for (let i = 0; i < classGroups.length; i++) {
        for (let j = i + 1; j < classGroups.length; j++) {
          const cg1 = classGroups[i];
          const cg2 = classGroups[j];
          if (
            timesOverlap(
              cg1.dayOfWeek,
              cg1.startTime,
              cg1.endTime,
              cg2.dayOfWeek,
              cg2.startTime,
              cg2.endTime
            )
          ) {
            registration.items[i].hasClash = true;
            registration.items[i].clashWith = cg2.moduleCode;
            registration.items[j].hasClash = true;
            registration.items[j].clashWith = cg1.moduleCode;
            totalClashes++;
          }
        }
      }
      registration.totalClashes = totalClashes;
    } else {
      registration.totalClashes = 0;
    }

    await registration.save();
    res.json({ message: 'Module removed', registration });
  } catch (error) {
    console.error('Remove item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// PATCH /api/registrations/:id/confirm - Confirm registration
const confirmRegistration = async (req, res) => {
  try {
    const { id } = req.params;

    const registration = await Registration.findOne({
      _id: id,
      student: req.user._id,
    });

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    if (registration.totalClashes > 0) {
      return res.status(400).json({
        message: 'Cannot confirm registration with unresolved clashes',
        clashes: registration.totalClashes,
      });
    }

    registration.status = 'confirmed';
    registration.confirmedAt = new Date();
    await registration.save();

    // Update enrolled counts for each class group
    for (const item of registration.items) {
      await ClassGroup.findByIdAndUpdate(item.classGroup, {
        $inc: { enrolledCount: 1 },
      });
    }

    await registration.populate([
      { path: 'items.module', select: 'code name credits' },
      { path: 'items.classGroup', select: 'groupName dayOfWeek startTime endTime venue totalSeats enrolledCount' },
    ]);

    res.json({ message: 'Registration confirmed successfully', registration });
  } catch (error) {
    console.error('Confirm registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/registrations/:id - Cancel registration
const cancelRegistration = async (req, res) => {
  try {
    const { id } = req.params;

    const registration = await Registration.findOne({
      _id: id,
      student: req.user._id,
    });

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    registration.status = 'cancelled';
    await registration.save();

    res.json({ message: 'Registration cancelled' });
  } catch (error) {
    console.error('Cancel registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/registrations/clash-check - Check for clashes given class group IDs
const checkClashes = async (req, res) => {
  try {
    const { classGroupIds } = req.query;

    if (!classGroupIds) {
      return res.status(400).json({ message: 'classGroupIds query param required' });
    }

    const ids = Array.isArray(classGroupIds) ? classGroupIds : classGroupIds.split(',');
    const classGroups = await ClassGroup.find({ _id: { $in: ids } });

    const clashes = [];
    for (let i = 0; i < classGroups.length; i++) {
      for (let j = i + 1; j < classGroups.length; j++) {
        const cg1 = classGroups[i];
        const cg2 = classGroups[j];
        if (
          timesOverlap(
            cg1.dayOfWeek,
            cg1.startTime,
            cg1.endTime,
            cg2.dayOfWeek,
            cg2.startTime,
            cg2.endTime
          )
        ) {
          clashes.push({
            group1: { id: cg1._id, moduleCode: cg1.moduleCode, groupName: cg1.groupName },
            group2: { id: cg2._id, moduleCode: cg2.moduleCode, groupName: cg2.groupName },
            day: cg1.dayOfWeek,
            time: `${cg1.startTime}-${cg1.endTime}`,
          });
        }
      }
    }

    res.json({ hasClashes: clashes.length > 0, clashes });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getRegistration,
  getAllRegistrations,
  createOrUpdateRegistration,
  updateRegistrationItem,
  removeRegistrationItem,
  confirmRegistration,
  cancelRegistration,
  checkClashes,
};
