// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

 /**
  * @title WrappedONFT
  * @dev Per-collection wrapped ERC721 contract deployed by the factory.
  * Supports per-token URI storage.
  * Only the factory/bridge can mint/burn.
  */
contract WrappedONFT is ERC721, Ownable {
    mapping(uint256 => string) private _tokenURIs;
    address public originalToken;
    constructor() ERC721("", "") Ownable(address(this)) {}
    function initialize(string memory name_, string memory symbol_, address originalToken_, address owner_) external {
        _transferOwnership(owner_);
        originalToken = originalToken_;
    }
    function mint(address to, uint256 tokenId, string memory uri) external onlyOwner {
        _safeMint(to, tokenId);
        _tokenURIs[tokenId] = uri;
    }
    function burn(uint256 tokenId) external onlyOwner {
        _burn(tokenId);
        delete _tokenURIs[tokenId];
    }
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        _requireOwned(tokenId);
        return _tokenURIs[tokenId];
    }
}