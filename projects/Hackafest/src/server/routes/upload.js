const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;
const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 10 // Max 10 files at once
  },
  fileFilter: (req, file, cb) => {
    // Allow images only
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Ensure upload directories exist
const ensureUploadDirs = async () => {
  const dirs = ['uploads/images', 'uploads/thumbnails', 'uploads/metadata'];
  
  for (const dir of dirs) {
    try {
      await fs.mkdir(dir, { recursive: true });
    } catch (error) {
      console.error(`Error creating directory ${dir}:`, error);
    }
  }
};

// Initialize upload directories
ensureUploadDirs();

// Upload single image
router.post('/image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No image file provided',
        message: 'Please select an image to upload'
      });
    }
    
    const { originalname, mimetype, buffer } = req.file;
    const { width, height, quality = 85 } = req.query;
    
    // Generate unique filename
    const fileId = uuidv4();
    const ext = path.extname(originalname).toLowerCase() || '.jpg';
    const filename = `${fileId}${ext}`;
    const filepath = path.join('uploads/images', filename);
    const thumbnailPath = path.join('uploads/thumbnails', `thumb_${filename}`);
    
    // Process main image
    let imageProcessor = sharp(buffer);
    
    // Resize if dimensions provided
    if (width || height) {
      imageProcessor = imageProcessor.resize(
        width ? parseInt(width) : null,
        height ? parseInt(height) : null,
        { 
          fit: 'inside',
          withoutEnlargement: true
        }
      );
    }
    
    // Set quality and format
    if (mimetype === 'image/png') {
      imageProcessor = imageProcessor.png({ quality: parseInt(quality) });
    } else {
      imageProcessor = imageProcessor.jpeg({ quality: parseInt(quality) });
    }
    
    // Save main image
    await imageProcessor.toFile(filepath);
    
    // Create thumbnail (300x300)
    await sharp(buffer)
      .resize(300, 300, { 
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 80 })
      .toFile(thumbnailPath);
    
    // Get image metadata
    const metadata = await sharp(filepath).metadata();
    
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/images/${filename}`;
    const thumbnailUrl = `${req.protocol}://${req.get('host')}/uploads/thumbnails/thumb_${filename}`;
    
    res.json({
      success: true,
      image: {
        id: fileId,
        url: imageUrl,
        thumbnailUrl,
        filename,
        originalName: originalname,
        size: metadata.size,
        width: metadata.width,
        height: metadata.height,
        format: metadata.format
      }
    });
    
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({
      error: 'Upload failed',
      message: error.message
    });
  }
});

// Upload multiple images
router.post('/images', upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        error: 'No image files provided',
        message: 'Please select images to upload'
      });
    }
    
    const { quality = 85 } = req.query;
    const results = [];
    
    for (const file of req.files) {
      try {
        const { originalname, mimetype, buffer } = file;
        
        // Generate unique filename
        const fileId = uuidv4();
        const ext = path.extname(originalname).toLowerCase() || '.jpg';
        const filename = `${fileId}${ext}`;
        const filepath = path.join('uploads/images', filename);
        const thumbnailPath = path.join('uploads/thumbnails', `thumb_${filename}`);
        
        // Process image
        let imageProcessor = sharp(buffer);
        
        if (mimetype === 'image/png') {
          imageProcessor = imageProcessor.png({ quality: parseInt(quality) });
        } else {
          imageProcessor = imageProcessor.jpeg({ quality: parseInt(quality) });
        }
        
        // Save main image
        await imageProcessor.toFile(filepath);
        
        // Create thumbnail
        await sharp(buffer)
          .resize(300, 300, { 
            fit: 'cover',
            position: 'center'
          })
          .jpeg({ quality: 80 })
          .toFile(thumbnailPath);
        
        // Get metadata
        const metadata = await sharp(filepath).metadata();
        
        const imageUrl = `${req.protocol}://${req.get('host')}/uploads/images/${filename}`;
        const thumbnailUrl = `${req.protocol}://${req.get('host')}/uploads/thumbnails/thumb_${filename}`;
        
        results.push({
          id: fileId,
          url: imageUrl,
          thumbnailUrl,
          filename,
          originalName: originalname,
          size: metadata.size,
          width: metadata.width,
          height: metadata.height,
          format: metadata.format
        });
        
      } catch (fileError) {
        console.error(`Error processing file ${file.originalname}:`, fileError);
        results.push({
          error: true,
          filename: file.originalname,
          message: fileError.message
        });
      }
    }
    
    res.json({
      success: true,
      images: results,
      uploaded: results.filter(r => !r.error).length,
      failed: results.filter(r => r.error).length
    });
    
  } catch (error) {
    console.error('Multiple image upload error:', error);
    res.status(500).json({
      error: 'Upload failed',
      message: error.message
    });
  }
});

