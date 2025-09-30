const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  walletAddress: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  nonce: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  verificationCount: {
    type: Number,
    default: 0
  },
  preferences: {
    notifications: {
      type: Boolean,
      default: true
    },
    email: String,
    phone: String
  },
  metadata: {
    deviceInfo: String,
    ipAddress: String,
    userAgent: String
  }
}, {
  timestamps: true
});

// Index for faster queries
userSchema.index({ walletAddress: 1 });
userSchema.index({ createdAt: -1 });

module.exports = mongoose.model('User', userSchema);
