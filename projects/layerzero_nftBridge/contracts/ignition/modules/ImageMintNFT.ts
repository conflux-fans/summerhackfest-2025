// ignition/modules/ImageMintNFT.ts
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("ImageMintNFTModule", (m) => {
  // Deploy the ImageMintNFT contract with no parameters
  const imageMintNFT = m.contract("ImageMintNFT", []);
  
  return { imageMintNFT };
});