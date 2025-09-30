// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract QuizCraftArena is ReentrancyGuard, Ownable {
    // ===== STATE VARIABLES =====
    uint256 public constant LOBBY_TIMEOUT = 5 minutes;

    // Lobby status lifecycle
    enum LobbyStatus { OPEN, STARTED, IN_PROGRESS, COMPLETED, CANCELLED }

    // Prize distribution status
    enum DistributionStatus { NOT_DISTRIBUTED, DISTRIBUTED }

    struct Lobby {
        uint256 id;
        string name;
        string category;
        uint256 entryFee;
        uint256 playerCount;
        uint256 maxPlayers;
        uint256 prizePool;
        uint256 createdAt;
        LobbyStatus status;
        DistributionStatus distribution;
        address[] players;
        address winner;
        address creator;
    }

    mapping(uint256 => Lobby) public lobbies;
    mapping(uint256 => mapping(address => uint256)) public playerScores;
    mapping(uint256 => address[]) public lobbyLeaderboard;
    mapping(uint256 => bool) public leaderboardSet;

    uint256 public nextLobbyId;

    // ===== EVENTS =====
    event LobbyCreated(
        uint256 indexed lobbyId,
        string name,
        string category,
        uint256 entryFee,
        uint256 maxPlayers,
        address creator
    );
    event PlayerJoined(uint256 indexed lobbyId, address player);
    event LobbyCompleted(uint256 indexed lobbyId, address winner, uint256 prize);
    event LobbyCancelled(uint256 indexed lobbyId);
    event ScoresSubmitted(uint256 indexed lobbyId, address[] players, uint256[] scores);
    event LeaderboardSet(uint256 indexed lobbyId, address[] leaderboard);

    // ===== MODIFIERS =====
    modifier validLobby(uint256 _lobbyId) {
        require(_lobbyId < nextLobbyId, "Lobby does not exist");
        _;
    }

    modifier onlyLobbyCreator(uint256 _lobbyId) {
        require(msg.sender == lobbies[_lobbyId].creator, "Only lobby creator can execute this");
        _;
    }

    // ===== CORE FUNCTIONS =====
    function createLobby(
        string memory _name,
        string memory _category,
        uint256 _entryFee,
        uint256 _maxPlayers
    ) external returns (uint256) {
        require(bytes(_name).length > 0, "Lobby name cannot be empty");
        require(bytes(_category).length > 0, "Category cannot be empty");
        require(_entryFee > 0, "Entry fee must be greater than 0");
        require(_maxPlayers > 1 && _maxPlayers <= 10, "Invalid max players");

        uint256 lobbyId = nextLobbyId++;
        Lobby storage newLobby = lobbies[lobbyId];

        newLobby.id = lobbyId;
        newLobby.name = _name;
        newLobby.category = _category;
        newLobby.entryFee = _entryFee;
        newLobby.maxPlayers = _maxPlayers;
        newLobby.createdAt = block.timestamp;
        newLobby.status = LobbyStatus.OPEN;
        newLobby.distribution = DistributionStatus.NOT_DISTRIBUTED;
        newLobby.creator = msg.sender;

        emit LobbyCreated(lobbyId, _name, _category, _entryFee, _maxPlayers, msg.sender);
        return lobbyId;
    }

    function joinLobby(uint256 _lobbyId) external payable nonReentrant validLobby(_lobbyId) {
        Lobby storage lobby = lobbies[_lobbyId];
        require(lobby.status == LobbyStatus.OPEN || lobby.status == LobbyStatus.STARTED, "Lobby not open");
        require(msg.value == lobby.entryFee, "Incorrect entry fee");
        require(lobby.players.length < lobby.maxPlayers, "Lobby full");
        require(block.timestamp <= lobby.createdAt + LOBBY_TIMEOUT, "Lobby expired");
        require(msg.sender != lobby.creator, "Creator cannot join this lobby");

        // Add player
        lobby.players.push(msg.sender);
        lobby.playerCount++;
        lobby.prizePool += msg.value;

        emit PlayerJoined(_lobbyId, msg.sender);

        // Update lobby status
        if (lobby.players.length == 1) {
            lobby.status = LobbyStatus.STARTED;
        }
        if (lobby.players.length == lobby.maxPlayers) {
            lobby.status = LobbyStatus.IN_PROGRESS;
        }
    }

    /**
     * @dev Only lobby creator can execute the payout once a winner is chosen.
     */
    function executeWinnerPayout(uint256 _lobbyId, address _winner)
        external
        nonReentrant
        validLobby(_lobbyId)
        onlyLobbyCreator(_lobbyId)
    {
        Lobby storage lobby = lobbies[_lobbyId];
        require(lobby.status == LobbyStatus.IN_PROGRESS, "Lobby not in progress");
        require(isPlayerInLobby(_lobbyId, _winner), "Winner not in this lobby");
        require(lobby.distribution == DistributionStatus.NOT_DISTRIBUTED, "Already distributed");
        require(block.timestamp >= lobby.createdAt + LOBBY_TIMEOUT, "Lobby not expired yet");

        // Mark complete
        lobby.status = LobbyStatus.COMPLETED;
        lobby.winner = _winner;
        lobby.distribution = DistributionStatus.DISTRIBUTED;

        uint256 prize = lobby.prizePool;
        require(prize > 0, "No prize to distribute");
        lobby.prizePool = 0; // avoid re-entrancy double spend

        (bool success, ) = payable(_winner).call{value: prize}("");
        require(success, "Prize transfer failed");

        emit LobbyCompleted(_lobbyId, _winner, prize);
    }

    // ===== VIEW HELPERS =====
    function isPlayerInLobby(uint256 _lobbyId, address _player) public view returns (bool) {
        address[] storage players = lobbies[_lobbyId].players;
        for (uint256 i = 0; i < players.length; i++) {
            if (players[i] == _player) {
                return true;
            }
        }
        return false;
    }

    function getPlayersInLobby(uint256 _lobbyId) external view validLobby(_lobbyId) returns (address[] memory) {
        return lobbies[_lobbyId].players;
    }

    function getLobbyResult(uint256 _lobbyId)
        external
        view
        validLobby(_lobbyId)
        returns (LobbyStatus, address, uint256)
    {
        Lobby storage lobby = lobbies[_lobbyId];
        require(
            block.timestamp >= lobby.createdAt + LOBBY_TIMEOUT || 
            lobby.status == LobbyStatus.COMPLETED,
            "Results not available yet"
        );
        return (lobby.status, lobby.winner, lobby.prizePool);
    }

    // ===== ADMIN =====
    function withdrawERC20(IERC20 _token, address _to) external onlyOwner {
        uint256 balance = _token.balanceOf(address(this));
        require(balance > 0, "No tokens to withdraw");
        _token.transfer(_to, balance);
    }

    // Reject direct ETH sends
    receive() external payable {
        revert("Do not send ETH directly");
    }
}
