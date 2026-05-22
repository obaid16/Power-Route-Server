const googleTTS = require('google-tts-api');

exports.generateSpeech = async (text) => {
  try {
    // google-tts-api has a 200 char limit per request, so we use getAllAudioBase64
    // which automatically splits long text into chunks and fetches them all
    const results = await googleTTS.getAllAudioBase64(text, {
      lang: 'en',
      slow: false,
      host: 'https://translate.google.com',
    });

    // Concatenate all the base64 chunks back into a single Buffer
    const buffers = results.map(res => Buffer.from(res.base64, 'base64'));
    return Buffer.concat(buffers);
  } catch (error) {
    console.error("Google TTS Error:", error);
    throw new Error("Failed to generate voice audio");
  }
};
