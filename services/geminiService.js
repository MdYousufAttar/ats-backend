export const performAnalysis = async (resumeFile, jobDescription) => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set.");
  }

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
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API Error:", data);
      throw new Error("Gemini API failed");
    }

    const text = data.candidates[0].content.parts[0].text;

    return JSON.parse(text);
  } catch (error) {
    console.error("FINAL GEMINI ERROR:", error);
    throw error;
  }
};
