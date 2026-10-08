const AdvisorRequest = require('../models/AdvisorRequest');
const Notification = require('../models/Notification');

// POST /api/advisor/requests - Student submits a request
const createRequest = async (req, res) => {
  try {
    const { subject, message, conflictDetails, suggestedAlternative } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ message: 'Subject and message are required' });
    }

    const request = await AdvisorRequest.create({
      student: req.user._id,
      subject,
      message,
      conflictDetails: conflictDetails || {},
      suggestedAlternative,
    });

    await request.populate('student', 'name studentId email');

    res.status(201).json(request);
  } catch (error) {
    console.error('Create advisor request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/advisor/requests - Student: get own requests | Advisor/Admin: get all
const getRequests = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'student') {
      query.student = req.user._id;
    }

    const requests = await AdvisorRequest.find(query)
      .populate('student', 'name studentId email programme year')
      .populate('advisor', 'name')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/advisor/requests/:id - Get single request
const getRequestById = async (req, res) => {
  try {
    const request = await AdvisorRequest.findById(req.params.id)
      .populate('student', 'name studentId email programme year')
      .populate('advisor', 'name');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Students can only see their own
    if (req.user.role === 'student' && request.student._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// PATCH /api/advisor/requests/:id - Advisor updates status/resolution
const updateRequest = async (req, res) => {
  try {
    const { status, resolution } = req.body;

    const request = await AdvisorRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (status) request.status = status;
    if (resolution) request.resolution = resolution;
    if (!request.advisor) request.advisor = req.user._id;

    if (status === 'resolved') {
      request.resolvedAt = new Date();

      // Notify student
      await Notification.create({
        recipient: request.student,
        title: 'Advisor response received',
        message: resolution || 'Your advisor request has been resolved.',
        type: 'info',
      });
    }

    await request.save();
    await request.populate('student', 'name studentId email');

    res.json(request);
  } catch (error) {
    console.error('Update request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createRequest, getRequests, getRequestById, updateRequest };
