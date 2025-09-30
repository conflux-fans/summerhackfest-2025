const Session = require('../models/Session');
const crypto = require('crypto');

// Generate a 6-digit session code
const generateSessionCode = async (sessionData) => {
  try {
    const { walletAddress, contractAddress, eventName, location, expiresInMinutes } = sessionData;
    
    // Generate 6-digit code
    const sessionCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Calculate expiration time
    const expiresAt = new Date(Date.now() + (expiresInMinutes * 60 * 1000));
    
    // Create session record
    const session = new Session({
      sessionCode,
      walletAddress: walletAddress.toLowerCase(),
      contractAddress: contractAddress.toLowerCase(),
      eventName,
      location,
      expiresAt,
      metadata: {
        generatedAt: new Date(),
        expiresInMinutes
      }
    });
    
    await session.save();
    
    return {
      sessionCode,
      expiresAt,
      sessionId: session._id
    };
  } catch (error) {
    console.error('Session generation error:', error);
    throw error;
  }
};

// Verify session code
const verifySessionCode = async (sessionCode, verifierInfo = {}) => {
  try {
    const session = await Session.findOne({
      sessionCode,
      isUsed: false,
      expiresAt: { $gt: new Date() }
    });
    
    if (!session) {
      return {
        success: false,
        reason: 'Invalid or expired session code'
      };
    }
    
    // Mark session as used
    session.isUsed = true;
    session.usedAt = new Date();
    session.usedBy = verifierInfo.ipAddress || verifierInfo.deviceId || 'Unknown';
    await session.save();
    
    return {
      success: true,
      verification: {
        sessionCode: session.sessionCode,
        eventName: session.eventName,
        location: session.location,
        walletAddress: session.walletAddress,
        contractAddress: session.contractAddress,
        verifiedAt: session.usedAt,
        method: 'session-code'
      }
    };
  } catch (error) {
    console.error('Session verification error:', error);
    throw error;
  }
};

// Get active sessions for a wallet
const getActiveSessions = async (walletAddress) => {
  try {
    return await Session.find({
      walletAddress: walletAddress.toLowerCase(),
      isUsed: false,
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });
  } catch (error) {
    console.error('Get active sessions error:', error);
    throw error;
  }
};

// Get session history for a wallet
const getSessionHistory = async (walletAddress, options = {}) => {
  try {
    const { limit = 20, offset = 0 } = options;
    
    return await Session.find({
      walletAddress: walletAddress.toLowerCase()
    })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(offset);
  } catch (error) {
    console.error('Get session history error:', error);
    throw error;
  }
};

// Clean up expired sessions
const cleanupExpiredSessions = async () => {
  try {
    const result = await Session.deleteMany({
      expiresAt: { $lt: new Date() }
    });
    
    console.log(`Cleaned up ${result.deletedCount} expired sessions`);
    return result.deletedCount;
  } catch (error) {
    console.error('Cleanup expired sessions error:', error);
    throw error;
  }
};

// Get session statistics
const getSessionStats = async (walletAddress) => {
  try {
    const stats = await Session.aggregate([
      { $match: { walletAddress: walletAddress.toLowerCase() } },
      {
        $group: {
          _id: null,
          totalSessions: { $sum: 1 },
          activeSessions: {
            $sum: { $cond: [{ $and: [{ $eq: ['$isUsed', false] }, { $gt: ['$expiresAt', new Date()] }] }, 1, 0] }
          },
          usedSessions: {
            $sum: { $cond: [{ $eq: ['$isUsed', true] }, 1, 0] }
          },
          expiredSessions: {
            $sum: { $cond: [{ $lt: ['$expiresAt', new Date()] }, 1, 0] }
          }
        }
      }
    ]);
    
    return stats[0] || {
      totalSessions: 0,
      activeSessions: 0,
      usedSessions: 0,
      expiredSessions: 0
    };
  } catch (error) {
    console.error('Get session stats error:', error);
    throw error;
  }
};

module.exports = {
  generateSessionCode,
  verifySessionCode,
  getActiveSessions,
  getSessionHistory,
  cleanupExpiredSessions,
  getSessionStats
};
