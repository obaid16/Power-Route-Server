const { OpenAI } = require('openai');
const fs = require('fs');
const { generateChatResponse } = require('../services/openaiService');
const { generateSpeech } = require('../services/elevenLabsService');

let openai = null;
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith('sk-')) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

// @desc    Transcribe Voice
// @route   POST /api/voice/transcribe
// @access  Public
exports.transcribe = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No audio file uploaded' });
    }

    if (!openai) {
      return res.status(200).json({ success: true, data: "Mocked transcription because OpenAI key is missing." });
    }

    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(req.file.path),
      model: "whisper-1",
    });

    // Cleanup temp file
    fs.unlinkSync(req.file.path);

    res.status(200).json({ success: true, data: transcription.text });
  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Generate Voice Reply (TTS)
// @route   POST /api/voice/reply
// @access  Public
exports.reply = async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ success: false, error: 'Text is required' });
    }

    const audioBuffer = await generateSpeech(text);

    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': audioBuffer.length
    });
    
    res.send(audioBuffer);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Process Voice Command
// @route   POST /api/voice/command
// @access  Private
exports.command = async (req, res) => {
  try {
    const { commandText } = req.body;
    
    // Use AI to extract structured intent from voice command
    const systemPrompt = `You are an intent parser for an EV app. 
    User command: "${commandText}"
    Extract the intent. Available intents: FIND_CHARGERS, BOOK_SLOT, EMERGENCY_SOS, NAVIGATION, OPEN_PROFILE, TRACK_BOOKING.
    Return ONLY JSON format: { "intent": "INTENT_NAME", "parameters": {} }`;

    const responseText = await generateChatResponse([], systemPrompt);
    
    let parsedData = { intent: "UNKNOWN" };
    try {
      parsedData = JSON.parse(responseText);
    } catch(e) {
      // Handle parsing failure from AI
    }

    res.status(200).json({ success: true, data: parsedData });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
