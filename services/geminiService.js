import { GoogleGenAI } from "@google/genai";

export const performAnalysis = async (resumeFile, jobDescription) => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set.");
  }

  const genAI = new GoogleGenAI({
    apiKey: process.env.API_KEY,
  });

  // Convert base64 to readable text
  const resumeText = Buffer.from(resumeFile.data, "base64").toString("utf-8");

  const prompt = `
You are an ATS resume analyzer.

Resume:
${resumeText}

Job Description:
${jobDescription || "Not provided"}

Return STRICT JSON:
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
      model: "gemini-1.5-flash",
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
    });

    const text = response.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error("No response text from Gemini.");
    }

    // Extract JSON from model output
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error("Model did not return valid JSON.");
    }

    return JSON.parse(jsonMatch[0]);

  } catch (error) {
    console.error("GEMINI ERROR:", error);
    throw error;
  }
};
