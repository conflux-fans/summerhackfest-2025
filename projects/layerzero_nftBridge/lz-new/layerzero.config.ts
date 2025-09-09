import { EndpointId } from '@layerzerolabs/lz-definitions';
import { ExecutorOptionType } from '@layerzerolabs/lz-v2-utilities';
import { OAppEnforcedOption } from '@layerzerolabs/toolbox-hardhat';
import { TwoWayConfig, generateConnectionsConfig } from '@layerzerolabs/metadata-tools';

const confluxOApp = {
  eid: EndpointId.CONFLUX_V2_MAINNET, // 30212
  address: "0x45a8c758a42B0515dB5FfC880d1dffC7358cac03",
};

const baseOApp = {
  eid: EndpointId.BASE_V2_MAINNET, // 30184
  address: "0xF5d65814E2584cD504F1AC836C0A24d438CDf7Ec",
};

const enforcedOptions: OAppEnforcedOption[] = [
  {
    eid: EndpointId.BASE_V2_MAINNET,
    msgType: 1,
    optionType: ExecutorOptionType.LZ_RECEIVE,
    options: '0x00010020000000000000000000000000000f424000000000000000000000000000000000', // type 1, gas 1000000, value 0
  },
  {
    eid: EndpointId.CONFLUX_V2_MAINNET,
    msgType: 1,
    optionType: ExecutorOptionType.LZ_RECEIVE,
    options: '0x00010020000000000000000000000000000f424000000000000000000000000000000000',
  },
];

const pathways: TwoWayConfig[] = [
  [
    confluxOApp,
    baseOApp,
    [
      ['0x6F9e1aD2B1f2a3B4c5d6e7f8g9h0i1j2k3l4m5n6o7p8q9r0s1t2u3v4w5x6y7z8', '0x9a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2'], // Conflux DVNs
      [] // No optional DVNs
    ],
    [15, 200], // Confirmations: Conflux (15), Base (200)
    [enforcedOptions, enforcedOptions],
  ],
];

export default async function () {
  const connections = await generateConnectionsConfig(pathways);
  return {
    contracts: [{ contract: confluxOApp }, { contract: baseOApp }],
    connections,
  };
};