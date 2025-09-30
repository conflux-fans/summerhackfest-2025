const crypto = require('crypto');
const { ethers } = require('ethers');

// Generate a random nonce for wallet authentication
const generateNonce = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Verify signature against wallet address and nonce
const verifySignature = (walletAddress, signature, nonce) => {
  try {
    // In production, you would:
    // 1. Recover the address from the signature
    // 2. Compare it with the provided wallet address
    // 3. Verify the nonce was signed correctly
    
    // For demo purposes, we'll simulate verification
    // In real implementation, use ethers.js to verify:
    // const message = `Sign this message to authenticate: ${nonce}`;
    // const recoveredAddress = ethers.utils.verifyMessage(message, signature);
    // return recoveredAddress.toLowerCase() === walletAddress.toLowerCase();
    
    // Demo: accept any signature that's at least 10 characters
    return signature && signature.length >= 10;
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
};

// Generate a message for the user to sign
const generateSignMessage = (nonce) => {
  return `Sign this message to authenticate with NFTicket:\n\nNonce: ${nonce}\n\nThis request will not trigger a blockchain transaction or cost any gas fees.`;
};

// Verify message signature (production implementation)
const verifyMessageSignature = (message, signature, expectedAddress) => {
  try {
    const recoveredAddress = ethers.utils.verifyMessage(message, signature);
    return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
  } catch (error) {
    console.error('Message signature verification error:', error);
    return false;
  }
};

module.exports = {
  generateNonce,
  verifySignature,
  generateSignMessage,
  verifyMessageSignature
};
