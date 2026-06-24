const Station = require('../models/Station');

// @desc    Get all stations
// @route   GET /api/stations
// @access  Public
exports.getStations = async (req, res) => {
  try {
    const { lat, lng } = req.query;
    
    // 1. Fetch Real Data from OpenChargeMap API (if key is configured)
    if (lat && lng && process.env.OPENCHARGEMAP_API_KEY) {
      try {
        const url = `https://api.openchargemap.io/v3/poi/?output=json&latitude=${lat}&longitude=${lng}&distance=25&maxresults=15&key=${process.env.OPENCHARGEMAP_API_KEY}`;
        const response = await fetch(url);
        
        if (response.ok) {
          const ocmData = await response.json();
          if (Array.isArray(ocmData) && ocmData.length > 0) {
            const liveStations = ocmData.map(poi => ({
              _id: poi.ID.toString(),
              name: poi.AddressInfo?.Title || "EV Charging Station",
              rating: (Math.random() * (5 - 3.5) + 3.5).toFixed(1), // Mock rating 3.5-5.0
              location: {
                type: "Point",
                coordinates: [poi.AddressInfo?.Longitude || 0, poi.AddressInfo?.Latitude || 0],
                formattedAddress: `${poi.AddressInfo?.AddressLine1 || ''} ${poi.AddressInfo?.Town || ''}`.trim() || "Address not available"
              },
              pricing: { ratePerKwh: 0.45, currency: "USD" }, // Pricing usually isn't standard in OCM
              chargers: poi.Connections?.map(conn => ({
                type: conn.Level?.Title || "Standard",
                power: conn.PowerKW ? `${conn.PowerKW}kW` : "50kW",
                status: poi.StatusType?.IsOperational === false ? "occupied" : "available",
                portType: conn.ConnectionType?.Title || "Standard"
              })) || [ { type: "Standard", power: "50kW", status: "available", portType: "Standard" } ]
            }));
            
            return res.status(200).json({
              success: true,
              count: liveStations.length,
              data: liveStations
            });
          }
        }
      } catch (err) {
        console.error("Failed to fetch from OpenChargeMap, falling back to local DB:", err.message);
      }
    }

    // 2. Fallback to local MongoDB Data
    let stations = await Station.find();
    
    // Seed database if no stations exist
    if (stations.length === 0) {
      const seedStations = [
        {
          name: "Electrify America - Union Square",
          rating: 4.8,
          location: { type: "Point", coordinates: [-122.4194, 37.7749], formattedAddress: "123 Tech Blvd, San Francisco" },
          pricing: { ratePerKwh: 0.45, currency: "USD" },
          chargers: [
            { type: "DC Fast", power: "150kW", status: "available", portType: "CCS1" },
            { type: "DC Fast", power: "150kW", status: "available", portType: "CCS1" },
            { type: "DC Fast", power: "50kW", status: "occupied", portType: "CHAdeMO" }
          ]
        },
        {
          name: "Tesla Supercharger - Market St",
          rating: 4.5,
          location: { type: "Point", coordinates: [-122.4294, 37.7849], formattedAddress: "456 West Ave, San Francisco" },
          pricing: { ratePerKwh: 0.50, currency: "USD" },
          chargers: [
            { type: "DC Fast", power: "250kW", status: "available", portType: "NACS" },
            { type: "DC Fast", power: "250kW", status: "available", portType: "NACS" }
          ]
        },
        {
          name: "ChargePoint - Westfield Mall",
          rating: 4.2,
          location: { type: "Point", coordinates: [-122.4094, 37.7649], formattedAddress: "789 Center St, San Francisco" },
          pricing: { ratePerKwh: 0.30, currency: "USD" },
          chargers: [
            { type: "Level 2", power: "22kW", status: "available", portType: "J1772" },
            { type: "Level 2", power: "22kW", status: "available", portType: "J1772" }
          ]
        }
      ];
      await Station.insertMany(seedStations);
      stations = await Station.find();
    }

    res.status(200).json({
      success: true,
      count: stations.length,
      data: stations
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getStation = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if it's an OpenChargeMap ID (numeric) and we have the API key
    if (!isNaN(id) && process.env.OPENCHARGEMAP_API_KEY) {
      const url = `https://api.openchargemap.io/v3/poi/?output=json&chargepointid=${id}&key=${process.env.OPENCHARGEMAP_API_KEY}`;
      const response = await fetch(url);
      if (response.ok) {
        const ocmData = await response.json();
        if (Array.isArray(ocmData) && ocmData.length > 0) {
          const poi = ocmData[0];
          const station = {
            _id: poi.ID.toString(),
            name: poi.AddressInfo?.Title || "EV Charging Station",
            rating: (Math.random() * (5 - 3.5) + 3.5).toFixed(1), // Mock rating
            location: {
              type: "Point",
              coordinates: [poi.AddressInfo?.Longitude || 0, poi.AddressInfo?.Latitude || 0],
              formattedAddress: `${poi.AddressInfo?.AddressLine1 || ''} ${poi.AddressInfo?.Town || ''}`.trim() || "Address not available"
            },
            pricing: { ratePerKwh: 0.45, currency: "USD" },
            chargers: poi.Connections?.map(conn => ({
              type: conn.Level?.Title || "Standard",
              power: conn.PowerKW ? `${conn.PowerKW}kW` : "50kW",
              status: poi.StatusType?.IsOperational === false ? "occupied" : "available",
              portType: conn.ConnectionType?.Title || "Standard"
            })) || [ { type: "Standard", power: "50kW", status: "available", portType: "Standard" } ]
          };
          return res.status(200).json({ success: true, data: station });
        }
      }
    }

    // Fallback to local MongoDB
    // Make sure it is a valid ObjectId before querying to prevent CastError
    if (id.length === 24) {
      const station = await Station.findById(id);
      if (station) {
        return res.status(200).json({
          success: true,
          data: station
        });
      }
    }

    return res.status(404).json({ success: false, error: 'Station not found' });
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
