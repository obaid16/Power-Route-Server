const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate mock JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d'
  });
};

// @desc    Google Login/Signup
// @route   POST /api/auth/google
// @access  Public
exports.googleLogin = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ success: false, error: 'Token is required' });

    // Mock successful Google login bypass
    const mockUser = {
      _id: "mock_google_id_123",
      name: "Google User",
      email: "googleuser@example.com"
    };

    res.status(200).json({
      success: true,
      token: generateToken(mockUser._id),
      user: {
        id: mockUser._id,
        name: mockUser.name,
        email: mockUser.email
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Register a user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email } = req.body;

    const mockUser = {
      _id: "mock_id_" + Math.random().toString(36).slice(-8),
      name: name || "New User",
      email: email || "user@example.com"
    };

    res.status(201).json({
      success: true,
      token: generateToken(mockUser._id),
      user: {
        id: mockUser._id,
        name: mockUser.name,
        email: mockUser.email
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email } = req.body;

    const mockUser = {
      _id: "mock_id_456",
      name: "Mock User",
      email: email || "user@example.com"
    };

    res.status(200).json({
      success: true,
      token: generateToken(mockUser._id),
      user: {
        id: mockUser._id,
        name: mockUser.name,
        email: mockUser.email
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        _id: req.user ? req.user.id : "mock_id_123",
        name: "Mock User",
        email: "user@example.com"
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
