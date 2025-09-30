const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const Verification = require('../models/Verification');
const Collection = require('../models/Collection');
const Device = require('../models/Device');
const { verifySignature, verifyNFTOwnership } = require('../utils/crypto');
const { rateLimiter } = require('../middleware/rateLimiter');
const NodeCache = require('node-cache');

// Cache for session codes (10 minute TTL)
const sessionCache = new NodeCache({ stdTTL: 600 });

// Generate verification session code
router.post('/generate-session', rateLimiter, async (req, res) => {
  try {
    const { contractAddress, organizerId, eventName, location, expiryMinutes } = req.body;
    
    if (!contractAddress || !organizerId) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'contractAddress and organizerId are required'
      });
    }
    
    // Verify collection exists and organizer owns it
    const collection = await Collection.findOne({ contractAddress: contractAddress.toLowerCase() });
    if (!collection) {
      return res.status(404).json({
        error: 'Collection not found',
        message: 'The specified collection does not exist'
      });
    }
    
    if (collection.creator.toLowerCase() !== organizerId.toLowerCase()) {
      return res.status(403).json({
        error: 'Unauthorized',
        message: 'Only the collection creator can generate session codes'
      });
    }
    
    // Generate 6-digit session code
    const sessionCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + (expiryMinutes || 60) * 60 * 1000);
    
    // Store session in cache
    const sessionData = {
      contractAddress: contractAddress.toLowerCase(),
      organizerId: organizerId.toLowerCase(),
      eventName: eventName || collection.name,
      location: location || '',
      createdAt: new Date(),
      expiresAt,
      verificationCount: 0
    };
    
    sessionCache.set(sessionCode, sessionData);
    
    res.json({
      success: true,
      sessionCode,
      expiresAt,
      collectionName: collection.name,
      eventName: sessionData.eventName
    });
    
  } catch (error) {
    console.error('Generate session error:', error);
    res.status(500).json({
      error: 'Failed to generate session',
      message: error.message
    });
  }
});

// Verify ownership with signature
router.post('/verify-signature', rateLimiter, async (req, res) => {
  try {
    const { 
      walletAddress, 
      contractAddress, 
      signature, 
      message, 
      deviceId,
      sessionCode 
    } = req.body;
    
    if (!walletAddress || !contractAddress || !signature || !message) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'walletAddress, contractAddress, signature, and message are required'
      });
    }
    
    // Verify signature
    const isValidSignature = await verifySignature(message, signature, walletAddress);
    if (!isValidSignature) {
      return res.status(403).json({
        error: 'Invalid signature',
        message: 'Signature verification failed'
      });
    }
    
    // Get collection info
    const collection = await Collection.findOne({ contractAddress: contractAddress.toLowerCase() });
    if (!collection) {
      return res.status(404).json({
        error: 'Collection not found',
        message: 'The specified collection does not exist'
      });
    }
    
    if (!collection.isActive) {
      return res.status(400).json({
        error: 'Collection inactive',
        message: 'This collection is not currently active'
      });
    }
    
    // Verify NFT ownership on-chain
    const ownershipResult = await verifyNFTOwnership(
      contractAddress, 
      walletAddress, 
      collection.accessRule
    );
    
    let verificationResult;
    let reason = null;
    
    if (!ownershipResult.success) {
      verificationResult = 'failed';
      reason = ownershipResult.reason || 'NFT ownership verification failed';
    } else {
      verificationResult = 'success';
    }
    
    // Get session data if provided
    let sessionData = null;
    if (sessionCode) {
      sessionData = sessionCache.get(sessionCode);
      if (sessionData) {
        sessionData.verificationCount += 1;
        sessionCache.set(sessionCode, sessionData);
      }
    }
    
    // Update device if provided
    if (deviceId) {
      const device = await Device.findOne({ deviceId, isActive: true });
      if (device && device.walletAddress.toLowerCase() === walletAddress.toLowerCase()) {
        await device.updateLastUsed();
      }
    }
    
    // Create verification record
    const verification = await Verification.createVerification({
      walletAddress: walletAddress.toLowerCase(),
      contractAddress: contractAddress.toLowerCase(),
      verificationMethod: deviceId ? 'mobile-app' : 'signature',
      signature,
      message,
      result: verificationResult,
      reason,
      sessionCode,
      deviceId,
      tokenIds: ownershipResult.tokenIds || [],
      tokenTraits: ownershipResult.tokenTraits || [],
      accessRuleApplied: collection.accessRule,
      organizerId: collection.creator,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      metadata: {
        eventName: sessionData?.eventName || collection.name,
        location: sessionData?.location || ''
      }
    });
    
    // Update collection stats
    if (verificationResult === 'success') {
      await Collection.findByIdAndUpdate(collection._id, {
        $inc: { totalVerifications: 1 }
      });
    }
    
    res.json({
      success: verificationResult === 'success',
      verificationId: verification.verificationId,
      result: verificationResult,
      reason,
      walletAddress: walletAddress.toLowerCase(),
      contractAddress: contractAddress.toLowerCase(),
      collectionName: collection.name,
      timestamp: verification.verifiedAt,
      tokenInfo: ownershipResult.success ? {
        tokenIds: ownershipResult.tokenIds,
        balance: ownershipResult.balance
      } : null
    });
    
  } catch (error) {
    console.error('Verify signature error:', error);
    res.status(500).json({
      error: 'Verification failed',
      message: error.message
    });
  }
});

