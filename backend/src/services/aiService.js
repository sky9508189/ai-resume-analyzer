const OpenAI = require("openai");

let deepseek;

const getClient = () => {
  if (!deepseek) {
    deepseek = new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseURL: "https://api.deepseek.com",
    });
  }
  return deepseek;
};

const analyzeResume = async (resumeText) => {
  const prompt = `You are an expert resume analyzer and career coach. Analyze the following resume and provide a detailed assessment.

Resume content:
${resumeText}

Provide your analysis in the following JSON format (no markdown, pure JSON):
{
  "overallScore": <number 0-100>,
  "summary": "<2-3 sentence summary of the resume>",
  "sections": [
    { "name": "Contact Information", "score": <0-100>, "feedback": "<feedback>" },
    { "name": "Professional Summary", "score": <0-100>, "feedback": "<feedback>" },
    { "name": "Work Experience", "score": <0-100>, "feedback": "<feedback>" },
    { "name": "Education", "score": <0-100>, "feedback": "<feedback>" },
    { "name": "Skills", "score": <0-100>, "feedback": "<feedback>" }
  ],
  "strengths": ["<strength1>", "<strength2>", "<strength3>"],
  "weaknesses": ["<weakness1>", "<weakness2>", "<weakness3>"],
  "suggestions": ["<suggestion1>", "<suggestion2>", "<suggestion3>", "<suggestion4>", "<suggestion5>"],
  "atsScore": <number 0-100>,
  "keywordAnalysis": [
    { "keyword": "<keyword>", "found": true/false, "category": "<technical/skill/education>" }
  ],
  "missingKeywords": ["<keyword1>", "<keyword2>"],
  "formattingScore": <number 0-100>
}

Be thorough and constructive. For ATS scoring, consider keyword density, formatting, and relevant industry terms. Include at least 10 keywords in keywordAnalysis.

IMPORTANT: Respond with ONLY the JSON object, no other text.`;

  const response = await getClient().chat.completions.create({
    model: "deepseek-chat",
    messages: [
      {
        role: "system",
        content: "You are an expert ATS resume analyzer. Respond with valid JSON only, no markdown formatting, no code blocks.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.3,
  });

  const content = response.choices[0]?.message?.content;

  if (!content) {
    throw new Error("Failed to get analysis from AI");
  }

  const cleaned = content.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();

  return JSON.parse(cleaned);
};

module.exports = { analyzeResume };
