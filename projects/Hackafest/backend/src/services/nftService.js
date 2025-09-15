// Mock NFT data for demo
const mockNFTs = [
  {
    id: '1',
    tokenId: '42',
    contractAddress: '0x1234567890123456789012345678901234567890',
    owner: '0x742d35cc61b8000000000000000000000000000',
    name: 'VIP Access Pass #42',
    description: 'Premium access to exclusive events',
    image: 'https://via.placeholder.com/300x300/22D3EE/FFFFFF?text=VIP+Pass',
    rarity: 'Epic',
    traits: {
      'Tier': 'Gold',
      'Validity': '1 Year',
      'Benefits': 'Premium'
    },
    verified: true,
    createdAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    tokenId: '128',
    contractAddress: '0x2345678901234567890123456789012345678901',
    owner: '0x742d35cc61b8000000000000000000000000000',
    name: 'Concert Ticket #128',
    description: 'Front row seat access',
    image: 'https://via.placeholder.com/300x300/22C55E/FFFFFF?text=Concert',
    rarity: 'Legendary',
    traits: {
      'Section': 'Front Row',
      'Date': '2024-03-15',
      'Venue': 'Arena Hall'
    },
    verified: true,
    createdAt: '2024-01-20T14:20:00Z'
  },
  {
    id: '3',
    tokenId: '1',
    contractAddress: '0x3456789012345678901234567890123456789012',
    owner: '0x742d35cc61b8000000000000000000000000000',
    name: 'Exclusive Art Piece #1',
    description: 'A unique digital artwork with real-world access benefits',
    image: 'https://via.placeholder.com/300x300/8B5CF6/FFFFFF?text=Art+Piece',
    rarity: 'Legendary',
    traits: {
      'Artist': 'Digital Creator',
      'Style': 'Abstract',
      'Access': 'Gallery VIP',
      'Rarity': 'Legendary'
    },
    verified: false,
    createdAt: '2024-01-25T09:15:00Z'
  }
];

// Get NFTs owned by wallet
const getNFTsByWallet = async (walletAddress, options = {}) => {
  try {
    const { contractAddress, limit = 50, offset = 0 } = options;
    
    let filteredNFTs = mockNFTs.filter(nft => 
      nft.owner.toLowerCase() === walletAddress.toLowerCase()
    );
    
    // Filter by contract address if provided
    if (contractAddress) {
      filteredNFTs = filteredNFTs.filter(nft => 
        nft.contractAddress.toLowerCase() === contractAddress.toLowerCase()
      );
    }
    
    // Apply pagination
    const startIndex = parseInt(offset);
    const endIndex = startIndex + parseInt(limit);
    const paginatedNFTs = filteredNFTs.slice(startIndex, endIndex);
    
    return paginatedNFTs;
  } catch (error) {
    console.error('Get NFTs by wallet error:', error);
    throw error;
  }
};

// Get NFT details
const getNFTDetails = async (contractAddress, tokenId) => {
  try {
    const nft = mockNFTs.find(n => 
      n.contractAddress.toLowerCase() === contractAddress.toLowerCase() &&
      n.tokenId === tokenId
    );
    
    return nft || null;
  } catch (error) {
    console.error('Get NFT details error:', error);
    throw error;
  }
};

// Get NFT metadata
const getNFTMetadata = async (contractAddress, tokenId) => {
  try {
    const nft = await getNFTDetails(contractAddress, tokenId);
    
    if (!nft) {
      return null;
    }
    
    return {
      name: nft.name,
      description: nft.description,
      image: nft.image,
      attributes: Object.entries(nft.traits).map(([trait_type, value]) => ({
        trait_type,
        value
      })),
      external_url: `https://nfticket.app/nft/${contractAddress}/${tokenId}`,
      background_color: '0B0F14',
      animation_url: null
    };
  } catch (error) {
    console.error('Get NFT metadata error:', error);
    throw error;
  }
};

