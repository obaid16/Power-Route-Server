const { generateChatResponse, generateStreamingChatResponse } = require('../services/aiService');

const SYSTEM_PROMPT = `You are Power AI, an advanced AI assistant for the PoweRoute EV Charging Platform. 
Your goal is to help EV drivers find charging stations, understand their battery needs, navigate safely, and provide emergency assistance if needed.
Be concise, helpful, and use a friendly but professional tone. Format responses nicely.`;

// @desc    Chat with AI
// @route   POST /api/ai/chat
// @access  Public (or Private depending on needs)
exports.chat = async (req, res) => {
  try {
    const { messages, stream = false } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ success: false, error: 'Messages array is required' });
    }

    if (stream) {
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Transfer-Encoding', 'chunked');
      await generateStreamingChatResponse(messages, SYSTEM_PROMPT, res);
    } else {
      const responseText = await generateChatResponse(messages, SYSTEM_PROMPT);
      res.status(200).json({
        success: true,
        data: responseText
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get EV Recommendations
// @route   POST /api/ai/recommend
// @access  Private
exports.recommend = async (req, res) => {
  try {
    const { batteryLevel, destination, currentLoc } = req.body;
    const prompt = `User's current battery is ${batteryLevel}%. They are at ${currentLoc} heading to ${destination}. Recommend a charging strategy and nearby stations.`;
    
    const responseText = await generateChatResponse([{ role: 'user', content: prompt }], SYSTEM_PROMPT);
    res.status(200).json({ success: true, data: responseText });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Emergency Help
// @route   POST /api/ai/emergency-help
// @access  Public
exports.emergencyHelp = async (req, res) => {
  try {
    const { issue } = req.body;
    const prompt = `EMERGENCY SOS Triggered: ${issue}. Provide immediate, critical, step-by-step safety instructions for an EV driver. Keep it under 3 sentences.`;
    
    const responseText = await generateChatResponse([{ role: 'user', content: prompt }], "You are an emergency responder AI. Prioritize human safety.");
    res.status(200).json({ success: true, data: responseText });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Route Plan AI
// @route   POST /api/ai/route-plan
// @access  Private
exports.routePlan = async (req, res) => {
  try {
    const { start, end, vehicle } = req.body;
    const prompt = `Plan an EV route from ${start} to ${end} for a ${vehicle}. Include suggested charging stops.`;
    
    const responseText = await generateChatResponse([{ role: 'user', content: prompt }], SYSTEM_PROMPT);
    res.status(200).json({ success: true, data: responseText });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
