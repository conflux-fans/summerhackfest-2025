// Simulation utilities for frontend demo
export interface MockWallet {
  address: string;
  connected: boolean;
  balance: string;
}

export interface MockCollection {
  id: string;
  contractAddress: string;
  name: string;
  symbol: string;
  description: string;
  category: string;
  imageUrl: string;
  creator: string;
  price: string;
  totalSupply: number;
  maxSupply: number;
  isActive: boolean;
  createdAt: string;
}

export interface MockNFT {
  tokenId: number;
  contractAddress: string;
  owner: string;
  name: string;
  description: string;
  imageUrl: string;
  traits: { trait_type: string; value: string }[];
  rarity: number;
}

export interface MockVerification {
  id: string;
  walletAddress: string;
  contractAddress: string;
  result: 'success' | 'failed';
  timestamp: string;
  reason?: string;
}

// Mock wallet state
let mockWallet: MockWallet = {
  address: '',
  connected: false,
  balance: '0'
};

// Mock collections data
const mockCollections: MockCollection[] = [
  {
    id: '1',
    contractAddress: '0x1234567890123456789012345678901234567890',
    name: 'VIP Access Pass',
    symbol: 'VIP',
    description: 'Exclusive access to premium events and venues',
    category: 'access',
    imageUrl: '/api/placeholder/400/300',
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
    imageUrl: '/api/placeholder/400/300',
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
    imageUrl: '/api/placeholder/400/300',
    creator: '0xcdef1234567890abcdef1234567890abcdef1234',
    price: '0.1',
    totalSupply: 200,
    maxSupply: 300,
    isActive: true,
    createdAt: '2024-01-25T09:15:00Z'
  }
];

// Mock NFTs owned by user
const mockUserNFTs: MockNFT[] = [
  {
    tokenId: 42,
    contractAddress: '0x1234567890123456789012345678901234567890',
    owner: '0x742d35cc61b8000000000000000000000000000',
    name: 'VIP Access Pass #42',
    description: 'Premium access to exclusive events',
    imageUrl: '/nft.webp',
    traits: [
      { trait_type: 'Tier', value: 'Gold' },
      { trait_type: 'Validity', value: '1 Year' },
      { trait_type: 'Benefits', value: 'Premium' }
    ],
    rarity: 85
  },
  {
    tokenId: 128,
    contractAddress: '0x2345678901234567890123456789012345678901',
    owner: '0x742d35cc61b8000000000000000000000000000',
    name: 'Concert Ticket #128',
    description: 'Front row seat access',
    imageUrl: '/nft.webp',
    traits: [
      { trait_type: 'Section', value: 'Front Row' },
      { trait_type: 'Date', value: '2024-03-15' },
      { trait_type: 'Venue', value: 'Arena Hall' }
    ],
    rarity: 95
  },
  {
    tokenId: 1,
    contractAddress: '0x3456789012345678901234567890123456789012',
    owner: '0x742d35cc61b8000000000000000000000000000',
    name: 'Exclusive Art Piece #1',
    description: 'A unique digital artwork with real-world access benefits',
    imageUrl: '/nft.webp',
    traits: [
      { trait_type: 'Artist', value: 'Digital Creator' },
      { trait_type: 'Style', value: 'Abstract' },
      { trait_type: 'Access', value: 'Gallery VIP' },
      { trait_type: 'Rarity', value: 'Legendary' }
    ],
    rarity: 98
  }
];

// Mock verification history
export interface MockVerificationDetailed extends MockVerification {
  tokenId?: number;
  eventName?: string;
  location?: string;
  verificationMethod: 'signature' | 'session-code' | 'mobile-app';
  deviceInfo?: string;
  sessionCode?: string;
  ipAddress?: string;
  organizerId?: string;
}

