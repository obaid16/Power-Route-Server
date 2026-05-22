const Station = require('../models/Station');

// @desc    Get all stations
// @route   GET /api/stations
// @access  Public
exports.getStations = async (req, res) => {
  try {
    const stations = await Station.find();
    res.status(200).json({
      success: true,
      count: stations.length,
      data: stations
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get single station
// @route   GET /api/stations/:id
// @access  Public
exports.getStation = async (req, res) => {
  try {
    const station = await Station.findById(req.params.id);
    
    if (!station) {
      return res.status(404).json({ success: false, error: 'Station not found' });
    }

    res.status(200).json({
      success: true,
      data: station
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Create new station (Admin only ideally)
// @route   POST /api/stations
// @access  Private
exports.createStation = async (req, res) => {
  try {
    const station = await Station.create(req.body);
    res.status(201).json({
      success: true,
      data: station
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
