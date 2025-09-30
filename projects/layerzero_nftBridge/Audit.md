# Smart Contract Audit Guide

This document provides a technical overview and audit guide for the contracts in `projects/layerzero_nftBridge/contracts/contracts` of the [`summerhackfest-2025`](https://github.com/0xfdbu/summerhackfest-2025) repository. It is intended for use by security auditors and advanced users.

---

## Contracts to Audit

- [`DynamicONFTBridge.sol`](./DynamicONFTBridge.sol)
- [`FactoryNftCollectionsMint.sol`](./FactoryNftCollectionsMint.sol)
- [`WrappedONFT.sol`](./WrappedONFT.sol)

---

## 1. DynamicONFTBridge.sol

**Purpose**:  
Symmetric bridge for ERC721 NFTs across chains (Conflux/Base). Supports both locking/unlocking for native collections and minting/burning for wrapped collections. Dynamically handles collections originating from any chain.

**Key Features**:
- Auto-registers new ERC721 collections (permissionless unless unregistered).
- Manages mappings for original/wrapped tokens and home chain IDs.
- Uses LayerZero messaging for cross-chain communication.

**Critical Functions**:
- `bridgeSend(...)`: Entrypoint for bridging, handles both directions. Determines if the NFT is native or wrapped and calls lock/burn or mint/unlock logic.
- `_lzReceive(...)`: Handles LayerZero messages, decodes payload, and finalizes bridging by minting or unlocking.
- `deployWrapper(...)`: Deploys a new minimal proxy for a wrapped NFT collection using OpenZeppelin's Clones.
- `registerToken/unregisterToken(...)`: Permissionless registration, but only owner can unregister.

**Attack Surfaces & Risks**:
- **Token Registration**: Any contract can be registered as a supported token, which may lead to unsupported token logic if `isERC721` is incorrectly implemented or spoofed.
- **Wrapper Deployment**: Relies on proper initialization, but uses OpenZeppelin's Clones pattern for minimal proxies.
- **Upgradeability**: Bridge contract is NOT upgradeable by design; proxies are only used for wrapped NFT contracts.
- **LayerZero Integration**: Any vulnerabilities in LayerZero's message relaying or endpoint spoofing could impact the bridge.
- **Reentrancy/DoS**: No obvious reentrancy vectors due to ERC721 standards and explicit use of onlyOwner/onlyOwnerOrFactory modifiers; still, review for DoS via large batch operations.
- **Event Logging**: Key events are emitted for token registration, wrapper deployment, minting, and burning, aiding traceability.

**Recommendations**:
- Verify all ERC721 interface checks cannot be bypassed.
- Ensure LayerZero endpoints are securely configured.
- Test for large batch bridging and possible gas exhaustion.

---

## 2. FactoryNftCollectionsMint.sol

**Purpose**:  
Factory for creating new ERC721 NFT collections and minting NFTs, supporting both batch and single minting.

**Key Features**:
- Uses a minimal proxy (via Clones) to deploy new `BaseNFT` contracts per collection.
- Each `BaseNFT` supports metadata, image, contractURI, and is Ownable by the creator.
- Only the owner or factory can mint, batch mint, or burn NFTs in a given collection.

**Critical Functions**:
- `createCollection(...)`: Deploys a new ERC721 collection (cloned), assigns ownership, and stores metadata.
- `mintNFT(...)`, `batchMintNFT(...)`: Only collection owner can mint or batch mint NFTs.
- `burnNFT(...)`, `batchBurnNFT(...)`: Only collection owner can burn NFTs.
- Collection and NFT tracking via mappings.

**Attack Surfaces & Risks**:
- **Initialization**: Each clone must be initialized only once; check for possible reinitialization attacks.
- **Mint Authorization**: Only the collection owner may mint/burn; ensure access controls are strictly enforced via `onlyOwnerOrFactory`.
- **Batch Mint/Burn**: Potential for gas exhaustion if arrays are very large.
- **Cloning Logic**: Relies on OpenZeppelin's Clones and Ownable for security.
- **Upgradeability**: Factory is not upgradeable; clones are fixed logic after deployment.

**Recommendations**:
- Enforce strict checks in `initialize` to prevent repeated calls.
- Consider gas limits for batch operations.
- Review event emissions for off-chain indexing.

---

## 3. WrappedONFT.sol

**Purpose**:  
Per-collection wrapped ERC721 contract, deployed as a minimal proxy. Allows bridge/factory (owner) to mint and burn NFTs corresponding to bridged originals.

**Key Features**:
- Only owner (bridge/factory) can mint/burn.
- Per-token URI storage.
- Metadata (`name`, `symbol`, `originalToken`) set at initialization.

**Attack Surfaces & Risks**:
- **Ownership**: Only bridge/factory can call mint/burn; verify ownership cannot be hijacked.
- **Initialization**: Must prevent re-initialization or uninitialized deployment.
- **TokenURI**: Only settable at mint, cannot be changed after.
- **Upgradeability**: None; clones are static after deployment.

**Recommendations**:
- Verify `initialize` is called exactly once.
- Check for correct event emission on mint/burn.

---

## General Notes

- **External Dependencies**: Contracts depend on OpenZeppelin, LayerZero, and Clones. Ensure all dependencies are audited and up-to-date.
- **No Upgradability**: The contracts themselves are not upgradeable, but minimal proxies are used for per-collection and per-bridge deployments for gas efficiency.
- **Frontend Integration**: Ensure frontend correctly handles wallet permissions, approvals, and error reporting for all contract interactions.

---

## References

- [DynamicONFTBridge.sol](./DynamicONFTBridge.sol)
- [FactoryNftCollectionsMint.sol](./FactoryNftCollectionsMint.sol)
- [WrappedONFT.sol](./WrappedONFT.sol)
- [layerzero_nftBridge/README.md](https://github.com/0xfdbu/summerhackfest-2025/blob/main/projects/layerzero_nftBridge/README.md)
- Deployed contract addresses and further architecture diagrams available in the [README](https://github.com/0xfdbu/summerhackfest-2025/blob/main/projects/layerzero_nftBridge/README.md).

---

**For full context, auditors are strongly encouraged to review the contracts in detail and test all bridging and factory flows on testnets.**