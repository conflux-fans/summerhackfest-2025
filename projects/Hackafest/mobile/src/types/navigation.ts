export type RootStackParamList = {
  Main: undefined;
  CodeInput: {
    type: 'connect' | 'verify';
  };
  NFTDetail: {
    nft: {
      id: string;
      tokenId: string;
      name: string;
      description: string;
      image: string;
      contractAddress: string;
      rarity: string;
      traits: Record<string, string>;
      owner: string;
    };
  };
};

export type TabParamList = {
  Home: undefined;
  Wallet: undefined;
  Verify: undefined;
  Events: undefined;
  Settings: undefined;
};

export type Wallet = {
  address: string;
  connected: boolean;
  balance: string;
  chainId: number;
};

export type NFT = {
  id: string;
  tokenId: string;
  name: string;
  description: string;
  image: string;
  contractAddress: string;
  rarity: string;
  traits: Record<string, string>;
  owner: string;
  verified?: boolean;
};

export type VerificationResult = {
  success: boolean;
  tokenId?: string;
  eventName?: string;
  location?: string;
  timestamp: string;
  method: 'signature' | 'qr-code' | 'nfc';
  reason?: string;
};

export type Event = {
  id: string;
  name: string;
  description: string;
  location: string;
  date: string;
  time: string;
  requiredNFTs: string[];
  maxAttendees: number;
  currentAttendees: number;
  status: 'upcoming' | 'live' | 'ended';
};
