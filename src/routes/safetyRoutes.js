const express = require('express');
const router = express.Router();
const safetyController = require('../controllers/safetyController');

router.get('/nearby-places', safetyController.getNearbySafePlaces);

module.exports = router;