// Verify NFT ownership
const verifyNFTOwnership = async (walletAddress, contractAddress, tokenId) => {
  try {
    const nft = await getNFTDetails(contractAddress, tokenId);
    
    if (!nft) {
      return {
        success: false,
        reason: 'NFT not found'
      };
    }
    
    const isOwner = nft.owner.toLowerCase() === walletAddress.toLowerCase();
    
    return {
      success: isOwner,
      reason: isOwner ? null : 'NFT not owned by this wallet',
      nft: isOwner ? nft : null
    };
  } catch (error) {
    console.error('Verify NFT ownership error:', error);
    throw error;
  }
};

// Get NFT collection info
const getCollectionInfo = async (contractAddress) => {
  try {
    const collectionNFTs = mockNFTs.filter(nft => 
      nft.contractAddress.toLowerCase() === contractAddress.toLowerCase()
    );
    
    if (collectionNFTs.length === 0) {
      return null;
    }
    
    const totalSupply = collectionNFTs.length;
    const verifiedCount = collectionNFTs.filter(nft => nft.verified).length;
    
    // Get unique traits
    const allTraits = {};
    collectionNFTs.forEach(nft => {
      Object.entries(nft.traits).forEach(([key, value]) => {
        if (!allTraits[key]) {
          allTraits[key] = new Set();
        }
        allTraits[key].add(value);
      });
    });
    
    const traitCounts = {};
    Object.entries(allTraits).forEach(([key, values]) => {
      traitCounts[key] = Array.from(values).length;
    });
    
    return {
      contractAddress,
      totalSupply,
      verifiedCount,
      traitCounts,
      rarityDistribution: {
        'Common': collectionNFTs.filter(nft => nft.rarity === 'Common').length,
        'Uncommon': collectionNFTs.filter(nft => nft.rarity === 'Uncommon').length,
        'Rare': collectionNFTs.filter(nft => nft.rarity === 'Rare').length,
        'Epic': collectionNFTs.filter(nft => nft.rarity === 'Epic').length,
        'Legendary': collectionNFTs.filter(nft => nft.rarity === 'Legendary').length
      }
    };
  } catch (error) {
    console.error('Get collection info error:', error);
    throw error;
  }
};

// Search NFTs
const searchNFTs = async (query, options = {}) => {
  try {
    const { walletAddress, contractAddress, rarity, verified, limit = 20, offset = 0 } = options;
    
    let filteredNFTs = [...mockNFTs];
    
    // Filter by wallet address
    if (walletAddress) {
      filteredNFTs = filteredNFTs.filter(nft => 
        nft.owner.toLowerCase() === walletAddress.toLowerCase()
      );
    }
    
    // Filter by contract address
    if (contractAddress) {
      filteredNFTs = filteredNFTs.filter(nft => 
        nft.contractAddress.toLowerCase() === contractAddress.toLowerCase()
      );
    }
    
    // Filter by rarity
    if (rarity) {
      filteredNFTs = filteredNFTs.filter(nft => 
        nft.rarity.toLowerCase() === rarity.toLowerCase()
      );
    }
    
    // Filter by verified status
    if (verified !== undefined) {
      filteredNFTs = filteredNFTs.filter(nft => nft.verified === verified);
    }
    
    // Search by name or description
    if (query) {
      const searchTerm = query.toLowerCase();
      filteredNFTs = filteredNFTs.filter(nft => 
        nft.name.toLowerCase().includes(searchTerm) ||
        nft.description.toLowerCase().includes(searchTerm)
      );
    }
    
    // Apply pagination
    const startIndex = parseInt(offset);
    const endIndex = startIndex + parseInt(limit);
    const paginatedNFTs = filteredNFTs.slice(startIndex, endIndex);
    
    return {
      nfts: paginatedNFTs,
      total: filteredNFTs.length,
      hasMore: endIndex < filteredNFTs.length
    };
  } catch (error) {
    console.error('Search NFTs error:', error);
    throw error;
  }
};

module.exports = {
  getNFTsByWallet,
  getNFTDetails,
  getNFTMetadata,
  verifyNFTOwnership,
  getCollectionInfo,
  searchNFTs
};
