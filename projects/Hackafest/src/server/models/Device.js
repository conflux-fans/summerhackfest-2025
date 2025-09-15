const mongoose = require('mongoose');

const DeviceSchema = new mongoose.Schema({
  // Device identification
  deviceId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // Owner wallet
  walletAddress: {
    type: String,
    required: true,
    index: true
  },
  
  // Device information
  deviceName: {
    type: String,
    required: true,
    trim: true
  },
  deviceType: {
    type: String,
    enum: ['mobile', 'desktop', 'tablet'],
    default: 'mobile'
  },
  platform: {
    type: String,
    enum: ['ios', 'android', 'web', 'windows', 'macos', 'linux'],
    default: 'web'
  },
  
  // Pairing information
  pairingCode: {
    type: String,
    index: true,
    sparse: true // Allow null values but index non-null ones
  },
  pairingCodeExpiry: Date,
  
  // Security
  publicKey: String, // For device-specific encryption
  lastSignature: String, // Last verification signature
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  isTrusted: {
    type: Boolean,
    default: false
  },
  
  // Usage tracking
  lastUsed: {
    type: Date,
    default: Date.now
  },
  totalVerifications: {
    type: Number,
    default: 0
  },
  
  // Network info
  lastIpAddress: String,
  userAgent: String,
  
  // Pairing details
  pairedAt: {
    type: Date,
    default: Date.now
  },
  pairingMethod: {
    type: String,
    enum: ['qr-code', 'manual-code', 'deep-link'],
    default: 'manual-code'
  }
}, {
  timestamps: true
});

// Indexes for performance
DeviceSchema.index({ walletAddress: 1, isActive: 1 });
DeviceSchema.index({ pairingCode: 1, pairingCodeExpiry: 1 });
DeviceSchema.index({ lastUsed: -1 });

// Method to generate pairing code
DeviceSchema.methods.generatePairingCode = function() {
  const crypto = require('crypto');
  this.pairingCode = crypto.randomBytes(3).toString('hex').toUpperCase();
  this.pairingCodeExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  return this.pairingCode;
};

// Method to verify pairing code
DeviceSchema.methods.verifyPairingCode = function(code) {
  if (!this.pairingCode || !this.pairingCodeExpiry) return false;
  if (new Date() > this.pairingCodeExpiry) return false;
  return this.pairingCode.toUpperCase() === code.toUpperCase();
};

// Method to complete pairing
DeviceSchema.methods.completePairing = function() {
  this.isTrusted = true;
  this.pairingCode = undefined;
  this.pairingCodeExpiry = undefined;
  this.pairedAt = new Date();
  return this.save();
};

// Method to revoke device
DeviceSchema.methods.revoke = function() {
  this.isActive = false;
  this.isTrusted = false;
  return this.save();
};

// Method to update last used
DeviceSchema.methods.updateLastUsed = function() {
  this.lastUsed = new Date();
  this.totalVerifications += 1;
  return this.save();
};

// Static method to get active devices for wallet
DeviceSchema.statics.getActiveDevices = function(walletAddress) {
  return this.find({ 
    walletAddress: walletAddress.toLowerCase(), 
    isActive: true 
  }).sort({ lastUsed: -1 });
};

// Static method to find by pairing code
DeviceSchema.statics.findByPairingCode = function(code) {
  return this.findOne({
    pairingCode: code.toUpperCase(),
    pairingCodeExpiry: { $gt: new Date() },
    isActive: true
  });
};

// Static method to cleanup expired pairing codes
DeviceSchema.statics.cleanupExpiredCodes = function() {
  return this.updateMany(
    { pairingCodeExpiry: { $lt: new Date() } },
    { 
      $unset: { 
        pairingCode: 1, 
        pairingCodeExpiry: 1 
      } 
    }
  );
};

module.exports = mongoose.model('Device', DeviceSchema);