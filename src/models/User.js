const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false // Don't return password by default
  },
  phone: {
    type: String,
  },
  city: {
    type: String,
  },
  state: {
    type: String,
  },
  emergencyContact: {
    name: String,
    phone: String,
  },
  evDetails: {
    brand: String,
    model: String,
    portType: {
      type: String,
      enum: ['ccs1', 'ccs2', 'chademo', 'tesla', 'type2', ''],
      default: ''
    },
    preferredSpeed: {
      type: String,
      enum: ['fast', 'level2', ''],
      default: ''
    }
  },
  preferences: {
    voiceFeedback: {
      type: Boolean,
      default: true
    },
    wakeWord: {
      type: Boolean,
      default: false
    },
    distanceUnit: {
      type: String,
      enum: ['km', 'mi'],
      default: 'km'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
