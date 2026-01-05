const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: '*' }));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'Mr Bukkan Writer API - Backend is running! ✍️',
    status: 'operational',
    endpoints: {
      health: 'GET /api/health',
      generateContent: 'POST /api/generate-content'
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'running',
    apiConfigured: !!process.env.GOOGLE_API_KEY,
    timestamp: new Date().toISOString()
  });
});

app.post('/api/generate-content', async (req, res) => {
  try {
    const { topic, type } = req.body;
    const apiKey = process.env.GOOGLE_API_KEY;

    if (!topic || !type) {
      return res.status(400).json({ error: 'Topic and type are required' });
    }

    if (!apiKey) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    console.log(`Generating ${type} for topic:`, topic);

    const prompts = {
      article: `You are Mr Bukkan, a professional article writer. Write a comprehensive, well-structured article about "${topic}". 

Requirements:
- Length: 500-800 words
- Include an engaging introduction
- Use clear headings and subheadings
- Provide detailed information with facts and insights
- Include a strong conclusion
- Write in a professional, informative tone
- Make it engaging and easy to read

Only respond with the article itself, properly formatted with line breaks between paragraphs.`,
      
      story: `You are Mr Bukkan, a creative story writer. Write an engaging, imaginative story about "${topic}".

Requirements:
- Length: 600-1000 words
- Include vivid descriptions and character development
- Create an engaging plot with a clear beginning, middle, and end
- Use descriptive language and dialogue where appropriate
- Make it emotionally engaging and memorable
- Write in a narrative, creative tone

Only respond with the story itself, properly formatted with line breaks between paragraphs.`
    };

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    
    const response = await axios.post(url, {
      contents: [{
        parts: [{
          text: prompts[type]
        }]
      }]
    }, { timeout: 60000 });

    const content = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!content) {
      console.log('No content in response');
      return res.status(500).json({ error: 'No content generated' });
    }

    console.log('Content generated successfully');
    res.json({ content });

  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ 
      error: 'Failed to generate content',
      details: error.message
    });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('✅ Server running on port', PORT);
  console.log('✅ API Key configured:', !!process.env.GOOGLE_API_KEY);
});
