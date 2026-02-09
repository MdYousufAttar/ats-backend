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
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.API_KEY}`,
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

    const raw = await response.text();

    console.log("RAW GEMINI RESPONSE:", raw);

    if (!response.ok) {
      console.error("Gemini API Error:", raw);
      throw new Error("Gemini API failed");
    }

    let data;
    try {
      data = JSON.parse(raw);
    } catch (err) {
      console.error("Failed to parse Gemini response:", raw);
      throw new Error("Invalid JSON from Gemini");
    }


    const text = data.candidates[0].content.parts[0].text;

    // Extract JSON safely from model output
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      console.error("Invalid JSON response from model:", text);
      throw new Error("Model did not return valid JSON.");
    }

    return JSON.parse(jsonMatch[0]);

  } catch (error) {
    console.error("FINAL GEMINI ERROR:", error);
    throw error;
  }
};
