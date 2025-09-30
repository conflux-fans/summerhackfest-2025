// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "poseidon-solidity/PoseidonT4.sol";

/**
 * @dev DeepFamily Token Contract Interface
 */
interface IDeepFamilyToken {
  function mint(address to) external returns (uint256 reward);
  function recentReward() external view returns (uint256);
  function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

/**
 * @dev Groth16 verifier interface for onboarding person hash commitments.
 */
interface IPersonHashVerifier {
  function verifyProof(
    uint256[2] calldata a,
    uint256[2][2] calldata b,
    uint256[2] calldata c,
    uint256[7] calldata publicSignals
  ) external view returns (bool);
}

/**
 * @dev Poseidon name binding proof verifier interface used before minting NFTs.
 */
interface INamePoseidonVerifier {
  function verifyProof(
    uint256[2] calldata a,
    uint256[2][2] calldata b,
    uint256[2] calldata c,
    uint256[4] calldata publicSignals
  ) external view returns (bool);
}

/**
 * @title DeepFamily — Zero-Knowledge Secured Family Tree
 * @notice Maintains verifiable family lineages with multi-version personas, endorsement flows, and NFT incentives.
 * @dev Poseidon commitments paired with Groth16 verifiers deliver:
 *      - private-yet-verifiable identity commitments plus addPersonZK onboarding
 *      - mintPersonNFT name-binding proofs, endorsement-driven FT reward routing, and parent-linked version histories
 *      - story chunk append/update/seal lifecycle, pagination-friendly read APIs, and strict validation guardrails
 */
contract DeepFamily is ERC721Enumerable, Ownable, ReentrancyGuard {
  // ========== Custom Errors (Unified Error Handling) ==========

  // Input validation errors
  error InvalidPersonHash();
  error InvalidFatherVersionIndex();
  error InvalidMotherVersionIndex();
  error InvalidVersionIndex();
  error InvalidFullName();
  error InvalidTagLength();
  error InvalidCIDLength();
  error InvalidBirthPlace();
  error InvalidDeathPlace();
  error InvalidBirthMonth();
  error InvalidBirthDay();
  error InvalidStory();
  error InvalidTokenURI();
  // Added ZK-related errors
  error InvalidZKProof();
  error VerifierNotSet();
  error NameVerifierNotSet();

  // Business logic errors
  error DuplicateVersion();
  error MustEndorseVersionFirst();
  error VersionAlreadyMinted();
  error BasicInfoMismatch();

  // Token-related errors
  error TokenContractNotSet();
  error InvalidTokenId();
  error EndorsementFeeTransferFailed();

  // Query-related errors
  error PageSizeExceedsLimit();
  error DirectETHNotAccepted();

  // Story sharding related errors
  error StoryAlreadySealed();
  error ChunkIndexOutOfRange();
  error InvalidChunkContent();
  error ChunkHashMismatch();
  error StoryNotFound();
  error MustBeNFTHolder();

  /**
   * @dev Basic identity information structure
   */
  struct PersonBasicInfo {
    bytes32 fullNameCommitment; // Poseidon digest derived from keccak(fullName) and salt
    bool isBirthBC; // Whether birth is BC (Before Christ)
    uint16 birthYear; // Birth year(0=unknown)
    uint8 birthMonth; // Birth month (1-12, 0=unknown)
    uint8 birthDay; // Birth day (1-31, 0=unknown)
    uint8 gender; // Gender (0=unknown, 1=male, 2=female, 3=other)
  }

  /**
   * @dev Person version information structure
   */
  struct PersonVersion {
    bytes32 personHash; // Person identifier hash
    bytes32 fatherHash; // Father's hash
    bytes32 motherHash; // Mother's hash
    uint256 versionIndex; // Version index of this version (starts from 1, determined when written)
    uint256 fatherVersionIndex; // Father's version index (0 means unspecified)
    uint256 motherVersionIndex; // Mother's version index (0 means unspecified)
    address addedBy; // Address of the person who added this - packed with timestamp in slot 3's first 20 bytes
    uint96 timestamp; // Addition timestamp - packed with addedBy in slot 3's last 12 bytes, sufficient until 2^96 seconds later
    string tag; // Version tag - dynamic storage
    string metadataCID; // IPFS CID - dynamic storage
  }

  /**
   * @dev NFT supplementary information structure
   */
  struct PersonSupplementInfo {
    string fullName; // Full name
    string birthPlace; // Birth place
    bool isDeathBC; // Whether death is BC (Before Christ)
    uint16 deathYear; // Death year(0=unknown)
    uint8 deathMonth; // Death month (0-12, 0=unknown)
    uint8 deathDay; // Death day (0-31, 0=unknown)
    string deathPlace; // Death place
    string story; // Life story summary (currently kept as abstract, detailed content uses sharded storage)
  }

  /**
   * @dev NFT core information structure - combines basic and supplementary information
   */
  struct PersonCoreInfo {
    PersonBasicInfo basicInfo; // Basic information
    PersonSupplementInfo supplementInfo; // Supplementary information
  }

  /**
   * @dev Child version reference (used to query child versions from parent versions)
   */
  struct ChildRef {
    bytes32 childHash;
    uint256 childVersionIndex; // Starts from 1
  }

  /**
   * @dev Story chunk structure - used for sharded storage of detailed life stories
   */
  struct StoryChunk {
    uint256 chunkIndex; // Chunk index (starts from 0)
    bytes32 chunkHash; // Chunk content hash (for data integrity verification)
    string content; // Chunk content (limited to reasonable range to control gas costs)
    uint256 timestamp; // Creation/update timestamp
    address lastEditor; // Last editor's address
  }

  /**
   * @dev Story metadata structure - manages metadata of complete stories
   */
  struct StoryMetadata {
    uint256 totalChunks; // Current total number of chunks
    bytes32 fullStoryHash; // Comprehensive hash of complete story (combination of all chunk hashes)
    uint256 lastUpdateTime; // Last update timestamp
    bool isSealed; // Whether sealed (no further modifications after sealing, ensuring historical record immutability)
    uint256 totalLength; // Total character count of all chunk contents
  }

  // ========== Core Storage Mappings ==========

  /// @dev Person hash => version array, stores all version information of a person
  mapping(bytes32 => PersonVersion[]) public personVersions;

  /// @dev Counter for total number of different persons in the system
  uint256 public totalPersonsCount;

  /// @dev Person hash => version hash => whether exists, prevents duplicate versions
  mapping(bytes32 => mapping(bytes32 => bool)) public versionExists;
  /// @dev Person hash => user address => endorsed version index, each user can only endorse one version per person
  /// @notice Version index starts from 1, 0 means no endorsement
  mapping(bytes32 => mapping(address => uint256)) public endorsedVersionIndex;

  // ========== NFT Related ==========

  /// @dev NFT counter, incrementally generates tokenId
  uint256 public tokenCounter;

  /// @dev TokenID => person hash, the person corresponding to the NFT
  mapping(uint256 => bytes32) public tokenIdToPerson;

  /// @dev TokenID => version index, the specific version corresponding to the NFT
  mapping(uint256 => uint256) public tokenIdToVersionIndex;

  /// @dev TokenID => core information, implements key information on-chain
  mapping(uint256 => PersonCoreInfo) public nftCoreInfo;

  /// @dev TokenID => TokenURI, stores NFT metadata URI
  mapping(uint256 => string) private _tokenURIs;
  /// @dev TokenID => historical TokenURI array
  mapping(uint256 => string[]) public tokenURIHistory;

  /// @dev (person hash, version index) => TokenID, ensures each version can only be minted once
  mapping(bytes32 => mapping(uint256 => uint256)) public versionToTokenId;

  // ========== Story Sharding Storage Mappings ==========

  /// @dev tokenId => story metadata
  mapping(uint256 => StoryMetadata) public storyMetadata;

  /// @dev tokenId => chunkIndex => chunk data
  mapping(uint256 => mapping(uint256 => StoryChunk)) public storyChunks;

  /// @dev tokenId => active chunk indices array (for efficient traversal)
  mapping(uint256 => uint256[]) public activeChunkIndices;

  // ========== Statistics Mappings ==========

  /// @dev Person hash => version index => endorsement count, reflects version credibility
  mapping(bytes32 => mapping(uint256 => uint256)) public versionEndorsementCount;

  // Name indexing removed for privacy

  /// @dev (parent person hash, parent version index) => children version reference array
  mapping(bytes32 => mapping(uint256 => ChildRef[])) public childrenOf;

  // ========== System Constants ==========

  /// @dev Maximum length for long text (such as life stories)
  uint256 public constant MAX_LONG_TEXT_LENGTH = 256;

  /// @dev Maximum results per query page
  uint256 public constant MAX_QUERY_PAGE_SIZE = 100;

  /// @dev Maximum content length per chunk (1KB text)
  uint256 public constant MAX_CHUNK_CONTENT_LENGTH = 1000;

  /// @dev Maximum number of story chunks per NFT
  uint256 public constant MAX_STORY_CHUNKS = 100;

  // Public signals include 3 hashes × 2 limbs (each limb 128-bit): person/father/mother
  uint256 private constant _HASH_LIMBS_REQUIRED = 6; // 3 hashes * 2 limbs

  /// @dev DeepFamily token contract address (immutable)
  address public immutable DEEP_FAMILY_TOKEN_CONTRACT;

  /// @dev ZK verification contract address (immutable)
  address public immutable PERSON_HASH_VERIFIER;
  address public immutable NAME_POSEIDON_VERIFIER;

  // ========== Event Definitions ==========

  /**
   * @dev Person version added event (extended: includes parent hashes and version indices for frontend/indexing tree construction)
   * @notice Version index starts from 1
   * @param personHash Person hash (keccak256 of Poseidon commitment)
   * @param versionIndex Version index
   * @param addedBy Address of the person who added this
   * @param timestamp Addition timestamp
   * @param fatherHash Father's hash (keccak256 of Poseidon commitment)
   * @param fatherVersionIndex Father's version index (0 means unspecified)
   * @param motherHash Mother's hash (keccak256 of Poseidon commitment)
   * @param motherVersionIndex Mother's version index (0 means unspecified)
   * @param tag Version tag
   */
  event PersonVersionAdded(
    bytes32 indexed personHash,
    uint256 indexed versionIndex,
    address indexed addedBy,
    uint256 timestamp,
    bytes32 fatherHash,
    uint256 fatherVersionIndex,
    bytes32 motherHash,
    uint256 motherVersionIndex,
    string tag
  );

  /**
   * @dev Version endorsement event
   * @notice Version index starts from 1
   * @param personHash Person hash (keccak256 of Poseidon commitment)
   * @param endorser Endorser's address
   * @param versionIndex Endorsed version index
   * @param endorsementFee Endorsement fee
   * @param timestamp Endorsement timestamp
   */
  event PersonVersionEndorsed(
    bytes32 indexed personHash,
    address indexed endorser,
    uint256 versionIndex,
    uint256 endorsementFee,
    uint256 timestamp
  );

  /**
   * @dev Person hash ZK verification event (emits final keccak256-wrapped hash)
   */
  event PersonHashZKVerified(bytes32 indexed personHash, address indexed prover);

  /**
   * @dev NFT minting event
   * @notice Version index starts from 1
   * @param personHash Person hash (keccak256 of Poseidon commitment)
   * @param tokenId NFT TokenID
   * @param owner NFT holder
   * @param versionIndex Corresponding version index
   * @param tokenURI NFT metadata URI
   * @param timestamp Minting timestamp
   */
  event PersonNFTMinted(
    bytes32 indexed personHash,
    uint256 indexed tokenId,
    address indexed owner,
    uint256 versionIndex,
    string tokenURI,
    uint256 timestamp
  );

  /**
   * @dev NFT metadata URI update event
   * @param tokenId NFT TokenID
   * @param owner Updater (current holder)
   * @param oldURI Old URI
   * @param newURI New URI
   */
  event TokenURIUpdated(
    uint256 indexed tokenId,
    address indexed owner,
    string oldURI,
    string newURI
  );

  // Name discovery event removed for privacy

  /**
   * @dev Token mining reward distribution event
   * @param miner Miner's address
   * @param personHash Added person hash
   * @param versionIndex Version index
   * @param reward Token reward received
   */
  event TokenRewardDistributed(
    address indexed miner,
    bytes32 indexed personHash,
    uint256 indexed versionIndex,
    uint256 reward
  );

  // ========== Story Sharding Related Events ==========

  /**
   * @dev Story chunk added event
   * @param tokenId NFT TokenID
   * @param chunkIndex Chunk index
   * @param chunkHash Chunk hash
   * @param editor Editor's address
   * @param contentLength Chunk content length
   */
  event StoryChunkAdded(
    uint256 indexed tokenId,
    uint256 indexed chunkIndex,
    bytes32 chunkHash,
    address indexed editor,
    uint256 contentLength
  );

  /**
   * @dev Story chunk updated event
   * @param tokenId NFT TokenID
   * @param chunkIndex Chunk index
   * @param oldHash Old chunk hash
   * @param newHash New chunk hash
   * @param editor Editor's address
   */
  event StoryChunkUpdated(
    uint256 indexed tokenId,
    uint256 indexed chunkIndex,
    bytes32 oldHash,
    bytes32 newHash,
    address indexed editor
  );

  /**
   * @dev Story sealed event
   * @param tokenId NFT TokenID
   * @param totalChunks Total chunks
   * @param fullStoryHash Complete story hash
   * @param sealer Sealer's address
   */
  event StorySealed(
    uint256 indexed tokenId,
    uint256 totalChunks,
    bytes32 fullStoryHash,
    address indexed sealer
  );

  // ========== Function Modifiers ==========

  /**
   * @dev Validates person hash and version index validity (merged version)
   * @param personHash Person hash
   * @param versionIndex Version index
   */
  modifier validPersonAndVersion(bytes32 personHash, uint256 versionIndex) {
    if (personHash == bytes32(0)) revert InvalidPersonHash();
    if (versionIndex == 0 || versionIndex > personVersions[personHash].length) {
      revert InvalidVersionIndex();
    }
    _;
  }

  // ========== Constructor ==========

  /**
   * @dev Constructor, initializes ERC721 contract and token contract address
   * @param _deepFamilyTokenContract DeepFamily token contract address
   * @param _personHashVerifier Person hash ZK verification contract address
   */
  constructor(
    address _deepFamilyTokenContract,
    address _personHashVerifier,
    address _namePoseidonVerifier
  ) ERC721("DeepFamily", "Family") Ownable(msg.sender) {
    if (_deepFamilyTokenContract == address(0)) revert TokenContractNotSet();
    if (_personHashVerifier == address(0)) revert VerifierNotSet();
    if (_namePoseidonVerifier == address(0)) revert NameVerifierNotSet();
    DEEP_FAMILY_TOKEN_CONTRACT = _deepFamilyTokenContract;
    PERSON_HASH_VERIFIER = _personHashVerifier;
    NAME_POSEIDON_VERIFIER = _namePoseidonVerifier;
  }

  // ========== Core Functionality Functions ==========

  /**
   * @dev Reassembles 2 128-bit limbs starting from 'start' in publicSignals into raw Poseidon digest bytes32 (big-endian: hi128|lo128).
   */
  function _packHashFromTwo128(uint256 hi, uint256 lo) internal pure returns (bytes32 h) {
    unchecked {
      if ((hi >> 128) != 0 || (lo >> 128) != 0) revert InvalidZKProof();
      uint256 v = (hi << 128) | lo;
      h = bytes32(v);
    }
  }

  /**
   * @dev Wrap raw Poseidon digest with keccak256 for domain separation and collision resistance.
   */
  function _wrapPoseidonHash(bytes32 poseidonDigest) internal pure returns (bytes32) {
    return keccak256(abi.encodePacked(poseidonDigest));
  }

  /**
   * @dev Check if person hash exists in the system (non-zero and has version records)
   * @param personHash Person hash to check
   * @return Whether it exists
   */
  function _personExists(bytes32 personHash) internal view returns (bool) {
    return personHash != bytes32(0) && personVersions[personHash].length > 0;
  }

  /**
   * @notice Calculate unique person hash value
   * @dev Matches circuit Poseidon output and applies keccak256 for final domain-separated hash
   */
  function getPersonHash(PersonBasicInfo memory basicInfo) public pure returns (bytes32) {
    if (basicInfo.fullNameCommitment == bytes32(0)) revert InvalidFullName();
    if (basicInfo.birthMonth > 12) revert InvalidBirthMonth();
    if (basicInfo.birthDay > 31) revert InvalidBirthDay();

    uint256 limb0 = uint256(basicInfo.fullNameCommitment) >> 128;
    uint256 limb1 = uint256(basicInfo.fullNameCommitment) & ((1 << 128) - 1);

    uint256 packedData = (uint256(basicInfo.birthYear) << 24) |
      (uint256(basicInfo.birthMonth) << 16) |
      (uint256(basicInfo.birthDay) << 8) |
      (uint256(basicInfo.gender) << 1) |
      (basicInfo.isBirthBC ? 1 : 0);

    uint256[3] memory inputs;
    inputs[0] = limb0;
    inputs[1] = limb1;
    inputs[2] = packedData;

    uint256 poseidonResult = PoseidonT4.hash(inputs);
    bytes32 poseidonDigest = bytes32(poseidonResult);

    return _wrapPoseidonHash(poseidonDigest);
  }

  /**
   * @dev Unified single string hash tool (only for single string -> keccak256).
   * @return Calculated hash value
   */
  function _hashString(string memory value) internal pure returns (bytes32) {
    return keccak256(abi.encodePacked(value));
  }

  /**
   * @dev Internal core function for adding person versions and establishing indices
   * @param personHash Person hash
   * @param fatherHash Father's hash
   * @param motherHash Mother's hash
   * @param fatherVersionIndex Father's version index (0 means unspecified)
   * @param motherVersionIndex Mother's version index (0 means unspecified)
   * @param tag Version tag
   * @param metadataCID Metadata CID (IPFS Content Identifier)
   */
  function _addPersonInternal(
    bytes32 personHash,
    bytes32 fatherHash,
    bytes32 motherHash,
    uint256 fatherVersionIndex,
    uint256 motherVersionIndex,
    string calldata tag,
    string calldata metadataCID
  ) internal {
    if (bytes(tag).length > MAX_LONG_TEXT_LENGTH) revert InvalidTagLength();
    if (bytes(metadataCID).length > MAX_LONG_TEXT_LENGTH) revert InvalidCIDLength();
    if (fatherVersionIndex > personVersions[fatherHash].length) revert InvalidFatherVersionIndex();
    if (motherVersionIndex > personVersions[motherHash].length) revert InvalidMotherVersionIndex();
    bytes32 versionHash = keccak256(
      abi.encodePacked(
        personHash,
        fatherHash,
        motherHash,
        fatherVersionIndex,
        motherVersionIndex,
        tag
      )
    );
    if (versionExists[personHash][versionHash]) revert DuplicateVersion();
    versionExists[personHash][versionHash] = true;
    personVersions[personHash].push(
      PersonVersion({
        personHash: personHash,
        fatherHash: fatherHash,
        motherHash: motherHash,
        versionIndex: 0,
        fatherVersionIndex: fatherVersionIndex,
        motherVersionIndex: motherVersionIndex,
        tag: tag,
        metadataCID: metadataCID,
        addedBy: msg.sender,
        timestamp: uint96(block.timestamp)
      })
    );
    uint256 versionIndex = personVersions[personHash].length;
    personVersions[personHash][versionIndex - 1].versionIndex = versionIndex;
    if (fatherHash != bytes32(0)) {
      childrenOf[fatherHash][fatherVersionIndex].push(
        ChildRef({childHash: personHash, childVersionIndex: versionIndex})
      );
    }
    if (motherHash != bytes32(0)) {
      childrenOf[motherHash][motherVersionIndex].push(
        ChildRef({childHash: personHash, childVersionIndex: versionIndex})
      );
    }
    if (versionIndex == 1) {
      totalPersonsCount++;
    }
    emit PersonVersionAdded(
      personHash,
      versionIndex,
      msg.sender,
      block.timestamp,
      fatherHash,
      fatherVersionIndex,
      motherHash,
      motherVersionIndex,
      tag
    );
    // Name indexing removed
    if (_personExists(fatherHash) && _personExists(motherHash)) {
      uint256 reward = IDeepFamilyToken(DEEP_FAMILY_TOKEN_CONTRACT).mint(msg.sender);
      if (reward > 0) {
        emit TokenRewardDistributed(msg.sender, personHash, versionIndex, reward);
      }
    }
  }

  /**
   * @dev Original addPerson changed to call internal function (preserves non-ZK entry point, can be disabled later)
   */
  function addPerson(
    bytes32 personHash,
    bytes32 fatherHash,
    bytes32 motherHash,
    uint256 fatherVersionIndex,
    uint256 motherVersionIndex,
    string calldata tag,
    string calldata metadataCID
  ) public {
    _addPersonInternal(
      personHash,
      fatherHash,
      motherHash,
      fatherVersionIndex,
      motherVersionIndex,
      tag,
      metadataCID
    );
  }

  /**
   * @dev Zero-knowledge proof based addition entry point (limb version):
   * publicSignals mapping (fixed order, all are 128-bit limbs, big-endian concatenation hi|lo):
   * 0..1 => personHash limbs (hi -> lo)
   * 2..3 => fatherHash limbs (hi -> lo)
   * 4..5 => motherHash limbs (hi -> lo)
   * 6    => submitter address (uint160 in lower 160 bits)
   */
  function addPersonZK(
    uint256[2] calldata a,
    uint256[2][2] calldata b,
    uint256[2] calldata c,
    uint256[7] calldata publicSignals,
    uint256 fatherVersionIndex,
    uint256 motherVersionIndex,
    string calldata tag,
    string calldata metadataCID
  ) external {
    uint256 submitter = publicSignals[_HASH_LIMBS_REQUIRED];
    if (submitter != uint256(uint160(msg.sender))) revert InvalidZKProof();

    if (!IPersonHashVerifier(PERSON_HASH_VERIFIER).verifyProof(a, b, c, publicSignals)) {
      revert InvalidZKProof();
    }

    bytes32 personHash_ = _wrapPoseidonHash(
      _packHashFromTwo128(publicSignals[0], publicSignals[1])
    );
    bytes32 fatherHash_ = _wrapPoseidonHash(
      _packHashFromTwo128(publicSignals[2], publicSignals[3])
    );
    bytes32 motherHash_ = _wrapPoseidonHash(
      _packHashFromTwo128(publicSignals[4], publicSignals[5])
    );

    emit PersonHashZKVerified(personHash_, msg.sender);

    _addPersonInternal(
      personHash_,
      fatherHash_,
      motherHash_,
      fatherVersionIndex,
      motherVersionIndex,
      tag,
      metadataCID
    );
  }

  /**
   * @notice Endorse a supported version
   * @dev Express trust in a specific version through endorsement, requires spending FamilyTokens equal to current reward amount.
   * @param personHash Person hash
   * @param versionIndex Version index to endorse (starts from 1)
   */
  function endorseVersion(
    bytes32 personHash,
    uint256 versionIndex
  ) external validPersonAndVersion(personHash, versionIndex) {
    uint256 prev = endorsedVersionIndex[personHash][msg.sender];
    if (prev == versionIndex) {
      return;
    }

    uint256 arrayIndex = versionIndex - 1;
    uint256 fee = IDeepFamilyToken(DEEP_FAMILY_TOKEN_CONTRACT).recentReward();

    if (fee > 0) {
      PersonVersion storage v = personVersions[personHash][arrayIndex];
      uint256 tokenId = versionToTokenId[personHash][arrayIndex];
      address recipient;
      if (tokenId != 0) {
        address holder = _ownerOf(tokenId);
        if (holder != address(0)) {
          recipient = holder;
        } else {
          recipient = v.addedBy;
        }
      } else {
        recipient = v.addedBy;
      }
      bool ok = IDeepFamilyToken(DEEP_FAMILY_TOKEN_CONTRACT).transferFrom(
        msg.sender,
        recipient,
        fee
      );
      if (!ok) revert EndorsementFeeTransferFailed();
    }

    if (prev > 0) {
      uint256 prevIdx = prev - 1;
      uint256 count = versionEndorsementCount[personHash][prevIdx];
      if (count > 0) {
        versionEndorsementCount[personHash][prevIdx] = count - 1;
      }
    }

    versionEndorsementCount[personHash][arrayIndex] += 1;
    endorsedVersionIndex[personHash][msg.sender] = versionIndex;

    emit PersonVersionEndorsed(personHash, msg.sender, versionIndex, fee, block.timestamp);
  }

  /**
   * @notice Mint family tree NFT and put core information on-chain.
   * @dev Can only mint when caller has completed endorsement for this version.
   * @param personHash Person hash
   * @param versionIndex Version index (starts from 1)
   * @param _tokenURI NFT metadata URI (can be empty string)
   * @param coreInfo Person core information structure
   */
  function mintPersonNFT(
    uint256[2] calldata a,
    uint256[2][2] calldata b,
    uint256[2] calldata c,
    uint256[4] calldata publicSignals,
    bytes32 personHash,
    uint256 versionIndex,
    string calldata _tokenURI,
    PersonCoreInfo calldata coreInfo
  ) external nonReentrant validPersonAndVersion(personHash, versionIndex) {
    uint256 arrayIndex = versionIndex - 1;

    if (versionToTokenId[personHash][arrayIndex] != 0) revert VersionAlreadyMinted();

    if (endorsedVersionIndex[personHash][msg.sender] != versionIndex) {
      revert MustEndorseVersionFirst();
    }

    if (bytes(_tokenURI).length > MAX_LONG_TEXT_LENGTH) revert InvalidTokenURI();
    if (bytes(coreInfo.supplementInfo.fullName).length == 0) revert InvalidFullName();
    if (bytes(coreInfo.supplementInfo.fullName).length > MAX_LONG_TEXT_LENGTH)
      revert InvalidFullName();
    if (bytes(coreInfo.supplementInfo.story).length > MAX_LONG_TEXT_LENGTH) revert InvalidStory();
    if (bytes(coreInfo.supplementInfo.birthPlace).length > MAX_LONG_TEXT_LENGTH)
      revert InvalidBirthPlace();
    if (bytes(coreInfo.supplementInfo.deathPlace).length > MAX_LONG_TEXT_LENGTH)
      revert InvalidDeathPlace();

    bytes32 computedHash = getPersonHash(coreInfo.basicInfo);
    if (computedHash != personHash) revert BasicInfoMismatch();

    if (!INamePoseidonVerifier(NAME_POSEIDON_VERIFIER).verifyProof(a, b, c, publicSignals))
      revert InvalidZKProof();

    bytes32 poseidonDigest = _packHashFromTwo128(publicSignals[0], publicSignals[1]);
    if (poseidonDigest != coreInfo.basicInfo.fullNameCommitment) revert BasicInfoMismatch();

    bytes32 providedFullNameHash = _packHashFromTwo128(publicSignals[2], publicSignals[3]);
    bytes32 computedFullNameHash = _hashString(coreInfo.supplementInfo.fullName);
    if (computedFullNameHash != providedFullNameHash) revert BasicInfoMismatch();

    uint256 newTokenId = ++tokenCounter;

    _safeMint(msg.sender, newTokenId);
    _setTokenURI(newTokenId, _tokenURI);

    tokenIdToPerson[newTokenId] = personHash;
    tokenIdToVersionIndex[newTokenId] = versionIndex;

    versionToTokenId[personHash][arrayIndex] = newTokenId;

    nftCoreInfo[newTokenId] = coreInfo;

    emit PersonNFTMinted(
      personHash,
      newTokenId,
      msg.sender,
      versionIndex,
      _tokenURI,
      block.timestamp
    );
  }

  // ========== Story Sharding Functionality Functions ==========

  /**
   * @notice Add story chunk to NFT
   * @dev Only NFT holder can add chunks, chunk content will be hash verified
   * @param tokenId NFT TokenID
   * @param chunkIndex Chunk index (must be continuous, starting from 0)
   * @param content Chunk content
   * @param expectedHash Expected chunk hash (for client-side validation)
   */
  function addStoryChunk(
    uint256 tokenId,
    uint256 chunkIndex,
    string calldata content,
    bytes32 expectedHash
  ) external nonReentrant {
    // Verify NFT ownership
    if (_ownerOf(tokenId) != msg.sender) revert MustBeNFTHolder();

    // Validate input
    if (bytes(content).length == 0 || bytes(content).length > MAX_CHUNK_CONTENT_LENGTH) {
      revert InvalidChunkContent();
    }

    StoryMetadata storage metadata = storyMetadata[tokenId];

    if (metadata.isSealed) revert StoryAlreadySealed();
    if (metadata.totalChunks >= MAX_STORY_CHUNKS) revert ChunkIndexOutOfRange();
    if (chunkIndex != metadata.totalChunks) revert ChunkIndexOutOfRange();

    bytes32 contentHash = _hashString(content);
    if (expectedHash != bytes32(0) && contentHash != expectedHash) {
      revert ChunkHashMismatch();
    }

    StoryChunk storage chunk = storyChunks[tokenId][chunkIndex];
    chunk.chunkIndex = chunkIndex;
    chunk.chunkHash = contentHash;
    chunk.content = content;
    chunk.timestamp = block.timestamp;
    chunk.lastEditor = msg.sender;

    metadata.totalChunks = metadata.totalChunks + 1;
    metadata.lastUpdateTime = block.timestamp;
    metadata.totalLength = metadata.totalLength + bytes(content).length;

    activeChunkIndices[tokenId].push(chunkIndex);

    _updateFullStoryHash(tokenId);

    emit StoryChunkAdded(tokenId, chunkIndex, contentHash, msg.sender, bytes(content).length);
  }

  /**
   * @notice Update existing story chunk
   * @dev Only NFT holders can update chunks, complete hash will be recalculated after update
   * @param tokenId NFT TokenID
   * @param chunkIndex Chunk index
   * @param newContent New chunk content
   * @param expectedHash Expected new chunk hash
   */
  function updateStoryChunk(
    uint256 tokenId,
    uint256 chunkIndex,
    string calldata newContent,
    bytes32 expectedHash
  ) external nonReentrant {
    if (_ownerOf(tokenId) != msg.sender) revert MustBeNFTHolder();

    StoryMetadata storage metadata = storyMetadata[tokenId];

    if (metadata.isSealed) revert StoryAlreadySealed();
    if (chunkIndex >= metadata.totalChunks) revert ChunkIndexOutOfRange();
    if (bytes(newContent).length == 0 || bytes(newContent).length > MAX_CHUNK_CONTENT_LENGTH) {
      revert InvalidChunkContent();
    }

    StoryChunk storage chunk = storyChunks[tokenId][chunkIndex];

    bytes32 newHash = _hashString(newContent);
    if (expectedHash != bytes32(0) && newHash != expectedHash) {
      revert ChunkHashMismatch();
    }

    bytes32 oldHash = chunk.chunkHash;
    uint256 oldLength = bytes(chunk.content).length;

    chunk.chunkHash = newHash;
    chunk.content = newContent;
    chunk.timestamp = block.timestamp;
    chunk.lastEditor = msg.sender;

    metadata.lastUpdateTime = block.timestamp;
    metadata.totalLength = metadata.totalLength - oldLength + bytes(newContent).length;

    _updateFullStoryHash(tokenId);

    emit StoryChunkUpdated(tokenId, chunkIndex, oldHash, newHash, msg.sender);
  }

  /**
   * @notice Seal story, making it unmodifiable
   * @dev Only NFT holders can seal stories, sealing ensures immutability of historical records
   * @param tokenId NFT TokenID
   */
  function sealStory(uint256 tokenId) external {
    if (_ownerOf(tokenId) != msg.sender) revert MustBeNFTHolder();

    StoryMetadata storage metadata = storyMetadata[tokenId];

    if (metadata.isSealed) revert StoryAlreadySealed();
    if (metadata.totalChunks == 0) revert StoryNotFound();

    metadata.isSealed = true;
    metadata.lastUpdateTime = block.timestamp;

    emit StorySealed(tokenId, metadata.totalChunks, metadata.fullStoryHash, msg.sender);
  }

  /**
   * @dev Internal function to recalculate complete story hash
   * @param tokenId NFT TokenID
   */
  function _updateFullStoryHash(uint256 tokenId) internal {
    StoryMetadata storage metadata = storyMetadata[tokenId];
    uint256[] storage indices = activeChunkIndices[tokenId];

    if (indices.length == 0) {
      metadata.fullStoryHash = bytes32(0);
      return;
    }

    bytes memory combinedHashes;
    for (uint256 i = 0; i < indices.length; i++) {
      uint256 chunkIndex = indices[i];
      bytes32 chunkHash = storyChunks[tokenId][chunkIndex].chunkHash;
      combinedHashes = abi.encodePacked(combinedHashes, chunkHash);
    }

    metadata.fullStoryHash = keccak256(combinedHashes);
  }

  // ========== Query Functions ==========

  /**
   * @notice Get total version count of specified person (lightweight query)
   * @dev Very low gas consumption, used to quickly understand how many versions a person has
   * @param personHash Person hash
   * @return versionCount Total version count
   */
  function countPersonVersions(bytes32 personHash) external view returns (uint256 versionCount) {
    versionCount = personVersions[personHash].length;
  }

  /**
   * @notice Get complete information of specified version
   * @dev Directly query endorsement count and TokenID of single version, version index starts from 1
   * @param personHash Person hash
   * @param versionIndex Version index (starts from 1)
   * @return version Version information
   * @return endorsementCount Endorsement count
   * @return tokenId NFT TokenID (0 means not minted)
   */
  function getVersionDetails(
    bytes32 personHash,
    uint256 versionIndex
  )
    external
    view
    validPersonAndVersion(personHash, versionIndex)
    returns (PersonVersion memory version, uint256 endorsementCount, uint256 tokenId)
  {
    uint256 arrayIndex = versionIndex - 1; // Convert to array index (starts from 0)
    version = personVersions[personHash][arrayIndex];
    endorsementCount = versionEndorsementCount[personHash][arrayIndex];
    tokenId = versionToTokenId[personHash][arrayIndex];
  }

  /**
   * @notice Get children of specified parent version (paginated)
   * @dev When limit=0, only returns total count; supports offset/limit, max page length limited by MAX_QUERY_PAGE_SIZE
   * @param parentHash Parent person hash
   * @param parentVersionIndex Parent version index (starts from 1)
   * @param offset Starting position (starts from 0)
   * @param limit Return quantity limit (1-50)
   * @return childHashes Children person hash array
   * @return childVersionIndices Children version index array (one-to-one correspondence with hashes)
   * @return totalCount Total children count
   * @return hasMore Whether there are more
   * @return nextOffset Starting position for next query
   */
  function listChildren(
    bytes32 parentHash,
    uint256 parentVersionIndex,
    uint256 offset,
    uint256 limit
  )
    external
    view
    validPersonAndVersion(parentHash, parentVersionIndex)
    returns (
      bytes32[] memory childHashes,
      uint256[] memory childVersionIndices,
      uint256 totalCount,
      bool hasMore,
      uint256 nextOffset
    )
  {
    if (limit > MAX_QUERY_PAGE_SIZE) revert PageSizeExceedsLimit();

    ChildRef[] storage allChildren = childrenOf[parentHash][parentVersionIndex];
    totalCount = allChildren.length;

    if (limit == 0) {
      return (new bytes32[](0), new uint256[](0), totalCount, false, offset);
    }

    if (offset >= totalCount) {
      return (new bytes32[](0), new uint256[](0), totalCount, false, totalCount);
    }

    uint256 endIndex = offset + limit;
    if (endIndex > totalCount) endIndex = totalCount;
    uint256 resultLength = endIndex - offset;
    childHashes = new bytes32[](resultLength);
    childVersionIndices = new uint256[](resultLength);

    for (uint256 i = 0; i < resultLength; i++) {
      ChildRef storage c = allChildren[offset + i];
      childHashes[i] = c.childHash;
      childVersionIndices[i] = c.childVersionIndex;
    }

    nextOffset = endIndex;
    hasMore = endIndex < totalCount;
    return (childHashes, childVersionIndices, totalCount, hasMore, nextOffset);
  }

  /**
   * @notice Get complete NFT information (combined query)
   * @dev Requires tokenId to exist; single call returns person hash, version index, version info, core info, endorsement count and URI.
   * @param tokenId NFT TokenID
   * @return personHash Corresponding person hash
   * @return versionIndex Corresponding version index (starts from 1)
   * @return version Version basic information
   * @return coreInfo NFT core information
   * @return endorsementCount Endorsement count
   * @return nftTokenURI NFT metadata URI
   */
  function getNFTDetails(
    uint256 tokenId
  )
    external
    view
    returns (
      bytes32 personHash,
      uint256 versionIndex,
      PersonVersion memory version,
      PersonCoreInfo memory coreInfo,
      uint256 endorsementCount,
      string memory nftTokenURI
    )
  {
    if (_ownerOf(tokenId) == address(0)) revert InvalidTokenId();
    personHash = tokenIdToPerson[tokenId];
    if (personHash == bytes32(0)) revert InvalidTokenId();

    versionIndex = tokenIdToVersionIndex[tokenId];
    uint256 arrayIndex = versionIndex - 1;

    version = personVersions[personHash][arrayIndex];
    coreInfo = nftCoreInfo[tokenId];
    endorsementCount = versionEndorsementCount[personHash][arrayIndex];
    nftTokenURI = tokenURI(tokenId);
  }

  /**
   * @notice Get person version basic information (supports pagination)
   * @dev Query specified person's version basic information, supports pagination to avoid gas attacks
   * @param personHash Person hash
   * @param offset Starting position (starts from 0)
   * @param limit Return quantity limit (1-50)
   * @return versions Version information array
   * @return totalVersions Total version count
   * @return hasMore Whether there are more versions
   * @return nextOffset Suggested starting position for next query
   */
  function listPersonVersions(
    bytes32 personHash,
    uint256 offset,
    uint256 limit
  )
    external
    view
    returns (
      PersonVersion[] memory versions,
      uint256 totalVersions,
      bool hasMore,
      uint256 nextOffset
    )
  {
    if (limit > MAX_QUERY_PAGE_SIZE) revert PageSizeExceedsLimit();

    PersonVersion[] storage allVersions = personVersions[personHash];
    totalVersions = allVersions.length;

    if (limit == 0) {
      return (new PersonVersion[](0), totalVersions, false, offset);
    }

    if (offset >= totalVersions) {
      return (new PersonVersion[](0), totalVersions, false, totalVersions);
    }

    uint256 endIndex = offset + limit;
    if (endIndex > totalVersions) {
      endIndex = totalVersions;
    }

    uint256 resultLength = endIndex - offset;
    versions = new PersonVersion[](resultLength);

    for (uint256 i = 0; i < resultLength; i++) {
      versions[i] = allVersions[offset + i];
    }

    nextOffset = endIndex;
    hasMore = endIndex < totalVersions;

    return (versions, totalVersions, hasMore, nextOffset);
  }

  /**
   * @notice Get version endorsement statistics (supports pagination)
   * @dev Used for frontend display of version credibility ranking, supports pagination to avoid gas attacks
   * @param personHash Person hash
   * @param offset Starting position (starts from 0)
   * @param limit Return quantity limit (1-50)
   * @return versionIndices Version index array
   * @return endorsementCounts Corresponding endorsement count array
   * @return tokenIds Corresponding NFT TokenID array (0 means not minted)
   * @return totalVersions Total version count
   * @return hasMore Whether there are more versions
   * @return nextOffset Suggested starting position for next query
   */
  function listVersionsEndorsementStats(
    bytes32 personHash,
    uint256 offset,
    uint256 limit
  )
    external
    view
    returns (
      uint256[] memory versionIndices,
      uint256[] memory endorsementCounts,
      uint256[] memory tokenIds,
      uint256 totalVersions,
      bool hasMore,
      uint256 nextOffset
    )
  {
    if (limit > MAX_QUERY_PAGE_SIZE) revert PageSizeExceedsLimit();

    PersonVersion[] storage versions = personVersions[personHash];
    totalVersions = versions.length;

    if (limit == 0) {
      return (new uint256[](0), new uint256[](0), new uint256[](0), totalVersions, false, offset);
    }

    if (offset >= totalVersions) {
      return (
        new uint256[](0),
        new uint256[](0),
        new uint256[](0),
        totalVersions,
        false,
        totalVersions
      );
    }

    uint256 endIndex = offset + limit;
    if (endIndex > totalVersions) {
      endIndex = totalVersions;
    }

    uint256 resultLength = endIndex - offset;
    versionIndices = new uint256[](resultLength);
    endorsementCounts = new uint256[](resultLength);
    tokenIds = new uint256[](resultLength);

    for (uint256 i = 0; i < resultLength; i++) {
      uint256 versionIndex = offset + i;
      versionIndices[i] = versionIndex + 1;
      endorsementCounts[i] = versionEndorsementCount[personHash][versionIndex];
      tokenIds[i] = versionToTokenId[personHash][versionIndex];
    }

    // Calculate next query starting position and whether there is more data
    nextOffset = endIndex;
    hasMore = endIndex < totalVersions;

    return (versionIndices, endorsementCounts, tokenIds, totalVersions, hasMore, nextOffset);
  }

  /**
   * @notice Paginated query of historical URI for a Token
   * @param tokenId Token ID
   * @param offset Starting index
   * @param limit Return quantity
   */
  function listTokenURIHistory(
    uint256 tokenId,
    uint256 offset,
    uint256 limit
  )
    external
    view
    returns (string[] memory uris, uint256 totalCount, bool hasMore, uint256 nextOffset)
  {
    string[] storage all = tokenURIHistory[tokenId];
    totalCount = all.length;

    if (limit == 0) {
      return (new string[](0), totalCount, false, offset);
    }

    if (offset >= totalCount) {
      return (new string[](0), totalCount, false, totalCount);
    }

    uint256 end = offset + limit;
    if (end > totalCount) end = totalCount;
    uint256 resultLength = end - offset;
    uris = new string[](resultLength);
    for (uint256 i = 0; i < resultLength; i++) {
      uris[i] = all[offset + i];
    }
    nextOffset = end;
    hasMore = end < totalCount;
    return (uris, totalCount, hasMore, nextOffset);
  }

  /**
   * @dev Internal function to set token URI
   * @param tokenId Token ID
   * @param _tokenURI URI string
   */
  function _setTokenURI(uint256 tokenId, string memory _tokenURI) internal {
    _tokenURIs[tokenId] = _tokenURI;
  }

  /**
   * @dev Override tokenURI function to return stored URI
   * @param tokenId NFT token ID
   * @return URI string
   */
  function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
    _requireOwned(tokenId);
    return _tokenURIs[tokenId];
  }

