const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { verifySignature, generateVerificationMessage, isValidAddress } = require('../utils/crypto');
const { createRateLimiter } = require('../middleware/rateLimiter');

// Rate limiting for auth endpoints
const authLimiter = createRateLimiter('strict');

// JWT secret from environment
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Request authentication challenge message
 */
router.post('/challenge', authLimiter, async (req, res) => {
  try {
    const { walletAddress, action = 'login' } = req.body;
    
    if (!walletAddress || !isValidAddress(walletAddress)) {
      return res.status(400).json({
        error: 'Invalid wallet address',
        message: 'Please provide a valid wallet address'
      });
    }
    
    // Generate challenge message
    const timestamp = Date.now();
    const message = generateVerificationMessage(action, null, timestamp);
    
    res.json({
      success: true,
      message,
      timestamp,
      walletAddress: walletAddress.toLowerCase(),
      action
    });
    
  } catch (error) {
    console.error('Challenge generation error:', error);
    res.status(500).json({
      error: 'Failed to generate challenge',
      message: error.message
    });
  }
});

/**
 * Verify signature and issue JWT token
 */
router.post('/verify', authLimiter, async (req, res) => {
  try {
    const { walletAddress, signature, message, action = 'login' } = req.body;
    
    if (!walletAddress || !signature || !message) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'walletAddress, signature, and message are required'
      });
    }
    
    if (!isValidAddress(walletAddress)) {
      return res.status(400).json({
        error: 'Invalid wallet address',
        message: 'Please provide a valid wallet address'
      });
    }
    
    // Verify the signature
    const isValidSignature = await verifySignature(message, signature, walletAddress);
    
    if (!isValidSignature) {
      return res.status(403).json({
        error: 'Invalid signature',
        message: 'Signature verification failed'
      });
    }
    
    // Check message timestamp (prevent replay attacks)
    const messageMatch = message.match(/Timestamp: (\d+)/);
    if (messageMatch) {
      const messageTimestamp = parseInt(messageMatch[1]);
      const currentTime = Date.now();
      const timeDiff = currentTime - messageTimestamp;
      
      // Message should not be older than 10 minutes
      if (timeDiff > 10 * 60 * 1000) {
        return res.status(400).json({
          error: 'Signature expired',
          message: 'Please request a new challenge message'
        });
      }
    }
    
    // Generate JWT token
    const payload = {
      walletAddress: walletAddress.toLowerCase(),
      action,
      iat: Math.floor(Date.now() / 1000)
    };
    
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    
    // Calculate expiry time
    const decoded = jwt.decode(token);
    const expiresAt = new Date(decoded.exp * 1000);
    
    res.json({
      success: true,
      token,
      walletAddress: walletAddress.toLowerCase(),
      expiresAt,
      action
    });
    
  } catch (error) {
    console.error('Auth verification error:', error);
    res.status(500).json({
      error: 'Authentication failed',
      message: error.message
    });
  }
});

/**
 * Verify JWT token middleware
 */
const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Missing or invalid authorization header',
        message: 'Please provide a valid JWT token'
      });
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Add wallet address to request object
    req.walletAddress = decoded.walletAddress;
    req.tokenPayload = decoded;
    
    next();
    
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expired',
        message: 'Please authenticate again'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'Please provide a valid JWT token'
      });
    }
    
    console.error('Token verification error:', error);
    res.status(500).json({
      error: 'Authentication error',
      message: error.message
    });
  }
};

/**
 * Refresh JWT token
 */
router.post('/refresh', verifyToken, async (req, res) => {
  try {
    const { walletAddress, action } = req.tokenPayload;
    
    // Generate new token
    const payload = {
      walletAddress,
      action: action || 'login',
      iat: Math.floor(Date.now() / 1000)
    };
    
    const newToken = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    
    const decoded = jwt.decode(newToken);
    const expiresAt = new Date(decoded.exp * 1000);
    
    res.json({
      success: true,
      token: newToken,
      walletAddress,
      expiresAt
    });
    
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      error: 'Failed to refresh token',
      message: error.message
    });
  }
});

/**
 * Logout (invalidate token - client-side implementation)
 */
router.post('/logout', verifyToken, async (req, res) => {
  try {
    // In a production app, you might want to blacklist the token
    // For now, we'll just confirm the logout
    res.json({
      success: true,
      message: 'Successfully logged out'
    });
    
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Logout failed',
      message: error.message
    });
  }
});

/**
 * Get current user info (protected route example)
 */
router.get('/me', verifyToken, async (req, res) => {
  try {
    const { walletAddress, action, iat } = req.tokenPayload;
    
    res.json({
      success: true,
      user: {
        walletAddress,
        action,
        authenticatedAt: new Date(iat * 1000),
        tokenIssuedAt: new Date(iat * 1000)
      }
    });
    
  } catch (error) {
    console.error('Get user info error:', error);
    res.status(500).json({
      error: 'Failed to get user info',
      message: error.message
    });
  }
});

/**
 * Validate token endpoint (for client-side checks)
 */
router.post('/validate', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        error: 'Missing token',
        message: 'Please provide a token to validate'
      });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    
    res.json({
      success: true,
      valid: true,
      walletAddress: decoded.walletAddress,
      expiresAt: new Date(decoded.exp * 1000),
      issuedAt: new Date(decoded.iat * 1000)
    });
    
  } catch (error) {
    if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
      return res.json({
        success: true,
        valid: false,
        error: error.message
      });
    }
    
    console.error('Token validation error:', error);
    res.status(500).json({
      error: 'Validation failed',
      message: error.message
    });
  }
});

// Export the verifyToken middleware for use in other routes
module.exports = router;
module.exports.verifyToken = verifyToken;