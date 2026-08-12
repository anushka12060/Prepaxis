const Resume = require('../models/Resume');
const { extractTextFromFile } = require('../services/resumeParser');

// Upload a resume — either as a file (multipart) or pasted text (JSON body)
const uploadResume = async (req, res) => {
  try {
    let rawText;
    let originalFilename = null;
    let sourceType;

    if (req.file) {
      // File was uploaded (multer put it on req.file)
      rawText = await extractTextFromFile(req.file);
      originalFilename = req.file.originalname;
      sourceType = 'file';
    } else if (req.body.resumeText && req.body.resumeText.trim()) {
      // No file — check for pasted text instead
      rawText = req.body.resumeText.trim();
      sourceType = 'pasted';
    } else {
      return res.status(400).json({ message: 'Please upload a file or paste resume text' });
    }

    if (!rawText || rawText.length < 50) {
      return res.status(400).json({ message: 'Could not extract meaningful text from the resume' });
    }

    const resume = await Resume.create({
      userId: req.user._id,
      originalFilename,
      rawText,
      sourceType,
    });

    res.status(201).json(resume);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Failed to upload resume' });
  }
};

// Get the current user's most recent resume
const getResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ userId: req.user._id }).sort({ createdAt: -1 });

    if (!resume) {
      return res.status(404).json({ message: 'No resume found' });
    }

    res.json(resume);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Failed to fetch resume' });
  }
};

module.exports = { uploadResume, getResume };