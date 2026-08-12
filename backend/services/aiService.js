const fetch = require("node-fetch");
const logger = require("../utils/logger");

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent";

async function callAI(prompt, maxRetries = 1) {
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    if (attempt > 0) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
    try {
      const response = await fetch(
        `${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 1.0,
              maxOutputTokens: 700,
            },
          }),
        },
      );

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Gemini API error: ${response.status} - ${errText}`);
      }

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawText) {
        throw new Error("AI returned empty response");
      }

      return rawText;
    } catch (error) {
      lastError = error;
      logger.warn(`AI call attempt ${attempt + 1} failed: ${error.message}`);
    }
  }

  logger.error(
    `AI call failed after ${maxRetries + 1} attempts: ${lastError.message}`,
  );
  throw new Error(
    "AI service is currently unavailable. Please try again in a moment.",
  );
}

function extractJSON(rawText) {
  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("AI response did not contain valid JSON");
  }
  return JSON.parse(jsonMatch[0]);
}

module.exports = { callAI, extractJSON };
