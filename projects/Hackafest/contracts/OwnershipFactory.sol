// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./OwnershipNFT.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract OwnershipFactory is Ownable {
    struct DeployedCollection {
        address contractAddress;
        address creator;
        string name;
        string symbol;
        uint256 deployedAt;
        bool isActive;
    }
    
    mapping(address => DeployedCollection[]) public creatorCollections;
    mapping(address => bool) public isOwnershipNFT;
    
    DeployedCollection[] public allCollections;
    
    uint256 public deploymentFee = 0.01 ether; // Fee to deploy a collection
    uint256 public platformFee = 250; // 2.5% platform fee (basis points)
    
    event CollectionDeployed(
        address indexed creator,
        address indexed contractAddress,
        string name,
        string symbol
    );
    
    event CollectionStatusChanged(address indexed contractAddress, bool isActive);
    
    modifier onlyValidCreator() {
        require(msg.sender != address(0), "Invalid creator address");
        _;
    }
    
    function createCollection(
        string memory _name,
        string memory _symbol,
        string memory _description,
        string memory _category,
        uint256 _royaltyPercentage,
        uint256 _maxSupply,
        uint256 _price,
        uint256 _maxMintPerWallet,
        bool _allowlistOnly
    ) public payable onlyValidCreator returns (address) {
        require(msg.value >= deploymentFee, "Insufficient deployment fee");
        require(_royaltyPercentage <= 1000, "Royalty percentage too high"); // Max 10%
        require(_maxSupply > 0, "Max supply must be greater than 0");
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(bytes(_symbol).length > 0, "Symbol cannot be empty");
        
        // Deploy new NFT contract
        OwnershipNFT newCollection = new OwnershipNFT(
            _name,
            _symbol,
            _description,
            _category,
            _royaltyPercentage,
            _maxSupply,
            _price,
            _maxMintPerWallet,
            _allowlistOnly
        );
        
        // Transfer ownership to creator
        newCollection.transferOwnership(msg.sender);
        
        // Register the collection
        address contractAddress = address(newCollection);
        isOwnershipNFT[contractAddress] = true;
        
        DeployedCollection memory collection = DeployedCollection({
            contractAddress: contractAddress,
            creator: msg.sender,
            name: _name,
            symbol: _symbol,
            deployedAt: block.timestamp,
            isActive: true
        });
        
        creatorCollections[msg.sender].push(collection);
        allCollections.push(collection);
        
        emit CollectionDeployed(msg.sender, contractAddress, _name, _symbol);
        
        return contractAddress;
    }
    
    function getCreatorCollections(address creator) public view returns (DeployedCollection[] memory) {
        return creatorCollections[creator];
    }
    
    function getAllCollections() public view returns (DeployedCollection[] memory) {
        return allCollections;
    }
    
    function getActiveCollections() public view returns (DeployedCollection[] memory) {
        uint256 activeCount = 0;
        
        // Count active collections
        for (uint256 i = 0; i < allCollections.length; i++) {
            if (allCollections[i].isActive) {
                activeCount++;
            }
        }
        
        // Create array of active collections
        DeployedCollection[] memory activeCollections = new DeployedCollection[](activeCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 0; i < allCollections.length; i++) {
            if (allCollections[i].isActive) {
                activeCollections[currentIndex] = allCollections[i];
                currentIndex++;
            }
        }
        
        return activeCollections;
    }
    
    function setCollectionStatus(address contractAddress, bool isActive) public {
        require(isOwnershipNFT[contractAddress], "Not an OwnershipNFT contract");
        
        OwnershipNFT nftContract = OwnershipNFT(contractAddress);
        require(nftContract.owner() == msg.sender || msg.sender == owner(), "Not authorized");
        
        // Update in allCollections array
        for (uint256 i = 0; i < allCollections.length; i++) {
            if (allCollections[i].contractAddress == contractAddress) {
                allCollections[i].isActive = isActive;
                break;
            }
        }
        
        // Update in creator collections
        address creator = nftContract.collectionInfo().creator;
        DeployedCollection[] storage collections = creatorCollections[creator];
        
        for (uint256 i = 0; i < collections.length; i++) {
            if (collections[i].contractAddress == contractAddress) {
                collections[i].isActive = isActive;
                break;
            }
        }
        
        emit CollectionStatusChanged(contractAddress, isActive);
    }
    
    function verifyOwnership(address contractAddress, address holder) public view returns (bool) {
        require(isOwnershipNFT[contractAddress], "Not an OwnershipNFT contract");
        
        OwnershipNFT nftContract = OwnershipNFT(contractAddress);
        
        // Check if collection is active
        (, , , , , , , bool isActive, ) = nftContract.collectionInfo();
        if (!isActive) return false;
        
        // Check time validity
        if (!nftContract.checkTimeValidity()) return false;
        
        // Check access rules
        return nftContract.verifyAccess(holder);
    }
    
    function getCollectionInfo(address contractAddress) public view returns (
        string memory name,
        string memory symbol,
        string memory description,
        string memory category,
        uint256 royaltyPercentage,
        uint256 maxSupply,
        uint256 price,
        bool isActive,
        address creator,
        uint256 totalSupply
    ) {
        require(isOwnershipNFT[contractAddress], "Not an OwnershipNFT contract");
        
        OwnershipNFT nftContract = OwnershipNFT(contractAddress);
        
        (name, symbol, description, category, royaltyPercentage, maxSupply, price, isActive, creator) = nftContract.collectionInfo();
        totalSupply = nftContract.getTotalSupply();
    }
    
    function setDeploymentFee(uint256 _fee) public onlyOwner {
        deploymentFee = _fee;
    }
    
    function setPlatformFee(uint256 _fee) public onlyOwner {
        require(_fee <= 1000, "Platform fee too high"); // Max 10%
        platformFee = _fee;
    }
    
    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }
    
    function getCollectionCount() public view returns (uint256) {
        return allCollections.length;
    }
    
    function getCreatorCollectionCount(address creator) public view returns (uint256) {
        return creatorCollections[creator].length;
    }
}