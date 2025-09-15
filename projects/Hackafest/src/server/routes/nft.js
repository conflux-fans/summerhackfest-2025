const express = require('express');
const router = express.Router();
const { verifyToken } = require('./auth');
const { getUserTokens, getCollectionInfo, isValidAddress } = require('../utils/crypto');
const Collection = require('../models/Collection');
const Verification = require('../models/Verification');
const { rateLimiter, verificationRateLimiter } = require('../middleware/rateLimiter');

/**
 * Get NFT tokens for a wallet address
 */
router.get('/wallet/:walletAddress', rateLimiter, async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const { contractAddress, limit = 50, offset = 0 } = req.query;
    
    if (!isValidAddress(walletAddress)) {
      return res.status(400).json({
        error: 'Invalid wallet address',
        message: 'Please provide a valid wallet address'
      });
    }
    
    // If specific contract is requested
    if (contractAddress) {
      if (!isValidAddress(contractAddress)) {
        return res.status(400).json({
          error: 'Invalid contract address',
          message: 'Please provide a valid contract address'
        });
      }
      
      const tokens = await getUserTokens(contractAddress, walletAddress);
      
      if (!tokens.success) {
        return res.status(500).json({
          error: 'Failed to get tokens',
          message: tokens.error
        });
      }
      
      // Get collection info
      const collection = await Collection.findOne({ 
        contractAddress: contractAddress.toLowerCase() 
      }).select('name symbol description imageUrl category');
      
      res.json({
        success: true,
        tokens: tokens.tokens,
        balance: tokens.balance,
        collection,
        walletAddress: walletAddress.toLowerCase(),
        contractAddress: contractAddress.toLowerCase()
      });
      
    } else {
      // Get tokens from all collections the user might own
      const collections = await Collection.find({ isActive: true })
        .select('contractAddress name symbol imageUrl')
        .limit(parseInt(limit))
        .skip(parseInt(offset));
      
      const allTokens = [];
      
      for (const collection of collections) {
        try {
          const tokens = await getUserTokens(collection.contractAddress, walletAddress);
          
          if (tokens.success && tokens.tokens.length > 0) {
            allTokens.push({
              collection: {
                contractAddress: collection.contractAddress,
                name: collection.name,
                symbol: collection.symbol,
                imageUrl: collection.imageUrl
              },
              tokens: tokens.tokens,
              balance: tokens.balance
            });
          }
        } catch (tokenError) {
          console.warn(`Error getting tokens for ${collection.contractAddress}:`, tokenError);
          // Continue with other collections
        }
      }
      
      res.json({
        success: true,
        collections: allTokens,
        walletAddress: walletAddress.toLowerCase(),
        totalCollections: allTokens.length
      });
    }
    
  } catch (error) {
    console.error('Get wallet tokens error:', error);
    res.status(500).json({
      error: 'Failed to get wallet tokens',
      message: error.message
    });
  }
});

/**
 * Get NFT token details by contract and token ID
 */
router.get('/:contractAddress/:tokenId', rateLimiter, async (req, res) => {
  try {
    const { contractAddress, tokenId } = req.params;
    
    if (!isValidAddress(contractAddress)) {
      return res.status(400).json({
        error: 'Invalid contract address',
        message: 'Please provide a valid contract address'
      });
    }
    
    // Get collection info
    const collection = await Collection.findOne({ 
      contractAddress: contractAddress.toLowerCase() 
    });
    
    if (!collection) {
      return res.status(404).json({
        error: 'Collection not found',
        message: 'No collection found with this contract address'
      });
    }
    
    // Get on-chain token info
    try {
      const { ethers } = require('ethers');
      const { getProvider } = require('../utils/crypto');
      
      const provider = getProvider();
      const contract = new ethers.Contract(contractAddress, [
        "function ownerOf(uint256 tokenId) view returns (address)",
        "function tokenURI(uint256 tokenId) view returns (string)",
        "function getTokenTraits(uint256 tokenId) view returns (string)",
        "function getTokenRarity(uint256 tokenId) view returns (uint256)"
      ], provider);
      
      const [owner, tokenURI, traits, rarity] = await Promise.all([
        contract.ownerOf(tokenId).catch(() => null),
        contract.tokenURI(tokenId).catch(() => ''),
        contract.getTokenTraits(tokenId).catch(() => ''),
        contract.getTokenRarity(tokenId).catch(() => 0)
      ]);
      
      if (!owner) {
        return res.status(404).json({
          error: 'Token not found',
          message: 'No token found with this ID'
        });
      }
      
      res.json({
        success: true,
        token: {
          tokenId: parseInt(tokenId),
          contractAddress: contractAddress.toLowerCase(),
          owner: owner.toLowerCase(),
          tokenURI,
          traits: traits || '',
          rarity: Number(rarity)
        },
        collection: {
          name: collection.name,
          symbol: collection.symbol,
          description: collection.description,
          imageUrl: collection.imageUrl,
          category: collection.category,
          creator: collection.creator
        }
      });
      
    } catch (chainError) {
      console.error('Get token details error:', chainError);
      return res.status(500).json({
        error: 'Failed to get token details',
        message: 'Could not retrieve token information from blockchain'
      });
    }
    
  } catch (error) {
    console.error('Get NFT details error:', error);
    res.status(500).json({
      error: 'Failed to get NFT details',
      message: error.message
    });
  }
});

