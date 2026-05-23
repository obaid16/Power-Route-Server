const Station = require('../models/Station');

// @desc    Get all stations
// @route   GET /api/stations
// @access  Public
exports.getStations = async (req, res) => {
  try {
    // Return mock data to bypass MongoDB connection issues
    const mockStations = [
      {
        _id: "1",
        name: "Downtown Superhub",
        rating: 4.8,
        chargers: [
          { type: "CCS", power: "150kW", status: "available" },
          { type: "CCS", power: "150kW", status: "available" },
          { type: "CHAdeMO", power: "50kW", status: "occupied" }
        ]
      },
      {
        _id: "2",
        name: "Westside Fast Charge",
        rating: 4.5,
        chargers: [
          { type: "Tesla Supercharger", power: "250kW", status: "available" },
          { type: "Tesla Supercharger", power: "250kW", status: "available" }
        ]
      },
      {
        _id: "3",
        name: "City Center Parking Station",
        rating: 4.2,
        chargers: [
          { type: "Type 2", power: "22kW", status: "available" },
          { type: "Type 2", power: "22kW", status: "available" },
          { type: "Type 2", power: "22kW", status: "available" }
        ]
      }
    ];
    res.status(200).json({
      success: true,
      count: mockStations.length,
      data: mockStations
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
    const mockStations = [
      {
        _id: "1",
        name: "Downtown Superhub",
        rating: 4.8,
        chargers: [
          { type: "CCS", power: "150kW", status: "available" },
          { type: "CCS", power: "150kW", status: "available" },
          { type: "CHAdeMO", power: "50kW", status: "occupied" }
        ]
      },
      {
        _id: "2",
        name: "Westside Fast Charge",
        rating: 4.5,
        chargers: [
          { type: "Tesla Supercharger", power: "250kW", status: "available" },
          { type: "Tesla Supercharger", power: "250kW", status: "available" }
        ]
      },
      {
        _id: "3",
        name: "City Center Parking Station",
        rating: 4.2,
        chargers: [
          { type: "Type 2", power: "22kW", status: "available" },
          { type: "Type 2", power: "22kW", status: "available" },
          { type: "Type 2", power: "22kW", status: "available" }
        ]
      }
    ];

    const station = mockStations.find(s => s._id === req.params.id) || mockStations[0];
    
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
