const { PDFParse } = require('pdf-parse');
const mammoth = require('mammoth');

// Extracts raw text from an uploaded file buffer, based on its mimetype
const extractTextFromFile = async (file) => {
  const { buffer, mimetype } = file;

  if (mimetype === 'application/pdf') {
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    await parser.destroy();
    return result.text.trim();
  }

  if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const result = await mammoth.extractRawText({ buffer });
    return result.value.trim();
  }

  throw new Error('Unsupported file type');
};

module.exports = { extractTextFromFile };