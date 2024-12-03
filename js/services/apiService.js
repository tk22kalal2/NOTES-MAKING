import { API_KEYS, API_ENDPOINTS } from '../utils/apiConfig.js';

export async function callVisionAPI(imageContent) {
  const response = await fetch(`${API_ENDPOINTS.VISION}?key=${API_KEYS.VISION_API}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      requests: [{ 
        image: { content: imageContent }, 
        features: [{ type: "TEXT_DETECTION" }] 
      }]
    })
  });
  
  if (!response.ok) {
    throw new Error(`Vision API error: ${response.statusText}`);
  }
  
  return response.json();
}

export async function callGeminiAPI(text) {
  const response = await fetch(`${API_ENDPOINTS.GEMINI}?key=${API_KEYS.GEMINI_API}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: `Summarize the following text into concise, well-structured notes:\n${text}`
        }]
      }]
    })
  });
  
  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.statusText}`);
  }
  
  const data = await response.json();
  if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
    throw new Error('Invalid response from Gemini API');
  }
  
  return data.candidates[0].content.parts[0].text;
}