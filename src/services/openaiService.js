const { OpenAI } = require('openai');

// Initialize OpenAI conditionally so the app doesn't crash if the key is missing
let openai = null;
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith('sk-')) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
} else {
  console.warn("⚠️ OPENAI_API_KEY is missing or invalid. AI endpoints will return mock data.");
}

exports.generateChatResponse = async (messages, systemPrompt) => {
  if (!openai) {
    return "This is a mocked AI response because the OpenAI API key is missing. Please add your key to the .env file.";
  }

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      ...messages
    ],
    temperature: 0.7,
  });

  return completion.choices[0].message.content;
};

exports.generateStreamingChatResponse = async (messages, systemPrompt, res) => {
  if (!openai) {
    res.write("This is a mocked streaming AI response.");
    res.end();
    return;
  }

  const stream = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      ...messages
    ],
    temperature: 0.7,
    stream: true,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || "";
    res.write(content);
  }
  res.end();
};
