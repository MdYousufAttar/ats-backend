
import { performAnalysis } from '../services/geminiService.js';

export const runAnalysis = async (req, res, next) => {
  try {
    const { resumeFile, jobDescription } = req.body;

    // Basic validation
    if (!resumeFile || !resumeFile.data || !resumeFile.mimeType) {
      return res.status(400).json({ error: 'Missing or invalid resume file data.' });
    }

    const analysisResult = await performAnalysis(resumeFile, jobDescription);
    
    res.status(200).json(analysisResult);
  } catch (error) {
    console.error('Error in analysis controller:', error);
    res.status(500).json({ error: 'An error occurred during analysis.', details: error.message });
  }
};
