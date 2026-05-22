const express = require('express');
const { chat, recommend, emergencyHelp, routePlan } = require('../controllers/aiController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/chat', chat); // Can be public for basic use
router.post('/recommend', protect, recommend);
router.post('/emergency-help', emergencyHelp);
router.post('/route-plan', protect, routePlan);

module.exports = router;
