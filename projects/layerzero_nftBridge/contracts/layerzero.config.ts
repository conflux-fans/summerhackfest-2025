import { EndpointId } from '@layerzerolabs/lz-definitions';
import { ExecutorOptionType } from '@layerzerolabs/lz-v2-utilities';
import { OAppEnforcedOption } from '@layerzerolabs/toolbox-hardhat';
import { TwoWayConfig, generateConnectionsConfig } from '@layerzerolabs/metadata-tools';

// Define OApp configurations
// const confluxOApp = {
//   eid: EndpointId.CONFLUX_V2_MAINNET,
//   contractName: 'DynamicONFTBridge',
// };
// const baseOApp = {
//   eid: EndpointId.BASE_V2_MAINNET,
//   contractName: 'DynamicONFTBridge',
// };

const ethereumSepoliaOApp = {
  eid: 40161, // SEPOLIA_V2_TESTNET
  contractName: 'DynamicONFTBridge',
};

const baseSepoliaOApp = {
  eid: 40245, // BASE_V2_TESTNET
  contractName: 'DynamicONFTBridge',
};

// Define enforced options (currently empty)
const enforcedOptions: OAppEnforcedOption[] = [];

// Define pathway configurations for two-way connections
const pathways: TwoWayConfig[] = [
  // Ethereum Sepolia to Base Sepolia
  [
    ethereumSepoliaOApp,
    baseSepoliaOApp,
    [
      ['LayerZero Labs'], // DVNs for Ethereum Sepolia -> Base Sepolia
      [], // Executors (none specified)
    ],
    [1, 1], // Confirmations: Lower for testnets (Ethereum Sepolia: 1, Base Sepolia: 1)
    [enforcedOptions, enforcedOptions], // Enforced options for both directions
  ],
  // Base Sepolia to Ethereum Sepolia
  [
    baseSepoliaOApp,
    ethereumSepoliaOApp,
    [
      ['LayerZero Labs'], // DVNs for Base Sepolia -> Ethereum Sepolia
      [], // Executors (none specified)
    ],
    [1, 1], // Confirmations: Lower for testnets (Base Sepolia: 1, Ethereum Sepolia: 1)
    [enforcedOptions, enforcedOptions], // Enforced options for both directions
  ],
];

// Export configuration generator
export default async function () {
  const connections = await generateConnectionsConfig(pathways);
  return {
    contracts: [
      { contract: ethereumSepoliaOApp },
      { contract: baseSepoliaOApp },
    ],
    connections,
  };
};