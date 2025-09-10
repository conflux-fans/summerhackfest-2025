export const ERC721_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "to", "type": "address" },
      { "internalType": "uint256", "name": "tokenId", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "owner", "type": "address" }
    ],
    "name": "balanceOf",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "tokenId", "type": "uint256" }
    ],
    "name": "getApproved",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "owner", "type": "address" },
      { "internalType": "address", "name": "operator", "type": "address" }
    ],
    "name": "isApprovedForAll",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "tokenId", "type": "uint256" }
    ],
    "name": "ownerOf",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "from", "type": "address" },
      { "internalType": "address", "name": "to", "type": "address" },
      { "internalType": "uint256", "name": "tokenId", "type": "uint256" }
    ],
    "name": "safeTransferFrom",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "from", "type": "address" },
      { "internalType": "address", "name": "to", "type": "address" },
      { "internalType": "uint256", "name": "tokenId", "type": "uint256" },
      { "internalType": "bytes", "name": "data", "type": "bytes" }
    ],
    "name": "safeTransferFrom",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes4", "name": "interfaceId", "type": "bytes4" }
    ],
    "name": "supportsInterface",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "tokenId", "type": "uint256" }
    ],
    "name": "tokenURI",
    "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  }
];

export const ESPACE_BRIDGE_ABI = [
  {
    "type": "constructor",
    "inputs": [
      { "name": "_lzEndpoint", "type": "address" },
      { "name": "_delegate", "type": "address" }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "approvalRequired",
    "inputs": [],
    "outputs": [{ "name": "", "type": "bool" }],
    "stateMutability": "pure"
  },
  {
    "type": "function",
    "name": "bridgeSend",
    "inputs": [
      { "name": "_originalToken", "type": "address" },
      { "name": "_dstEid", "type": "uint32" },
      { "name": "_to", "type": "address" },
      { "name": "_tokenIds", "type": "uint256[]" },
      { "name": "_options", "type": "bytes" },
      {
        "name": "_fee",
        "type": "tuple",
        "components": [
          { "name": "nativeFee", "type": "uint256" },
          { "name": "lzTokenFee", "type": "uint256" }
        ]
      },
      { "name": "_refundAddress", "type": "address" }
    ],
    "outputs": [],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "isERC721",
    "inputs": [{ "name": "_token", "type": "address" }],
    "outputs": [{ "name": "", "type": "bool" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "lzReceive",
    "inputs": [
      {
        "name": "_origin",
        "type": "tuple",
        "components": [
          { "name": "srcEid", "type": "uint32" },
          { "name": "sender", "type": "bytes32" },
          { "name": "nonce", "type": "uint64" }
        ]
      },
      { "name": "_guid", "type": "bytes32" },
      { "name": "_message", "type": "bytes" },
      { "name": "_executor", "type": "address" },
      { "name": "_extraData", "type": "bytes" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "peers",
    "inputs": [{ "name": "_eid", "type": "uint32" }],
    "outputs": [{ "name": "", "type": "bytes32" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "quoteBridgeSend",
    "inputs": [
      { "name": "_originalToken", "type": "address" },
      { "name": "_dstEid", "type": "uint32" },
      { "name": "_to", "type": "address" },
      { "name": "_tokenIds", "type": "uint256[]" },
      { "name": "_options", "type": "bytes" },
      { "name": "_payInLzToken", "type": "bool" }
    ],
    "outputs": [
      {
        "name": "fee",
        "type": "tuple",
        "components": [
          { "name": "nativeFee", "type": "uint256" },
          { "name": "lzTokenFee", "type": "uint256" }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "registerToken",
    "inputs": [{ "name": "_token", "type": "address" }],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "supportedTokens",
    "inputs": [{ "name": "", "type": "address" }],
    "outputs": [{ "name": "", "type": "bool" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "token",
    "outputs": [{ "name": "", "type": "address" }],
    "stateMutability": "pure"
  },
  {
    "type": "function",
    "name": "unregisterToken",
    "inputs": [{ "name": "_token", "type": "address" }],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "event",
    "name": "TokenRegistered",
    "inputs": [{ "name": "token", "type": "address", "indexed": true }],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "TokenUnregistered",
    "inputs": [{ "name": "token", "type": "address", "indexed": true }],
    "anonymous": false
  }
];

export const BASE_WRAPPED_ABI = [
  {
    "type": "constructor",
    "inputs": [
      { "name": "_lzEndpoint", "type": "address" },
      { "name": "_delegate", "type": "address" }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "approvalRequired",
    "inputs": [],
    "outputs": [{ "name": "", "type": "bool" }],
    "stateMutability": "pure"
  },
  {
    "type": "function",
    "name": "bridgeSend",
    "inputs": [
      { "name": "_originalToken", "type": "address" },
      { "name": "_dstEid", "type": "uint32" },
      { "name": "_to", "type": "address" },
      { "name": "_wrappedIds", "type": "uint256[]" },
      { "name": "_options", "type": "bytes" },
      {
        "name": "_fee",
        "type": "tuple",
        "components": [
          { "name": "nativeFee", "type": "uint256" },
          { "name": "lzTokenFee", "type": "uint256" }
        ]
      },
      { "name": "_refundAddress", "type": "address" }
    ],
    "outputs": [],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "isERC721",
    "inputs": [{ "name": "_token", "type": "address" }],
    "outputs": [{ "name": "", "type": "bool" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "lzReceive",
    "inputs": [
      {
        "name": "_origin",
        "type": "tuple",
        "components": [
          { "name": "srcEid", "type": "uint32" },
          { "name": "sender", "type": "bytes32" },
          { "name": "nonce", "type": "uint64" }
        ]
      },
      { "name": "_guid", "type": "bytes32" },
      { "name": "_message", "type": "bytes" },
      { "name": "_executor", "type": "address" },
      { "name": "_extraData", "type": "bytes" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "peers",
    "inputs": [{ "name": "_eid", "type": "uint32" }],
    "outputs": [{ "name": "", "type": "bytes32" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "quoteBridgeSend",
    "inputs": [
      { "name": "_originalToken", "type": "address" },
      { "name": "_dstEid", "type": "uint32" },
      { "name": "_to", "type": "address" },
      { "name": "_wrappedIds", "type": "uint256[]" },
      { "name": "_options", "type": "bytes" },
      { "name": "_payInLzToken", "type": "bool" }
    ],
    "outputs": [
      {
        "name": "fee",
        "type": "tuple",
        "components": [
          { "name": "nativeFee", "type": "uint256" },
          { "name": "lzTokenFee", "type": "uint256" }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "registerToken",
    "inputs": [{ "name": "_token", "type": "address" }],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "supportedTokens",
    "inputs": [{ "name": "", "type": "address" }],
    "outputs": [{ "name": "", "type": "bool" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "token",
    "outputs": [{ "name": "", "type": "address" }],
    "stateMutability": "pure"
  },
  {
    "type": "function",
    "name": "unregisterToken",
    "inputs": [{ "name": "_token", "type": "address" }],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "event",
    "name": "TokenRegistered",
    "inputs": [{ "name": "token", "type": "address", "indexed": true }],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "TokenUnregistered",
    "inputs": [{ "name": "token", "type": "address", "indexed": true }],
    "anonymous": false
  }
];

export const IMAGE_MINT_NFT_ABI = [
  {
    "inputs": [
      { "name": "to", "type": "address" },
      { "name": "tokenId", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
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
      { "name": "tokenId", "type": "uint256" }
    ],
    "name": "tokenURI",
    "outputs": [{ "name": "", "type": "string" }],
    "stateMutability": "view",
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