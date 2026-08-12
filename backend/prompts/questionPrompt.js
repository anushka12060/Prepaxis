function buildQuestionGenerationPrompt(topic, difficulty) {
  const angles = [
    'a real-world coding scenario or debugging situation',
    'a conceptual explanation with a practical example',
    'a comparison between two related approaches',
    'a "what would happen if..." prediction question',
    'a question about a common mistake or pitfall',
  ];
  const randomAngle = angles[Math.floor(Math.random() * angles.length)];

  return `You are an expert technical interviewer creating practice questions for college students preparing for placements.

Generate ONE practice question on the topic of "${topic}" at "${difficulty}" difficulty level.

Requirements:
- Frame this specific question as: ${randomAngle}.
- Avoid the most commonly-asked, textbook-default question on this topic (e.g. for JavaScript, avoid the overused "== vs ===" question unless the topic specifically demands it).
- Make the question specific and non-generic — imagine dozens of students are practicing this topic simultaneously and each should get something meaningfully different.

Also provide a clear, well-structured ideal answer that a strong candidate would give.

Respond ONLY with a valid JSON object in exactly this format, nothing else before or after:

{
  "question": "the practice question text",
  "idealAnswer": "a clear, complete model answer to the question"
}`;
}

module.exports = { buildQuestionGenerationPrompt };