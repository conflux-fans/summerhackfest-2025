// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/*
  Modular EVM NFT Bridge (LayerZero)
  - Multi-chain ready design: easily add new chains by updating trustedRemoteLookup and using chainID in payload.
  - Contracts included:
      1) EspaceBridge (deployed on Conflux eSpace)
      2) BaseWrappedBridge (deployed on Base or other EVM chain)

  Design principles:
  - originChain and dstChain encoded in messages, supporting multi-chain expansion.
  - trustedRemoteLookup mapping supports multiple chains.
  - Payload includes originChain, originContract, tokenId, recipient, tokenURI.
*/

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

interface ILayerZeroEndpoint {
    function send(
        uint16 _dstChainId,
        bytes calldata _destination,
        bytes calldata _payload,
        address payable _refundAddress,
        address _zroPaymentAddress,
        bytes calldata _adapterParams
    ) external payable;

    function estimateFees(
        uint16 _dstChainId,
        address _userApplication,
        bytes calldata _payload,
        bool _payInZRO,
        bytes calldata _adapterParams
    ) external view returns (uint nativeFee, uint zroFee);
}

interface ILayerZeroReceiver {
    function lzReceive(
        uint16 _srcChainId,
        bytes calldata _srcAddress,
        uint64 _nonce,
        bytes calldata _payload
    ) external;
}

///////////////////////////////////////////////////////////////////////////
// EspaceBridge (Origin chain bridge, supports multi-chain)
///////////////////////////////////////////////////////////////////////////
contract EspaceBridge is Ownable, ReentrancyGuard, ILayerZeroReceiver {
    using Strings for uint256;

    ILayerZeroEndpoint public endpoint;
    IERC721 public originalNFT;

    mapping(uint16 => bytes) public trustedRemoteLookup; // multi-chain support
    mapping(uint256 => bool) public locked;

    event BridgeOut(address indexed sender, uint16 dstChainId, address dstAddress, uint256 tokenId, string tokenURI);
    event BridgeIn(address indexed recipient, uint16 srcChainId, address srcAddress, uint256 tokenId);

    constructor(address _endpoint, address _originalNFT) Ownable(msg.sender) {
        endpoint = ILayerZeroEndpoint(_endpoint);
        originalNFT = IERC721(_originalNFT);
    }

    function setTrustedRemote(uint16 _dstChainId, bytes calldata _remote) external onlyOwner {
        trustedRemoteLookup[_dstChainId] = _remote;
    }

    function bridgeOut(
        uint16 _dstChainId,
        bytes calldata _dstContractBytes,
        uint256 _tokenId,
        address _recipient,
        bytes calldata _adapterParams
    ) external payable nonReentrant {
        require(_recipient != address(0), "Bad recipient");
        originalNFT.transferFrom(msg.sender, address(this), _tokenId);
        locked[_tokenId] = true;

        string memory tokenURI = _getTokenURI(_tokenId);

        uint8 action = 1;
        bytes memory payload = abi.encode(action, uint16(0), address(originalNFT), _tokenId, tokenURI, _recipient);

        endpoint.send{value: msg.value}(_dstChainId, _dstContractBytes, payload, payable(msg.sender), address(0), _adapterParams);

        emit BridgeOut(msg.sender, _dstChainId, _bytesToAddress(_dstContractBytes), _tokenId, tokenURI);
    }

    function _getTokenURI(uint256 tokenId) internal view returns (string memory) {
        (bool success, bytes memory data) = address(originalNFT).staticcall(
            abi.encodeWithSignature("tokenURI(uint256)", tokenId)
        );
        if (!success) return "";
        return abi.decode(data, (string));
    }

    function lzReceive(uint16 _srcChainId, bytes calldata _srcAddress, uint64, bytes calldata _payload) external override {
        require(msg.sender == address(endpoint), "Caller must be endpoint");
        bytes memory trustedRemote = trustedRemoteLookup[_srcChainId];
        require(trustedRemote.length != 0 && keccak256(trustedRemote) == keccak256(_srcAddress), "Remote not trusted");

        (uint8 action, , , uint256 originTokenId, , address recipient) = abi.decode(
            _payload,
            (uint8, uint16, address, uint256, string, address)
        );

        if (action == 2) {
            require(locked[originTokenId], "Token not locked");
            locked[originTokenId] = false;
            originalNFT.transferFrom(address(this), recipient, originTokenId);
            emit BridgeIn(recipient, _srcChainId, _bytesToAddress(_srcAddress), originTokenId);
        } else {
            revert("Unsupported action on EspaceBridge");
        }
    }

    function _bytesToAddress(bytes memory bys) internal pure returns (address addr) {
        require(bys.length >= 20, "bytes too short");
        assembly {
            addr := mload(add(bys, 20))
        }
    }

    function ownerWithdrawToken(uint256 tokenId, address to) external onlyOwner {
        require(locked[tokenId], "Token not locked");
        locked[tokenId] = false;
        originalNFT.transferFrom(address(this), to, tokenId);
    }
}

