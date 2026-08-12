// Builds the prompt to generate the very first interview question for a given role
function buildFirstQuestionPrompt(role, resumeText = null) {
  const resumeContext = resumeText
    ? `\n\nHere is the candidate's resume for context:\n${resumeText}\n\nUse relevant details from their resume (skills, projects, experience) to make the question more targeted and personalized where appropriate, without simply quizzing them on resume trivia.`
    : '';

  return `You are an experienced technical interviewer conducting a mock interview for the role of "${role}".${resumeContext}
Ask exactly ONE interview question suitable for a college student preparing for placements.
The question should be clear, specific, and appropriate for a first question (not too hard, not too easy).

Respond ONLY with a valid JSON object in exactly this format, nothing else before or after:

{
  "question": "the interview question text"
}`;
}

// Builds the prompt to give feedback on an answer AND generate the next question
function buildNextQuestionPrompt(role, previousQuestions, latestAnswer) {
  const history = previousQuestions
    .map((q, i) => `Q${i + 1}: ${q.question}\nAnswer: ${q.answer || '(not answered)'}`)
    .join('\n\n');

  return `You are an experienced technical interviewer conducting a mock interview for the role of "${role}".

Here is the interview so far:
${history}

The candidate's latest answer was: "${latestAnswer}"

First, give brief, constructive feedback (2-3 sentences) on that latest answer.
Then, ask ONE new interview question that has not been asked yet, building naturally on the interview so far.

Respond ONLY with a valid JSON object in exactly this format, nothing else before or after:

{
  "feedback": "brief feedback on the latest answer",
  "nextQuestion": "the next interview question text"
}`;
}

// Builds the prompt for final scoring and summary after all questions are answered
function buildSummaryPrompt(role, allQuestions) {
  const transcript = allQuestions
    .map((q, i) => `Q${i + 1}: ${q.question}\nAnswer: ${q.answer}`)
    .join('\n\n');

  return `You are an experienced technical interviewer who just finished a mock interview for the role of "${role}".

Full interview transcript:
${transcript}

Based on the candidate's answers, provide:
1. An overall score out of 100
2. A brief overall summary (3-4 sentences) of their performance
3. A list of 2-3 weak topics/areas they should practice more, based on their answers

Respond ONLY with a valid JSON object in exactly this format, nothing else before or after:

{
  "score": 75,
  "overallSummary": "brief summary text",
  "weakTopics": ["topic 1", "topic 2"]
}`;
}

module.exports = { buildFirstQuestionPrompt, buildNextQuestionPrompt, buildSummaryPrompt };