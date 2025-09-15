require("@nomicfoundation/hardhat-toolbox");
require("hardhat-deploy");
require("hardhat-contract-sizer");
require("dotenv").config();
require("./tasks/add-person");
require("./tasks/endorse");
require("./tasks/mint-nft");
require("./tasks/networks-check");
require("./tasks/networks-list");

// Register story-related task scripts used by tests
require("./tasks/add-story-chunk");
require("./tasks/update-story-chunk");
require("./tasks/list-story-chunks");
require("./tasks/seal-story");

const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000000";
const INFURA_API_KEY = process.env.INFURA_API_KEY || "";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || "";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: (process.env.VIA_IR || "false") === "true",
      // Allow overriding EVM version via environment variable (default istanbul)
      evmVersion: process.env.EVM_VERSION || "istanbul",
    },
  },
  
  networks: {
    // Local development network
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
      gas: 30000000, // 30M gas limit for ZK proof verification
      gasPrice: "auto",
      timeout: 1200000,
    },
    
    // Built-in Hardhat network - allow large contracts
    hardhat: {
      chainId: 31337,
      // Allow unlimited contract size locally; can be controlled via env UNLIMITED_SIZE
      allowUnlimitedContractSize: (process.env.UNLIMITED_SIZE || "true") === "true",
      gas: 30000000, // 30M gas limit for ZK proof verification
      gasPrice: "auto",
      blockGasLimit: 30000000, // Block gas limit
    },
    
    // Ethereum test network
    sepolia: {
      url: `https://sepolia.infura.io/v3/${INFURA_API_KEY}`,
      accounts: PRIVATE_KEY !== "0x0000000000000000000000000000000000000000000000000000000000000000" ? [PRIVATE_KEY] : [],
      chainId: 11155111,
      gasPrice: "auto",
      timeout: 1200000,
    },
    
    // Holesky testnet (latest Ethereum testnet)
    holesky: {
      url: `https://holesky.infura.io/v3/${INFURA_API_KEY}`,
      accounts: PRIVATE_KEY !== "0x0000000000000000000000000000000000000000000000000000000000000000" ? [PRIVATE_KEY] : [],
      chainId: 17000,
      gasPrice: "auto",
      timeout: 1200000,
    },
    
    // Ethereum mainnet
    mainnet: {
      url: `https://mainnet.infura.io/v3/${INFURA_API_KEY}`,
      accounts: PRIVATE_KEY !== "0x0000000000000000000000000000000000000000000000000000000000000000" ? [PRIVATE_KEY] : [],
      chainId: 1,
      gasPrice: "auto",
      timeout: 1200000,
    },
    
    // Polygon Amoy testnet (replacement for Mumbai)
    polygonAmoy: {
      url: `https://polygon-amoy.infura.io/v3/${INFURA_API_KEY}`,
      accounts: PRIVATE_KEY !== "0x0000000000000000000000000000000000000000000000000000000000000000" ? [PRIVATE_KEY] : [],
      chainId: 80002,
      gasPrice: "auto",
      timeout: 1200000,
    },
    
    // Polygon mainnet
    polygon: {
      url: `https://polygon-mainnet.infura.io/v3/${INFURA_API_KEY}`,
      accounts: PRIVATE_KEY !== "0x0000000000000000000000000000000000000000000000000000000000000000" ? [PRIVATE_KEY] : [],
      chainId: 137,
      gasPrice: "auto",
      timeout: 1200000,
    },
    
    // BSC testnet
    bscTestnet: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545/",
      accounts: PRIVATE_KEY !== "0x0000000000000000000000000000000000000000000000000000000000000000" ? [PRIVATE_KEY] : [],
      chainId: 97,
      gasPrice: "auto",
      timeout: 1200000,
    },
    
    // BSC mainnet
    bsc: {
      url: "https://bsc-dataseed1.binance.org",
      accounts: PRIVATE_KEY !== "0x0000000000000000000000000000000000000000000000000000000000000000" ? [PRIVATE_KEY] : [],
      chainId: 56,
      gasPrice: "auto",
      timeout: 1200000,
    },
    
    // Arbitrum testnet
    arbitrumSepolia: {
      url: `https://arbitrum-sepolia.infura.io/v3/${INFURA_API_KEY}`,
      accounts: PRIVATE_KEY !== "0x0000000000000000000000000000000000000000000000000000000000000000" ? [PRIVATE_KEY] : [],
      chainId: 421614,
      gasPrice: "auto",
      timeout: 1200000,
    },
    
    // Arbitrum mainnet
    arbitrum: {
      url: `https://arbitrum-mainnet.infura.io/v3/${INFURA_API_KEY}`,
      accounts: PRIVATE_KEY !== "0x0000000000000000000000000000000000000000000000000000000000000000" ? [PRIVATE_KEY] : [],
      chainId: 42161,
      gasPrice: "auto",
      timeout: 1200000,
    },
    
    // Optimism testnet
    optimismSepolia: {
      url: `https://optimism-sepolia.infura.io/v3/${INFURA_API_KEY}`,
      accounts: PRIVATE_KEY !== "0x0000000000000000000000000000000000000000000000000000000000000000" ? [PRIVATE_KEY] : [],
      chainId: 11155420,
      gasPrice: "auto",
      timeout: 1200000,
    },
    
    // Optimism mainnet
    optimism: {
      url: `https://optimism-mainnet.infura.io/v3/${INFURA_API_KEY}`,
      accounts: PRIVATE_KEY !== "0x0000000000000000000000000000000000000000000000000000000000000000" ? [PRIVATE_KEY] : [],
      chainId: 10,
      gasPrice: "auto",
      timeout: 1200000,
    },
    
    // Conflux eSpace testnet
    confluxTestnet: {
      url: "https://evmtestnet.confluxrpc.com",
      accounts: PRIVATE_KEY !== "0x0000000000000000000000000000000000000000000000000000000000000000" ? [PRIVATE_KEY] : [],
      chainId: 71,
      gasPrice: "auto",
      timeout: 1200000,
    },
    
    // Conflux eSpace mainnet
    conflux: {
      url: "https://evm.confluxrpc.com",
      accounts: PRIVATE_KEY !== "0x0000000000000000000000000000000000000000000000000000000000000000" ? [PRIVATE_KEY] : [],
      chainId: 1030,
      gasPrice: "auto",
      timeout: 1200000,
    },
  },
  
  // Contract verification configuration
  etherscan: {
    apiKey: {
      // Ethereum networks
      mainnet: ETHERSCAN_API_KEY,
      sepolia: ETHERSCAN_API_KEY,
      holesky: ETHERSCAN_API_KEY,
      
      // Polygon networks
      polygon: process.env.POLYGONSCAN_API_KEY || "",
      polygonAmoy: process.env.POLYGONSCAN_API_KEY || "",
      
      // BSC networks
      bsc: process.env.BSCSCAN_API_KEY || "",
      bscTestnet: process.env.BSCSCAN_API_KEY || "",
      
      // Arbitrum networks
      arbitrum: process.env.ARBISCAN_API_KEY || "",
      arbitrumSepolia: process.env.ARBISCAN_API_KEY || "",
      
      // Optimism networks
      optimism: process.env.OPTIMISTIC_ETHERSCAN_API_KEY || "",
      optimismSepolia: process.env.OPTIMISTIC_ETHERSCAN_API_KEY || "",
      
      // Conflux networks
      conflux: process.env.CONFLUXSCAN_API_KEY || "",
      confluxTestnet: process.env.CONFLUXSCAN_API_KEY || "",
    },
    customChains: [
      {
        network: "holesky",
        chainId: 17000,
        urls: {
          apiURL: "https://api-holesky.etherscan.io/api",
          browserURL: "https://holesky.etherscan.io"
        }
      },
      {
        network: "arbitrumSepolia",
        chainId: 421614,
        urls: {
          apiURL: "https://api-sepolia.arbiscan.io/api",
          browserURL: "https://sepolia.arbiscan.io"
        }
      },
      {
        network: "optimismSepolia",
        chainId: 11155420,
        urls: {
          apiURL: "https://api-sepolia-optimistic.etherscan.io/api",
          browserURL: "https://sepolia-optimism.etherscan.io"
        }
      },
      {
        network: "confluxTestnet",
        chainId: 71,
        urls: {
          apiURL: "https://evmapi-testnet.confluxscan.net/api",
          browserURL: "https://evmtestnet.confluxscan.net"
        }
      },
      {
        network: "conflux",
        chainId: 1030,
        urls: {
          apiURL: "https://evmapi.confluxscan.net/api",
          browserURL: "https://evm.confluxscan.net"
        }
      }
    ]
  },
  
  // Gas reporter configuration
  gasReporter: {
    enabled: false, // Temporarily disabled due to provider issues
    currency: "USD",
    coinmarketcap: COINMARKETCAP_API_KEY,
    gasPrice: 20,
    showTimeSpent: true,
    showMethodSig: true,
    maxMethodDiff: 10,
  },
  
  // Contract size checker - temporarily disabled due to JSON parsing issue
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: false, // Disabled to avoid JSON parsing errors
    strict: process.env.CONTRACT_SIZER_STRICT === "true",
  },
  
  // Path configuration
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
    deploy: "./deploy",
    deployments: "./deployments",
  },
  
  // Mocha test configuration
  mocha: {
    timeout: 1200000,
    color: true,
    reporter: "spec",
  },
  
  // Typechain configuration
  typechain: {
    outDir: "typechain-types",
    target: "ethers-v6",
    alwaysGenerateOverloads: false,
    externalArtifacts: ["externalArtifacts/*.json"],
  },

  // hardhat-deploy configuration
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
};