let mockVerifications: MockVerificationDetailed[] = [
  {
    id: 'v1',
    walletAddress: '0x742d35cc61b8000000000000000000000000000',
    contractAddress: '0x1234567890123456789012345678901234567890',
    result: 'success',
    timestamp: '2024-01-28T15:30:00Z',
    tokenId: 42,
    eventName: 'VIP Conference Access - Opening Night',
    location: 'Convention Center, Hall A',
    verificationMethod: 'signature',
    organizerId: '0xabcdef1234567890abcdef1234567890abcdef12'
  },
  {
    id: 'v2',
    walletAddress: '0x742d35cc61b8000000000000000000000000000',
    contractAddress: '0x2345678901234567890123456789012345678901',
    result: 'success',
    timestamp: '2024-01-27T20:45:00Z',
    tokenId: 128,
    eventName: 'Front Row Concert Access',
    location: 'Arena Hall, Section A',
    verificationMethod: 'session-code',
    sessionCode: '123456',
    organizerId: '0xbcdef1234567890abcdef1234567890abcdef123'
  },
  {
    id: 'v3',
    walletAddress: '0x742d35cc61b8000000000000000000000000000',
    contractAddress: '0x1234567890123456789012345678901234567890',
    result: 'success',
    timestamp: '2024-01-26T14:15:00Z',
    tokenId: 42,
    eventName: 'VIP Lounge Access',
    location: 'Sky Lounge, Floor 20',
    verificationMethod: 'mobile-app',
    deviceInfo: 'iPhone 15 Pro',
    organizerId: '0xabcdef1234567890abcdef1234567890abcdef12'
  },
  {
    id: 'v4',
    walletAddress: '0x742d35cc61b8000000000000000000000000000',
    contractAddress: '0x3456789012345678901234567890123456789012',
    result: 'failed',
    timestamp: '2024-01-25T18:22:00Z',
    reason: 'NFT does not meet minimum rarity requirement',
    eventName: 'Exclusive Member Event',
    location: 'Private Club, Downtown',
    verificationMethod: 'signature',
    organizerId: '0xcdef1234567890abcdef1234567890abcdef1234'
  },
  {
    id: 'v5',
    walletAddress: '0x742d35cc61b8000000000000000000000000000',
    contractAddress: '0x3456789012345678901234567890123456789012',
    result: 'success',
    timestamp: '2024-01-24T12:00:00Z',
    tokenId: 89,
    eventName: 'Gym Access - Morning Session',
    location: 'Premium Fitness Center',
    verificationMethod: 'signature',
    organizerId: '0xcdef1234567890abcdef1234567890abcdef1234'
  }
];

// Simulation functions
export const simulateWalletConnection = async (): Promise<MockWallet> => {
  // Simulate connection delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  mockWallet = {
    address: '0x742d35cc61b8000000000000000000000000000',
    connected: true,
    balance: '1.25'
  };
  
  return mockWallet;
};

export const simulateWalletDisconnection = async (): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  mockWallet = {
    address: '',
    connected: false,
    balance: '0'
  };
};

export const getWalletState = (): MockWallet => {
  return mockWallet;
};

export const simulateSignMessage = async (message: string): Promise<string> => {
  // Simulate signing delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  if (!mockWallet.connected) {
    throw new Error('Wallet not connected');
  }
  
  // Generate a mock signature
  return `0x${'a'.repeat(128)}${Math.random().toString(16).slice(2, 8)}`;
};

export const simulateGetCollections = async (): Promise<MockCollection[]> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  return [...mockCollections];
};

export const simulateGetCollection = async (contractAddress: string): Promise<MockCollection | null> => {
  await new Promise(resolve => setTimeout(resolve, 600));
  return mockCollections.find(c => c.contractAddress === contractAddress) || null;
};

export const simulateCreateCollection = async (collectionData: Partial<MockCollection>): Promise<MockCollection> => {
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  if (!mockWallet.connected) {
    throw new Error('Wallet not connected');
  }
  
  const newCollection: MockCollection = {
    id: Math.random().toString(36).substr(2, 9),
    contractAddress: `0x${Math.random().toString(16).slice(2, 42)}`,
    name: collectionData.name || 'New Collection',
    symbol: collectionData.symbol || 'NEW',
    description: collectionData.description || 'A new NFT collection',
    category: collectionData.category || 'other',
    imageUrl: collectionData.imageUrl || '/api/placeholder/400/300',
    creator: mockWallet.address,
    price: collectionData.price || '0.01',
    totalSupply: 0,
    maxSupply: collectionData.maxSupply || 1000,
    isActive: true,
    createdAt: new Date().toISOString()
  };
  
  mockCollections.push(newCollection);
  return newCollection;
};

export const simulateGetUserNFTs = async (walletAddress?: string): Promise<MockNFT[]> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const targetAddress = walletAddress || mockWallet.address;
  if (!targetAddress) return [];
  
  return mockUserNFTs.filter(nft => nft.owner.toLowerCase() === targetAddress.toLowerCase());
};

export const simulateVerifyOwnership = async (contractAddress: string, eventName?: string, location?: string): Promise<MockVerificationDetailed> => {
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  if (!mockWallet.connected) {
    throw new Error('Wallet not connected');
  }
  
  // Simulate success/failure based on whether user owns NFT in that collection
  const ownedNFT = mockUserNFTs.find(nft => 
    nft.contractAddress.toLowerCase() === contractAddress.toLowerCase() &&
    nft.owner.toLowerCase() === mockWallet.address.toLowerCase()
  );
  
  const verification: MockVerificationDetailed = {
    id: `v${Date.now()}`,
    walletAddress: mockWallet.address,
    contractAddress,
    result: ownedNFT ? 'success' : 'failed',
    timestamp: new Date().toISOString(),
    reason: ownedNFT ? undefined : 'No NFTs owned in this collection',
    tokenId: ownedNFT?.tokenId,
    eventName: eventName || 'NFT Ownership Verification',
    location: location || 'Online Verification',
    verificationMethod: 'signature',
    organizerId: mockCollections.find(c => c.contractAddress === contractAddress)?.creator
  };
  
  mockVerifications.push(verification);
  return verification;
};

