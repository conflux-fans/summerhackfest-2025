const express = require('express');
const { body, validationResult } = require('express-validator');
const { authLimiter } = require('../middleware/rateLimiter');
const { generateNonce, verifySignature } = require('../services/authService');
const { createUser, findUserByWallet } = require('../services/userService');

const router = express.Router();

// Apply rate limiting to all auth routes
router.use(authLimiter);

// Generate nonce for wallet connection
router.post('/nonce', [
  body('walletAddress').isEthereumAddress().withMessage('Invalid wallet address')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { walletAddress } = req.body;
    const nonce = generateNonce();
    
    // Store nonce temporarily (in production, use Redis)
    // For demo, we'll just return it
    res.json({
      success: true,
      nonce,
      message: 'Sign this nonce with your wallet to authenticate'
    });
  } catch (error) {
    console.error('Nonce generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate nonce'
    });
  }
});

// Verify signature and authenticate
router.post('/verify', [
  body('walletAddress').isEthereumAddress().withMessage('Invalid wallet address'),
  body('signature').isString().withMessage('Signature is required'),
  body('nonce').isString().withMessage('Nonce is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { walletAddress, signature, nonce } = req.body;

    // Verify signature
    const isValidSignature = verifySignature(walletAddress, signature, nonce);
    
    if (!isValidSignature) {
      return res.status(401).json({
        success: false,
        error: 'Invalid signature'
      });
    }

    // Find or create user
    let user = await findUserByWallet(walletAddress);
    if (!user) {
      user = await createUser(walletAddress, nonce);
    } else {
      // Update last login
      user.lastLogin = new Date();
      await user.save();
    }

    // Generate JWT token (simplified for demo)
    const token = `demo-token-${Date.now()}-${walletAddress}`;

    res.json({
      success: true,
      token,
      user: {
        walletAddress: user.walletAddress,
        verificationCount: user.verificationCount,
        lastLogin: user.lastLogin
      },
      message: 'Authentication successful'
    });
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication failed'
    });
  }
});

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    // In production, extract user from JWT token
    const { walletAddress } = req.headers;
    
    if (!walletAddress) {
      return res.status(401).json({
        success: false,
        error: 'Wallet address required'
      });
    }

    const user = await findUserByWallet(walletAddress);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        walletAddress: user.walletAddress,
        verificationCount: user.verificationCount,
        lastLogin: user.lastLogin,
        preferences: user.preferences
      }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch profile'
    });
  }
});

module.exports = router;
