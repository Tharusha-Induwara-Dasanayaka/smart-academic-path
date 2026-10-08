const express = require('express');
const router = express.Router();
const {
  createRequest,
  getRequests,
  getRequestById,
  updateRequest,
} = require('../controllers/advisorController');
const { protect, restrictTo } = require('../middleware/auth');

router.post('/requests', protect, createRequest);
router.get('/requests', protect, getRequests);
router.get('/requests/:id', protect, getRequestById);
router.patch('/requests/:id', protect, restrictTo('advisor', 'admin'), updateRequest);

module.exports = router;
