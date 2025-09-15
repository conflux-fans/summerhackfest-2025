import { ethers } from 'ethers';
import OnChainForumABI from '../ABI/OnChainForum.json';

class ContractService {
  constructor() {
    this.contractAddress = '0x7AeD1C50613D836f242E16823e045Abd4c540049';
    this.contract = null;
    this.provider = null;
    this.signer = null;
    this.abi = OnChainForumABI;
  }

  // Initialize contract with provider and signer
  async initialize(provider, signer) {
    try {
      this.provider = provider;
      this.signer = signer;
      
      // Verify we're on Conflux eSpace mainnet
      const network = await provider.getNetwork();
      const confluxMainnetChainId = 1030; // Conflux eSpace mainnet chain ID in decimal
      
      if (Number(network.chainId) !== confluxMainnetChainId) {
        throw new Error(`Wrong network! Expected Conflux eSpace mainnet (${confluxMainnetChainId}), got ${network.chainId}`);
      }
      
      // Create contract instance
      this.contract = new ethers.Contract(
        this.contractAddress,
        this.abi,
        signer
      );
      
      console.log('Contract initialized on Conflux eSpace mainnet:', {
        chainId: network.chainId,
        name: network.name,
        contractAddress: this.contractAddress
      });
      
      return { success: true };
    } catch (error) {
      console.error('Failed to initialize contract:', error);
      return { success: false, error: error.message };
    }
  }