// Delete image
router.delete('/image/:imageId', async (req, res) => {
  try {
    const { imageId } = req.params;
    
    // Find files with this ID
    const imagesDir = 'uploads/images';
    const thumbnailsDir = 'uploads/thumbnails';
    
    const files = await fs.readdir(imagesDir);
    const thumbnails = await fs.readdir(thumbnailsDir);
    
    const imageFile = files.find(f => f.startsWith(imageId));
    const thumbnailFile = thumbnails.find(f => f.includes(imageId));
    
    const deletedFiles = [];
    
    // Delete main image
    if (imageFile) {
      await fs.unlink(path.join(imagesDir, imageFile));
      deletedFiles.push(imageFile);
    }
    
    // Delete thumbnail
    if (thumbnailFile) {
      await fs.unlink(path.join(thumbnailsDir, thumbnailFile));
      deletedFiles.push(thumbnailFile);
    }
    
    if (deletedFiles.length === 0) {
      return res.status(404).json({
        error: 'Image not found',
        message: 'No image found with the provided ID'
      });
    }
    
    res.json({
      success: true,
      message: 'Image deleted successfully',
      deletedFiles
    });
    
  } catch (error) {
    console.error('Image deletion error:', error);
    res.status(500).json({
      error: 'Deletion failed',
      message: error.message
    });
  }
});

// Get image info
router.get('/image/:imageId', async (req, res) => {
  try {
    const { imageId } = req.params;
    
    const imagesDir = 'uploads/images';
    const files = await fs.readdir(imagesDir);
    const imageFile = files.find(f => f.startsWith(imageId));
    
    if (!imageFile) {
      return res.status(404).json({
        error: 'Image not found',
        message: 'No image found with the provided ID'
      });
    }
    
    const filepath = path.join(imagesDir, imageFile);
    const metadata = await sharp(filepath).metadata();
    const stats = await fs.stat(filepath);
    
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/images/${imageFile}`;
    const thumbnailUrl = `${req.protocol}://${req.get('host')}/uploads/thumbnails/thumb_${imageFile}`;
    
    res.json({
      success: true,
      image: {
        id: imageId,
        url: imageUrl,
        thumbnailUrl,
        filename: imageFile,
        size: stats.size,
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        uploadedAt: stats.ctime
      }
    });
    
  } catch (error) {
    console.error('Get image info error:', error);
    res.status(500).json({
      error: 'Failed to get image info',
      message: error.message
    });
  }
});

// List uploaded images
router.get('/images', async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    
    const imagesDir = 'uploads/images';
    const files = await fs.readdir(imagesDir);
    
    // Sort by upload time (newest first)
    const fileStats = await Promise.all(
      files.map(async (filename) => {
        const stats = await fs.stat(path.join(imagesDir, filename));
        return { filename, uploadedAt: stats.ctime };
      })
    );
    
    fileStats.sort((a, b) => b.uploadedAt - a.uploadedAt);
    
    // Apply pagination
    const paginatedFiles = fileStats.slice(
      parseInt(offset),
      parseInt(offset) + parseInt(limit)
    );
    
    const images = await Promise.all(
      paginatedFiles.map(async ({ filename, uploadedAt }) => {
        try {
          const metadata = await sharp(path.join(imagesDir, filename)).metadata();
          const imageId = filename.split('.')[0];
          
          return {
            id: imageId,
            url: `${req.protocol}://${req.get('host')}/uploads/images/${filename}`,
            thumbnailUrl: `${req.protocol}://${req.get('host')}/uploads/thumbnails/thumb_${filename}`,
            filename,
            width: metadata.width,
            height: metadata.height,
            format: metadata.format,
            uploadedAt
          };
        } catch (metadataError) {
          return {
            id: filename.split('.')[0],
            filename,
            error: 'Could not read metadata',
            uploadedAt
          };
        }
      })
    );
    
    res.json({
      success: true,
      images: images.filter(img => !img.error),
      pagination: {
        total: files.length,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: (parseInt(offset) + parseInt(limit)) < files.length
      }
    });
    
  } catch (error) {
    console.error('List images error:', error);
    res.status(500).json({
      error: 'Failed to list images',
      message: error.message
    });
  }
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        error: 'File too large',
        message: 'Image must be smaller than 10MB'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(413).json({
        error: 'Too many files',
        message: 'Maximum 10 files allowed'
      });
    }
  }
  
  res.status(500).json({
    error: 'Upload error',
    message: error.message
  });
});

module.exports = router;