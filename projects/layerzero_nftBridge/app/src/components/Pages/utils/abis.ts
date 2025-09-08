export const ESPACE_BRIDGE_ABI = [
  {
    "inputs": [
      { "name": "_dstEid", "type": "uint32" },
      { "name": "_tokenId", "type": "uint256" },
      { "name": "_recipient", "type": "address" },
      { "name": "_options", "type": "bytes" }
    ],
    "name": "bridgeOut",
    "outputs": [
      {
        "components": [
          { "name": "msgId", "type": "bytes32" },
          { "name": "guid", "type": "bytes32" },
          { "name": "nonce", "type": "uint64" },
          { "name": "fee", "type": "uint256" }
        ],
        "name": "receipt",
        "type": "tuple"
      }
    ],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "_dstEid", "type": "uint32" },
      { "name": "_tokenId", "type": "uint256" },
      { "name": "_recipient", "type": "address" },
      { "name": "_options", "type": "bytes" }
    ],
    "name": "quoteBridgeOut",
    "outputs": [
      {
        "components": [
          { "name": "nativeFee", "type": "uint256" },
          { "name": "lzTokenFee", "type": "uint256" }
        ],
        "name": "fee",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "name": "_eid", "type": "uint32" }],
    "name": "peers",
    "outputs": [{ "name": "", "type": "bytes32" }],
    "stateMutability": "view",
    "type": "function"
  }
];

export const BASE_WRAPPED_ABI = [
  {
    "inputs": [
      { "name": "_dstEid", "type": "uint32" },
      { "name": "_wrappedTokenId", "type": "uint256" },
      { "name": "_recipient", "type": "address" },
      { "name": "_options", "type": "bytes" }
    ],
    "name": "bridgeBack",
    "outputs": [
      {
        "components": [
          { "name": "msgId", "type": "bytes32" },
          { "name": "guid", "type": "bytes32" },
          { "name": "nonce", "type": "uint64" },
          { "name": "fee", "type": "uint256" }
        ],
        "name": "receipt",
        "type": "tuple"
      }
    ],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "_dstEid", "type": "uint32" },
      { "name": "_wrappedTokenId", "type": "uint256" },
      { "name": "_recipient", "type": "address" },
      { "name": "_options", "type": "bytes" }
    ],
    "name": "quoteBridgeBack",
    "outputs": [
      {
        "components": [
          { "name": "nativeFee", "type": "uint256" },
          { "name": "lzTokenFee", "type": "uint256" }
        ],
        "name": "fee",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "_wrappedTokenId", "type": "uint256" }
    ],
    "name": "ownerOf",
    "outputs": [{ "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "tokenId", "type": "uint256" }
    ],
    "name": "tokenURI",
    "outputs": [{ "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "name": "_eid", "type": "uint32" }],
    "name": "peers",
    "outputs": [{ "name": "", "type": "bytes32" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "_wrappedTokenId", "type": "uint256" }
    ],
    "name": "wrappedOriginInfo",
    "outputs": [
      { "name": "originEid", "type": "uint32" },
      { "name": "originContract", "type": "address" },
      { "name": "originTokenId", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

export const IMAGE_MINT_NFT_ABI = [
  {
    "inputs": [
      { "name": "tokenId", "type": "uint256" }
    ],
    "name": "ownerOf",
    "outputs": [{ "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "tokenId", "type": "uint256" }
    ],
    "name": "tokenURI",
    "outputs": [{ "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "tokenId", "type": "uint256" }
    ],
    "name": "tokenMetadata",
    "outputs": [
      { "name": "name", "type": "string" },
      { "name": "cid", "type": "string" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "to", "type": "address" },
      { "name": "tokenId", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

export const LAYERZERO_ENDPOINT_ABI = [
  {
    "inputs": [
      { "name": "_dstEid", "type": "uint32" },
      { "name": "_message", "type": "bytes" },
      { "name": "_options", "type": "bytes" },
      { "name": "_payInLzToken", "type": "bool" },
      { "name": "_sender", "type": "address" }
    ],
    "name": "quote",
    "outputs": [
      { "name": "nativeFee", "type": "uint256" },
      { "name": "lzTokenFee", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];