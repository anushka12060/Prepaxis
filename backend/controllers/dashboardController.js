const InterviewSession = require('../models/InterviewSession');
const Resume = require('../models/Resume');
const SavedQuestion = require('../models/SavedQuestion');

const getDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    // Only completed interviews have a real score/summary — in-progress ones aren't meaningful for stats
    const completedSessions = await InterviewSession.find({ userId, status: 'completed' }).sort({ createdAt: 1 });

    const totalInterviews = completedSessions.length;

    const averageScore =
      totalInterviews > 0
        ? Math.round(
            completedSessions.reduce((sum, s) => sum + (s.score || 0), 0) / totalInterviews
          )
        : 0;

    // Count how often each weak topic appears across all completed interviews
    const weakTopicsFrequency = {};
    completedSessions.forEach((session) => {
      (session.weakTopics || []).forEach((topic) => {
        const key = topic.toLowerCase();
        weakTopicsFrequency[key] = (weakTopicsFrequency[key] || 0) + 1;
      });
    });

    // Score over time, in chronological order, for charting progress
    const scoreTrend = completedSessions.map((s) => ({
      date: s.createdAt,
      score: s.score,
      role: s.role,
    }));

    // Count of interviews per role
    const roleBreakdown = {};
    completedSessions.forEach((session) => {
      roleBreakdown[session.role] = (roleBreakdown[session.role] || 0) + 1;
    });

    const resumesUploaded = await Resume.countDocuments({ userId });
    const savedQuestionsCount = await SavedQuestion.countDocuments({ userId });

    res.json({
      totalInterviews,
      averageScore,
      weakTopicsFrequency,
      scoreTrend,
      roleBreakdown,
      resumesUploaded,
      savedQuestionsCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Failed to fetch dashboard data' });
  }
};

module.exports = { getDashboard };