import { GoogleGenAI, Type } from '@google/genai';

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    atsScore: { type: Type.NUMBER },
    summary: { type: Type.STRING },
    keywordAnalysis: {
      type: Type.OBJECT,
      properties: {
        matchedKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
        missingKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
    },
    sectionFeedback: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          section: { type: Type.STRING },
          status: { type: Type.STRING, enum: ['Good', 'Needs Improvement', 'Poor'] },
          feedback: { type: Type.STRING },
        },
      },
    },
    overallRecommendations: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
  },
};

export const performAnalysis = async (resumeFile, jobDescription) => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set.");
  }

  const genAI = new GoogleGenAI({
    apiKey: process.env.API_KEY,
  });

  const model = 'gemini-2.5-flash';

  const resumePart = {
    inlineData: {
      mimeType: resumeFile.mimeType,
      data: resumeFile.data,
    },
  };

  const textPart = {
    text: `
      Analyze the attached resume against the following job description.
      Job Description: "${jobDescription || 'No job description provided.'}"
      Provide detailed ATS analysis in JSON format.
    `,
  };

  try {
    const response = await genAI.models.generateContent({
      model,
      contents: { parts: [resumePart, textPart] },
      config: {
        responseMimeType: 'application/json',
        responseSchema,
      },
    });

    return JSON.parse(response.text.trim());
  } catch (error) {
  console.error("FULL GEMINI ERROR:", error);
  console.error("Error response data:", error?.response?.data);
  throw error;  // <-- temporarily throw original error
}
};
