// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

library ClubLibrary {
    struct Club {
        uint256 id;
        string name;
        mapping(address => Member) members;
        uint256 memberCounter;
        uint256 pool;
        mapping(uint256 => Proposal) proposals;
        uint256 proposalCounter;
    }

    struct Member {
        address memberAddress;
        uint256 balance;
    }

    struct Proposal {
        uint256 id;
        address creator;
        uint256 amount;
        address destination;
        string status;
        string description;
        uint256 votesFor;
        uint256 votesAgainst;
        mapping(address => bool) voted;
    }
}

contract InvestmentClub {
    using ClubLibrary for ClubLibrary.Club;

    struct ClubInfo {
        uint256 clubId;
        string name;
        uint256 memberCount;
        uint256 proposalCount;
        uint256 pool;
    }

    struct ProposalInfo {
        uint256 id;
        address creator;
        uint256 amount;
        address destination;
        string status;
        string description;
        uint256 votesFor;
        uint256 votesAgainst;
    }

    struct Vote {
        address voter;
        bool inSupport;
    }

    struct ProposalVotes {
        uint256 id;
        Vote[] votes;
    }

    
    mapping(uint256 => ClubLibrary.Club) private clubs;
    uint256 private clubCounter;

    constructor() {
        clubCounter = 0;
    }
    
    function getClubById(uint256 clubId) public view returns (ClubInfo memory) {
        require(isClubIdExist(clubId), "the club does not exist");
        ClubLibrary.Club storage clubReal = clubs[clubId];
        ClubInfo memory club = ClubInfo(clubReal.id, clubReal.name, clubReal.memberCounter, clubReal.proposalCounter, clubReal.pool);
        return club;
    }

    function getMyClubs() public view returns (ClubInfo[] memory) {
        ClubInfo[] memory clubsInfo = new ClubInfo[](clubCounter);
        uint256 index = 0;
        for (uint256 i = 1; i <= clubCounter; i++) {
            ClubLibrary.Club storage club = clubs[i];
            if (isMemberOfClub(msg.sender, club.id)) {
                clubsInfo[index] = ClubInfo(club.id, club.name, club.memberCounter,club.proposalCounter, club.pool);
                index++;
            }
        }

        return clubsInfo;
    }
    
    function createClub(string memory name) public returns (uint256) {
        uint256 clubId = clubCounter + 1;
        ClubLibrary.Club storage club = clubs[clubId];
        club.id = clubId;
        club.name = name;
        club.pool = 0;
        club.proposalCounter = 0;
        club.memberCounter = 1;
        
        ClubLibrary.Member memory member = ClubLibrary.Member({
            memberAddress: msg.sender,
            balance: 0
        });
        
        club.members[msg.sender] = member;
        
        clubCounter = clubId;
        
        return clubId;
    }
    
    function joinClub(uint256 clubId) public {
        require(isClubIdExist(clubId), "The club does not exist");
        ClubLibrary.Club storage club = clubs[clubId];
        require(isClubFull(clubId), "The club is full, no more members can be added");
        require(!isMemberOfClub(msg.sender, clubId), "You are already a member of the club");
        
        ClubLibrary.Member memory member = ClubLibrary.Member({
            memberAddress: msg.sender,
            balance: 0
        });
        
        club.members[msg.sender] = member;
        club.memberCounter += 1;
    }
    
    function contributeToClub(uint256 clubId) public payable {
        require(isClubIdExist(clubId), "the club does not exist");
        ClubLibrary.Club storage club = clubs[clubId];
        require(isMemberOfClub(msg.sender, clubId), "You are not a member of the club");
        require(msg.value > 0, "You must send EVMOS to contribute");
        
        ClubLibrary.Member storage member = club.members[msg.sender];
        member.balance += uint256(msg.value);
        
        club.pool += uint256(msg.value);
    }
    
    function createProposal(uint256 clubId, uint256 amount, address destination, string memory description) public {
        require(isClubIdExist(clubId), "the club does not exist");
        ClubLibrary.Club storage club = clubs[clubId];
        require(isMemberOfClub(msg.sender, clubId), "You are not a member of the club");
        //require(club.pool >= amount, "The amount exceeds the pool of the club");
        require(amount > 0, "The amount of the proposal must be greater than 0");
        //require(getBalanceByClub(msg.sender, clubId), "Your balance in the club must be greater than 0");
        
        uint256 proposalId = club.proposalCounter + 1;
        
        ClubLibrary.Proposal storage proposal = clubs[clubId].proposals[proposalId];
        proposal.id = proposalId;
        proposal.creator = msg.sender;
        proposal.amount = amount;
        proposal.destination = destination;
        proposal.status = "Pending";
        proposal.description = description;
        proposal.votesFor = 0;
        proposal.votesAgainst = 0;
        
        club.proposalCounter = proposalId;
    }

    // function getVotesForProposal(uint256 clubId, uint256 proposalId) external view returns (address[] memory) {
    //     require(isClubIdExist(clubId), "Club does not exist");
    //     require(isProposalIdExist(proposalId, clubId), "Proposal does not exist");

    //     ClubLibrary.Proposal storage proposal = clubs[clubId].proposals[proposalId];
    //     uint256 totalVotes = proposal.votesFor+proposal.votesAgainst;
    //     Vote[] memory votes = new Vote[](totalVotes);
    //     uint256 index = 0;

    //     for (uint256 i = 0; i < totalVotes; i++) {
    //         if (proposal.voted[i]) {
    //             address voter = proposal.votes[i].voter;
    //             bool inSupport = proposal.votes[i].inSupport;

    //             votes[index] = Vote(voter, inSupport);
    //             index++;
    //         }
    //     }

    //     return votes;
    // }

    function voteOnProposal(uint256 clubId, uint256 proposalId, bool vote) public {
        require(isClubIdExist(clubId), "the club does not exist");
        ClubLibrary.Club storage club = clubs[clubId];
        require(isMemberOfClub(msg.sender, clubId), "You are not a member of the club");
        require(isProposalIdExist(proposalId, clubId), "The proposal does not exist");
        //require(getBalanceByClub(msg.sender, clubId) > 0, "Your balance in the club must be greater than 0");
        
        ClubLibrary.Proposal storage proposal = club.proposals[proposalId];
        require(!hasVoted(msg.sender, proposalId, clubId), "You have already voted on this proposal");
        require(keccak256(bytes(proposal.status)) == keccak256(bytes("Pending")), "The proposal is no longer pending");
        
        proposal.voted[msg.sender] = vote;
        
        if (vote) {
            proposal.votesFor += 1;
        } else {
            proposal.votesAgainst += 1;
        }
    }

    function executeProposal(uint256 clubId, uint256 proposalId) public payable {
        require(isClubIdExist(clubId), "the club does not exist");
        ClubLibrary.Club storage club = clubs[clubId];
        require(isMemberOfClub(msg.sender, clubId), "You are not a member of the club");
        require(isProposalIdExist(proposalId, clubId), "The proposal does not exist");
        require(isValidExecutor(clubId, proposalId), "Only the creator of the proposal can execute it");
        
        ClubLibrary.Proposal storage proposal = club.proposals[proposalId];
        require(club.pool >= proposal.amount, "The amount exceeds the pool of the club");
        require(proposal.votesFor > proposal.votesAgainst, "The proposal has not been approved");
        
        proposal.status = "Executed";
        club.pool -= proposal.amount;
        payable(proposal.destination).transfer(uint256(proposal.amount));
    }

    function closeProposal(uint256 clubId, uint256 proposalId) public {
        require(isClubIdExist(clubId), "the club does not exist");
        require(isProposalIdExist(proposalId, clubId), "The proposal does not exist");
        ClubLibrary.Proposal storage proposal = clubs[clubId].proposals[proposalId];
        require(keccak256(bytes(proposal.status)) == keccak256(bytes("Pending")), "The proposal is not in pending status");
        require(isValidExecutor(clubId, proposalId), "Only the proposal creator can close the proposal");
        
        proposal.status = "Closed";
    }

    function getProposalById(uint256 clubId, uint256 proposalId) public view returns (ProposalInfo memory) {
        require(isClubIdExist(clubId), "the club does not exist");
        require(isProposalIdExist(proposalId, clubId), "The proposal does not exist");
        ClubLibrary.Proposal storage proposal = clubs[clubId].proposals[proposalId];
        ProposalInfo memory proposalInfo = ProposalInfo(proposal.id, proposal.creator,
                proposal.amount,
                proposal.destination,
                proposal.status,
                proposal.description,
                proposal.votesFor,
                proposal.votesAgainst);
        return proposalInfo;
    }


    function getProposalsByClub(uint256 clubId) public view returns (ProposalInfo[] memory) {
        require(isClubIdExist(clubId), "Club does not exist");
        ClubLibrary.Club storage club = clubs[clubId];

        ProposalInfo[] memory proposalList = new ProposalInfo[](club.proposalCounter);
        uint256 index = 0;

        for (uint256 i = 1; i <= club.proposalCounter; i++) {
            ClubLibrary.Proposal storage proposal = club.proposals[i];
            proposalList[index] = ProposalInfo(
                proposal.id,
                proposal.creator,
                proposal.amount,
                proposal.destination,
                proposal.status,
                proposal.description,
                proposal.votesFor,
                proposal.votesAgainst
            );
            index++;
            
        }

        return proposalList;
    }

    function listClubs() public view returns (ClubInfo[] memory) {
        ClubInfo[] memory clubList = new ClubInfo[](clubCounter);

        for (uint256 i = 0; i < clubCounter; i++) {
            ClubLibrary.Club storage club = clubs[i+1];
            clubList[i] = ClubInfo(club.id, club.name, club.memberCounter, club.proposalCounter, club.pool);
        }

        return clubList;
    }


    function leaveClub(uint256 clubId) public {
        require(isClubIdExist(clubId), "the club does not exist");
        ClubLibrary.Club storage club = clubs[clubId];
        require(isMemberOfClub(msg.sender, clubId), "You are not a member of the club");
        club.memberCounter -= 1;
        delete club.members[msg.sender];
    }

    function isValidExecutor(uint256 clubId, uint256 proposalId) private view returns (bool) {
        ClubLibrary.Club storage club = clubs[clubId];
        ClubLibrary.Proposal storage proposal = club.proposals[proposalId];
        return msg.sender == proposal.creator;
    }

    function getBalanceByClub(address userAddress, uint256 clubId) public view returns (uint256) {
        ClubLibrary.Club storage club = clubs[clubId];
        ClubLibrary.Member storage member = club.members[userAddress];
        return member.balance;
    }

    function isClubIdExist(uint256 clubId) public view returns (bool) {
        return clubs[clubId].id != 0;
    }

    function isMemberOfClub(address memberAddress, uint256 clubId) public view returns (bool) {
        return clubs[clubId].members[memberAddress].memberAddress != address(0);
    }

    function isProposalIdExist(uint256 proposalId, uint256 clubId) public view returns (bool) {
        return clubs[clubId].proposals[proposalId].id != 0;
    }

    function hasVoted(address sender, uint256 proposalId, uint256 clubId) public view returns (bool) {
        return clubs[clubId].proposals[proposalId].voted[sender];
    }

    function isClubFull(uint256 clubId) public view returns (bool) {
        return (clubs[clubId].memberCounter < 99);
    }

}