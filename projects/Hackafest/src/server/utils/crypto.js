const { ethers } = require('ethers');

// Initialize provider for Conflux Network
const getProvider = () => {
  const rpcUrl = process.env.CONFLUX_RPC_URL || 'https://evm.confluxrpc.com';
  return new ethers.JsonRpcProvider(rpcUrl);
};

// ERC-721 ABI for basic NFT functions
const ERC721_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
  "function totalSupply() view returns (uint256)",
  "function tokenURI(uint256 tokenId) view returns (string)"
];

// Our custom NFT contract ABI
const OWNERSHIP_NFT_ABI = [
  ...ERC721_ABI,
  "function verifyAccess(address holder) view returns (bool)",
  "function checkTimeValidity() view returns (bool)",
  "function getTokenTraits(uint256 tokenId) view returns (string)",
  "function getTokenRarity(uint256 tokenId) view returns (uint256)",
  "function accessRule() view returns (tuple(string ruleType, string traitType, string traitValue, uint256 minRarity, uint256 validityStart, uint256 validityEnd, bool transferable))",
  "function collectionInfo() view returns (tuple(string name, string symbol, string description, string category, uint256 royaltyPercentage, uint256 maxSupply, uint256 price, bool isActive, address creator))"
];

/**
 * Verify a signature against a message and wallet address
 * @param {string} message - The original message that was signed
 * @param {string} signature - The signature to verify
 * @param {string} walletAddress - The expected signer's address
 * @returns {Promise<boolean>} - True if signature is valid
 */
