const User = require('../models/User');
const crypto = require('crypto');

// Create a new user
const createUser = async (walletAddress, nonce) => {
  try {
    const user = new User({
      walletAddress: walletAddress.toLowerCase(),
      nonce,
      metadata: {
        deviceInfo: 'Unknown',
        ipAddress: 'Unknown',
        userAgent: 'Unknown'
      }
    });
    
    await user.save();
    return user;
  } catch (error) {
    console.error('User creation error:', error);
    throw error;
  }
};

// Find user by wallet address
const findUserByWallet = async (walletAddress) => {
  try {
    return await User.findOne({ 
      walletAddress: walletAddress.toLowerCase() 
    });
  } catch (error) {
    console.error('Find user error:', error);
    throw error;
  }
};

// Update user preferences
const updateUserPreferences = async (walletAddress, preferences) => {
  try {
    const user = await findUserByWallet(walletAddress);
    if (!user) {
      throw new Error('User not found');
    }

    user.preferences = { ...user.preferences, ...preferences };
    await user.save();
    
    return user;
  } catch (error) {
    console.error('Update user preferences error:', error);
    throw error;
  }
};

// Update user metadata
const updateUserMetadata = async (walletAddress, metadata) => {
  try {
    const user = await findUserByWallet(walletAddress);
    if (!user) {
      throw new Error('User not found');
    }

    user.metadata = { ...user.metadata, ...metadata };
    await user.save();
    
    return user;
  } catch (error) {
    console.error('Update user metadata error:', error);
    throw error;
  }
};

// Get user statistics
const getUserStats = async (walletAddress) => {
  try {
    const user = await findUserByWallet(walletAddress);
    if (!user) {
      throw new Error('User not found');
    }

    const Verification = require('../models/Verification');
    const verificationStats = await Verification.aggregate([
      { $match: { walletAddress: walletAddress.toLowerCase() } },
      {
        $group: {
          _id: null,
          totalVerifications: { $sum: 1 },
          successfulVerifications: {
            $sum: { $cond: [{ $eq: ['$result', 'success'] }, 1, 0] }
          },
          uniqueContracts: { $addToSet: '$contractAddress' },
          uniqueEvents: { $addToSet: '$eventName' }
        }
      }
    ]);

    const stats = verificationStats[0] || {
      totalVerifications: 0,
      successfulVerifications: 0,
      uniqueContracts: [],
      uniqueEvents: []
    };

    return {
      user: {
        walletAddress: user.walletAddress,
        verificationCount: user.verificationCount,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        isActive: user.isActive
      },
      stats: {
        totalVerifications: stats.totalVerifications,
        successfulVerifications: stats.successfulVerifications,
        successRate: stats.totalVerifications > 0 
          ? (stats.successfulVerifications / stats.totalVerifications) * 100 
          : 0,
        uniqueContractCount: stats.uniqueContracts.length,
        uniqueEventCount: stats.uniqueEvents.length
      }
    };
  } catch (error) {
    console.error('Get user stats error:', error);
    throw error;
  }
};

// Deactivate user account
const deactivateUser = async (walletAddress) => {
  try {
    const user = await findUserByWallet(walletAddress);
    if (!user) {
      throw new Error('User not found');
    }

    user.isActive = false;
    await user.save();
    
    return user;
  } catch (error) {
    console.error('Deactivate user error:', error);
    throw error;
  }
};

// Generate new nonce for user
const generateNewNonce = async (walletAddress) => {
  try {
    const user = await findUserByWallet(walletAddress);
    if (!user) {
      throw new Error('User not found');
    }

    const newNonce = crypto.randomBytes(32).toString('hex');
    user.nonce = newNonce;
    await user.save();
    
    return newNonce;
  } catch (error) {
    console.error('Generate new nonce error:', error);
    throw error;
  }
};

module.exports = {
  createUser,
  findUserByWallet,
  updateUserPreferences,
  updateUserMetadata,
  getUserStats,
  deactivateUser,
  generateNewNonce
};