// Verify with session code
router.post('/verify-session', rateLimiter, async (req, res) => {
  try {
    const { sessionCode, walletAddress, signature, message, deviceId } = req.body;
    
    if (!sessionCode || !walletAddress || !signature || !message) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'sessionCode, walletAddress, signature, and message are required'
      });
    }
    
    // Get session data
    const sessionData = sessionCache.get(sessionCode);
    if (!sessionData) {
      return res.status(404).json({
        error: 'Invalid or expired session code',
        message: 'Please ask the organizer for a new session code'
      });
    }
    
    // Check if session has expired
    if (new Date() > sessionData.expiresAt) {
      sessionCache.del(sessionCode);
      return res.status(400).json({
        error: 'Session expired',
        message: 'This session code has expired'
      });
    }
    
    // Forward to signature verification with session context
    req.body.contractAddress = sessionData.contractAddress;
    
    // Call the signature verification logic
    const verifyResult = await router.handle({ 
      ...req, 
      url: '/verify-signature',
      method: 'POST'
    }, res);
    
  } catch (error) {
    console.error('Verify session error:', error);
    res.status(500).json({
      error: 'Session verification failed',
      message: error.message
    });
  }
});

// Get active sessions for organizer
router.get('/sessions/:organizerId', async (req, res) => {
  try {
    const { organizerId } = req.params;
    
    const activeSessions = [];
    const allKeys = sessionCache.keys();
    
    for (const sessionCode of allKeys) {
      const sessionData = sessionCache.get(sessionCode);
      if (sessionData && sessionData.organizerId.toLowerCase() === organizerId.toLowerCase()) {
        activeSessions.push({
          sessionCode,
          ...sessionData
        });
      }
    }
    
    res.json({
      success: true,
      sessions: activeSessions,
      count: activeSessions.length
    });
    
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({
      error: 'Failed to get sessions',
      message: error.message
    });
  }
});

// Revoke session
router.delete('/sessions/:sessionCode', async (req, res) => {
  try {
    const { sessionCode } = req.params;
    const { organizerId } = req.body;
    
    const sessionData = sessionCache.get(sessionCode);
    if (!sessionData) {
      return res.status(404).json({
        error: 'Session not found',
        message: 'Session not found or already expired'
      });
    }
    
    if (sessionData.organizerId.toLowerCase() !== organizerId.toLowerCase()) {
      return res.status(403).json({
        error: 'Unauthorized',
        message: 'You can only revoke your own sessions'
      });
    }
    
    sessionCache.del(sessionCode);
    
    res.json({
      success: true,
      message: 'Session successfully revoked'
    });
    
  } catch (error) {
    console.error('Revoke session error:', error);
    res.status(500).json({
      error: 'Failed to revoke session',
      message: error.message
    });
  }
});

// Get verification history
router.get('/history/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    
    const verifications = await Verification.find({ 
      walletAddress: walletAddress.toLowerCase() 
    })
    .sort({ verifiedAt: -1 })
    .limit(parseInt(limit))
    .skip(parseInt(offset))
    .populate('contractAddress', 'name symbol category');
    
    const total = await Verification.countDocuments({ 
      walletAddress: walletAddress.toLowerCase() 
    });
    
    res.json({
      success: true,
      verifications: verifications.map(v => ({
        verificationId: v.verificationId,
        result: v.result,
        reason: v.reason,
        contractAddress: v.contractAddress,
        verificationMethod: v.verificationMethod,
        verifiedAt: v.verifiedAt,
        metadata: v.metadata
      })),
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: (parseInt(offset) + parseInt(limit)) < total
      }
    });
    
  } catch (error) {
    console.error('Get verification history error:', error);
    res.status(500).json({
      error: 'Failed to get verification history',
      message: error.message
    });
  }
});

// Get collection verification stats
router.get('/stats/:contractAddress', async (req, res) => {
  try {
    const { contractAddress } = req.params;
    const { days = 30 } = req.query;
    
    const [stats, failureReasons] = await Promise.all([
      Verification.getCollectionStats(contractAddress, parseInt(days)),
      Verification.getFailureReasons(contractAddress, parseInt(days))
    ]);
    
    // Calculate totals
    const totals = stats.reduce((acc, day) => ({
      total: acc.total + day.total,
      success: acc.success + day.success,
      failed: acc.failed + day.failed
    }), { total: 0, success: 0, failed: 0 });
    
    const successRate = totals.total > 0 ? (totals.success / totals.total * 100).toFixed(2) : 0;
    
    res.json({
      success: true,
      stats: {
        dailyStats: stats,
        totals: {
          ...totals,
          successRate: parseFloat(successRate)
        },
        failureReasons
      },
      period: `${days} days`
    });
    
  } catch (error) {
    console.error('Get verification stats error:', error);
    res.status(500).json({
      error: 'Failed to get verification stats',
      message: error.message
    });
  }
});

module.exports = router;