// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ImageMintNFT is ERC721, Ownable {
    uint256 public nextTokenId;

    struct NFTMetadata {
        string name;
        string cid; // IPFS CID
    }

    mapping(uint256 => NFTMetadata) public tokenMetadata;

    // Constructor: pass msg.sender to Ownable for initial ownership
    constructor() ERC721("ImageMintNFT", "IMNFT") Ownable(msg.sender) {}

    // Users mint NFTs with a name and IPFS CID
    function mintNFT(string memory _name, string memory _cid) external {
        uint256 tokenId = nextTokenId;
        _safeMint(msg.sender, tokenId);

        tokenMetadata[tokenId] = NFTMetadata({
            name: _name,
            cid: _cid
        });

        nextTokenId++;
    }

    // Manual existence check
    function exists(uint256 tokenId) public view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }

    // Override tokenURI
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(exists(tokenId), "Token does not exist");
        NFTMetadata memory metadata = tokenMetadata[tokenId];
        return string(abi.encodePacked("ipfs://", metadata.cid));
    }
}
