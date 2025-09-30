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

export const BRIDGE_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "_lzEndpoint", "type": "address" },
      { "internalType": "address", "name": "_delegate", "type": "address" }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "token", "type": "address" }
    ],
    "name": "TokenRegistered",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "token", "type": "address" }
    ],
    "name": "TokenUnregistered",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "wrapper", "type": "address" },
      { "indexed": true, "internalType": "address", "name": "canonicalAddr", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "tokenId", "type": "uint256" },
      { "indexed": false, "internalType": "address", "name": "to", "type": "address" }
    ],
    "name": "WrappedMinted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "wrapper", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "tokenId", "type": "uint256" }
    ],
    "name": "WrappedBurned",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "canonicalAddr", "type": "address" },
      { "indexed": false, "internalType": "address", "name": "wrapper", "type": "address" }
    ],
    "name": "WrapperDeployed",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "approvalRequired",
    "outputs": [
      { "internalType": "bool", "name": "", "type": "bool" }
    ],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "_localToken", "type": "address" },
      { "internalType": "uint32", "name": "_dstEid", "type": "uint32" },
      { "internalType": "address", "name": "_to", "type": "address" },
      { "internalType": "uint256[]", "name": "_tokenIds", "type": "uint256[]" },
      { "internalType": "bytes", "name": "_options", "type": "bytes" },
      {
        "components": [
          { "internalType": "uint256", "name": "nativeFee", "type": "uint256" },
          { "internalType": "uint256", "name": "lzTokenFee", "type": "uint256" }
        ],
        "internalType": "struct MessagingFee",
        "name": "_fee",
        "type": "tuple"
      },
      { "internalType": "address", "name": "_refundAddress", "type": "address" }
    ],
    "name": "bridgeSend",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "_canonicalAddr", "type": "address" }
    ],
    "name": "getWrapper",
    "outputs": [
      { "internalType": "address", "name": "", "type": "address" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "_token", "type": "address" }
    ],
    "name": "isERC721",
    "outputs": [
      { "internalType": "bool", "name": "", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          { "internalType": "uint32", "name": "srcEid", "type": "uint32" },
          { "internalType": "bytes32", "name": "sender", "type": "bytes32" },
          { "internalType": "uint64", "name": "nonce", "type": "uint64" }
        ],
        "internalType": "struct Origin",
        "name": "_origin",
        "type": "tuple"
      },
      { "internalType": "bytes32", "name": "_guid", "type": "bytes32" },
      { "internalType": "bytes", "name": "_message", "type": "bytes" },
      { "internalType": "address", "name": "_executor", "type": "address" },
      { "internalType": "bytes", "name": "_extraData", "type": "bytes" }
    ],
    "name": "lzReceive",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "", "type": "address" },
      { "internalType": "address", "name": "", "type": "address" },
      { "internalType": "uint256", "name": "", "type": "uint256" },
      { "internalType": "bytes", "name": "", "type": "bytes" }
    ],
    "name": "onERC721Received",
    "outputs": [
      { "internalType": "bytes4", "name": "", "type": "bytes4" }
    ],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint32", "name": "_eid", "type": "uint32" }
    ],
    "name": "peers",
    "outputs": [
      { "internalType": "bytes32", "name": "", "type": "bytes32" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "_localToken", "type": "address" },
      { "internalType": "uint32", "name": "_dstEid", "type": "uint32" },
      { "internalType": "address", "name": "_to", "type": "address" },
      { "internalType": "uint256[]", "name": "_tokenIds", "type": "uint256[]" },
      { "internalType": "bytes", "name": "_options", "type": "bytes" },
      { "internalType": "bool", "name": "_payInLzToken", "type": "bool" }
    ],
    "name": "quoteBridgeSend",
    "outputs": [
      {
        "components": [
          { "internalType": "uint256", "name": "nativeFee", "type": "uint256" },
          { "internalType": "uint256", "name": "lzTokenFee", "type": "uint256" }
        ],
        "internalType": "struct MessagingFee",
        "name": "fee",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "_token", "type": "address" }
    ],
    "name": "registerToken",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "token",
    "outputs": [
      { "internalType": "address", "name": "", "type": "address" }
    ],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "_token", "type": "address" }
    ],
    "name": "unregisterToken",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "", "type": "address" }
    ],
    "name": "originalToHomeEid",
    "outputs": [
      { "internalType": "uint32", "name": "", "type": "uint32" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "", "type": "address" }
    ],
    "name": "originalToWrapper",
    "outputs": [
      { "internalType": "address", "name": "", "type": "address" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "", "type": "address" }
    ],
    "name": "supportedTokens",
    "outputs": [
      { "internalType": "bool", "name": "", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "wrappedImplementation",
    "outputs": [
      { "internalType": "address", "name": "", "type": "address" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "", "type": "address" }
    ],
    "name": "wrapperToOriginal",
    "outputs": [
      { "internalType": "address", "name": "", "type": "address" }
    ],
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