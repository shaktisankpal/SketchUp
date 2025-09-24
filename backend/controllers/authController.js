const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Function to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// @desc    Register a new user
// @route   POST /api/v1/auth/register
const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    res.status(400);
    throw new Error("Please enter all fields");
  }

  const userExists = await User.findOne({ $or: [{ email }, { username }] });

  if (userExists) {
    res.status(400);
    throw new Error("User with that email or username already exists");
  }

  const user = await User.create({
    username,
    email,
    password,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

// @desc    Authenticate user & get token
// @route   POST /api/v1/auth/login
const loginUser = asyncHandler(async (req, res) => {
  const { login, password } = req.body; // 'login' can be username or email

  const user = await User.findOne({
    $or: [{ email: login }, { username: login }],
  });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid username or password");
  }
});

module.exports = { registerUser, loginUser };
