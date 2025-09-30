// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract OwnershipNFT is ERC721, ERC721URIStorage, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIdCounter;
    
    struct AccessRule {
        string ruleType; // "hold-one", "specific-trait", "min-rarity"
        string traitType;
        string traitValue;
        uint256 minRarity;
        uint256 validityStart;
        uint256 validityEnd;
        bool transferable;
    }
    
    struct CollectionInfo {
        string name;
        string symbol;
        string description;
        string category;
        uint256 royaltyPercentage;
        uint256 maxSupply;
        uint256 price;
        bool isActive;
        address creator;
    }
    
    CollectionInfo public collectionInfo;
    AccessRule public accessRule;
    
    mapping(uint256 => string) private _tokenTraits;
    mapping(uint256 => uint256) private _tokenRarity;
    mapping(address => bool) private _allowlist;
    mapping(address => uint256) private _mintedPerWallet;
    
    uint256 public maxMintPerWallet;
    bool public allowlistOnly;
    
    event TokenMinted(address indexed to, uint256 indexed tokenId, string tokenURI);
    event AccessRuleUpdated(string ruleType, string traitType, string traitValue);
    event CollectionStatusChanged(bool isActive);
    
    modifier onlyActiveCollection() {
        require(collectionInfo.isActive, "Collection is not active");
        _;
    }
    
    modifier onlyAllowedMinter() {
        if (allowlistOnly) {
            require(_allowlist[msg.sender], "Address not in allowlist");
        }
        _;
    }
    
    constructor(
        string memory _name,
        string memory _symbol,
        string memory _description,
        string memory _category,
        uint256 _royaltyPercentage,
        uint256 _maxSupply,
        uint256 _price,
        uint256 _maxMintPerWallet,
        bool _allowlistOnly
    ) ERC721(_name, _symbol) {
        collectionInfo = CollectionInfo({
            name: _name,
            symbol: _symbol,
            description: _description,
            category: _category,
            royaltyPercentage: _royaltyPercentage,
            maxSupply: _maxSupply,
            price: _price,
            isActive: true,
            creator: msg.sender
        });
        
        maxMintPerWallet = _maxMintPerWallet;
        allowlistOnly = _allowlistOnly;
        
        // Default access rule: hold at least 1 token
        accessRule = AccessRule({
            ruleType: "hold-one",
            traitType: "",
            traitValue: "",
            minRarity: 0,
            validityStart: block.timestamp,
            validityEnd: 0, // 0 means no expiry
            transferable: true
        });
    }
    
    function mint(address to, string memory tokenURI) 
        public 
        payable 
        onlyActiveCollection 
        onlyAllowedMinter 
        nonReentrant 
    {
        require(_tokenIdCounter.current() < collectionInfo.maxSupply, "Max supply reached");
        require(msg.value >= collectionInfo.price, "Insufficient payment");
        require(_mintedPerWallet[to] < maxMintPerWallet, "Wallet mint limit exceeded");
        
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
        _mintedPerWallet[to]++;
        
        emit TokenMinted(to, tokenId, tokenURI);
    }
    
    function batchMint(address[] memory recipients, string[] memory tokenURIs) 
        public 
        onlyOwner 
        onlyActiveCollection 
    {
        require(recipients.length == tokenURIs.length, "Arrays length mismatch");
        require(_tokenIdCounter.current() + recipients.length <= collectionInfo.maxSupply, "Would exceed max supply");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            uint256 tokenId = _tokenIdCounter.current();
            _tokenIdCounter.increment();
            
            _safeMint(recipients[i], tokenId);
            _setTokenURI(tokenId, tokenURIs[i]);
            
            emit TokenMinted(recipients[i], tokenId, tokenURIs[i]);
        }
    }
    
    function setAccessRule(
        string memory _ruleType,
        string memory _traitType,
        string memory _traitValue,
        uint256 _minRarity,
        uint256 _validityStart,
        uint256 _validityEnd,
        bool _transferable
    ) public onlyOwner {
        accessRule = AccessRule({
            ruleType: _ruleType,
            traitType: _traitType,
            traitValue: _traitValue,
            minRarity: _minRarity,
            validityStart: _validityStart,
            validityEnd: _validityEnd,
            transferable: _transferable
        });
        
        emit AccessRuleUpdated(_ruleType, _traitType, _traitValue);
    }
    
    function setTokenTraits(uint256 tokenId, string memory traits) public onlyOwner {
        require(_exists(tokenId), "Token does not exist");
        _tokenTraits[tokenId] = traits;
    }
    
    function setTokenRarity(uint256 tokenId, uint256 rarity) public onlyOwner {
        require(_exists(tokenId), "Token does not exist");
        _tokenRarity[tokenId] = rarity;
    }
    
    function addToAllowlist(address[] memory addresses) public onlyOwner {
        for (uint256 i = 0; i < addresses.length; i++) {
            _allowlist[addresses[i]] = true;
        }
    }
    
    function removeFromAllowlist(address[] memory addresses) public onlyOwner {
        for (uint256 i = 0; i < addresses.length; i++) {
            _allowlist[addresses[i]] = false;
        }
    }
    
    function setCollectionStatus(bool _isActive) public onlyOwner {
        collectionInfo.isActive = _isActive;
        emit CollectionStatusChanged(_isActive);
    }
    
    function verifyAccess(address holder) public view returns (bool) {
        uint256 balance = balanceOf(holder);
        
        // Check basic ownership
        if (keccak256(bytes(accessRule.ruleType)) == keccak256(bytes("hold-one"))) {
            return balance >= 1;
        }
        
        // Check specific trait requirements
        if (keccak256(bytes(accessRule.ruleType)) == keccak256(bytes("specific-trait"))) {
            if (balance == 0) return false;
            
            // Check if any owned token has the required trait
            for (uint256 i = 0; i < balance; i++) {
                uint256 tokenId = tokenOfOwnerByIndex(holder, i);
                string memory traits = _tokenTraits[tokenId];
                
                // Simple trait matching (in production, use JSON parsing)
                if (bytes(traits).length > 0 && 
                    keccak256(bytes(traits)) == keccak256(bytes(accessRule.traitValue))) {
                    return true;
                }
            }
            return false;
        }
        
        // Check minimum rarity requirements
        if (keccak256(bytes(accessRule.ruleType)) == keccak256(bytes("min-rarity"))) {
            if (balance == 0) return false;
            
            for (uint256 i = 0; i < balance; i++) {
                uint256 tokenId = tokenOfOwnerByIndex(holder, i);
                if (_tokenRarity[tokenId] >= accessRule.minRarity) {
                    return true;
                }
            }
            return false;
        }
        
        return false;
    }
    
    function checkTimeValidity() public view returns (bool) {
        if (accessRule.validityStart > block.timestamp) return false;
        if (accessRule.validityEnd > 0 && accessRule.validityEnd < block.timestamp) return false;
        return true;
    }
    
    function getTokenTraits(uint256 tokenId) public view returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        return _tokenTraits[tokenId];
    }
    
    function getTokenRarity(uint256 tokenId) public view returns (uint256) {
        require(_exists(tokenId), "Token does not exist");
        return _tokenRarity[tokenId];
    }
    
    function isInAllowlist(address account) public view returns (bool) {
        return _allowlist[account];
    }
    
    function getMintedCount(address account) public view returns (uint256) {
        return _mintedPerWallet[account];
    }
    
    function getTotalSupply() public view returns (uint256) {
        return _tokenIdCounter.current();
    }
    
    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }
    
    // Override functions for URI storage
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
    
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
    
    // Disable transfers if not transferable
    function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize) internal override {
        if (from != address(0) && to != address(0)) { // Not mint or burn
            require(accessRule.transferable, "Token is not transferable");
        }
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }
}