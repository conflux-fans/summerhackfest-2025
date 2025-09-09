// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/*
  Modular EVM NFT Bridge (LayerZero V2)
  - Multi-chain ready design: easily add new chains by updating peers and using eid in payload.
  - Contracts included:
      1) EspaceBridge (deployed on Conflux eSpace)
      2) BaseWrappedBridge (deployed on Base or other EVM chain)
  Design principles:
  - originEid and dstEid encoded in messages, supporting multi-chain expansion.
  - peers mapping supports multiple chains.
  - Payload includes action, originEid, originContract, tokenId, tokenURI, recipient.
  - Upgraded to LayerZero V2 using OApp standard.
  - Use app.layerzero.network to configure DVNs and executors for the deployed OApps to avoid reverts in quote/send.
*/

import { OApp, Origin, MessagingFee } from "@layerzerolabs/lz-evm-oapp-v2/contracts/oapp/OApp.sol";
import { MessagingReceipt } from "@layerzerolabs/lz-evm-oapp-v2/contracts/oapp/OAppSender.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

///////////////////////////////////////////////////////////////////////////
// EspaceBridge (Origin chain bridge, supports multi-chain)
///////////////////////////////////////////////////////////////////////////
contract EspaceBridge is OApp, ReentrancyGuard {
    using Strings for uint256;

    IERC721 public originalNFT;
    mapping(uint256 => bool) public locked;

    event BridgeOut(address indexed sender, uint32 dstEid, address dstAddress, uint256 tokenId, string tokenURI);
    event BridgeIn(address indexed recipient, uint32 srcEid, address srcAddress, uint256 tokenId);

    constructor(address _endpoint, address _originalNFT, address _delegate) OApp(_endpoint, _delegate) Ownable(_delegate) {
        originalNFT = IERC721(_originalNFT);
    }

    function quoteBridgeOut(
        uint32 _dstEid,
        uint256 _tokenId,
        address _recipient,
        bytes calldata _options
    ) public view returns (MessagingFee memory fee) {
        string memory tokenURI = _getTokenURI(_tokenId);
        uint8 action = 1;
        bytes memory payload = abi.encode(action, endpoint.eid(), address(originalNFT), _tokenId, tokenURI, _recipient);
        fee = _quote(_dstEid, payload, _options, false);
    }

    function bridgeOut(
        uint32 _dstEid,
        uint256 _tokenId,
        address _recipient,
        bytes calldata _options
    ) external payable nonReentrant returns (MessagingReceipt memory receipt) {
        require(_recipient != address(0), "Bad recipient");
        originalNFT.transferFrom(msg.sender, address(this), _tokenId);
        locked[_tokenId] = true;
        string memory tokenURI = _getTokenURI(_tokenId);
        uint8 action = 1;
        bytes memory payload = abi.encode(action, endpoint.eid(), address(originalNFT), _tokenId, tokenURI, _recipient);
        receipt = _lzSend(_dstEid, payload, _options, MessagingFee(msg.value, 0), payable(msg.sender));
        emit BridgeOut(msg.sender, _dstEid, _bytes32ToAddress(peers[_dstEid]), _tokenId, tokenURI);
    }

    function _getTokenURI(uint256 tokenId) internal view returns (string memory) {
        (bool success, bytes memory data) = address(originalNFT).staticcall(
            abi.encodeWithSignature("tokenURI(uint256)", tokenId)
        );
        if (!success) return "";
        return abi.decode(data, (string));
    }

    function _lzReceive(
        Origin calldata _origin,
        bytes32 _guid,
        bytes calldata _payload,
        address _executor,
        bytes calldata _extraData
    ) internal virtual override {
        require(peers[_origin.srcEid] == _origin.sender, "Sender not peer");
        (uint8 action, , , uint256 originTokenId, , address recipient) = abi.decode(
            _payload,
            (uint8, uint32, address, uint256, string, address)
        );
        if (action == 2) {
            require(locked[originTokenId], "Token not locked");
            locked[originTokenId] = false;
            originalNFT.transferFrom(address(this), recipient, originTokenId);
            emit BridgeIn(recipient, _origin.srcEid, _bytes32ToAddress(_origin.sender), originTokenId);
        } else {
            revert("Unsupported action on EspaceBridge");
        }
    }

    function _bytes32ToAddress(bytes32 _bytes) internal pure returns (address) {
        return address(uint160(uint256(_bytes)));
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
contract BaseWrappedBridge is OApp, ERC721, ReentrancyGuard {
    mapping(bytes32 => uint256) public bridgedToWrapped;
    mapping(uint256 => bytes32) public wrappedToOriginKey;
    mapping(uint256 => OriginInfo) public wrappedOriginInfo;
    uint256 public nextTokenId = 1;

    struct OriginInfo {
        uint32 originEid;
        address originContract;
        uint256 originTokenId;
    }

    event WrappedMinted(
        address indexed recipient,
        uint32 srcEid,
        address srcContract,
        uint256 originTokenId,
        uint256 wrappedTokenId,
        string tokenURI
    );
    event WrappedBurned(
        address indexed owner,
        uint256 wrappedTokenId,
        uint32 destEid,
        address destContract,
        uint256 originTokenId
    );

    constructor(string memory name_, string memory symbol_, address _endpoint, address _delegate)
        OApp(_endpoint, _delegate)
        Ownable(_delegate)
        ERC721(name_, symbol_)
    {}

    function quoteBridgeBack(
        uint32 _dstEid,
        uint256 _wrappedTokenId,
        address _recipient,
        bytes calldata _options
    ) public view returns (MessagingFee memory fee) {
        OriginInfo memory info = wrappedOriginInfo[_wrappedTokenId];
        uint8 action = 2;
        bytes memory payload = abi.encode(action, info.originEid, info.originContract, info.originTokenId, "", _recipient);
        fee = _quote(_dstEid, payload, _options, false);
    }

    function _lzReceive(
        Origin calldata _origin,
        bytes32 _guid,
        bytes calldata _payload,
        address _executor,
        bytes calldata _extraData
    ) internal virtual override {
        require(peers[_origin.srcEid] == _origin.sender, "Sender not peer");
        (uint8 action, uint32 originEid, address originContract, uint256 originTokenId, string memory tokenURI, address recipient) = abi.decode(
            _payload,
            (uint8, uint32, address, uint256, string, address)
        );
        if (action == 1) {
            bytes32 key = keccak256(abi.encodePacked(originEid, originContract, originTokenId));
            require(bridgedToWrapped[key] == 0, "Already bridged");
            uint256 wrappedId = nextTokenId++;
            bridgedToWrapped[key] = wrappedId;
            wrappedToOriginKey[wrappedId] = key;
            wrappedOriginInfo[wrappedId] = OriginInfo({originEid: originEid, originContract: originContract, originTokenId: originTokenId});
            _safeMint(recipient, wrappedId);
            emit WrappedMinted(recipient, originEid, originContract, originTokenId, wrappedId, tokenURI);
        } else {
            revert("Unsupported action on BaseWrappedBridge");
        }
    }

    function bridgeBack(
        uint32 _dstEid,
        uint256 _wrappedTokenId,
        address _recipient,
        bytes calldata _options
    ) external payable nonReentrant returns (MessagingReceipt memory receipt) {
        require(ownerOf(_wrappedTokenId) == msg.sender, "Not owner");
        OriginInfo memory info = wrappedOriginInfo[_wrappedTokenId];
        require(info.originContract != address(0), "Origin not found");
        _burn(_wrappedTokenId);
        uint8 action = 2;
        bytes memory payload = abi.encode(action, info.originEid, info.originContract, info.originTokenId, "", _recipient);
        receipt = _lzSend(_dstEid, payload, _options, MessagingFee(msg.value, 0), payable(msg.sender));
        emit WrappedBurned(msg.sender, _wrappedTokenId, _dstEid, _bytes32ToAddress(peers[_dstEid]), info.originTokenId);
    }

    function _bytes32ToAddress(bytes32 _bytes) internal pure returns (address) {
        return address(uint160(uint256(_bytes)));
    }
}