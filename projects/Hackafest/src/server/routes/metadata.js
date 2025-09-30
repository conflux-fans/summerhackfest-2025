const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');

// Generate NFT metadata
router.post('/generate', async (req, res) => {
  try {
    const {
      name,
      description,
      imageUrl,
      attributes = [],
      externalUrl,
      animationUrl,
      backgroundColor,
      tokenId,
      contractAddress
    } = req.body;
    
    if (!name || !description || !imageUrl) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'name, description, and imageUrl are required'
      });
    }
    
    // Create metadata object following OpenSea standard
    const metadata = {
      name,
      description,
      image: imageUrl,
      external_url: externalUrl || '',
      attributes: attributes.map(attr => ({
        trait_type: attr.trait_type || attr.traitType,
        value: attr.value,
        display_type: attr.display_type || attr.displayType,
        max_value: attr.max_value || attr.maxValue
      }))
    };
    
    // Add optional fields
    if (animationUrl) metadata.animation_url = animationUrl;
    if (backgroundColor) metadata.background_color = backgroundColor;
    
    // Generate metadata file
    const metadataId = uuidv4();
    const filename = `${metadataId}.json`;
    const filepath = path.join('uploads/metadata', filename);
    
    await fs.writeFile(filepath, JSON.stringify(metadata, null, 2));
    
    const metadataUrl = `${req.protocol}://${req.get('host')}/uploads/metadata/${filename}`;
    
    res.json({
      success: true,
      metadata: {
        id: metadataId,
        url: metadataUrl,
        filename,
        data: metadata
      }
    });
    
  } catch (error) {
    console.error('Generate metadata error:', error);
    res.status(500).json({
      error: 'Failed to generate metadata',
      message: error.message
    });
  }
});

// Batch generate metadata for multiple tokens
router.post('/batch-generate', async (req, res) => {
  try {
    const { tokens, baseUri } = req.body;
    
    if (!Array.isArray(tokens) || tokens.length === 0) {
      return res.status(400).json({
        error: 'Invalid tokens array',
        message: 'tokens must be a non-empty array'
      });
    }
    
    const results = [];
    
    for (let i = 0; i < tokens.length; i++) {
      try {
        const token = tokens[i];
        const {
          name,
          description,
          imageUrl,
          attributes = [],
          externalUrl,
          animationUrl,
          backgroundColor,
          tokenId = i
        } = token;
        
        if (!name || !description || !imageUrl) {
          results.push({
            tokenId,
            error: true,
            message: 'Missing required fields (name, description, imageUrl)'
          });
          continue;
        }
        
        // Create metadata
        const metadata = {
          name,
          description,
          image: imageUrl,
          external_url: externalUrl || '',
          attributes: attributes.map(attr => ({
            trait_type: attr.trait_type || attr.traitType,
            value: attr.value,
            display_type: attr.display_type || attr.displayType,
            max_value: attr.max_value || attr.maxValue
          }))
        };
        
        if (animationUrl) metadata.animation_url = animationUrl;
        if (backgroundColor) metadata.background_color = backgroundColor;
        
        // Save metadata file
        const metadataId = uuidv4();
        const filename = `${metadataId}.json`;
        const filepath = path.join('uploads/metadata', filename);
        
        await fs.writeFile(filepath, JSON.stringify(metadata, null, 2));
        
        const metadataUrl = `${req.protocol}://${req.get('host')}/uploads/metadata/${filename}`;
        
        results.push({
          tokenId,
          success: true,
          metadata: {
            id: metadataId,
            url: metadataUrl,
            filename,
            data: metadata
          }
        });
        
      } catch (tokenError) {
        console.error(`Error processing token ${i}:`, tokenError);
        results.push({
          tokenId: token.tokenId || i,
          error: true,
          message: tokenError.message
        });
      }
    }
    
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => r.error);
    
    res.json({
      success: true,
      results,
      summary: {
        total: tokens.length,
        successful: successful.length,
        failed: failed.length
      },
      baseUri: baseUri || `${req.protocol}://${req.get('host')}/uploads/metadata/`
    });
    
  } catch (error) {
    console.error('Batch generate metadata error:', error);
    res.status(500).json({
      error: 'Failed to batch generate metadata',
      message: error.message
    });
  }
});

// Get metadata by ID
router.get('/:metadataId', async (req, res) => {
  try {
    const { metadataId } = req.params;
    
    const filename = `${metadataId}.json`;
    const filepath = path.join('uploads/metadata', filename);
    
    try {
      const data = await fs.readFile(filepath, 'utf8');
      const metadata = JSON.parse(data);
      
      res.json(metadata);
      
    } catch (fileError) {
      if (fileError.code === 'ENOENT') {
        return res.status(404).json({
          error: 'Metadata not found',
          message: 'No metadata found with the provided ID'
        });
      }
      throw fileError;
    }
    
  } catch (error) {
    console.error('Get metadata error:', error);
    res.status(500).json({
      error: 'Failed to get metadata',
      message: error.message
    });
  }
});

