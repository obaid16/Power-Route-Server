const axios = require('axios');

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
// Using a default voice ID (e.g., 'Rachel' or similar, you can change this)
const VOICE_ID = '21m00Tcm4TlvDq8ikWAM'; 

exports.generateSpeech = async (text) => {
  if (!ELEVENLABS_API_KEY) {
    console.warn("⚠️ ELEVENLABS_API_KEY is missing. Voice reply will return empty buffer.");
    return Buffer.from('');
  }

  try {
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      {
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      },
      {
        headers: {
          'Accept': 'audio/mpeg',
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json'
        },
        responseType: 'arraybuffer' // We want the audio file as a buffer
      }
    );

    return response.data;
  } catch (error) {
    console.error('ElevenLabs Error:', error.message);
    throw new Error('Failed to generate speech');
  }
};
