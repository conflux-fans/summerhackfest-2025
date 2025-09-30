export const CONFLUX_TESTNET = {
  chainId: 71,
  name: "Conflux eSpace Testnet",
  rpcUrl: "https://evmtestnet.confluxrpc.com",
  blockExplorer: "https://evmtestnet.confluxscan.io",
  nativeCurrency: {
    name: "CFX",
    symbol: "CFX",
    decimals: 18,
  },
}

export const CONTRACT_ADDRESSES = {
  QUIZ_CRAFT_ARENA: process.env.NEXT_PUBLIC_QUIZ_CRAFT_ARENA_ADDRESS || "0x265D173C6f715cD0C6d36B29724420D0fa85252b",
  QUIZ_CRAFT_NFT: process.env.NEXT_PUBLIC_QUIZ_CRAFT_NFT_ADDRESS || "0x0987654321098765432109876543210987654321",
}

export const IS_DEVELOPMENT =
  process.env.NODE_ENV === "development" || !process.env.NEXT_PUBLIC_QUIZ_CRAFT_ARENA_ADDRESS

export const QUIZ_CATEGORIES = ["Technology", "History", "Crypto", "Science", "Sports", "Entertainment"]
