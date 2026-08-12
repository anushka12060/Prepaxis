const mongoose = require('mongoose');

const savedQuestionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // If bookmarking a question from the bank, this is set
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      default: null,
    },
    // If bookmarking an AI-generated question that isn't in the bank, we store it directly here instead
    customQuestion: {
      question: { type: String },
      idealAnswer: { type: String },
      topic: { type: String },
    },
  },
  { timestamps: true }
);

// Prevent saving the exact same bank question twice for the same user
savedQuestionSchema.index(
  { userId: 1, questionId: 1 },
  { unique: true, partialFilterExpression: { questionId: { $type: 'objectId' } } }
);

module.exports = mongoose.model('SavedQuestion', savedQuestionSchema);