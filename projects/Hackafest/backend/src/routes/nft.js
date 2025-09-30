const express = require('express');
const { body, validationResult } = require('express-validator');
const { getNFTsByWallet, getNFTDetails } = require('../services/nftService');

const router = express.Router();

// Get NFTs owned by wallet
router.get('/wallet/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const { contractAddress, limit = 50, offset = 0 } = req.query;

    const nfts = await getNFTsByWallet(walletAddress, {
      contractAddress,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      nfts,
      total: nfts.length
    });
  } catch (error) {
    console.error('Get NFTs error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch NFTs'
    });
  }
});

// Get NFT details
router.get('/details', [
  body('contractAddress').isEthereumAddress().withMessage('Invalid contract address'),
  body('tokenId').isString().withMessage('Token ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { contractAddress, tokenId } = req.body;

    const nftDetails = await getNFTDetails(contractAddress, tokenId);

    if (!nftDetails) {
      return res.status(404).json({
        success: false,
        error: 'NFT not found'
      });
    }

    res.json({
      success: true,
      nft: nftDetails
    });
  } catch (error) {
    console.error('Get NFT details error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch NFT details'
    });
  }
});

// Verify NFT ownership (quick check)
router.post('/verify-ownership', [
  body('walletAddress').isEthereumAddress().withMessage('Invalid wallet address'),
  body('contractAddress').isEthereumAddress().withMessage('Invalid contract address'),
  body('tokenId').isString().withMessage('Token ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { walletAddress, contractAddress, tokenId } = req.body;

    // In production, this would check the blockchain
    // For demo, we'll use mock data
    const mockNFTs = [
      {
        contractAddress: '0x1234567890123456789012345678901234567890',
        tokenId: '42',
        owner: '0x742d35cc61b8000000000000000000000000000'
      },
      {
        contractAddress: '0x2345678901234567890123456789012345678901',
        tokenId: '128',
        owner: '0x742d35cc61b8000000000000000000000000000'
      },
      {
        contractAddress: '0x3456789012345678901234567890123456789012',
        tokenId: '1',
        owner: '0x742d35cc61b8000000000000000000000000000'
      }
    ];

    const nft = mockNFTs.find(n => 
      n.contractAddress.toLowerCase() === contractAddress.toLowerCase() &&
      n.tokenId === tokenId &&
      n.owner.toLowerCase() === walletAddress.toLowerCase()
    );

    res.json({
      success: !!nft,
      owned: !!nft,
      message: nft ? 'NFT is owned by this wallet' : 'NFT is not owned by this wallet'
    });
  } catch (error) {
    console.error('Verify ownership error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify ownership'
    });
  }
});

module.exports = router;
