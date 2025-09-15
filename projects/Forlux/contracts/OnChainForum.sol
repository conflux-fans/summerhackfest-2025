// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title OnChainForum
 * @dev A minimal, serverless forum on Conflux eSpace
 * @author Hackaton Conflux Team
 * @notice This contract implements a decentralized forum with posts, replies, and likes
 */
contract OnChainForum {
    
    // ============ STRUCTS ============
    
    struct Post {
        uint256 id;
        uint256 parentId;        // 0 for top-level posts
        address author;
        string content;          // Either short text or IPFS CID
        uint256 createdAt;
        bool deleted;
        uint256 likeCount;
    }
    
    // ============ STATE VARIABLES ============
    
    mapping(uint256 => Post) public posts;
    mapping(uint256 => mapping(address => bool)) public userLikes;
    uint256 public nextId = 1;
    bool public immutable contentIsCID;
    address public owner;
    
    // ============ EVENTS ============
    
    event PostCreated(
        uint256 indexed id,
        uint256 indexed parentId,
        address indexed author,
        string content,
        uint256 createdAt
    );
    
    event PostDeleted(
        uint256 indexed id,
        address indexed author
    );
    
    event PostLiked(
        uint256 indexed id,
        address indexed user,
        bool liked,
        uint256 likeCount
    );
    
    // ============ MODIFIERS ============
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier postExists(uint256 _id) {
        require(_id > 0 && _id < nextId, "Post does not exist");
        _;
    }
    
    modifier notDeleted(uint256 _id) {
        require(!posts[_id].deleted, "Post is deleted");
        _;
    }
    
    // ============ CONSTRUCTOR ============
    
    /**
     * @dev Constructor sets the content mode and owner
     * @param _contentIsCID If true, content is treated as IPFS CID; if false, as plain text
     */
    constructor(bool _contentIsCID) {
        contentIsCID = _contentIsCID;
        owner = msg.sender;
    }
    
    // ============ MAIN FUNCTIONS ============
    
    /**
     * @dev Create a new post or reply
     * @param _content The post content (text or IPFS CID depending on mode)
     * @param _parentId Parent post ID (0 for top-level posts)
     * @return The ID of the created post
     */
    function createPost(string memory _content, uint256 _parentId) 
        external 
        returns (uint256) 
    {
        require(bytes(_content).length > 0, "Content cannot be empty");
        
        // If replying, validate parent exists and is not deleted
        if (_parentId != 0) {
            require(_parentId < nextId, "Parent post does not exist");
            require(!posts[_parentId].deleted, "Cannot reply to deleted post");
        }
        
        uint256 id = nextId++;
        
        posts[id] = Post({
            id: id,
            parentId: _parentId,
            author: msg.sender,
            content: _content,
            createdAt: block.timestamp,
            deleted: false,
            likeCount: 0
        });
        
        emit PostCreated(id, _parentId, msg.sender, _content, block.timestamp);
        
        return id;
    }
    
    /**
     * @dev Soft delete a post (only by author)
     * @param _id The ID of the post to delete
     */
    function deletePost(uint256 _id) 
        external 
        postExists(_id)
        notDeleted(_id)
    {
        Post storage post = posts[_id];
        require(msg.sender == post.author, "Only author can delete post");
        
        post.deleted = true;
        
        emit PostDeleted(_id, msg.sender);
    }
    
    /**
     * @dev Like or unlike a post
     * @param _id The ID of the post to like/unlike
     * @param _liked True to like, false to unlike
     */
    function like(uint256 _id, bool _liked) 
        external 
        postExists(_id)
        notDeleted(_id)
    {
        Post storage post = posts[_id];
        bool currentlyLiked = userLikes[_id][msg.sender];
        
        // If trying to set the same state, do nothing
        if (currentlyLiked == _liked) {
            return;
        }
        
        // Update like state
        userLikes[_id][msg.sender] = _liked;
        
        // Update like count with overflow protection
        if (_liked) {
            post.likeCount++;
        } else {
            require(post.likeCount > 0, "Like count underflow");
            post.likeCount--;
        }
        
        emit PostLiked(_id, msg.sender, _liked, post.likeCount);
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Get a post by ID
     * @param _id The ID of the post
     * @return The post struct
     */
    function getPost(uint256 _id) 
        external 
        view 
        postExists(_id)
        returns (Post memory) 
    {
        return posts[_id];
    }
    
    /**
     * @dev Check if a user has liked a specific post
     * @param _id The post ID
     * @param _user The user address
     * @return True if the user has liked the post
     */
    function hasUserLiked(uint256 _id, address _user) 
        external 
        view 
        postExists(_id)
        returns (bool) 
    {
        return userLikes[_id][_user];
    }
    
    /**
     * @dev Get the total number of posts created
     * @return The next ID (which equals total posts + 1)
     */
    function getTotalPosts() external view returns (uint256) {
        return nextId - 1;
    }
    
    /**
     * @dev Get multiple posts by IDs
     * @param _ids Array of post IDs
     * @return Array of post structs
     */
    function getPosts(uint256[] memory _ids) 
        external 
        view 
        returns (Post[] memory) 
    {
        Post[] memory result = new Post[](_ids.length);
        
        for (uint256 i = 0; i < _ids.length; i++) {
            if (_ids[i] > 0 && _ids[i] < nextId) {
                result[i] = posts[_ids[i]];
            }
        }
        
        return result;
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Transfer ownership of the contract
     * @param _newOwner The new owner address
     */
    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "New owner cannot be zero address");
        owner = _newOwner;
    }
    
    // ============ FRONTEND HELPER FUNCTIONS ============
    
    /**
     * @dev Get all top-level posts (parentId = 0)
     * @return Array of post structs
     */
    function getTopLevelPosts() external view returns (Post[] memory) {
        uint256 count = 0;
        
        // Count top-level posts
        for (uint256 i = 1; i < nextId; i++) {
            if (posts[i].parentId == 0 && !posts[i].deleted) {
                count++;
            }
        }
        
        // Create array and populate
        Post[] memory topLevelPosts = new Post[](count);
        uint256 index = 0;
        
        for (uint256 i = 1; i < nextId; i++) {
            if (posts[i].parentId == 0 && !posts[i].deleted) {
                topLevelPosts[index] = posts[i];
                index++;
            }
        }
        
        return topLevelPosts;
    }
    
    /**
     * @dev Get all replies for a specific post
     * @param _parentId The parent post ID
     * @return Array of reply post structs
     */
    function getReplies(uint256 _parentId) 
        external 
        view 
        postExists(_parentId)
        returns (Post[] memory) 
    {
        uint256 count = 0;
        
        // Count replies
        for (uint256 i = 1; i < nextId; i++) {
            if (posts[i].parentId == _parentId && !posts[i].deleted) {
                count++;
            }
        }
        
        // Create array and populate
        Post[] memory replies = new Post[](count);
        uint256 index = 0;
        
        for (uint256 i = 1; i < nextId; i++) {
            if (posts[i].parentId == _parentId && !posts[i].deleted) {
                replies[index] = posts[i];
                index++;
            }
        }
        
        return replies;
    }
    
    /**
     * @dev Get posts by author
     * @param _author The author address
     * @return Array of post structs by the author
     */
    function getPostsByAuthor(address _author) external view returns (Post[] memory) {
        uint256 count = 0;
        
        // Count posts by author
        for (uint256 i = 1; i < nextId; i++) {
            if (posts[i].author == _author && !posts[i].deleted) {
                count++;
            }
        }
        
        // Create array and populate
        Post[] memory authorPosts = new Post[](count);
        uint256 index = 0;
        
        for (uint256 i = 1; i < nextId; i++) {
            if (posts[i].author == _author && !posts[i].deleted) {
                authorPosts[index] = posts[i];
                index++;
            }
        }
        
        return authorPosts;
    }
    
    /**
     * @dev Get recent posts (last N posts)
     * @param _limit Maximum number of posts to return
     * @return Array of recent post structs
     */
    function getRecentPosts(uint256 _limit) external view returns (Post[] memory) {
        uint256 totalPosts = nextId - 1;
        if (totalPosts == 0) {
            return new Post[](0);
        }
        
        uint256 count = _limit > totalPosts ? totalPosts : _limit;
        Post[] memory recentPosts = new Post[](count);
        
        uint256 index = 0;
        for (uint256 i = totalPosts; i >= 1 && index < count; i--) {
            if (!posts[i].deleted) {
                recentPosts[index] = posts[i];
                index++;
            }
        }
        
        // Resize array if some posts were deleted
        if (index < count) {
            Post[] memory resizedPosts = new Post[](index);
            for (uint256 i = 0; i < index; i++) {
                resizedPosts[i] = recentPosts[i];
            }
            return resizedPosts;
        }
        
        return recentPosts;
    }
    
    /**
     * @dev Get posts with pagination
     * @param _offset Starting index (0-based)
     * @param _limit Number of posts to return
     * @return Array of post structs
     */
    function getPostsPaginated(uint256 _offset, uint256 _limit) 
        external 
        view 
        returns (Post[] memory) 
    {
        uint256 totalPosts = nextId - 1;
        if (totalPosts == 0 || _offset >= totalPosts) {
            return new Post[](0);
        }
        
        uint256 availablePosts = totalPosts - _offset;
        uint256 count = _limit > availablePosts ? availablePosts : _limit;
        Post[] memory paginatedPosts = new Post[](count);
        
        uint256 index = 0;
        uint256 currentId = totalPosts - _offset;
        
        while (index < count && currentId >= 1) {
            if (!posts[currentId].deleted) {
                paginatedPosts[index] = posts[currentId];
                index++;
            }
            currentId--;
        }
        
        // Resize array if some posts were deleted
        if (index < count) {
            Post[] memory resizedPosts = new Post[](index);
            for (uint256 i = 0; i < index; i++) {
                resizedPosts[i] = paginatedPosts[i];
            }
            return resizedPosts;
        }
        
        return paginatedPosts;
    }
    
    /**
     * @dev Get user's like status for multiple posts
     * @param _user The user address
     * @param _postIds Array of post IDs to check
     * @return Array of boolean values (true if liked)
     */
    function getUserLikesForPosts(address _user, uint256[] memory _postIds) 
        external 
        view 
        returns (bool[] memory) 
    {
        bool[] memory likes = new bool[](_postIds.length);
        
        for (uint256 i = 0; i < _postIds.length; i++) {
            if (_postIds[i] > 0 && _postIds[i] < nextId) {
                likes[i] = userLikes[_postIds[i]][_user];
            }
        }
        
        return likes;
    }
    
    /**
     * @dev Get post statistics
     * @return _totalPosts Total number of posts
     * @return _totalReplies Total number of replies
     * @return _totalLikes Total number of likes across all posts
     */
    function getPostStatistics() 
        external 
        view 
        returns (
            uint256 _totalPosts,
            uint256 _totalReplies,
            uint256 _totalLikes
        ) 
    {
        uint256 posts = 0;
        uint256 replies = 0;
        uint256 likes = 0;
        
        for (uint256 i = 1; i < nextId; i++) {
            if (!posts[i].deleted) {
                if (posts[i].parentId == 0) {
                    posts++;
                } else {
                    replies++;
                }
                likes += posts[i].likeCount;
            }
        }
        
        return (posts, replies, likes);
    }
    
    // ============ UTILITY FUNCTIONS ============
    
    /**
     * @dev Get contract information
     * @return _contentIsCID Whether content is treated as CID
     * @return _totalPosts Total number of posts
     * @return _owner Contract owner
     */
    function getContractInfo() 
        external 
        view 
        returns (
            bool _contentIsCID,
            uint256 _totalPosts,
            address _owner
        ) 
    {
        return (contentIsCID, nextId - 1, owner);
    }
}
