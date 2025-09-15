# OnChainForum Smart Contract

A comprehensive, serverless forum smart contract for Conflux eSpace with frontend-optimized data fetching.

## 🚀 Features

- **Post Management**: Create posts and replies with threading
- **Social Features**: Like/unlike posts with real-time counters
- **Content Flexibility**: Support for both IPFS CID and plain text
- **Moderation**: Soft deletion (author-only) with content preservation
- **Frontend Optimized**: Batch data fetching and pagination support
- **Event-Driven**: Real-time updates for frontend indexing

## 📝 Core Functions

### Post Operations
- `createPost(content, parentId)` - Create post or reply (0 for top-level)
- `deletePost(id)` - Soft delete your own post
- `like(id, liked)` - Like or unlike a post

### Basic Queries
- `getPost(id)` - Get individual post details
- `getTotalPosts()` - Get total post count
- `getContractInfo()` - Get contract metadata

## 🎯 Frontend Helper Functions

### Data Fetching
- `getTopLevelPosts()` - Get all main posts (no replies)
- `getReplies(parentId)` - Get all replies for a specific post
- `getPostsByAuthor(author)` - Get all posts by a specific user
- `getRecentPosts(limit)` - Get the most recent N posts
- `getPostsPaginated(offset, limit)` - Get posts with pagination

### User Interactions
- `getUserLikesForPosts(user, postIds[])` - Check like status for multiple posts
- `hasUserLiked(postId, user)` - Check if user liked a specific post

### Statistics
- `getPostStatistics()` - Get total posts, replies, and likes count

## 📡 Events

- `PostCreated(id, parentId, author, content, createdAt)` - New post created
- `PostDeleted(id, author)` - Post deleted by author
- `PostLiked(id, user, liked, likeCount)` - Post liked/unliked

## 🔧 Admin Functions

- `setContentMode(isCID)` - Switch between IPFS CID and plain text modes
- `transferOwnership(newOwner)` - Transfer contract ownership

## 💡 Frontend Integration Examples

```javascript
// Load main forum page
const topPosts = await contract.getTopLevelPosts();

// Load replies for a post
const replies = await contract.getReplies(postId);

// Load user profile
const userPosts = await contract.getPostsByAuthor(userAddress);

// Pagination
const page1 = await contract.getPostsPaginated(0, 10);
const page2 = await contract.getPostsPaginated(10, 10);

// Check like status for multiple posts
const postIds = [1, 2, 3, 4, 5];
const likeStatus = await contract.getUserLikesForPosts(userAddress, postIds);

// Get forum statistics
const stats = await contract.getPostStatistics();
// Returns: { totalPosts, totalReplies, totalLikes }
```

## 🚀 Deployment

Deploy to Conflux eSpace and integrate with your frontend using the contract ABI. The contract is optimized for gas efficiency and frontend performance.
