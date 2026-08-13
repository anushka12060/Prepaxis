const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const aiRateLimiter = require('../middleware/aiRateLimiter');
const {
  getQuestions,
  generateQuestion,
  saveQuestion,
  unsaveQuestion,
  getSavedQuestions,
  addToBank,
} = require('../controllers/questionController');

router.get('/', protect, getQuestions);
router.post('/generate', protect, aiRateLimiter, generateQuestion);
router.post('/save', protect, saveQuestion);
router.delete('/save/:id', protect, unsaveQuestion);
router.get('/saved', protect, getSavedQuestions);
router.post('/bank', protect, addToBank);

module.exports = router;