const express = require('express');
const { getBookings, createBooking } = require('../controllers/bookingController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// Require auth for all booking routes
router.use(protect);

router.route('/')
  .get(getBookings)
  .post(createBooking);

module.exports = router;
