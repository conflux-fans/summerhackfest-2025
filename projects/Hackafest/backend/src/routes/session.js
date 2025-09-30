const express = require('express');
const { body, validationResult } = require('express-validator');
const { generateSessionCode, verifySessionCode } = require('../services/sessionService');

const router = express.Router();

// Generate session code
router.post('/generate', [
  body('walletAddress').isEthereumAddress().withMessage('Invalid wallet address'),
  body('contractAddress').isEthereumAddress().withMessage('Invalid contract address'),
  body('eventName').isString().withMessage('Event name is required'),
  body('location').isString().withMessage('Location is required'),
  body('expiresInMinutes').optional().isInt({ min: 1, max: 1440 }).withMessage('Expires in minutes must be between 1 and 1440')
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

    const {
      walletAddress,
      contractAddress,
      eventName,
      location,
      expiresInMinutes = 60
    } = req.body;

    const sessionData = await generateSessionCode({
      walletAddress,
      contractAddress,
      eventName,
      location,
      expiresInMinutes
    });

    res.json({
      success: true,
      sessionCode: sessionData.sessionCode,
      expiresAt: sessionData.expiresAt,
      message: 'Session code generated successfully'
    });
  } catch (error) {
    console.error('Session generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate session code'
    });
  }
});

// Verify session code
router.post('/verify', [
  body('sessionCode').isString().isLength({ min: 6, max: 6 }).withMessage('Session code must be 6 digits'),
  body('verifierInfo').optional().isObject()
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

    const { sessionCode, verifierInfo } = req.body;

    const verificationResult = await verifySessionCode(sessionCode, verifierInfo);

    res.json({
      success: verificationResult.success,
      verification: verificationResult.verification,
      message: verificationResult.success 
        ? 'Session code verified successfully' 
        : verificationResult.reason || 'Session code verification failed'
    });
  } catch (error) {
    console.error('Session verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify session code'
    });
  }
});

// Get session info (without marking as used)
router.get('/info/:sessionCode', async (req, res) => {
  try {
    const { sessionCode } = req.params;
    
    const Session = require('../models/Session');
    const session = await Session.findOne({ 
      sessionCode,
      isUsed: false,
      expiresAt: { $gt: new Date() }
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found or expired'
      });
    }

    res.json({
      success: true,
      session: {
        eventName: session.eventName,
        location: session.location,
        expiresAt: session.expiresAt,
        createdAt: session.createdAt
      }
    });
  } catch (error) {
    console.error('Get session info error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get session info'
    });
  }
});

module.exports = router;
