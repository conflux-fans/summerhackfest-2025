import { EndpointId } from '@layerzerolabs/lz-definitions';
import { ExecutorOptionType } from '@layerzerolabs/lz-v2-utilities';
import { OAppEnforcedOption } from '@layerzerolabs/toolbox-hardhat';
import { TwoWayConfig, generateConnectionsConfig } from '@layerzerolabs/metadata-tools';

// Define OApp configurations
const confluxOApp = {
  eid: EndpointId.CONFLUX_V2_MAINNET,
  contractName: 'DynamicONFTBridge',
};

const baseOApp = {
  eid: EndpointId.BASE_V2_MAINNET,
  contractName: 'DynamicONFTBridge',
};

// Define enforced options (currently empty)
const enforcedOptions: OAppEnforcedOption[] = [];

// Define pathway configurations for two-way connections
const pathways: TwoWayConfig[] = [
  // Conflux to Base
  [
    confluxOApp,
    baseOApp,
    [
      ['LayerZero Labs'], // DVNs for Conflux -> Base
      [], // Executors (none specified)
    ],
    [15, 200], // Confirmations: Conflux (15), Base (200)
    [enforcedOptions, enforcedOptions], // Enforced options for both directions
  ],
  // Base to Conflux
  [
    baseOApp,
    confluxOApp,
    [
      ['LayerZero Labs'], // DVNs for Base -> Conflux
      [], // Executors (none specified)
    ],
    [200, 15], // Confirmations: Base (200), Conflux (15)
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