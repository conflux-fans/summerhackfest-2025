const mongoose = require('mongoose');

const VerificationSchema = new mongoose.Schema({
  // Verification ID
  verificationId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // Session information
  sessionCode: {
    type: String,
    index: true
  },
  
  // Wallet and collection
  walletAddress: {
    type: String,
    required: true,
    index: true
  },
  contractAddress: {
    type: String,
    required: true,
    index: true
  },
  
  // Verification details
  verificationMethod: {
    type: String,
    enum: ['signature', 'session-code', 'mobile-app'],
    required: true
  },
  
  // Signature data
  signature: String,
  message: String,
  messageHash: String,
  
  // Result
  result: {
    type: String,
    enum: ['success', 'failed'],
    required: true
  },
  reason: String, // Failure reason if applicable
  
  // Token information (if verification succeeded)
  tokenIds: [Number],
  tokenTraits: [{
    tokenId: Number,
    traits: String,
    rarity: Number
  }],
  
  // Access rule that was checked
  accessRuleApplied: {
    ruleType: String,
    traitType: String,
    traitValue: String,
    minRarity: Number
  },
  
  // Device information
  deviceId: String,
  ipAddress: String,
  userAgent: String,
  
  // Timing
  verifiedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: Date,
  
  // Organizer information
  organizerId: String, // Wallet address of the collection creator
  eventId: String, // Optional event identifier
  
  // Additional metadata
  metadata: {
    location: String,
    eventName: String,
    additionalData: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Indexes for performance and queries
VerificationSchema.index({ walletAddress: 1, verifiedAt: -1 });
VerificationSchema.index({ contractAddress: 1, verifiedAt: -1 });
VerificationSchema.index({ sessionCode: 1, verifiedAt: -1 });
VerificationSchema.index({ organizerId: 1, verifiedAt: -1 });
VerificationSchema.index({ result: 1, verifiedAt: -1 });
VerificationSchema.index({ verifiedAt: -1 }); // For cleanup and analytics

// TTL index for automatic cleanup (30 days)
VerificationSchema.index({ verifiedAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

// Virtual for verification age
VerificationSchema.virtual('ageInMinutes').get(function() {
  return Math.floor((new Date() - this.verifiedAt) / (1000 * 60));
});

// Virtual for is valid (if has expiry)
VerificationSchema.virtual('isValid').get(function() {
  if (!this.expiresAt) return this.result === 'success';
  return this.result === 'success' && new Date() < this.expiresAt;
});

// Method to check if verification is still valid
VerificationSchema.methods.isStillValid = function() {
  if (this.result !== 'success') return false;
  if (!this.expiresAt) return true;
  return new Date() < this.expiresAt;
};

// Static method to create verification record
VerificationSchema.statics.createVerification = function(data) {
  const crypto = require('crypto');
  
  return this.create({
    verificationId: crypto.randomUUID(),
    ...data,
    verifiedAt: new Date()
  });
};

// Static method to get verification history for wallet
VerificationSchema.statics.getWalletHistory = function(walletAddress, limit = 50) {
  return this.find({ walletAddress: walletAddress.toLowerCase() })
    .sort({ verifiedAt: -1 })
    .limit(limit);
};

// Static method to get collection verification stats
VerificationSchema.statics.getCollectionStats = function(contractAddress, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    {
      $match: {
        contractAddress: contractAddress.toLowerCase(),
        verifiedAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: "%Y-%m-%d", date: "$verifiedAt" } },
          result: "$result"
        },
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: "$_id.date",
        success: {
          $sum: { $cond: [{ $eq: ["$_id.result", "success"] }, "$count", 0] }
        },
        failed: {
          $sum: { $cond: [{ $eq: ["$_id.result", "failed"] }, "$count", 0] }
        },
        total: { $sum: "$count" }
      }
    },
    { $sort: { _id: 1 } }
  ]);
};

// Static method to get organizer analytics
VerificationSchema.statics.getOrganizerStats = function(organizerId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    {
      $match: {
        organizerId: organizerId.toLowerCase(),
        verifiedAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        totalVerifications: { $sum: 1 },
        successfulVerifications: {
          $sum: { $cond: [{ $eq: ["$result", "success"] }, 1, 0] }
        },
        uniqueWallets: { $addToSet: "$walletAddress" },
        uniqueCollections: { $addToSet: "$contractAddress" }
      }
    },
    {
      $addFields: {
        uniqueWalletCount: { $size: "$uniqueWallets" },
        uniqueCollectionCount: { $size: "$uniqueCollections" },
        successRate: {
          $multiply: [
            { $divide: ["$successfulVerifications", "$totalVerifications"] },
            100
          ]
        }
      }
    },
    {
      $project: {
        uniqueWallets: 0,
        uniqueCollections: 0
      }
    }
  ]);
};

// Static method to get failure reasons
VerificationSchema.statics.getFailureReasons = function(contractAddress, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    {
      $match: {
        contractAddress: contractAddress.toLowerCase(),
        result: "failed",
        verifiedAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: "$reason",
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

// Static method to cleanup old verifications
VerificationSchema.statics.cleanupOldVerifications = function(daysToKeep = 90) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
  
  return this.deleteMany({ verifiedAt: { $lt: cutoffDate } });
};

module.exports = mongoose.model('Verification', VerificationSchema);