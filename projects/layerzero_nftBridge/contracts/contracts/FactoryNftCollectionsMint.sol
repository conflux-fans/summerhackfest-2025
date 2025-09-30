// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";

/// @title BaseNFT - ERC721 implementation for factory-created NFT collections
contract BaseNFT is ERC721, ERC721URIStorage, Ownable {
    string private _customName;
    string private _customSymbol;
    string private _collectionImage; // Collection image CID
    string private _contractURI; // Collection metadata URI
    bool private _initialized;
    uint256 private _currentTokenId;
    address private _factory;

    constructor() ERC721("", "") Ownable(msg.sender) {}

    /// @notice Initializes a cloned collection with name, symbol, image, contract URI, and owner
    function initialize(
        string memory name_,
        string memory symbol_,
        string memory collectionImage_,
        string memory contractURI_,
        address owner_
    ) external {
        require(!_initialized, "Already initialized");
        _factory = msg.sender;
        _customName = name_;
        _customSymbol = symbol_;
        _collectionImage = collectionImage_;
        _contractURI = contractURI_;
        _transferOwnership(owner_);
        _initialized = true;
    }

    modifier onlyOwnerOrFactory() {
        require(msg.sender == owner() || msg.sender == _factory, "Ownable: caller is not the owner or factory");
        _;
    }

    function name() public view override returns (string memory) {
        return _customName;
    }

    function symbol() public view override returns (string memory) {
        return _customSymbol;
    }

    /// @notice Returns the collection image CID
    function collectionImage() public view returns (string memory) {
        return _collectionImage;
    }

    /// @notice Returns the collection metadata URI for OpenSea
    function contractURI() public view returns (string memory) {
        return _contractURI;
    }

    /// @notice Mints a new NFT with auto-incrementing token ID
    function mint(address to, string memory uri) external onlyOwnerOrFactory returns (uint256) {
        require(to != address(0), "Invalid recipient");
        uint256 tokenId = ++_currentTokenId;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        return tokenId;
    }

    /// @notice Batch mints NFTs with auto-incrementing token IDs
    function batchMint(address to, string[] calldata uris) external onlyOwnerOrFactory returns (uint256[] memory) {
        require(to != address(0), "Invalid recipient");
        require(uris.length > 0, "Empty arrays");
        uint256[] memory tokenIds = new uint256[](uris.length);
        for (uint256 i = 0; i < uris.length; i++) {
            uint256 tokenId = ++_currentTokenId;
            tokenIds[i] = tokenId;
            _safeMint(to, tokenId);
            _setTokenURI(tokenId, uris[i]);
        }
        return tokenIds;
    }

    function burn(uint256 tokenId) external onlyOwnerOrFactory {
        _burn(tokenId);
    }

    function batchBurn(uint256[] calldata tokenIds) external onlyOwnerOrFactory {
        require(tokenIds.length > 0, "Empty array");
        for (uint256 i = 0; i < tokenIds.length; i++) {
            _burn(tokenIds[i]);
        }
    }

    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}

/// @title NFTCollectionFactory - Factory for creating & managing NFT collections
contract NFTCollectionFactory {
    address public immutable implementation;
    mapping(address => address[]) private userCollections;
    mapping(address => uint256[]) private collectionNFTs;

    event CollectionCreated(address indexed collection, address indexed creator, string name, string symbol);
    event NFTMinted(address indexed collection, address indexed to, uint256 indexed tokenId, string uri);
    event NFTBatchMinted(address indexed collection, address indexed to, uint256[] tokenIds);
    event NFTBurned(address indexed collection, uint256 indexed tokenId);
    event NFTBatchBurned(address indexed collection, uint256[] tokenIds);

    constructor() {
        implementation = address(new BaseNFT());
    }

    function createCollection(
        string memory name,
        string memory symbol,
        string memory collectionImage,
        string memory contractURI
    ) external returns (address collection) {
        require(bytes(name).length > 0, "Invalid name");
        require(bytes(symbol).length > 0, "Invalid symbol");
        collection = Clones.clone(implementation);
        BaseNFT(collection).initialize(name, symbol, collectionImage, contractURI, msg.sender);
        userCollections[msg.sender].push(collection);
        emit CollectionCreated(collection, msg.sender, name, symbol);
    }

    function mintNFT(address collection, address to, string memory uri) external returns (uint256) {
        require(collection != address(0), "Invalid collection");
        require(to != address(0), "Invalid recipient");
        BaseNFT nft = BaseNFT(collection);
        require(nft.owner() == msg.sender, "Not collection owner");
        uint256 tokenId = nft.mint(to, uri);
        collectionNFTs[collection].push(tokenId);
        emit NFTMinted(collection, to, tokenId, uri);
        return tokenId;
    }

    function batchMintNFT(address collection, address to, string[] calldata uris) external returns (uint256[] memory) {
        require(collection != address(0), "Invalid collection");
        require(to != address(0), "Invalid recipient");
        require(uris.length > 0, "Empty arrays");
        BaseNFT nft = BaseNFT(collection);
        require(nft.owner() == msg.sender, "Not collection owner");
        uint256[] memory tokenIds = nft.batchMint(to, uris);
        for (uint256 i = 0; i < tokenIds.length; i++) {
            collectionNFTs[collection].push(tokenIds[i]);
        }
        emit NFTBatchMinted(collection, to, tokenIds);
        return tokenIds;
    }

    function burnNFT(address collection, uint256 tokenId) external {
        require(collection != address(0), "Invalid collection");
        BaseNFT nft = BaseNFT(collection);
        require(nft.owner() == msg.sender, "Not collection owner");
        nft.burn(tokenId);
        emit NFTBurned(collection, tokenId);
    }

    function batchBurnNFT(address collection, uint256[] calldata tokenIds) external {
        require(collection != address(0), "Invalid collection");
        require(tokenIds.length > 0, "Empty array");
        BaseNFT nft = BaseNFT(collection);
        require(nft.owner() == msg.sender, "Not collection owner");
        nft.batchBurn(tokenIds);
        emit NFTBatchBurned(collection, tokenIds);
    }

    function getUserCollections(address user) external view returns (address[] memory) {
        return userCollections[user];
    }

    function getCollectionNFTs(address collection) external view returns (uint256[] memory) {
        return collectionNFTs[collection];
    }
}