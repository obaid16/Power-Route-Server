const { GoogleGenAI } = require('@google/genai');

let ai = null;
const getAI = () => {
  if (!ai && process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return ai;
};

exports.generateChatResponse = async (messages, systemPrompt) => {
  const genAI = getAI();
  if (!genAI) {
    return "This is a mocked AI response because the Gemini API key is missing. Please add GEMINI_API_KEY to your .env file.";
  }

  // Convert OpenAI-style messages to Gemini format
  const formattedMessages = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : m.role,
    parts: [{ text: m.content }]
  }));

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: formattedMessages,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      }
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error.message);
    if (error.message.includes('503') || error.message.includes('high demand')) {
      return "I'm currently experiencing high demand and need a moment. Please try asking again in a few seconds!";
    }
    return "I'm having a little trouble connecting to my brain right now. Please try again!";
  }
};

exports.generateStreamingChatResponse = async (messages, systemPrompt, res) => {
  const genAI = getAI();
  if (!genAI) {
    res.write("This is a mocked streaming AI response. Please add GEMINI_API_KEY.");
    res.end();
    return;
  }

  const formattedMessages = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : m.role,
    parts: [{ text: m.content }]
  }));

  try {
    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: formattedMessages,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      }
    });

    for await (const chunk of responseStream) {
      res.write(chunk.text);
    }
    res.end();
  } catch (error) {
    console.error("Gemini API Stream Error:", error.message);
    if (error.message.includes('503') || error.message.includes('high demand')) {
      res.write("I'm currently experiencing high demand and need a moment. Please try asking again in a few seconds!");
    } else {
      res.write("I'm having a little trouble connecting to my brain right now. Please try again!");
    }
    res.end();
  }
};
