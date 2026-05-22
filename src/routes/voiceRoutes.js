const express = require('express');
const multer = require('multer');
const { transcribe, reply, command } = require('../controllers/voiceController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// Setup Multer for temporary audio file storage
const upload = multer({ dest: 'uploads/' });

router.post('/transcribe', upload.single('audio'), transcribe);
router.post('/reply', reply);
router.post('/command', protect, command);

module.exports = router;
