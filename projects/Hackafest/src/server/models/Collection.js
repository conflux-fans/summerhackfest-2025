const mongoose = require('mongoose');

const AccessRuleSchema = new mongoose.Schema({
  ruleType: {
    type: String,
    enum: ['hold-one', 'specific-trait', 'min-rarity'],
    default: 'hold-one'
  },
  traitType: String,
  traitValue: String,
  minRarity: {
    type: Number,
    default: 0
  },
  validityStart: {
    type: Date,
    default: Date.now
  },
  validityEnd: Date,
  transferable: {
    type: Boolean,
    default: true
  }
});

const CollectionSchema = new mongoose.Schema({
  // Contract information
  contractAddress: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // Basic collection info
  name: {
    type: String,
    required: true,
    trim: true
  },
  symbol: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['event', 'membership', 'space', 'rwa', 'other'],
    default: 'other'
  },
  
  // Financial settings
  royaltyPercentage: {
    type: Number,
    min: 0,
    max: 10,
    default: 5
  },
  price: {
    type: Number,
    min: 0,
    default: 0
  },
  currency: {
    type: String,
    enum: ['CFX', 'USDT', 'USDC'],
    default: 'CFX'
  },
  
  // Supply settings
  maxSupply: {
    type: Number,
    required: true,
    min: 1
  },
  currentSupply: {
    type: Number,
    default: 0
  },
  
  // Minting settings
  maxMintPerWallet: {
    type: Number,
    default: 10
  },
  allowlistOnly: {
    type: Boolean,
    default: false
  },
  allowlist: [{
    address: String,
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Access control
  accessRule: AccessRuleSchema,
  
  // Creator info
  creator: {
    type: String,
    required: true,
    index: true
  },
  
  // Metadata
  baseURI: String,
  imageUrl: String,
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  
  // Analytics
  totalVerifications: {
    type: Number,
    default: 0
  },
  uniqueHolders: {
    type: Number,
    default: 0
  },
  
  // Deployment info
  deployedAt: {
    type: Date,
    default: Date.now
  },
  deploymentTxHash: String,
  
  // Network info
  network: {
    type: String,
    default: 'conflux'
  },
  chainId: {
    type: Number,
    default: 1030 // Conflux mainnet
  }
}, {
  timestamps: true
});

// Indexes for performance
CollectionSchema.index({ creator: 1, isActive: 1 });
CollectionSchema.index({ category: 1, isActive: 1 });
CollectionSchema.index({ deployedAt: -1 });

// Virtual for verification rate
CollectionSchema.virtual('verificationRate').get(function() {
  if (this.currentSupply === 0) return 0;
  return (this.totalVerifications / this.currentSupply * 100).toFixed(2);
});

// Method to check if address is in allowlist
CollectionSchema.methods.isInAllowlist = function(address) {
  return this.allowlist.some(entry => 
    entry.address.toLowerCase() === address.toLowerCase()
  );
};

// Method to add to allowlist
CollectionSchema.methods.addToAllowlist = function(addresses) {
  const newEntries = addresses.map(addr => ({
    address: addr.toLowerCase(),
    addedAt: new Date()
  }));
  
  // Remove duplicates and add new ones
  const existingAddresses = new Set(
    this.allowlist.map(entry => entry.address.toLowerCase())
  );
  
  const uniqueEntries = newEntries.filter(entry => 
    !existingAddresses.has(entry.address)
  );
  
  this.allowlist.push(...uniqueEntries);
  return this.save();
};

// Static method to get active collections
CollectionSchema.statics.getActiveCollections = function() {
  return this.find({ isActive: true }).sort({ deployedAt: -1 });
};

// Static method to get collections by creator
CollectionSchema.statics.getByCreator = function(creator) {
  return this.find({ creator: creator.toLowerCase() }).sort({ deployedAt: -1 });
};

module.exports = mongoose.model('Collection', CollectionSchema);