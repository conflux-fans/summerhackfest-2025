const express = require('express');
const router = express.Router();
const Collection = require('../models/Collection');
const { verifyToken } = require('./auth');
const { getCollectionInfo, isValidAddress } = require('../utils/crypto');
const { rateLimiter, strictRateLimiter } = require('../middleware/rateLimiter');

/**
 * Create a new collection
 */
router.post('/', verifyToken, strictRateLimiter, async (req, res) => {
  try {
    const {
      contractAddress,
      name,
      symbol,
      description,
      category,
      imageUrl,
      bannerUrl,
      accessRule,
      royaltyPercentage,
      maxSupply,
      price,
      tags,
      socialLinks
    } = req.body;
    
    if (!contractAddress || !name || !symbol || !description) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'contractAddress, name, symbol, and description are required'
      });
    }
    
    if (!isValidAddress(contractAddress)) {
      return res.status(400).json({
        error: 'Invalid contract address',
        message: 'Please provide a valid contract address'
      });
    }
    
    // Check if collection already exists
    const existingCollection = await Collection.findOne({ 
      contractAddress: contractAddress.toLowerCase() 
    });
    
    if (existingCollection) {
      return res.status(409).json({
        error: 'Collection already exists',
        message: 'A collection with this contract address already exists'
      });
    }
    
    // Verify on-chain collection info
    let onChainInfo = null;
    try {
      const chainResult = await getCollectionInfo(contractAddress);
      if (chainResult.success) {
        onChainInfo = chainResult;
        
        // Validate that the authenticated user is the creator
        if (chainResult.collection.creator.toLowerCase() !== req.walletAddress.toLowerCase()) {
          return res.status(403).json({
            error: 'Unauthorized',
            message: 'Only the contract creator can register this collection'
          });
        }
      }
    } catch (chainError) {
      console.warn('Could not verify on-chain info:', chainError);
    }
    
    // Create collection
    const collection = await Collection.createCollection({
      contractAddress: contractAddress.toLowerCase(),
      name: name.trim(),
      symbol: symbol.trim().toUpperCase(),
      description: description.trim(),
      category: category || 'other',
      imageUrl: imageUrl || '',
      bannerUrl: bannerUrl || '',
      creator: req.walletAddress.toLowerCase(),
      accessRule: accessRule || {
        ruleType: 'hold-one',
        traitType: '',
        traitValue: '',
        minRarity: 0,
        validityStart: new Date(),
        validityEnd: null,
        transferable: true
      },
      royaltyPercentage: Math.min(Math.max(royaltyPercentage || 0, 0), 10), // Cap at 10%
      maxSupply: maxSupply || 0,
      price: price || '0',
      tags: Array.isArray(tags) ? tags.slice(0, 10) : [], // Limit to 10 tags
      socialLinks: socialLinks || {},
      onChainData: onChainInfo
    });
    
    res.status(201).json({
      success: true,
      collection: {
        id: collection._id,
        contractAddress: collection.contractAddress,
        name: collection.name,
        symbol: collection.symbol,
        description: collection.description,
        category: collection.category,
        imageUrl: collection.imageUrl,
        creator: collection.creator,
        isActive: collection.isActive,
        createdAt: collection.createdAt
      }
    });
    
  } catch (error) {
    console.error('Create collection error:', error);
    res.status(500).json({
      error: 'Failed to create collection',
      message: error.message
    });
  }
});

/**
 * Get all collections with filtering and pagination
 */
