const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const config = require('../config/config');
const logger = require('../config/logger');

exports.register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;
    
    // Check if user exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    
    // Create user
    const user = await User.create({ email, password, firstName, lastName, phone });
    
    // Create wallet for user
    await Wallet.create(user.user_id);
    
    logger.info(`New user registered: ${email}`);
    
    res.status(201).json({
      message: 'User registered successfully',
      userId: user.user_id
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Verify password
    const isValidPassword = await User.verifyPassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Update last login
    await User.updateLastLogin(user.user_id);
    
    // Generate JWT
    const token = jwt.sign(
      { 
        userId: user.user_id,
        email: user.email,
        role: user.role
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
    
    logger.info(`User logged in: ${email}`);
    
    res.json({
      token,
      user: {
        userId: user.user_id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Remove password from response
    delete user.password;
    
    res.json(user);
  } catch (error) {
    next(error);
  }
};