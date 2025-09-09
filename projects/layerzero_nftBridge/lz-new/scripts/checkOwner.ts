// scripts/checkOwner.ts
import { ethers } from "ethers";
import * as dotenv from "dotenv";
dotenv.config();

const CONFLUX_OAPP = "0x45a8c758a42B0515dB5FfC880d1dffC7358cac03";
const BASE_OAPP = "0xF5d65814E2584cD504F1AC836C0A24d438CDf7Ec";
const OAPP_ABI = [
  { inputs: [], name: "owner", outputs: [{ type: "address" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "delegate", outputs: [{ type: "address" }], stateMutability: "view", type: "function" },
];

async function main() {
  const confluxProvider = new ethers.providers.JsonRpcProvider(process.env.CONFLUX_RPC || "https://evm.confluxrpc.com");
  const baseProvider = new ethers.providers.JsonRpcProvider(process.env.BASE_RPC || "https://mainnet.base.org");
  const confluxContract = new ethers.Contract(CONFLUX_OAPP, OAPP_ABI, confluxProvider);
  const baseContract = new ethers.Contract(BASE_OAPP, OAPP_ABI, baseProvider);

  console.log("Conflux OApp Owner:", await confluxContract.owner());
  console.log("Conflux OApp Delegate:", await confluxContract.delegate());
  console.log("Base OApp Owner:", await baseContract.owner());
  console.log("Base OApp Delegate:", await baseContract.delegate());
}

main().catch(console.error);