  // Get contract instance for read operations
  getContract() {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }
    return this.contract;
  }

  // Verify we're on Conflux mainnet before transactions
  async verifyNetwork() {
    try {
      const network = await this.provider.getNetwork();
      const confluxMainnetChainId = 1030; // Conflux eSpace mainnet chain ID in decimal
      
      if (Number(network.chainId) !== confluxMainnetChainId) {
        throw new Error(`Wrong network! Expected Conflux eSpace mainnet (${confluxMainnetChainId}), got ${network.chainId}. Please switch to Conflux eSpace mainnet.`);
      }
      
      return { success: true, network: network };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get contract info
  async getContractInfo() {
    try {
      const contract = this.getContract();
      const info = await contract.getContractInfo();
      
      return {
        success: true,
        data: {
          contentIsCID: info._contentIsCID,
          totalPosts: info._totalPosts.toString(),
          owner: info._owner,
          rateLimit: info._rateLimit.toString()
        }
      };
    } catch (error) {
      console.error('Failed to get contract info:', error);
      return { success: false, error: error.message };
    }
  }

  // Get post statistics
  async getPostStatistics() {
    try {
      const contract = this.getContract();
      const stats = await contract.getPostStatistics();
      
      return {
        success: true,
        data: {
          totalPosts: stats._totalPosts.toString(),
          totalReplies: stats._totalReplies.toString(),
          totalLikes: stats._totalLikes.toString()
        }
      };
    } catch (error) {
      console.error('Failed to get post statistics:', error);
      return { success: false, error: error.message };
    }
  }

  // Get top-level posts with pagination
  async getTopLevelPosts(offset = 0, limit = 10) {
    try {
      const contract = this.getContract();
      const posts = await contract.getTopLevelPosts(offset, limit);
      
      return {
        success: true,
        data: posts.map(post => ({
          id: post.id.toString(),
          parentId: post.parentId.toString(),
          author: post.author,
          content: post.content,
          createdAt: new Date(parseInt(post.createdAt) * 1000),
          deleted: post.deleted,
          likeCount: post.likeCount.toString()
        }))
      };
    } catch (error) {
      console.error('Failed to get top-level posts:', error);
      return { success: false, error: error.message };
    }
  }

  // Get replies for a specific post
  async getReplies(parentId) {
    try {
      const contract = this.getContract();
      const replies = await contract.getReplies(parentId);
      
      return {
        success: true,
        data: replies.map(reply => ({
          id: reply.id.toString(),
          parentId: reply.parentId.toString(),
          author: reply.author,
          content: reply.content,
          createdAt: new Date(parseInt(reply.createdAt) * 1000),
          deleted: reply.deleted,
          likeCount: reply.likeCount.toString()
        }))
      };
    } catch (error) {
      console.error('Failed to get replies:', error);
      return { success: false, error: error.message };
    }
  }

  // Get a single post by ID
  async getPost(postId) {
    try {
      const contract = this.getContract();
      const post = await contract.getPost(postId);
      
      return {
        success: true,
        data: {
          id: post.id.toString(),
          parentId: post.parentId.toString(),
          author: post.author,
          content: post.content,
          createdAt: new Date(parseInt(post.createdAt) * 1000),
          deleted: post.deleted,
          likeCount: post.likeCount.toString()
        }
      };
    } catch (error) {
      console.error('Failed to get post:', error);
      return { success: false, error: error.message };
    }
  }

  // Create a new post
  async createPost(content, parentId = 0) {
    try {
      // Verify we're on Conflux mainnet before transaction
      const networkCheck = await this.verifyNetwork();
      if (!networkCheck.success) {
        return { success: false, error: networkCheck.error };
      }
      
      const contract = this.getContract();
      const tx = await contract.createPost(content, parentId);
      const receipt = await tx.wait();
      
      // Extract post ID from event (ethers v6 format)
      const event = receipt.logs?.find(log => {
        try {
          const parsed = contract.interface.parseLog(log);
          return parsed?.name === 'PostCreated';
        } catch {
          return false;
        }
      });
      
      let postId = null;
      if (event) {
        try {
          const parsed = contract.interface.parseLog(event);
          postId = parsed?.args?.id?.toString();
        } catch (error) {
          console.warn('Could not parse PostCreated event:', error);
        }
      }
      
      return {
        success: true,
        data: {
          postId,
          transactionHash: receipt.hash
        }
      };
    } catch (error) {
      console.error('Failed to create post:', error);
      return { success: false, error: error.message };
    }
  }

  // Like or unlike a post
  async likePost(postId, liked) {
    try {
      // Verify we're on Conflux mainnet before transaction
      const networkCheck = await this.verifyNetwork();
      if (!networkCheck.success) {
        return { success: false, error: networkCheck.error };
      }
      
      const contract = this.getContract();
      const tx = await contract.like(postId, liked);
      await tx.wait();
      
      return { success: true };
    } catch (error) {
      console.error('Failed to like post:', error);
      return { success: false, error: error.message };
    }
  }

  // Check if user has liked a post
  async hasUserLiked(postId, userAddress) {
    try {
      const contract = this.getContract();
      const liked = await contract.hasUserLiked(postId, userAddress);
      
      return {
        success: true,
        data: liked
      };
    } catch (error) {
      console.error('Failed to check user like:', error);
      return { success: false, error: error.message };
    }
  }

  // Get user's like status for multiple posts
  async getUserLikesForPosts(userAddress, postIds) {
    try {
      const contract = this.getContract();
      const likes = await contract.getUserLikesForPosts(userAddress, postIds);
      
      return {
        success: true,
        data: likes
      };
    } catch (error) {
      console.error('Failed to get user likes:', error);
      return { success: false, error: error.message };
    }
  }

  // Delete a post (only by author)
  async deletePost(postId) {
    try {
      const contract = this.getContract();
      const tx = await contract.deletePost(postId);
      await tx.wait();
      
      return { success: true };
    } catch (error) {
      console.error('Failed to delete post:', error);
      return { success: false, error: error.message };
    }
  }

  // Moderate a post (only by moderator)
  async moderatePost(postId) {
    try {
      // Verify we're on Conflux mainnet before transaction
      const networkCheck = await this.verifyNetwork();
      if (!networkCheck.success) {
        return { success: false, error: networkCheck.error };
      }
      
      const contract = this.getContract();
      const tx = await contract.moderatePost(postId);
      await tx.wait();
      
      return { success: true };
    } catch (error) {
      console.error('Failed to moderate post:', error);
      return { success: false, error: error.message };
    }
  }

  // Check if user is a moderator
  async isModerator(userAddress) {
    try {
      const contract = this.getContract();
      const isMod = await contract.isModerator(userAddress);
      
      return {
        success: true,
        data: isMod
      };
    } catch (error) {
      console.error('Failed to check moderator status:', error);
      return { success: false, error: error.message };
    }
  }

  // Get time until user can post again
  async getTimeUntilNextPost(userAddress) {
    try {
      const contract = this.getContract();
      const timeLeft = await contract.getTimeUntilNextPost(userAddress);
      
      return {
        success: true,
        data: parseInt(timeLeft.toString())
      };
    } catch (error) {
      console.error('Failed to get time until next post:', error);
      return { success: false, error: error.message };
    }
  }

  // Get posts by author
  async getPostsByAuthor(authorAddress, offset = 0, limit = 10) {
    try {
      const contract = this.getContract();
      const posts = await contract.getPostsByAuthor(authorAddress, offset, limit);
      
      return {
        success: true,
        data: posts.map(post => ({
          id: post.id.toString(),
          parentId: post.parentId.toString(),
          author: post.author,
          content: post.content,
          createdAt: new Date(parseInt(post.createdAt) * 1000),
          deleted: post.deleted,
          likeCount: post.likeCount.toString()
        }))
      };
    } catch (error) {
      console.error('Failed to get posts by author:', error);
      return { success: false, error: error.message };
    }
  }

  // Get contract constants
  async getContractConstants() {
    try {
      const contract = this.getContract();
      const [maxContentLength, maxPaginationLimit, rateLimit] = await Promise.all([
        contract.MAX_CONTENT_LENGTH(),
        contract.MAX_PAGINATION_LIMIT(),
        contract.RATE_LIMIT()
      ]);
      
      return {
        success: true,
        data: {
          maxContentLength: maxContentLength.toString(),
          maxPaginationLimit: maxPaginationLimit.toString(),
          rateLimit: rateLimit.toString()
        }
      };
    } catch (error) {
      console.error('Failed to get contract constants:', error);
      return { success: false, error: error.message };
    }
  }

  // Format time ago
  formatTimeAgo(timestamp) {
    const now = new Date();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  }

  // Format address for display
  formatAddress(address) {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }
}

// Create singleton instance
const contractService = new ContractService();

export default contractService;
