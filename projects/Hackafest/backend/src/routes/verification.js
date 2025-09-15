const express = require('express');
const { body, validationResult } = require('express-validator');
const { verificationLimiter } = require('../middleware/rateLimiter');
const { verifyNFTOwnership, createVerification } = require('../services/verificationService');
const { findUserByWallet } = require('../services/userService');

const router = express.Router();

// Apply rate limiting to verification routes
router.use(verificationLimiter);

// Verify NFT ownership
router.post('/verify', [
  body('walletAddress').isEthereumAddress().withMessage('Invalid wallet address'),
  body('contractAddress').isEthereumAddress().withMessage('Invalid contract address'),
  body('tokenId').isString().withMessage('Token ID is required'),
  body('eventName').optional().isString(),
  body('location').optional().isString(),
  body('verificationMethod').isIn(['signature', 'session-code', 'qr-code', 'nfc']).withMessage('Invalid verification method'),
  body('signature').optional().isString(),
  body('sessionCode').optional().isString(),
  body('qrCodeData').optional().isString()
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
      tokenId,
      eventName = 'NFT Ownership Verification',
      location = 'Online Verification',
      verificationMethod,
      signature,
      sessionCode,
      qrCodeData,
      deviceInfo,
      ipAddress
    } = req.body;

    // Find user
    const user = await findUserByWallet(walletAddress);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Verify NFT ownership
    const verificationResult = await verifyNFTOwnership(
      walletAddress,
      contractAddress,
      tokenId,
      verificationMethod,
      { signature, sessionCode, qrCodeData }
    );

    // Create verification record
    const verification = await createVerification({
      user: user._id,
      walletAddress,
      contractAddress,
      tokenId,
      eventName,
      location,
      verificationMethod,
      result: verificationResult.success ? 'success' : 'failed',
      reason: verificationResult.reason,
      signature,
      sessionCode,
      qrCodeData,
      deviceInfo,
      ipAddress: ipAddress || req.ip,
      metadata: verificationResult.metadata || {}
    });

    // Update user verification count
    if (verificationResult.success) {
      user.verificationCount += 1;
      await user.save();
    }

    res.json({
      success: verificationResult.success,
      verification: {
        id: verification._id,
        result: verification.result,
        tokenId: verification.tokenId,
        eventName: verification.eventName,
        location: verification.location,
        method: verification.verificationMethod,
        timestamp: verification.createdAt,
        reason: verification.reason
      },
      message: verificationResult.success 
        ? 'Verification successful' 
        : verificationResult.reason || 'Verification failed'
    });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Verification failed'
    });
  }
});

// Get verification history
router.get('/history', async (req, res) => {
  try {
    const { walletAddress, limit = 10, offset = 0 } = req.query;
    
    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        error: 'Wallet address is required'
      });
    }

    const user = await findUserByWallet(walletAddress);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const Verification = require('../models/Verification');
    const verifications = await Verification.find({ walletAddress })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .select('-signature -qrCodeData -metadata');

    res.json({
      success: true,
      verifications,
      total: verifications.length
    });
  } catch (error) {
    console.error('History fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch verification history'
    });
  }
});

// Get verification statistics
router.get('/stats', async (req, res) => {
  try {
    const { walletAddress } = req.query;
    
    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        error: 'Wallet address is required'
      });
    }

    const Verification = require('../models/Verification');
    const stats = await Verification.aggregate([
      { $match: { walletAddress } },
      {
        $group: {
          _id: null,
          totalVerifications: { $sum: 1 },
          successfulVerifications: {
            $sum: { $cond: [{ $eq: ['$result', 'success'] }, 1, 0] }
          },
          failedVerifications: {
            $sum: { $cond: [{ $eq: ['$result', 'failed'] }, 1, 0] }
          },
          uniqueContracts: { $addToSet: '$contractAddress' },
          uniqueEvents: { $addToSet: '$eventName' }
        }
      },
      {
        $project: {
          totalVerifications: 1,
          successfulVerifications: 1,
          failedVerifications: 1,
          uniqueContractCount: { $size: '$uniqueContracts' },
          uniqueEventCount: { $size: '$uniqueEvents' },
          successRate: {
            $multiply: [
              { $divide: ['$successfulVerifications', '$totalVerifications'] },
              100
            ]
          }
        }
      }
    ]);

    res.json({
      success: true,
      stats: stats[0] || {
        totalVerifications: 0,
        successfulVerifications: 0,
        failedVerifications: 0,
        uniqueContractCount: 0,
        uniqueEventCount: 0,
        successRate: 0
      }
    });
  } catch (error) {
    console.error('Stats fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch verification statistics'
    });
  }
});

module.exports = router;
