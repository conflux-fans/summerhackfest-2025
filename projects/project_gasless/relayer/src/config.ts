import dotenv from "dotenv";
dotenv.config();

export const RELAYER_PRIVATE_KEY = process.env.RELAYER_PRIVATE_KEY!;
export const RPC_URL = process.env.RPC_URL!;
export const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

export const GAS_TOP_UP_ADDRESS = "0x4FbC64D35e97C611F6af3B31E75Ff8BB32990a63";

export const GAS_TOP_UP_ABI = [
  // Constructor
  {
    inputs: [
      { internalType: "address", name: "_pyth", type: "address" },
      { internalType: "bytes32", name: "_cfxUsdFeedId", type: "bytes32" }
    ],
    stateMutability: "nonpayable",
    type: "constructor"
  },

  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "tokenAddress", type: "address" },
      { indexed: false, internalType: "string", name: "ticker", type: "string" },
      { indexed: false, internalType: "bytes32", name: "feedId", type: "bytes32" }
    ],
    name: "TokenAdded",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "user", type: "address" },
      { indexed: true, internalType: "address", name: "relayer", type: "address" },
      { indexed: true, internalType: "address", name: "tokenAddress", type: "address" },
      { indexed: false, internalType: "uint256", name: "tokenAmount", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "cfxAmount", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "relayerFee", type: "uint256" }
    ],
    name: "MetaSwapped",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: "uint256", name: "newFeePercent", type: "uint256" }
    ],
    name: "RelayerFeeUpdated",
    type: "event"
  },

  // Owner functions
  {
    inputs: [{ internalType: "address", name: "tokenAddress", type: "address" },
             { internalType: "string", name: "ticker", type: "string" },
             { internalType: "bytes32", name: "feedId", type: "bytes32" }],
    name: "addToken",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "_feePercent", type: "uint256" }],
    name: "setRelayerFee",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "depositCfx",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "amount", type: "uint256" }],
    name: "withdrawCfx",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ internalType: "address", name: "tokenAddress", type: "address" },
             { internalType: "uint256", name: "amount", type: "uint256" }],
    name: "withdrawToken",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },

  // Meta-swap
  {
    inputs: [
      { internalType: "address", name: "user", type: "address" },
      { internalType: "address", name: "tokenAddress", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "uint256", name: "deadline", type: "uint256" },
      { internalType: "bytes", name: "signature", type: "bytes" },
      { internalType: "bytes[]", name: "updateData", type: "bytes[]" },
      { internalType: "uint32", name: "maxAge", type: "uint32" }
    ],
    name: "metaSwap",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },

  // View functions
  {
    inputs: [],
    name: "getSupportedTokens",
    outputs: [
      {
        components: [
          { internalType: "address", name: "tokenAddress", type: "address" },
          { internalType: "string", name: "ticker", type: "string" },
          { internalType: "bytes32", name: "feedId", type: "bytes32" }
        ],
        internalType: "struct GasStation.TokenInfo[]",
        name: "",
        type: "tuple[]"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "address", name: "tokenAddress", type: "address" },
             { internalType: "uint256", name: "amount", type: "uint256" }],
    name: "estimateCfxOut",
    outputs: [
      { internalType: "uint256", name: "cfxAmount", type: "uint256" },
      { internalType: "uint256", name: "relayerFee", type: "uint256" },
      { internalType: "uint256", name: "userAmount", type: "uint256" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "getPyth",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "cfxUsdFeedId",
    outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function"
  },

  // Fallback receive
  { stateMutability: "payable", type: "receive" }
];

// Pyth Oracle
export const PYTH_ADDRESS = "0x8879170230c9603342f3837cf9a8e76c61791198fb1271bb2552c9af7b33c933";
export const PYTH_ABI = [
  { inputs: [["bytes"]], name: "getUpdateFee", outputs: [{ internalType: "uint256", name: "feeAmount", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [["bytes"]], name: "updatePriceFeeds", outputs: [], stateMutability: "payable", type: "function" },
  { inputs: [{ internalType: "bytes32", name: "id", type: "bytes32" }],
    name: "getPriceUnsafe",
    outputs: [
      {
        components: [
          { internalType: "int64", name: "price", type: "int64" },
          { internalType: "int32", name: "expo", type: "int32" },
          { internalType: "uint64", name: "publishTime", type: "uint64" }
        ],
        internalType: "struct PythStructs.Price",
        name: "",
        type: "tuple"
      }
    ],
    stateMutability: "view",
    type: "function"
  }
];
