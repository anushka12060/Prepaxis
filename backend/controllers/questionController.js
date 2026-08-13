const Question = require('../models/Question');
const SavedQuestion = require('../models/SavedQuestion');
const { callAI, extractJSON } = require('../services/aiService');
const { buildQuestionGenerationPrompt } = require('../prompts/questionPrompt');

const aiErrorMessage = (error) =>
  error.message === 'AI_BAD_FORMAT'
    ? 'The AI gave an unexpected response — please try again.'
    : error.message || 'Something went wrong';

// Browse/filter the question bank
const getQuestions = async (req, res) => {
  try {
    const { topic, difficulty } = req.query;
    const filter = {};
    if (topic) filter.topic = topic.toLowerCase();
    if (difficulty) filter.difficulty = difficulty;

    const questions = await Question.find(filter).sort({ createdAt: -1 });
    res.json(questions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Failed to fetch questions' });
  }
};

// Generate a single AI question on demand (not saved to the bank unless bookmarked)
const generateQuestion = async (req, res) => {
  try {
    const { topic, difficulty } = req.body;
    if (!topic || !difficulty) {
      return res.status(400).json({ message: 'Please provide a topic and difficulty' });
    }

    const prompt = buildQuestionGenerationPrompt(topic, difficulty);
    const rawResponse = await callAI(prompt);
    const parsed = extractJSON(rawResponse);

    res.json({
      question: parsed.question,
      idealAnswer: parsed.idealAnswer,
      topic: topic.toLowerCase(),
      difficulty,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: aiErrorMessage(error) || 'Failed to generate question' });
  }
};

// Bookmark a question — either an existing bank question (by id) or a custom AI-generated one (inline content)
const saveQuestion = async (req, res) => {
  try {
    const { questionId, customQuestion } = req.body;

    if (!questionId && !customQuestion) {
      return res.status(400).json({ message: 'Provide either a questionId or a customQuestion to save' });
    }

    if (questionId) {
      const exists = await Question.findById(questionId);
      if (!exists) {
        return res.status(404).json({ message: 'Question not found' });
      }
    }

    const saved = await SavedQuestion.create({
      userId: req.user._id,
      questionId: questionId || null,
      customQuestion: questionId ? undefined : customQuestion,
    });

    res.status(201).json(saved);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You already saved this question' });
    }
    console.error(error);
    res.status(500).json({ message: error.message || 'Failed to save question' });
  }
};

// Remove a bookmark
const unsaveQuestion = async (req, res) => {
  try {
    const deleted = await SavedQuestion.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!deleted) {
      return res.status(404).json({ message: 'Saved question not found' });
    }

    res.json({ message: 'Removed from saved questions' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Failed to unsave question' });
  }
};

// List the current user's saved/bookmarked questions
const getSavedQuestions = async (req, res) => {
  try {
    const saved = await SavedQuestion.find({ userId: req.user._id })
      .populate('questionId')
      .sort({ createdAt: -1 });

    res.json(saved);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Failed to fetch saved questions' });
  }
};

// Add an AI-generated question to the browsable bank
const addToBank = async (req, res) => {
  try {
    const { question, idealAnswer, topic, difficulty } = req.body;

    if (!question || !idealAnswer || !topic || !difficulty) {
      return res.status(400).json({ message: 'question, idealAnswer, topic, and difficulty are all required' });
    }

    const bankQuestion = await Question.create({
      topic: topic.toLowerCase(),
      difficulty,
      question,
      idealAnswer,
      source: 'ai-generated',
    });

    res.status(201).json(bankQuestion);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Failed to add question to bank' });
  }
};

module.exports = {
  getQuestions,
  generateQuestion,
  saveQuestion,
  unsaveQuestion,
  getSavedQuestions,
  addToBank,
};