/**
 * Check if wallet owns specific NFT with access verification
 */
router.post('/verify-ownership', verificationRateLimiter, async (req, res) => {
  try {
    const { walletAddress, contractAddress, tokenId } = req.body;
    
    if (!walletAddress || !contractAddress) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'walletAddress and contractAddress are required'
      });
    }
    
    if (!isValidAddress(walletAddress) || !isValidAddress(contractAddress)) {
      return res.status(400).json({
        error: 'Invalid addresses',
        message: 'Please provide valid wallet and contract addresses'
      });
    }
    
    // Get collection
    const collection = await Collection.findOne({ 
      contractAddress: contractAddress.toLowerCase() 
    });
    
    if (!collection) {
      return res.status(404).json({
        error: 'Collection not found',
        message: 'No collection found with this contract address'
      });
    }
    
    if (!collection.isActive) {
      return res.status(400).json({
        error: 'Collection inactive',
        message: 'This collection is not currently active'
      });
    }
    
    // Check specific token ownership if tokenId provided
    if (tokenId !== undefined) {
      try {
        const { ethers } = require('ethers');
        const { getProvider } = require('../utils/crypto');
        
        const provider = getProvider();
        const contract = new ethers.Contract(contractAddress, [
          "function ownerOf(uint256 tokenId) view returns (address)"
        ], provider);
        
        const owner = await contract.ownerOf(tokenId);
        const ownsToken = owner.toLowerCase() === walletAddress.toLowerCase();
        
        res.json({
          success: true,
          ownsToken,
          tokenId: parseInt(tokenId),
          owner: owner.toLowerCase(),
          walletAddress: walletAddress.toLowerCase(),
          contractAddress: contractAddress.toLowerCase(),
          collectionName: collection.name
        });
        
      } catch (tokenError) {
        console.error('Token ownership check error:', tokenError);
        res.status(500).json({
          error: 'Failed to check token ownership',
          message: 'Could not verify token ownership on blockchain'
        });
      }
      
    } else {
      // Check general collection ownership and access rules
      const { verifyNFTOwnership } = require('../utils/crypto');
      
      const ownershipResult = await verifyNFTOwnership(
        contractAddress,
        walletAddress,
        collection.accessRule
      );
      
      res.json({
        success: true,
        hasAccess: ownershipResult.success,
        reason: ownershipResult.reason || null,
        balance: ownershipResult.balance || 0,
        tokenIds: ownershipResult.tokenIds || [],
        accessRule: collection.accessRule,
        walletAddress: walletAddress.toLowerCase(),
        contractAddress: contractAddress.toLowerCase(),
        collectionName: collection.name
      });
    }
    
  } catch (error) {
    console.error('Verify ownership error:', error);
    res.status(500).json({
      error: 'Ownership verification failed',
      message: error.message
    });
  }
});

/**
 * Get collection supply and token list
 */
