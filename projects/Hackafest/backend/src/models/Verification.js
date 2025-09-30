const mongoose = require('mongoose');

const verificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  walletAddress: {
    type: String,
    required: true,
    lowercase: true
  },
  contractAddress: {
    type: String,
    required: true,
    lowercase: true
  },
  tokenId: {
    type: String,
    required: true
  },
  eventName: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  verificationMethod: {
    type: String,
    enum: ['signature', 'session-code', 'qr-code', 'nfc'],
    required: true
  },
  result: {
    type: String,
    enum: ['success', 'failed'],
    required: true
  },
  reason: {
    type: String
  },
  signature: {
    type: String
  },
  sessionCode: {
    type: String
  },
  qrCodeData: {
    type: String
  },
  deviceInfo: {
    type: String
  },
  ipAddress: {
    type: String
  },
  organizerId: {
    type: String
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes for faster queries
verificationSchema.index({ walletAddress: 1, createdAt: -1 });
verificationSchema.index({ contractAddress: 1, createdAt: -1 });
verificationSchema.index({ result: 1, createdAt: -1 });
verificationSchema.index({ verificationMethod: 1 });

module.exports = mongoose.model('Verification', verificationSchema);
