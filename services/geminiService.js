import { GoogleGenAI } from "@google/genai";

export const performAnalysis = async (resumeFile, jobDescription) => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set.");
  }

  const genAI = new GoogleGenAI({
    apiKey: process.env.API_KEY,
  });

  const model = "gemini-1.5-flash"; // ✅ supported

  // Convert resume to text (IMPORTANT)
  const resumeText = Buffer.from(resumeFile.data, "base64").toString("utf-8");

  const prompt = `
You are an ATS resume analyzer.

Resume:
${resumeText}

Job Description:
${jobDescription || "Not provided"}

Return STRICT JSON with:
{
  "atsScore": number,
  "summary": string,
  "matchedKeywords": string[],
  "missingKeywords": string[],
  "recommendations": string[]
}
`;

  try {
    const response = await genAI.models.generateContent({
      model,
      contents: [{ text: prompt }],
    });

    const text = response.text;

    return JSON.parse(text);
  } catch (error) {
    console.error("GEMINI CLOUD ERROR:", error);
    throw error;
  }
};
