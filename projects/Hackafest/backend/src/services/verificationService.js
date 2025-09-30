const { ethers } = require('ethers');
const Verification = require('../models/Verification');

// Mock NFT data for demo
const mockNFTs = [
  {
    contractAddress: '0x1234567890123456789012345678901234567890',
    tokenId: '42',
    owner: '0x742d35cc61b8000000000000000000000000000',
    name: 'VIP Access Pass #42',
    verified: true
  },
  {
    contractAddress: '0x2345678901234567890123456789012345678901',
    tokenId: '128',
    owner: '0x742d35cc61b8000000000000000000000000000',
    name: 'Concert Ticket #128',
    verified: true
  },
  {
    contractAddress: '0x3456789012345678901234567890123456789012',
    tokenId: '1',
    owner: '0x742d35cc61b8000000000000000000000000000',
    name: 'Exclusive Art Piece #1',
    verified: false
  }
];

// Verify NFT ownership
const verifyNFTOwnership = async (walletAddress, contractAddress, tokenId, method, credentials) => {
  try {
    // In production, you would:
    // 1. Connect to the blockchain (Conflux)
    // 2. Call the NFT contract's ownerOf function
    // 3. Verify the returned address matches the wallet address
    
    // For demo purposes, we'll check against mock data
    const nft = mockNFTs.find(n => 
      n.contractAddress.toLowerCase() === contractAddress.toLowerCase() &&
      n.tokenId === tokenId &&
      n.owner.toLowerCase() === walletAddress.toLowerCase()
    );

    if (!nft) {
      return {
        success: false,
        reason: 'NFT not found or not owned by this wallet',
        metadata: {
          contractAddress,
          tokenId,
          walletAddress,
          method
        }
      };
    }

    // Additional verification based on method
    switch (method) {
      case 'signature':
        if (!credentials.signature) {
          return {
            success: false,
            reason: 'Signature required for signature verification',
            metadata: { method, contractAddress, tokenId }
          };
        }
        // In production, verify the signature here
        break;
        
      case 'session-code':
        if (!credentials.sessionCode) {
          return {
            success: false,
            reason: 'Session code required for session verification',
            metadata: { method, contractAddress, tokenId }
          };
        }
        // In production, verify the session code here
        break;
        
      case 'qr-code':
        if (!credentials.qrCodeData) {
          return {
            success: false,
            reason: 'QR code data required for QR verification',
            metadata: { method, contractAddress, tokenId }
          };
        }
        // In production, verify the QR code data here
        break;
        
      case 'nfc':
        // NFC verification logic would go here
        break;
    }

    return {
      success: true,
      metadata: {
        nftName: nft.name,
        contractAddress,
        tokenId,
        walletAddress,
        method,
        verified: nft.verified
      }
    };
  } catch (error) {
    console.error('NFT ownership verification error:', error);
    return {
      success: false,
      reason: 'Verification failed due to technical error',
      metadata: { error: error.message, contractAddress, tokenId }
    };
  }
};

// Create verification record
const createVerification = async (verificationData) => {
  try {
    const verification = new Verification(verificationData);
    await verification.save();
    return verification;
  } catch (error) {
    console.error('Verification creation error:', error);
    throw error;
  }
};

// Get verification by ID
const getVerificationById = async (verificationId) => {
  try {
    return await Verification.findById(verificationId);
  } catch (error) {
    console.error('Get verification error:', error);
    throw error;
  }
};

// Get verifications by wallet address
const getVerificationsByWallet = async (walletAddress, options = {}) => {
  try {
    const { limit = 10, offset = 0, contractAddress, result } = options;
    
    const query = { walletAddress };
    if (contractAddress) query.contractAddress = contractAddress;
    if (result) query.result = result;
    
    return await Verification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset);
  } catch (error) {
    console.error('Get verifications error:', error);
    throw error;
  }
};

// Get verification statistics
const getVerificationStats = async (walletAddress) => {
  try {
    const stats = await Verification.aggregate([
      { $match: { walletAddress } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          successful: { $sum: { $cond: [{ $eq: ['$result', 'success'] }, 1, 0] } },
          failed: { $sum: { $cond: [{ $eq: ['$result', 'failed'] }, 1, 0] } },
          byMethod: {
            $push: {
              method: '$verificationMethod',
              result: '$result'
            }
          }
        }
      }
    ]);

    return stats[0] || { total: 0, successful: 0, failed: 0, byMethod: [] };
  } catch (error) {
    console.error('Get verification stats error:', error);
    throw error;
  }
};

module.exports = {
  verifyNFTOwnership,
  createVerification,
  getVerificationById,
  getVerificationsByWallet,
  getVerificationStats
};
