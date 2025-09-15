const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const Device = require('../models/Device');
const { verifySignature } = require('../utils/crypto');
const { rateLimiter } = require('../middleware/rateLimiter');

// Generate pairing code
router.post('/generate-code', rateLimiter, async (req, res) => {
  try {
    const { walletAddress, deviceName, deviceType, platform } = req.body;
    
    if (!walletAddress || !deviceName) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'walletAddress and deviceName are required'
      });
    }
    
    // Create new device entry
    const device = new Device({
      deviceId: uuidv4(),
      walletAddress: walletAddress.toLowerCase(),
      deviceName: deviceName.trim(),
      deviceType: deviceType || 'mobile',
      platform: platform || 'web',
      isActive: true,
      isTrusted: false,
      lastIpAddress: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    // Generate pairing code
    const pairingCode = device.generatePairingCode();
    await device.save();
    
    res.json({
      success: true,
      pairingCode,
      deviceId: device.deviceId,
      expiresAt: device.pairingCodeExpiry,
      pairingLink: `${process.env.FRONTEND_URL}/pair?code=${pairingCode}`
    });
    
  } catch (error) {
    console.error('Generate pairing code error:', error);
    res.status(500).json({
      error: 'Failed to generate pairing code',
      message: error.message
    });
  }
});

// Verify pairing code and complete pairing
router.post('/verify-code', rateLimiter, async (req, res) => {
  try {
    const { pairingCode, signature, message, walletAddress } = req.body;
    
    if (!pairingCode || !signature || !message || !walletAddress) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'pairingCode, signature, message, and walletAddress are required'
      });
    }
    
    // Find device by pairing code
    const device = await Device.findByPairingCode(pairingCode);
    if (!device) {
      return res.status(404).json({
        error: 'Invalid or expired pairing code',
        message: 'Please generate a new pairing code'
      });
    }
    
    // Verify the wallet address matches
    if (device.walletAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      return res.status(403).json({
        error: 'Wallet address mismatch',
        message: 'The wallet address does not match the pairing request'
      });
    }
    
    // Verify signature
    const isValidSignature = await verifySignature(message, signature, walletAddress);
    if (!isValidSignature) {
      return res.status(403).json({
        error: 'Invalid signature',
        message: 'Signature verification failed'
      });
    }
    
    // Complete pairing
    device.lastSignature = signature;
    await device.completePairing();
    
    res.json({
      success: true,
      deviceId: device.deviceId,
      deviceName: device.deviceName,
      pairedAt: device.pairedAt,
      message: 'Device successfully paired'
    });
    
  } catch (error) {
    console.error('Verify pairing code error:', error);
    res.status(500).json({
      error: 'Failed to verify pairing code',
      message: error.message
    });
  }
});

// Get paired devices for a wallet
router.get('/devices/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    
    const devices = await Device.getActiveDevices(walletAddress);
    
    const deviceList = devices.map(device => ({
      deviceId: device.deviceId,
      deviceName: device.deviceName,
      deviceType: device.deviceType,
      platform: device.platform,
      isTrusted: device.isTrusted,
      lastUsed: device.lastUsed,
      pairedAt: device.pairedAt,
      totalVerifications: device.totalVerifications
    }));
    
    res.json({
      success: true,
      devices: deviceList,
      count: deviceList.length
    });
    
  } catch (error) {
    console.error('Get devices error:', error);
    res.status(500).json({
      error: 'Failed to get devices',
      message: error.message
    });
  }
});

// Revoke a specific device
router.delete('/devices/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { walletAddress, signature, message } = req.body;
    
    if (!walletAddress || !signature || !message) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'walletAddress, signature, and message are required'
      });
    }
    
    // Find the device
    const device = await Device.findOne({ deviceId, isActive: true });
    if (!device) {
      return res.status(404).json({
        error: 'Device not found',
        message: 'Device not found or already revoked'
      });
    }
    
    // Verify ownership
    if (device.walletAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      return res.status(403).json({
        error: 'Unauthorized',
        message: 'You can only revoke your own devices'
      });
    }
    
    // Verify signature
    const isValidSignature = await verifySignature(message, signature, walletAddress);
    if (!isValidSignature) {
      return res.status(403).json({
        error: 'Invalid signature',
        message: 'Signature verification failed'
      });
    }
    
    // Revoke the device
    await device.revoke();
    
    res.json({
      success: true,
      message: 'Device successfully revoked'
    });
    
  } catch (error) {
    console.error('Revoke device error:', error);
    res.status(500).json({
      error: 'Failed to revoke device',
      message: error.message
    });
  }
});

// Revoke all devices for a wallet
router.delete('/devices', async (req, res) => {
  try {
    const { walletAddress, signature, message } = req.body;
    
    if (!walletAddress || !signature || !message) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'walletAddress, signature, and message are required'
      });
    }
    
    // Verify signature
    const isValidSignature = await verifySignature(message, signature, walletAddress);
    if (!isValidSignature) {
      return res.status(403).json({
        error: 'Invalid signature',
        message: 'Signature verification failed'
      });
    }
    
    // Revoke all devices
    const result = await Device.updateMany(
      { 
        walletAddress: walletAddress.toLowerCase(), 
        isActive: true 
      },
      { 
        isActive: false, 
        isTrusted: false 
      }
    );
    
    res.json({
      success: true,
      revokedCount: result.modifiedCount,
      message: `Successfully revoked ${result.modifiedCount} devices`
    });
    
  } catch (error) {
    console.error('Revoke all devices error:', error);
    res.status(500).json({
      error: 'Failed to revoke devices',
      message: error.message
    });
  }
});

// Update device last used (for tracking)
router.patch('/devices/:deviceId/ping', async (req, res) => {
  try {
    const { deviceId } = req.params;
    
    const device = await Device.findOne({ deviceId, isActive: true });
    if (!device) {
      return res.status(404).json({
        error: 'Device not found',
        message: 'Device not found or not active'
      });
    }
    
    await device.updateLastUsed();
    
    res.json({
      success: true,
      lastUsed: device.lastUsed
    });
    
  } catch (error) {
    console.error('Device ping error:', error);
    res.status(500).json({
      error: 'Failed to update device',
      message: error.message
    });
  }
});

// Cleanup expired pairing codes (internal endpoint)
router.post('/cleanup', async (req, res) => {
  try {
    const result = await Device.cleanupExpiredCodes();
    
    res.json({
      success: true,
      cleanedUp: result.modifiedCount,
      message: `Cleaned up ${result.modifiedCount} expired pairing codes`
    });
    
  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({
      error: 'Failed to cleanup',
      message: error.message
    });
  }
});

module.exports = router;