  /**
   * @notice Allow current NFT holder to update the token's metadata URI
   * @param tokenId NFT TokenID
   * @param newURI New metadata URI (recommended to use ipfs://CID format)
   */
  function updateTokenURI(uint256 tokenId, string calldata newURI) external {
    if (_ownerOf(tokenId) != msg.sender) revert MustBeNFTHolder();
    if (bytes(newURI).length > MAX_LONG_TEXT_LENGTH) revert InvalidTokenURI();

    string memory oldURI = _tokenURIs[tokenId];
    if (bytes(oldURI).length > 0) {
      tokenURIHistory[tokenId].push(oldURI);
    }
    _setTokenURI(tokenId, newURI);
    emit TokenURIUpdated(tokenId, msg.sender, oldURI, newURI);
  }

  // ========== Story Sharding Query Functions ==========

  /**
   * @notice Get NFT's story metadata
   * @param tokenId NFT TokenID
   * @return metadata Story metadata
   */
  function getStoryMetadata(uint256 tokenId) external view returns (StoryMetadata memory metadata) {
    if (_ownerOf(tokenId) == address(0)) revert InvalidTokenId();
    metadata = storyMetadata[tokenId];
  }

  /**
   * @notice Get detailed information of specified chunk
   * @param tokenId NFT TokenID
   * @param chunkIndex Chunk index
   * @return chunk Chunk information
   */
  function getStoryChunk(
    uint256 tokenId,
    uint256 chunkIndex
  ) external view returns (StoryChunk memory chunk) {
    if (_ownerOf(tokenId) == address(0)) revert InvalidTokenId();
    StoryMetadata storage metadata = storyMetadata[tokenId];
    if (chunkIndex >= metadata.totalChunks) revert ChunkIndexOutOfRange();
    chunk = storyChunks[tokenId][chunkIndex];
  }

