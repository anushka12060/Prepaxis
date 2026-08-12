const mongoose = require('mongoose');

const questionBankSchema = new mongoose.Schema(
  {
    topic: {
      type: String,
      required: true,
      trim: true,
      lowercase: true, // normalize so filtering by topic is consistent (e.g. "React" and "react" match)
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: true,
    },
    question: {
      type: String,
      required: true,
    },
    idealAnswer: {
      type: String,
      required: true,
    },
    source: {
      type: String,
      enum: ['seeded', 'ai-generated'],
      default: 'seeded',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Question', questionBankSchema);