///////////////////////////////////////////////////////////////////////////
// BaseWrappedBridge (Destination, multi-chain ready)
///////////////////////////////////////////////////////////////////////////
contract BaseWrappedBridge is ERC721, Ownable, ReentrancyGuard, ILayerZeroReceiver {
    ILayerZeroEndpoint public endpoint;
    mapping(uint16 => bytes) public trustedRemoteLookup;

    mapping(bytes32 => uint256) public bridgedToWrapped;
    mapping(uint256 => bytes32) public wrappedToOriginKey;
    mapping(uint256 => OriginInfo) public wrappedOriginInfo;

    uint256 public nextTokenId = 1;

    struct OriginInfo {
        uint16 originChain;
        address originContract;
        uint256 originTokenId;
    }

    event WrappedMinted(
        address indexed recipient,
        uint16 srcChainId,
        address srcContract,
        uint256 originTokenId,
        uint256 wrappedTokenId,
        string tokenURI
    );
    event WrappedBurned(
        address indexed owner,
        uint256 wrappedTokenId,
        uint16 destChainId,
        address destContract,
        uint256 originTokenId
    );

    constructor(string memory name_, string memory symbol_, address _endpoint)
        ERC721(name_, symbol_)
        Ownable(msg.sender)
    {
        endpoint = ILayerZeroEndpoint(_endpoint);
    }

    function setTrustedRemote(uint16 _srcChainId, bytes calldata _srcContract) external onlyOwner {
        trustedRemoteLookup[_srcChainId] = _srcContract;
    }

    function lzReceive(uint16 _srcChainId, bytes calldata _srcAddress, uint64, bytes calldata _payload) external override {
        require(msg.sender == address(endpoint), "Caller must be endpoint");
        bytes memory trustedRemote = trustedRemoteLookup[_srcChainId];
        require(trustedRemote.length != 0 && keccak256(trustedRemote) == keccak256(_srcAddress), "Remote not trusted");

        (uint8 action, uint16 originChain, address originContract, uint256 originTokenId, string memory tokenURI, address recipient) = abi.decode(
            _payload,
            (uint8, uint16, address, uint256, string, address)
        );

        if (action == 1) {
            bytes32 key = keccak256(abi.encodePacked(originChain, originContract, originTokenId));
            require(bridgedToWrapped[key] == 0, "Already bridged");

            uint256 wrappedId = nextTokenId++;
            bridgedToWrapped[key] = wrappedId;
            wrappedToOriginKey[wrappedId] = key;
            wrappedOriginInfo[wrappedId] = OriginInfo({originChain: originChain, originContract: originContract, originTokenId: originTokenId});

            _safeMint(recipient, wrappedId);
            emit WrappedMinted(recipient, originChain, originContract, originTokenId, wrappedId, tokenURI);
        } else {
            revert("Unsupported action on BaseWrappedBridge");
        }
    }

    function bridgeBack(
        uint16 _dstChainId,
        bytes calldata _dstContractBytes,
        uint256 _wrappedTokenId,
        bytes calldata _adapterParams
    ) external payable nonReentrant {
        require(ownerOf(_wrappedTokenId) == msg.sender, "Not owner");
        OriginInfo memory info = wrappedOriginInfo[_wrappedTokenId];
        require(info.originContract != address(0), "Origin not found");

        _burn(_wrappedTokenId);

        uint8 action = 2;
        bytes memory payload = abi.encode(action, info.originChain, info.originContract, info.originTokenId, "", msg.sender);

        endpoint.send{value: msg.value}(_dstChainId, _dstContractBytes, payload, payable(msg.sender), address(0), _adapterParams);

        emit WrappedBurned(msg.sender, _wrappedTokenId, _dstChainId, _bytesToAddress(_dstContractBytes), info.originTokenId);
    }

    function _bytesToAddress(bytes memory bys) internal pure returns (address addr) {
        require(bys.length >= 20, "bytes too short");
        assembly {
            addr := mload(add(bys, 20))
        }
    }
}