  /**
   * @notice Get story chunks with pagination
   * @param tokenId NFT TokenID
   * @param offset Starting position (starts from 0)
   * @param limit Return quantity limit
   * @return chunks Chunk array
   * @return totalChunks Total chunk count
   * @return hasMore Whether there are more chunks
   * @return nextOffset Starting position for next query
   */
  function listStoryChunks(
    uint256 tokenId,
    uint256 offset,
    uint256 limit
  )
    external
    view
    returns (StoryChunk[] memory chunks, uint256 totalChunks, bool hasMore, uint256 nextOffset)
  {
    if (_ownerOf(tokenId) == address(0)) revert InvalidTokenId();
    if (limit > MAX_QUERY_PAGE_SIZE) revert PageSizeExceedsLimit();

    StoryMetadata storage metadata = storyMetadata[tokenId];
    totalChunks = metadata.totalChunks;

    if (limit == 0) {
      return (new StoryChunk[](0), totalChunks, false, offset);
    }

    if (offset >= totalChunks) {
      return (new StoryChunk[](0), totalChunks, false, totalChunks);
    }

    uint256 endIndex = offset + limit;
    if (endIndex > totalChunks) endIndex = totalChunks;

    uint256 resultLength = endIndex - offset;
    chunks = new StoryChunk[](resultLength);

    for (uint256 i = 0; i < resultLength; i++) {
      chunks[i] = storyChunks[tokenId][offset + i];
    }

    nextOffset = endIndex;
    hasMore = endIndex < totalChunks;

    return (chunks, totalChunks, hasMore, nextOffset);
  }

  // ===== ETH Reception Path Protection: Reject Direct Transfers =====
  receive() external payable {
    revert DirectETHNotAccepted();
  }

  fallback() external payable {
    revert DirectETHNotAccepted();
  }
}
