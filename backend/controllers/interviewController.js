const InterviewSession = require('../models/InterviewSession');
const Resume = require('../models/Resume');
const { callAI, extractJSON } = require('../services/aiService');
const {
  buildFirstQuestionPrompt,
  buildNextQuestionPrompt,
  buildSummaryPrompt,
} = require('../prompts/interviewPrompt');

const TOTAL_QUESTIONS = 5;

const aiErrorMessage = (error) =>
  error.message === 'AI_BAD_FORMAT'
    ? 'The AI gave an unexpected response — please try again.'
    : error.message || 'Something went wrong';

// Start a new interview session
const startInterview = async (req, res) => {
  try {
    const { role, useResume } = req.body;
    if (!role) {
      return res.status(400).json({ message: 'Please provide a role' });
    }

    const previousAttempts = await InterviewSession.countDocuments({
      userId: req.user._id,
      role,
    });

    let resumeText = null;
    if (useResume) {
      const resume = await Resume.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
      if (!resume) {
        return res.status(400).json({ message: 'No resume found. Please upload a resume first, or start without one.' });
      }
      resumeText = resume.rawText;
    }

    const prompt = buildFirstQuestionPrompt(role, resumeText);
    const rawResponse = await callAI(prompt);
    const parsed = extractJSON(rawResponse);

    const session = await InterviewSession.create({
      userId: req.user._id,
      role,
      questions: [{ question: parsed.question, answer: '', feedback: '' }],
      attemptNumber: previousAttempts + 1,
      usedResume: !!useResume,
    });

    res.status(201).json(session);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: aiErrorMessage(error) || 'Failed to start interview' });
  }
};

// Submit an answer to the current question, get feedback + next question
const submitAnswer = async (req, res) => {
  try {
    const { answer } = req.body;
    if (!answer) {
      return res.status(400).json({ message: 'Please provide an answer' });
    }

    const session = await InterviewSession.findOne({ _id: req.params.id, userId: req.user._id });
    if (!session) {
      return res.status(404).json({ message: 'Interview session not found' });
    }
    if (session.status === 'completed') {
      return res.status(400).json({ message: 'This interview session is already completed' });
    }

    const currentIndex = session.currentQuestionIndex;
    session.questions[currentIndex].answer = answer;

    if (currentIndex + 1 >= TOTAL_QUESTIONS) {
      // This was the last question — no next question needed, frontend should call /complete next
      session.questions[currentIndex].feedback = 'Final answer recorded. Interview ready to be completed.';
      await session.save();
      return res.json({ session, isLastQuestion: true });
    }

    const prompt = buildNextQuestionPrompt(session.role, session.questions, answer);
    const rawResponse = await callAI(prompt);
    const parsed = extractJSON(rawResponse);

    session.questions[currentIndex].feedback = parsed.feedback;
    session.questions.push({ question: parsed.nextQuestion, answer: '', feedback: '' });
    session.currentQuestionIndex += 1;

    await session.save();
    res.json({ session, isLastQuestion: false });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: aiErrorMessage(error) || 'Failed to submit answer' });
  }
};

// Finish the interview, generate overall score + summary + weak topics
const completeInterview = async (req, res) => {
  try {
    const session = await InterviewSession.findOne({ _id: req.params.id, userId: req.user._id });
    if (!session) {
      return res.status(404).json({ message: 'Interview session not found' });
    }

    const prompt = buildSummaryPrompt(session.role, session.questions);
    const rawResponse = await callAI(prompt);
    const parsed = extractJSON(rawResponse);

    session.score = parsed.score;
    session.overallSummary = parsed.overallSummary;
    session.weakTopics = parsed.weakTopics;
    session.status = 'completed';

    await session.save();
    res.json(session);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: aiErrorMessage(error) || 'Failed to complete interview' });
  }
};

// Get a single interview session by id (full details, including all Q&A)
const getInterviewById = async (req, res) => {
  try {
    const session = await InterviewSession.findOne({ _id: req.params.id, userId: req.user._id });
    if (!session) {
      return res.status(404).json({ message: 'Interview session not found' });
    }
    res.json(session);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Failed to fetch interview session' });
  }
};

// List all interview sessions for the logged-in user (summary view, most recent first)
const getAllInterviews = async (req, res) => {
  try {
    const sessions = await InterviewSession.find({ userId: req.user._id })
      .select('role status score attemptNumber usedResume createdAt')
      .sort({ createdAt: -1 });
    res.json(sessions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Failed to fetch interview sessions' });
  }
};


module.exports = { startInterview, submitAnswer, completeInterview, getInterviewById, getAllInterviews };