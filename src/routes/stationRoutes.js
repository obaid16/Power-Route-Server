const express = require('express');
const { getStations, getStation, createStation } = require('../controllers/stationController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.route('/')
  .get(getStations)
  .post(protect, createStation);

router.route('/:id')
  .get(getStation);

module.exports = router;