router.get('/:contractAddress/tokens', rateLimiter, async (req, res) => {
  try {
    const { contractAddress } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    
    if (!isValidAddress(contractAddress)) {
      return res.status(400).json({
        error: 'Invalid contract address',
        message: 'Please provide a valid contract address'
      });
    }
    
    // Get collection
    const collection = await Collection.findOne({ 
      contractAddress: contractAddress.toLowerCase() 
    });
    
    if (!collection) {
      return res.status(404).json({
        error: 'Collection not found',
        message: 'No collection found with this contract address'
      });
    }
    
    try {
      const { ethers } = require('ethers');
      const { getProvider } = require('../utils/crypto');
      
      const provider = getProvider();
      const contract = new ethers.Contract(contractAddress, [
        "function totalSupply() view returns (uint256)",
        "function tokenByIndex(uint256 index) view returns (uint256)",
        "function tokenURI(uint256 tokenId) view returns (string)",
        "function ownerOf(uint256 tokenId) view returns (address)"
      ], provider);
      
      const totalSupply = await contract.totalSupply();
      const totalSupplyNumber = Number(totalSupply);
      
      // Get paginated token list
      const startIndex = parseInt(offset);
      const limitNumber = Math.min(parseInt(limit), 100); // Cap at 100
      const endIndex = Math.min(startIndex + limitNumber, totalSupplyNumber);
      
      const tokens = [];
      
      for (let i = startIndex; i < endIndex; i++) {
        try {
          const tokenId = await contract.tokenByIndex(i);
          const tokenIdNumber = Number(tokenId);
          
          const [tokenURI, owner] = await Promise.all([
            contract.tokenURI(tokenId).catch(() => ''),
            contract.ownerOf(tokenId).catch(() => '')
          ]);
          
          tokens.push({
            tokenId: tokenIdNumber,
            tokenURI,
            owner: owner.toLowerCase(),
            index: i
          });
          
        } catch (tokenError) {
          console.warn(`Error getting token at index ${i}:`, tokenError);
          // Continue with other tokens
        }
      }
      
      res.json({
        success: true,
        tokens,
        collection: {
          contractAddress: contractAddress.toLowerCase(),
          name: collection.name,
          symbol: collection.symbol,
          totalSupply: totalSupplyNumber,
          maxSupply: collection.maxSupply
        },
        pagination: {
          total: totalSupplyNumber,
          limit: limitNumber,
          offset: startIndex,
          hasMore: endIndex < totalSupplyNumber
        }
      });
      
    } catch (chainError) {
      console.error('Get collection tokens error:', chainError);
      res.status(500).json({
        error: 'Failed to get collection tokens',
        message: 'Could not retrieve token list from blockchain'
      });
    }
    
  } catch (error) {
    console.error('Get collection tokens error:', error);
    res.status(500).json({
      error: 'Failed to get collection tokens',
      message: error.message
    });
  }
});

/**
 * Get token ownership history and verification stats
 */
router.get('/:contractAddress/:tokenId/history', rateLimiter, async (req, res) => {
  try {
    const { contractAddress, tokenId } = req.params;
    const { limit = 20, offset = 0 } = req.query;
    
    if (!isValidAddress(contractAddress)) {
      return res.status(400).json({
        error: 'Invalid contract address',
        message: 'Please provide a valid contract address'
      });
    }
    
    // Get verification history for this specific token
    const verifications = await Verification.find({
      contractAddress: contractAddress.toLowerCase(),
      tokenIds: parseInt(tokenId)
    })
    .sort({ verifiedAt: -1 })
    .limit(parseInt(limit))
    .skip(parseInt(offset))
    .select('verificationId walletAddress result verifiedAt verificationMethod metadata');
    
    const totalVerifications = await Verification.countDocuments({
      contractAddress: contractAddress.toLowerCase(),
      tokenIds: parseInt(tokenId)
    });
    
    res.json({
      success: true,
      tokenId: parseInt(tokenId),
      contractAddress: contractAddress.toLowerCase(),
      verifications,
      stats: {
        totalVerifications,
        uniqueHolders: [...new Set(verifications.map(v => v.walletAddress))].length
      },
      pagination: {
        total: totalVerifications,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: (parseInt(offset) + parseInt(limit)) < totalVerifications
      }
    });
    
  } catch (error) {
    console.error('Get token history error:', error);
    res.status(500).json({
      error: 'Failed to get token history',
      message: error.message
    });
  }
});

module.exports = router;