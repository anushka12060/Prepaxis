const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const aiRateLimiter = require('../middleware/aiRateLimiter');
const {
  startInterview,
  submitAnswer,
  completeInterview,
  getInterviewById,
  getAllInterviews,
} = require('../controllers/interviewController');

router.post('/start', protect, aiRateLimiter, startInterview);
router.get('/', protect, getAllInterviews);
router.get('/:id', protect, getInterviewById);
router.post('/:id/answer', protect, aiRateLimiter, submitAnswer);
router.post('/:id/complete', protect, aiRateLimiter, completeInterview);

module.exports = router;