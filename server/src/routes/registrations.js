const express = require('express');
const router = express.Router();
const {
  getRegistration,
  getAllRegistrations,
  createOrUpdateRegistration,
  updateRegistrationItem,
  removeRegistrationItem,
  confirmRegistration,
  cancelRegistration,
  checkClashes,
} = require('../controllers/registrationController');
const { protect, restrictTo } = require('../middleware/auth');

router.get('/clash-check', protect, checkClashes);
router.get('/all', protect, restrictTo('admin', 'advisor'), getAllRegistrations);
router.get('/', protect, getRegistration);
router.post('/', protect, createOrUpdateRegistration);
router.patch('/:id/item', protect, updateRegistrationItem);
router.patch('/:id/confirm', protect, confirmRegistration);
router.delete('/:id/item/:moduleId', protect, removeRegistrationItem);
router.delete('/:id', protect, cancelRegistration);

module.exports = router;