router.get('/', rateLimiter, async (req, res) => {
  try {
    const {
      category,
      creator,
      isActive,
      limit = 20,
      offset = 0,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search
    } = req.query;
    
    // Build filter query
    const filter = {};
    
    if (category) filter.category = category;
    if (creator && isValidAddress(creator)) filter.creator = creator.toLowerCase();
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    
    // Add search functionality
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { symbol: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Build sort object
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const [collections, totalCount] = await Promise.all([
      Collection.find(filter)
        .select('-onChainData -__v')
        .sort(sortOptions)
        .limit(Math.min(parseInt(limit), 100)) // Cap at 100
        .skip(parseInt(offset)),
      Collection.countDocuments(filter)
    ]);
    
    res.json({
      success: true,
      collections,
      pagination: {
        total: totalCount,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: (parseInt(offset) + parseInt(limit)) < totalCount
      },
      filters: {
        category,
        creator,
        isActive,
        search
      }
    });
    
  } catch (error) {
    console.error('Get collections error:', error);
    res.status(500).json({
      error: 'Failed to get collections',
      message: error.message
    });
  }
});

/**
 * Get collection by contract address
 */
router.get('/:contractAddress', rateLimiter, async (req, res) => {
  try {
    const { contractAddress } = req.params;
    const { includeOnChain = false } = req.query;
    
    if (!isValidAddress(contractAddress)) {
      return res.status(400).json({
        error: 'Invalid contract address',
        message: 'Please provide a valid contract address'
      });
    }
    
    const collection = await Collection.findOne({ 
      contractAddress: contractAddress.toLowerCase() 
    }).select(includeOnChain === 'true' ? '' : '-onChainData -__v');
    
    if (!collection) {
      return res.status(404).json({
        error: 'Collection not found',
        message: 'No collection found with this contract address'
      });
    }
    
    // Optionally fetch fresh on-chain data
    let freshOnChainData = null;
    if (includeOnChain === 'true') {
      try {
        const chainResult = await getCollectionInfo(contractAddress);
        if (chainResult.success) {
          freshOnChainData = chainResult;
        }
      } catch (chainError) {
        console.warn('Could not fetch fresh on-chain data:', chainError);
      }
    }
    
    res.json({
      success: true,
      collection: {
        ...collection.toObject(),
        freshOnChainData
      }
    });
    
  } catch (error) {
    console.error('Get collection error:', error);
    res.status(500).json({
      error: 'Failed to get collection',
      message: error.message
    });
  }
});

/**
 * Update collection (only by creator)
 */
router.put('/:contractAddress', verifyToken, strictRateLimiter, async (req, res) => {
  try {
    const { contractAddress } = req.params;
    const {
      name,
      description,
      category,
      imageUrl,
      bannerUrl,
      tags,
      socialLinks,
      isActive
    } = req.body;
    
    if (!isValidAddress(contractAddress)) {
      return res.status(400).json({
        error: 'Invalid contract address',
        message: 'Please provide a valid contract address'
      });
    }
    
    const collection = await Collection.findOne({ 
      contractAddress: contractAddress.toLowerCase() 
    });
    
    if (!collection) {
      return res.status(404).json({
        error: 'Collection not found',
        message: 'No collection found with this contract address'
      });
    }
    
    // Verify ownership
    if (collection.creator.toLowerCase() !== req.walletAddress.toLowerCase()) {
      return res.status(403).json({
        error: 'Unauthorized',
        message: 'Only the collection creator can update this collection'
      });
    }
    
    // Update fields
    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (category !== undefined) updateData.category = category;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (bannerUrl !== undefined) updateData.bannerUrl = bannerUrl;
    if (Array.isArray(tags)) updateData.tags = tags.slice(0, 10);
    if (socialLinks !== undefined) updateData.socialLinks = socialLinks;
    if (isActive !== undefined) updateData.isActive = isActive;
    updateData.updatedAt = new Date();
    
    const updatedCollection = await Collection.findByIdAndUpdate(
      collection._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-onChainData -__v');
    
    res.json({
      success: true,
      collection: updatedCollection
    });
    
  } catch (error) {
    console.error('Update collection error:', error);
    res.status(500).json({
      error: 'Failed to update collection',
      message: error.message
    });
  }
});

/**
 * Delete collection (only by creator)
 */
router.delete('/:contractAddress', verifyToken, strictRateLimiter, async (req, res) => {
  try {
    const { contractAddress } = req.params;
    
    if (!isValidAddress(contractAddress)) {
      return res.status(400).json({
        error: 'Invalid contract address',
        message: 'Please provide a valid contract address'
      });
    }
    
    const collection = await Collection.findOne({ 
      contractAddress: contractAddress.toLowerCase() 
    });
    
    if (!collection) {
      return res.status(404).json({
        error: 'Collection not found',
        message: 'No collection found with this contract address'
      });
    }
    
    // Verify ownership
    if (collection.creator.toLowerCase() !== req.walletAddress.toLowerCase()) {
      return res.status(403).json({
        error: 'Unauthorized',
        message: 'Only the collection creator can delete this collection'
      });
    }
    
    // Soft delete by setting isActive to false
    await Collection.findByIdAndUpdate(collection._id, {
      isActive: false,
      updatedAt: new Date()
    });
    
    res.json({
      success: true,
      message: 'Collection deactivated successfully'
    });
    
  } catch (error) {
    console.error('Delete collection error:', error);
    res.status(500).json({
      error: 'Failed to delete collection',
      message: error.message
    });
  }
});

/**
 * Get collections by creator
 */
router.get('/creator/:walletAddress', rateLimiter, async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const { limit = 20, offset = 0 } = req.query;
    
    if (!isValidAddress(walletAddress)) {
      return res.status(400).json({
        error: 'Invalid wallet address',
        message: 'Please provide a valid wallet address'
      });
    }
    
    const [collections, totalCount] = await Promise.all([
      Collection.find({ creator: walletAddress.toLowerCase() })
        .select('-onChainData -__v')
        .sort({ createdAt: -1 })
        .limit(Math.min(parseInt(limit), 100))
        .skip(parseInt(offset)),
      Collection.countDocuments({ creator: walletAddress.toLowerCase() })
    ]);
    
    res.json({
      success: true,
      collections,
      creator: walletAddress.toLowerCase(),
      pagination: {
        total: totalCount,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: (parseInt(offset) + parseInt(limit)) < totalCount
      }
    });
    
  } catch (error) {
    console.error('Get creator collections error:', error);
    res.status(500).json({
      error: 'Failed to get creator collections',
      message: error.message
    });
  }
});

/**
 * Get collection categories
 */
router.get('/meta/categories', rateLimiter, async (req, res) => {
  try {
    const categories = await Collection.distinct('category');
    
    res.json({
      success: true,
      categories: categories.sort()
    });
    
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      error: 'Failed to get categories',
      message: error.message
    });
  }
});

/**
 * Get collection statistics
 */
router.get('/meta/stats', rateLimiter, async (req, res) => {
  try {
    const [
      totalCollections,
      activeCollections,
      totalCreators,
      categoryCounts
    ] = await Promise.all([
      Collection.countDocuments(),
      Collection.countDocuments({ isActive: true }),
      Collection.distinct('creator').then(creators => creators.length),
      Collection.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
    ]);
    
    res.json({
      success: true,
      stats: {
        totalCollections,
        activeCollections,
        totalCreators,
        categoryCounts: categoryCounts.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      }
    });
    
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      error: 'Failed to get statistics',
      message: error.message
    });
  }
});

module.exports = router;