async function verifySignature(message, signature, walletAddress) {
  try {
    // Recover the address from the signature
    const recoveredAddress = ethers.verifyMessage(message, signature);
    
    // Compare addresses (case-insensitive)
    return recoveredAddress.toLowerCase() === walletAddress.toLowerCase();
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

/**
 * Verify NFT ownership and access rules on-chain
 * @param {string} contractAddress - The NFT contract address
 * @param {string} walletAddress - The wallet address to check
 * @param {Object} accessRule - The access rule to apply
 * @returns {Promise<Object>} - Verification result with details
 */
async function verifyNFTOwnership(contractAddress, walletAddress, accessRule) {
  try {
    const provider = getProvider();
    const contract = new ethers.Contract(contractAddress, OWNERSHIP_NFT_ABI, provider);
    
    // Check if collection is active
    const collectionInfo = await contract.collectionInfo();
    if (!collectionInfo.isActive) {
      return {
        success: false,
        reason: 'Collection is not active'
      };
    }
    
    // Check time validity
    const isTimeValid = await contract.checkTimeValidity();
    if (!isTimeValid) {
      return {
        success: false,
        reason: 'Access rule time validity check failed'
      };
    }
    
    // Get user's NFT balance
    const balance = await contract.balanceOf(walletAddress);
    const balanceNumber = Number(balance);
    
    if (balanceNumber === 0) {
      return {
        success: false,
        reason: 'No NFTs owned in this collection'
      };
    }
    
    // Use the contract's built-in verification
    const hasAccess = await contract.verifyAccess(walletAddress);
    
    if (!hasAccess) {
      return {
        success: false,
        reason: 'Access rule requirements not met'
      };
    }
    
    // Get token details for successful verification
    const tokenIds = [];
    const tokenTraits = [];
    
    try {
      // Get up to 10 tokens for details (to avoid gas limit issues)
      const maxTokensToCheck = Math.min(balanceNumber, 10);
      
      for (let i = 0; i < maxTokensToCheck; i++) {
        const tokenId = await contract.tokenOfOwnerByIndex(walletAddress, i);
        tokenIds.push(Number(tokenId));
        
        try {
          const traits = await contract.getTokenTraits(tokenId);
          const rarity = await contract.getTokenRarity(tokenId);
          
          tokenTraits.push({
            tokenId: Number(tokenId),
            traits: traits || '',
            rarity: Number(rarity)
          });
        } catch (traitError) {
          // Some tokens might not have traits set
          tokenTraits.push({
            tokenId: Number(tokenId),
            traits: '',
            rarity: 0
          });
        }
      }
    } catch (tokenError) {
      console.warn('Error getting token details:', tokenError);
      // Still allow verification to succeed even if we can't get token details
    }
    
    return {
      success: true,
      balance: balanceNumber,
      tokenIds,
      tokenTraits,
      accessRule: {
        ruleType: accessRule.ruleType,
        verified: true
      }
    };
    
  } catch (error) {
    console.error('NFT ownership verification error:', error);
    
    // Handle specific error types
    if (error.code === 'CALL_EXCEPTION') {
      return {
        success: false,
        reason: 'Contract call failed - invalid contract or network error'
      };
    }
    
    if (error.code === 'NETWORK_ERROR') {
      return {
        success: false,
        reason: 'Network error - please try again'
      };
    }
    
    return {
      success: false,
      reason: `Blockchain verification failed: ${error.message}`
    };
  }
}

/**
 * Get collection information from the blockchain
 * @param {string} contractAddress - The NFT contract address
 * @returns {Promise<Object>} - Collection information
 */
async function getCollectionInfo(contractAddress) {
  try {
    const provider = getProvider();
    const contract = new ethers.Contract(contractAddress, OWNERSHIP_NFT_ABI, provider);
    
    const [collectionInfo, accessRule, totalSupply] = await Promise.all([
      contract.collectionInfo(),
      contract.accessRule(),
      contract.totalSupply()
    ]);
    
    return {
      success: true,
      collection: {
        name: collectionInfo.name,
        symbol: collectionInfo.symbol,
        description: collectionInfo.description,
        category: collectionInfo.category,
        royaltyPercentage: Number(collectionInfo.royaltyPercentage),
        maxSupply: Number(collectionInfo.maxSupply),
        currentSupply: Number(totalSupply),
        price: ethers.formatEther(collectionInfo.price),
        isActive: collectionInfo.isActive,
        creator: collectionInfo.creator
      },
      accessRule: {
        ruleType: accessRule.ruleType,
        traitType: accessRule.traitType,
        traitValue: accessRule.traitValue,
        minRarity: Number(accessRule.minRarity),
        validityStart: new Date(Number(accessRule.validityStart) * 1000),
        validityEnd: accessRule.validityEnd > 0 ? new Date(Number(accessRule.validityEnd) * 1000) : null,
        transferable: accessRule.transferable
      }
    };
  } catch (error) {
    console.error('Get collection info error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get user's NFT tokens in a collection
 * @param {string} contractAddress - The NFT contract address
 * @param {string} walletAddress - The wallet address
 * @returns {Promise<Object>} - User's tokens
 */
async function getUserTokens(contractAddress, walletAddress) {
  try {
    const provider = getProvider();
    const contract = new ethers.Contract(contractAddress, OWNERSHIP_NFT_ABI, provider);
    
    const balance = await contract.balanceOf(walletAddress);
    const balanceNumber = Number(balance);
    
    if (balanceNumber === 0) {
      return {
        success: true,
        tokens: [],
        balance: 0
      };
    }
    
    const tokens = [];
    
    // Get token details (limit to prevent timeout)
    const maxTokens = Math.min(balanceNumber, 50);
    
    for (let i = 0; i < maxTokens; i++) {
      try {
        const tokenId = await contract.tokenOfOwnerByIndex(walletAddress, i);
        const tokenURI = await contract.tokenURI(tokenId);
        const traits = await contract.getTokenTraits(tokenId);
        const rarity = await contract.getTokenRarity(tokenId);
        
        tokens.push({
          tokenId: Number(tokenId),
          tokenURI,
          traits: traits || '',
          rarity: Number(rarity)
        });
      } catch (tokenError) {
        console.warn(`Error getting token ${i}:`, tokenError);
        // Continue with other tokens
      }
    }
    
    return {
      success: true,
      tokens,
      balance: balanceNumber,
      totalShown: tokens.length
    };
    
  } catch (error) {
    console.error('Get user tokens error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Validate a Conflux address
 * @param {string} address - The address to validate
 * @returns {boolean} - True if valid
 */
function isValidAddress(address) {
  try {
    return ethers.isAddress(address);
  } catch {
    return false;
  }
}

/**
 * Generate a verification message for signing
 * @param {string} action - The action being performed
 * @param {string} contractAddress - The contract address (optional)
 * @param {number} timestamp - Timestamp (optional)
 * @returns {string} - Message to sign
 */
function generateVerificationMessage(action, contractAddress = null, timestamp = null) {
  const ts = timestamp || Date.now();
  const baseMessage = `OWNERSHIP Platform\nAction: ${action}\nTimestamp: ${ts}`;
  
  if (contractAddress) {
    return `${baseMessage}\nContract: ${contractAddress}`;
  }
  
  return baseMessage;
}

module.exports = {
  verifySignature,
  verifyNFTOwnership,
  getCollectionInfo,
  getUserTokens,
  isValidAddress,
  generateVerificationMessage,
  getProvider
};