const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  startInterview,
  submitAnswer,
  completeInterview,
  getInterviewById,
  getAllInterviews,
} = require('../controllers/interviewController');

router.post('/start', protect, startInterview);
router.get('/', protect, getAllInterviews);
router.get('/:id', protect, getInterviewById);
router.post('/:id/answer', protect, submitAnswer);
router.post('/:id/complete', protect, completeInterview);

module.exports = router;