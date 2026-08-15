const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

/**
 * Generate a JWT token valid for 30 days
 * @param {string} id - The user ID to encode
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // 1. Validate required inputs
  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please enter name, email, and password');
  }

  // 2. Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists with this email');
  }

  // 3. Create the user (password will be hashed via Mongoose pre-save hook)
  // We can assign a random color for avatarColor if we want to make it look nicer
  const colors = ['#6366F1', '#EC4899', '#10B981', '#F59E0B', '#3B82F6', '#8B5CF6'];
  const avatarColor = colors[Math.floor(Math.random() * colors.length)];

  const user = await User.create({
    name,
    email,
    password,
    avatarColor
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatarColor: user.avatarColor,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data provided');
  }
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // 1. Validate required inputs
  if (!email || !password) {
    res.status(400);
    throw new Error('Please enter email and password');
  }

  // 2. Find user by email
  const user = await User.findOne({ email });

  // 3. Verify user exists and compare password
  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatarColor: user.avatarColor,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  // req.user was attached by protect middleware
  res.status(200).json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    avatarColor: req.user.avatarColor,
    createdAt: req.user.createdAt
  });
});

module.exports = {
  registerUser,
  loginUser,
  getMe,
};
