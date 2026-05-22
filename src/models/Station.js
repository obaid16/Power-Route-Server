const mongoose = require('mongoose');

const StationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a station name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  location: {
    // GeoJSON Point
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    },
    formattedAddress: String,
    city: String,
    state: String,
  },
  chargers: [
    {
      type: {
        type: String, // e.g., 'DC Fast', 'Level 2'
        required: true
      },
      power: {
        type: String, // e.g., '150kW', '350kW', '22kW'
        required: true
      },
      status: {
        type: String,
        enum: ['available', 'occupied', 'offline', 'maintenance'],
        default: 'available'
      },
      portType: {
        type: String, // e.g., 'CCS1', 'CHAdeMO', 'NACS'
        required: true
      }
    }
  ],
  pricing: {
    ratePerKwh: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  rating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot be more than 5'],
    default: 5
  },
  amenities: [String],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create geospatial index for location searching
StationSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Station', StationSchema);
