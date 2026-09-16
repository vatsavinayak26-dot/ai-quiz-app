const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.post('/api/generate-quiz', async (req, res) => {
  const { notes, count = 5, difficulty = 'medium' } = req.body;

  const prompt = `You are an expert quiz generator. Based on the notes below, generate exactly ${count} multiple-choice questions at ${difficulty} difficulty level.
Return ONLY a valid JSON array of objects with no markdown backticks, no code fence, and no extra text.
Format:
[
  {
    "id": 1,
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 0,
    "explanation": "Brief explanation of why this option is correct."
  }
]

Study Notes:
${notes}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    let rawText = response.text.trim();
    rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

    const parsedQuiz = JSON.parse(rawText);
    res.json({ success: true, quiz: parsedQuiz });
  } catch (error) {
    console.error('Quiz Error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate quiz.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));