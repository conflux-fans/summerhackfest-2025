export const ESPACE_BRIDGE_ABI = [
  {
    "inputs": [
      { "name": "_dstChainId", "type": "uint16" },
      { "name": "_dstContractBytes", "type": "bytes" },
      { "name": "_tokenId", "type": "uint256" },
      { "name": "_recipient", "type": "address" },
      { "name": "_adapterParams", "type": "bytes" }
    ],
    "name": "bridgeOut",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{ "name": "_dstChainId", "type": "uint16" }],
    "name": "trustedRemoteLookup",
    "outputs": [{ "name": "", "type": "bytes" }],
    "stateMutability": "view",
    "type": "function"
  }
];

export const BASE_WRAPPED_ABI = [
  {
    "inputs": [
      { "name": "_dstChainId", "type": "uint16" },
      { "name": "_dstContractBytes", "type": "bytes" },
      { "name": "_wrappedTokenId", "type": "uint256" },
      { "name": "_adapterParams", "type": "bytes" }
    ],
    "name": "bridgeBack",
    "outputs": [],
    "stateMutability": "payable",
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
    "inputs": [{ "name": "_dstChainId", "type": "uint16" }],
    "name": "trustedRemoteLookup",
    "outputs": [{ "name": "", "type": "bytes" }],
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
    inputs: [
      { name: "_dstChainId", type: "uint16" },
      { name: "_userApplication", type: "address" },
      { name: "_payload", type: "bytes" },
      { name: "_payInZRO", type: "bool" },
      { name: "_adapterParams", type: "bytes" }
    ],
    name: "estimateFees",
    outputs: [
      { name: "nativeFee", type: "uint256" },
      { name: "zroFee", type: "uint256" }
    ],
    stateMutability: "view",
    type: "function"
  }
];