// Update metadata
router.put('/:metadataId', async (req, res) => {
  try {
    const { metadataId } = req.params;
    const {
      name,
      description,
      imageUrl,
      attributes = [],
      externalUrl,
      animationUrl,
      backgroundColor
    } = req.body;
    
    const filename = `${metadataId}.json`;
    const filepath = path.join('uploads/metadata', filename);
    
    // Check if file exists
    try {
      await fs.access(filepath);
    } catch {
      return res.status(404).json({
        error: 'Metadata not found',
        message: 'No metadata found with the provided ID'
      });
    }
    
    // Create updated metadata
    const metadata = {
      name: name || 'Unnamed Token',
      description: description || '',
      image: imageUrl || '',
      external_url: externalUrl || '',
      attributes: attributes.map(attr => ({
        trait_type: attr.trait_type || attr.traitType,
        value: attr.value,
        display_type: attr.display_type || attr.displayType,
        max_value: attr.max_value || attr.maxValue
      }))
    };
    
    if (animationUrl) metadata.animation_url = animationUrl;
    if (backgroundColor) metadata.background_color = backgroundColor;
    
    // Save updated metadata
    await fs.writeFile(filepath, JSON.stringify(metadata, null, 2));
    
    const metadataUrl = `${req.protocol}://${req.get('host')}/uploads/metadata/${filename}`;
    
    res.json({
      success: true,
      metadata: {
        id: metadataId,
        url: metadataUrl,
        filename,
        data: metadata
      }
    });
    
  } catch (error) {
    console.error('Update metadata error:', error);
    res.status(500).json({
      error: 'Failed to update metadata',
      message: error.message
    });
  }
});

// Delete metadata
router.delete('/:metadataId', async (req, res) => {
  try {
    const { metadataId } = req.params;
    
    const filename = `${metadataId}.json`;
    const filepath = path.join('uploads/metadata', filename);
    
    try {
      await fs.unlink(filepath);
      
      res.json({
        success: true,
        message: 'Metadata deleted successfully'
      });
      
    } catch (fileError) {
      if (fileError.code === 'ENOENT') {
        return res.status(404).json({
          error: 'Metadata not found',
          message: 'No metadata found with the provided ID'
        });
      }
      throw fileError;
    }
    
  } catch (error) {
    console.error('Delete metadata error:', error);
    res.status(500).json({
      error: 'Failed to delete metadata',
      message: error.message
    });
  }
});

// List metadata files
router.get('/', async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    
    const metadataDir = 'uploads/metadata';
    
    try {
      const files = await fs.readdir(metadataDir);
      const jsonFiles = files.filter(f => f.endsWith('.json'));
      
      // Sort by modification time (newest first)
      const fileStats = await Promise.all(
        jsonFiles.map(async (filename) => {
          const stats = await fs.stat(path.join(metadataDir, filename));
          return { filename, modifiedAt: stats.mtime };
        })
      );
      
      fileStats.sort((a, b) => b.modifiedAt - a.modifiedAt);
      
      // Apply pagination
      const paginatedFiles = fileStats.slice(
        parseInt(offset),
        parseInt(offset) + parseInt(limit)
      );
      
      const metadataList = await Promise.all(
        paginatedFiles.map(async ({ filename, modifiedAt }) => {
          try {
            const data = await fs.readFile(path.join(metadataDir, filename), 'utf8');
            const metadata = JSON.parse(data);
            const metadataId = filename.replace('.json', '');
            
            return {
              id: metadataId,
              url: `${req.protocol}://${req.get('host')}/uploads/metadata/${filename}`,
              filename,
              name: metadata.name,
              description: metadata.description?.substring(0, 100) + (metadata.description?.length > 100 ? '...' : ''),
              imageUrl: metadata.image,
              attributeCount: metadata.attributes?.length || 0,
              modifiedAt
            };
          } catch (parseError) {
            return {
              id: filename.replace('.json', ''),
              filename,
              error: 'Could not parse metadata',
              modifiedAt
            };
          }
        })
      );
      
      res.json({
        success: true,
        metadata: metadataList.filter(m => !m.error),
        pagination: {
          total: jsonFiles.length,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: (parseInt(offset) + parseInt(limit)) < jsonFiles.length
        }
      });
      
    } catch (dirError) {
      if (dirError.code === 'ENOENT') {
        return res.json({
          success: true,
          metadata: [],
          pagination: {
            total: 0,
            limit: parseInt(limit),
            offset: parseInt(offset),
            hasMore: false
          }
        });
      }
      throw dirError;
    }
    
  } catch (error) {
    console.error('List metadata error:', error);
    res.status(500).json({
      error: 'Failed to list metadata',
      message: error.message
    });
  }
});

// Generate collection metadata template
router.post('/template', async (req, res) => {
  try {
    const {
      collectionName,
      tokenCount,
      baseImageUrl,
      baseDescription,
      commonAttributes = [],
      variableAttributes = []
    } = req.body;
    
    if (!collectionName || !tokenCount || !baseImageUrl) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'collectionName, tokenCount, and baseImageUrl are required'
      });
    }
    
    const templates = [];
    
    for (let i = 1; i <= tokenCount; i++) {
      const metadata = {
        name: `${collectionName} #${i}`,
        description: baseDescription || `${collectionName} token #${i}`,
        image: `${baseImageUrl}/${i}.png`,
        external_url: '',
        attributes: [
          ...commonAttributes,
          {
            trait_type: 'Token ID',
            value: i,
            display_type: 'number'
          },
          ...variableAttributes.map(attr => ({
            trait_type: attr.trait_type,
            value: attr.values[Math.floor(Math.random() * attr.values.length)],
            display_type: attr.display_type
          }))
        ]
      };
      
      templates.push({
        tokenId: i,
        metadata
      });
    }
    
    res.json({
      success: true,
      templates,
      count: tokenCount,
      collectionName
    });
    
  } catch (error) {
    console.error('Generate template error:', error);
    res.status(500).json({
      error: 'Failed to generate template',
      message: error.message
    });
  }
});

module.exports = router;