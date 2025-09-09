import { EndpointId } from '@layerzerolabs/lz-definitions';
import { ExecutorOptionType } from '@layerzerolabs/lz-v2-utilities';
import { OAppEnforcedOption } from '@layerzerolabs/toolbox-hardhat';
import { TwoWayConfig, generateConnectionsConfig } from '@layerzerolabs/metadata-tools';

const confluxOApp = {
    eid: EndpointId.CONFLUX_V2_MAINNET,
    contractName: "EspaceBridge",
  };
  
  const baseOApp = {
    eid: EndpointId.BASE_V2_MAINNET,
    contractName: "BaseWrappedBridge",
  };

const enforcedOptions: OAppEnforcedOption[] = [
  {
    msgType: 1,
    optionType: ExecutorOptionType.LZ_RECEIVE,
    gas: 1000000,
    value: 0,
  },
];

const pathways: TwoWayConfig[] = [
  [
    confluxOApp,
    baseOApp,
    [
      ["LayerZero Labs"],
      []
    ],
    [15, 200], // Confirmations: Conflux (15), Base (200)
    [enforcedOptions, enforcedOptions]
  ],
  [
    baseOApp,
    confluxOApp,
    [
      ["LayerZero Labs"],
      []
    ],
    [200, 15], // Confirmations: Base (200), Conflux (15)
    [enforcedOptions, enforcedOptions]
  ]
];

export default async function () {
  const connections = await generateConnectionsConfig(pathways);
  return {
    contracts: [{ contract: confluxOApp }, { contract: baseOApp }],
    connections
  };
};