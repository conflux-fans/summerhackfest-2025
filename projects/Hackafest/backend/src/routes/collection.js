const express = require('express');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Mock collections data
const mockCollections = [
  {
    id: '1',
    contractAddress: '0x1234567890123456789012345678901234567890',
    name: 'VIP Access Pass',
    symbol: 'VIP',
    description: 'Exclusive access to premium events and venues',
    category: 'access',
    imageUrl: 'https://via.placeholder.com/400/300/22D3EE/FFFFFF?text=VIP+Access',
    creator: '0xabcdef1234567890abcdef1234567890abcdef12',
    price: '0.05',
    totalSupply: 750,
    maxSupply: 1000,
    isActive: true,
    createdAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    contractAddress: '0x2345678901234567890123456789012345678901',
    name: 'Concert Tickets',
    symbol: 'CONCERT',
    description: 'Digital tickets for upcoming concerts',
    category: 'tickets',
    imageUrl: 'https://via.placeholder.com/400/300/22C55E/FFFFFF?text=Concert+Tickets',
    creator: '0xbcdef1234567890abcdef1234567890abcdef123',
    price: '0.02',
    totalSupply: 500,
    maxSupply: 500,
    isActive: true,
    createdAt: '2024-01-20T14:20:00Z'
  },
  {
    id: '3',
    contractAddress: '0x3456789012345678901234567890123456789012',
    name: 'Gym Membership',
    symbol: 'GYM',
    description: 'Premium gym access with exclusive benefits',
    category: 'membership',
    imageUrl: 'https://via.placeholder.com/400/300/8B5CF6/FFFFFF?text=Gym+Membership',
    creator: '0xcdef1234567890abcdef1234567890abcdef1234',
    price: '0.1',
    totalSupply: 200,
    maxSupply: 300,
    isActive: true,
    createdAt: '2024-01-25T09:15:00Z'
  }
];

// Get all collections
router.get('/', async (req, res) => {
  try {
    const { category, search, limit = 20, offset = 0 } = req.query;
    
    let filteredCollections = [...mockCollections];
    
    // Filter by category
    if (category && category !== 'all') {
      filteredCollections = filteredCollections.filter(c => c.category === category);
    }
    
    // Filter by search term
    if (search) {
      const searchTerm = search.toLowerCase();
      filteredCollections = filteredCollections.filter(c => 
        c.name.toLowerCase().includes(searchTerm) ||
        c.description.toLowerCase().includes(searchTerm) ||
        c.creator.toLowerCase().includes(searchTerm)
      );
    }
    
    // Apply pagination
    const startIndex = parseInt(offset);
    const endIndex = startIndex + parseInt(limit);
    const paginatedCollections = filteredCollections.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      collections: paginatedCollections,
      total: filteredCollections.length,
      hasMore: endIndex < filteredCollections.length
    });
  } catch (error) {
    console.error('Get collections error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch collections'
    });
  }
});

// Get collection by contract address
router.get('/:contractAddress', async (req, res) => {
  try {
    const { contractAddress } = req.params;
    
    const collection = mockCollections.find(c => 
      c.contractAddress.toLowerCase() === contractAddress.toLowerCase()
    );
    
    if (!collection) {
      return res.status(404).json({
        success: false,
        error: 'Collection not found'
      });
    }
    
    res.json({
      success: true,
      collection
    });
  } catch (error) {
    console.error('Get collection error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch collection'
    });
  }
});

// Get collection statistics
router.get('/:contractAddress/stats', async (req, res) => {
  try {
    const { contractAddress } = req.params;
    
    const collection = mockCollections.find(c => 
      c.contractAddress.toLowerCase() === contractAddress.toLowerCase()
    );
    
    if (!collection) {
      return res.status(404).json({
        success: false,
        error: 'Collection not found'
      });
    }
    
    // Mock statistics
    const stats = {
      totalSupply: collection.totalSupply,
      maxSupply: collection.maxSupply,
      availableSupply: collection.maxSupply - collection.totalSupply,
      floorPrice: collection.price,
      totalVolume: '125.5',
      averagePrice: collection.price,
      holders: Math.floor(collection.totalSupply * 0.8), // Mock: 80% of supply is held
      verified: true,
      lastUpdated: new Date().toISOString()
    };
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Get collection stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch collection statistics'
    });
  }
});

// Create new collection (for demo)
router.post('/', [
  body('name').isString().isLength({ min: 1, max: 100 }).withMessage('Name is required and must be 1-100 characters'),
  body('symbol').isString().isLength({ min: 1, max: 10 }).withMessage('Symbol is required and must be 1-10 characters'),
  body('description').isString().isLength({ min: 1, max: 1000 }).withMessage('Description is required and must be 1-1000 characters'),
  body('category').isIn(['access', 'tickets', 'membership', 'art', 'gaming', 'other']).withMessage('Invalid category'),
  body('maxSupply').isInt({ min: 1, max: 1000000 }).withMessage('Max supply must be between 1 and 1,000,000'),
  body('price').isString().withMessage('Price is required')
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

    const { name, symbol, description, category, maxSupply, price } = req.body;
    const { walletAddress } = req.headers; // In production, get from JWT token

    if (!walletAddress) {
      return res.status(401).json({
        success: false,
        error: 'Wallet address required'
      });
    }

    // Generate mock contract address
    const contractAddress = `0x${Math.random().toString(16).slice(2, 42)}`;
    
    const newCollection = {
      id: (mockCollections.length + 1).toString(),
      contractAddress,
      name,
      symbol: symbol.toUpperCase(),
      description,
      category,
      imageUrl: 'https://via.placeholder.com/400/300/22D3EE/FFFFFF?text=New+Collection',
      creator: walletAddress,
      price,
      totalSupply: 0,
      maxSupply,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    // In production, this would be saved to database
    mockCollections.push(newCollection);

    res.status(201).json({
      success: true,
      collection: newCollection,
      message: 'Collection created successfully'
    });
  } catch (error) {
    console.error('Create collection error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create collection'
    });
  }
});

module.exports = router;
