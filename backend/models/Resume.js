const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    originalFilename: {
      type: String,
      default: null, // null if resume was pasted as text, not uploaded as a file
    },
    rawText: {
      type: String,
      required: true,
    },
    sourceType: {
      type: String,
      enum: ['file', 'pasted'],
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Resume', resumeSchema);