export const simulateGetVerificationHistory = async (contractAddress?: string): Promise<MockVerificationDetailed[]> => {
  await new Promise(resolve => setTimeout(resolve, 600));
  
  let filtered = mockVerifications.filter(v => 
    v.walletAddress.toLowerCase() === mockWallet.address.toLowerCase()
  );
  
  if (contractAddress) {
    filtered = filtered.filter(v => 
      v.contractAddress.toLowerCase() === contractAddress.toLowerCase()
    );
  }
  
  return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const simulateGetCollectionVerifications = async (contractAddress: string): Promise<MockVerificationDetailed[]> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return mockVerifications
    .filter(v => v.contractAddress.toLowerCase() === contractAddress.toLowerCase())
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const simulateGenerateSessionCode = async (eventName?: string, location?: string): Promise<{ sessionCode: string; expiresAt: string }> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  if (!mockWallet.connected) {
    throw new Error('Wallet not connected');
  }
  
  const sessionCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour from now
  
  return { sessionCode, expiresAt };
};

export const simulateVerifyWalletOwnership = async (targetWalletAddress: string, contractAddress: string): Promise<{
  success: boolean;
  ownershipDetails?: {
    walletAddress: string;
    tokenIds: number[];
    balance: number;
    collectionName: string;
  };
  reason?: string;
}> => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Find the collection
  const collection = mockCollections.find(c => c.contractAddress.toLowerCase() === contractAddress.toLowerCase());
  if (!collection) {
    return {
      success: false,
      reason: 'Collection not found'
    };
  }
  
  // Check if the target wallet owns any NFTs in this collection
  const ownedNFTs = mockUserNFTs.filter(nft => 
    nft.contractAddress.toLowerCase() === contractAddress.toLowerCase() &&
    nft.owner.toLowerCase() === targetWalletAddress.toLowerCase()
  );
  
  if (ownedNFTs.length === 0) {
    return {
      success: false,
      reason: 'No NFTs owned in this collection'
    };
  }
  
  return {
    success: true,
    ownershipDetails: {
      walletAddress: targetWalletAddress,
      tokenIds: ownedNFTs.map(nft => nft.tokenId),
      balance: ownedNFTs.length,
      collectionName: collection.name
    }
  };
};

export const simulatePairDevice = async (): Promise<{ pairingCode: string; deviceId: string }> => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  if (!mockWallet.connected) {
    throw new Error('Wallet not connected');
  }
  
  return {
    pairingCode: Math.floor(100000 + Math.random() * 900000).toString(),
    deviceId: `device_${Math.random().toString(36).substr(2, 9)}`
  };
};

export const simulateUploadImage = async (file: File): Promise<{ url: string; thumbnailUrl: string }> => {
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Create a mock URL for the uploaded image
  const mockUrl = URL.createObjectURL(file);
  
  return {
    url: mockUrl,
    thumbnailUrl: mockUrl
  };
};

// Utility to add mock data for demo
export const addMockCollectionForDemo = () => {
  const demoCollection: MockCollection = {
    id: 'demo',
    contractAddress: '0xdemo123456789012345678901234567890123456',
    name: 'Demo Collection',
    symbol: 'DEMO',
    description: 'A demo collection for testing',
    category: 'demo',
    imageUrl: '/api/placeholder/400/300',
    creator: mockWallet.address,
    price: '0.001',
    totalSupply: 1,
    maxSupply: 100,
    isActive: true,
    createdAt: new Date().toISOString()
  };
  
  const demoNFT: MockNFT = {
    tokenId: 1,
    contractAddress: demoCollection.contractAddress,
    owner: mockWallet.address,
    name: 'Demo NFT #1',
    description: 'A demo NFT for testing verification',
    imageUrl: '/nft.webp',
    traits: [
      { trait_type: 'Type', value: 'Demo' },
      { trait_type: 'Rarity', value: 'Common' }
    ],
    rarity: 50
  };
  
  if (!mockCollections.find(c => c.id === 'demo')) {
    mockCollections.push(demoCollection);
  }
  
  if (!mockUserNFTs.find(n => n.contractAddress === demoCollection.contractAddress)) {
    mockUserNFTs.push(demoNFT);
  }
};

export const simulationNotice = "🎮 Demo Mode: All actions are simulated for demonstration purposes";