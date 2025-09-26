import { EndpointId } from '@layerzerolabs/lz-definitions';
import { ExecutorOptionType } from '@layerzerolabs/lz-v2-utilities';
import { OAppEnforcedOption } from '@layerzerolabs/toolbox-hardhat';
import { TwoWayConfig, generateConnectionsConfig } from '@layerzerolabs/metadata-tools';

// Define OApp configurations for Conflux Mainnet and Base Mainnet
const confluxOApp = {
  eid: EndpointId.CONFLUX_V2_MAINNET,
  contractName: 'DynamicONFTBridge',
};

const baseOApp = {
  eid: EndpointId.BASE_V2_MAINNET,
  contractName: 'DynamicONFTBridge',
};

// Define enforced options for cross-chain message execution
const enforcedOptions: OAppEnforcedOption[] = [
  {
    msgType: 1, // SEND (used for LZ_RECEIVE in LayerZero)
    optionType: ExecutorOptionType.LZ_RECEIVE,
    gas: 200000, // Gas limit for receiving messages (e.g., minting wrapped NFTs or unlocking natives)
    value: 0, // No native token value required
  },
];

// Define pathway configurations for two-way connections
const pathways: TwoWayConfig[] = [
  // Conflux Mainnet to Base Mainnet
  [
    confluxOApp,
    baseOApp,
    [
      ['LayerZero Labs'], // DVNs for Conflux Mainnet -> Base Mainnet
      [], // Executors (none specified)
    ],
    [15, 15], // Confirmations: Standard for mainnets (Conflux: 15, Base: 15)
    [enforcedOptions, enforcedOptions], // Enforced options for both directions
  ],
  // Base Mainnet to Conflux Mainnet
  [
    baseOApp,
    confluxOApp,
    [
      ['LayerZero Labs'], // DVNs for Base Mainnet -> Conflux Mainnet
      [], // Executors (none specified)
    ],
    [15, 15], // Confirmations: Standard for mainnets (Base: 15, Conflux: 15)
    [enforcedOptions, enforcedOptions], // Enforced options for both directions
  ],
];

// Export configuration generator
export default async function () {
  const connections = await generateConnectionsConfig(pathways);
  return {
    contracts: [
      { contract: confluxOApp },
      { contract: baseOApp },
    ],
    connections,
  };
};