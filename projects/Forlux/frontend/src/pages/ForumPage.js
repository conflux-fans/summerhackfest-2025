import React, { useState } from 'react';
import './ForumPage.css';
import walletService from '../services/walletService';

// Helper function to create author display with moderator indicator
const AuthorDisplay = ({ author, moderatorStatus, contractService }) => {
  const displayName = walletService.formatAddress(author);
  const isModerator = moderatorStatus[author] || false;
  const defaultAvatar = walletService.getDefaultAvatar(author);
  
  return (
    <span className="author-with-moderator">
      <span className="author-avatar">
        <span className="author-default-avatar">{defaultAvatar}</span>
      </span>
      <span className="author-name">@{displayName}</span>
      {isModerator && (
        <span className="moderator-indicator" title="Moderator">
          🛡️
        </span>
      )}
    </span>
  );
};

function ForumPage({ 
  isConnected, 
  isModerator, 
  showCreatePost, 
  setShowCreatePost, 
  newPostContent, 
  setNewPostContent, 
  handleCreatePost, 
  handleLike, 
  handleReply, 
  handleModerate,
  posts,
  replies,
  contractInfo,
  postStatistics,
  loading,
  error,
  userAddress,
  showReplyModal,
  setShowReplyModal,
  replyToPost,
  replyContent,
  setReplyContent,
  handleCreateReply,
  userReplies,
  likedPosts,
  fetchUserReplies,
  fetchLikedPosts,
  navigateToProfile,
  contractService
}) {
  // State for sidebar features
  const [showUserPostsOnly, setShowUserPostsOnly] = useState(false);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [moderatorStatus, setModeratorStatus] = useState({});

  // Check moderator status for all unique authors
  React.useEffect(() => {
    const checkModeratorStatus = async () => {
      if (!contractService) return;
      
      const allAuthors = new Set();
      
      // Collect all unique authors from posts
      posts.forEach(post => allAuthors.add(post.author));
      
      // Collect all unique authors from replies
      Object.values(replies).forEach(replyList => {
        replyList.forEach(reply => allAuthors.add(reply.author));
      });
      
      const status = {};
      
      // Check moderator status for each author
      for (const author of allAuthors) {
        try {
          const result = await contractService.isModerator(author);
          if (result.success) {
            status[author] = result.data;
          }
        } catch (error) {
          console.error(`Error checking moderator status for ${author}:`, error);
          status[author] = false;
        }
      }
      
      setModeratorStatus(status);
    };
    
    checkModeratorStatus();
  }, [posts, replies, contractService]);

  // Filter posts based on user selection
  React.useEffect(() => {
    if (showUserPostsOnly && userAddress) {
      const userPosts = posts.filter(post => post.author.toLowerCase() === userAddress.toLowerCase());
      setFilteredPosts(userPosts);
    } else {
      setFilteredPosts(posts);
    }
  }, [posts, showUserPostsOnly, userAddress]);

  // Sidebar button handlers
  const handleCreatePosts = () => {
    if (isConnected) {
      setShowCreatePost(true);
    } else {
      alert('Please connect your wallet to create posts');
    }
  };

  const handleMyReplies = () => {
    if (!isConnected) {
      alert('Please connect your wallet to view your replies');
      return;
    }
    navigateToProfile();
  };

  const handleLikedPosts = () => {
    if (!isConnected) {
      alert('Please connect your wallet to view your liked posts');
      return;
    }
    navigateToProfile();
  };


  const handleUserPosts = () => {
    setShowUserPostsOnly(!showUserPostsOnly);
  };

  const handleShare = (postId) => {
    const postUrl = `${window.location.origin}${window.location.pathname}#post-${postId}`;
    
    if (navigator.share) {
      // Use native share API if available
      navigator.share({
        title: `Post #${postId}`,
        text: `Check out this post on the Conflux Forum`,
        url: postUrl
      }).catch(err => {
        console.log('Error sharing:', err);
        fallbackShare(postUrl, postId);
      });
    } else {
      // Fallback to clipboard
      fallbackShare(postUrl, postId);
    }
  };

  const fallbackShare = (url, postId) => {
    navigator.clipboard.writeText(url).then(() => {
      // Show a temporary success message
      const originalText = '🔗';
      const button = document.querySelector(`[data-post-id="${postId}"] .share-btn span`);
      if (button) {
        button.textContent = '✓';
        setTimeout(() => {
          button.textContent = originalText;
        }, 2000);
      }
    }).catch(err => {
      console.error('Failed to copy to clipboard:', err);
      // Show error message
      alert('Failed to copy link to clipboard');
    });
  };

  const handleStatistics = () => {
    const statsSection = document.querySelector('.forum-stats');
    if (statsSection) {
      statsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };
  return (
    <main className="forum-main">
      <div className="container">
        <div className="forum-layout">
          {/* Sidebar */}
          <aside className="forum-sidebar">
            <div className="sidebar-section">
              <h3>Forum Features</h3>
              <ul className="category-list">
                <li>
                  <button 
                    className="category-link"
                    onClick={navigateToProfile}
                    disabled={!isConnected}
                    title={isConnected ? "View your profile" : "Connect wallet to view profile"}
                  >
                    👤 My Profile
                  </button>
                </li>
                <li>
                  <button 
                    className="category-link"
                    onClick={handleMyReplies}
                    disabled={!isConnected}
                    title={isConnected ? "View your reply history" : "Connect wallet to view replies"}
                  >
                    💬 My Replies ({userReplies.length})
                  </button>
                </li>
                <li>
                  <button 
                    className="category-link"
                    onClick={handleLikedPosts}
                    disabled={!isConnected}
                    title={isConnected ? "View posts you've liked" : "Connect wallet to view liked posts"}
                  >
                    ❤️ Liked Posts ({likedPosts.length})
                  </button>
                </li>
                <li>
                  <button 
                    className="category-link" 
                    onClick={handleCreatePosts}
                    disabled={!isConnected}
                    title={isConnected ? "Create a new post" : "Connect wallet to create posts"}
                  >
                    📝 Create Posts
                  </button>
                </li>
                <li>
                  <button 
                    className="category-link" 
                    onClick={handleStatistics}
                    title="Scroll to statistics"
                  >
                    📊 Statistics
                  </button>
                </li>
              </ul>
            </div>
            
            <div className="sidebar-section">
              <h3>Smart Contract Info</h3>
              <div className="contract-info">
                <div className="info-item">
                  <span className="info-label">Content Mode:</span>
                  <span className="info-value">
                    {contractInfo ? (contractInfo.contentIsCID ? 'IPFS CID' : 'Plain Text') : 'Loading...'}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Rate Limit:</span>
                  <span className="info-value">
                    {contractInfo ? `${contractInfo.rateLimit} seconds` : 'Loading...'}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Total Posts:</span>
                  <span className="info-value">
                    {contractInfo ? contractInfo.totalPosts : 'Loading...'}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Contract Owner:</span>
                  <span className="info-value">
                    {contractInfo ? `${contractInfo.owner.slice(0, 6)}...${contractInfo.owner.slice(-4)}` : 'Loading...'}
                  </span>
                </div>
              </div>
            </div>

            {isModerator && (
              <div className="sidebar-section">
                <h3>Moderation Tools</h3>
                <div className="moderation-tools">
                  <button className="btn btn-secondary">View Reports</button>
                  <button className="btn btn-secondary">Moderate Posts</button>
                </div>
              </div>
            )}
          </aside>

          {/* Main Content */}
          <div className="forum-content">
            <div className="forum-header">
              <h1>On-Chain Forum</h1>
              <p>Decentralized forum powered by Conflux eSpace blockchain - Create posts, reply, and like content directly on-chain</p>
              <div className="network-info">
                <span className="network-badge">🌐 Conflux eSpace Mainnet</span>
                <span className="contract-address">Contract: 0x7AeD1C50613D836f242E16823e045Abd4c540049</span>
              </div>
              <button className="btn btn-primary" onClick={() => setShowCreatePost(true)}>Create New Post</button>
            </div>

            {/* Forum Statistics */}
            <div className="forum-stats">
              <div className="stat-card">
                <div className="stat-number">
                  {postStatistics ? postStatistics.totalPosts : '0'}
                </div>
                <div className="stat-label">Total Posts</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">
                  {postStatistics ? postStatistics.totalReplies : '0'}
                </div>
                <div className="stat-label">Total Replies</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">
                  {postStatistics ? postStatistics.totalLikes : '0'}
                </div>
                <div className="stat-label">Total Likes</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">
                  {contractInfo ? `${contractInfo.rateLimit}s` : '60s'}
                </div>
                <div className="stat-label">Rate Limit</div>
              </div>
            </div>

            {/* Recent Posts */}
            <div className="posts-section">
              <h2>
                {showUserPostsOnly ? 'Your Posts' : 'Recent Posts'}
                {showUserPostsOnly && (
                  <span className="filter-indicator">
                    ({filteredPosts.length} posts)
                  </span>
                )}
              </h2>
              
              {error && (
                <div className="error-message">
                  <p>Error: {error}</p>
                </div>
              )}
              
              {loading ? (
                <div className="loading-message">
                  <p>Loading posts...</p>
                </div>
              ) : filteredPosts.length === 0 ? (
                <div className="no-posts-message">
                  <p>
                    {showUserPostsOnly ? "You haven't created any posts yet. Create your first post!" :
                     "No posts yet. Be the first to create a post!"}
                  </p>
                </div>
              ) : (
                <div className="posts-list">
                  {filteredPosts.map((post) => (
                    <div key={post.id} className="post-card" data-post-id={post.id}>
                      <div className="post-header">
                        <h3 className="post-title">
                          {post.content.length > 100 
                            ? `${post.content.substring(0, 100)}...` 
                            : post.content}
                        </h3>
                        <div className="post-actions">
                          <button 
                            className="action-btn like-btn" 
                            onClick={() => handleLike(post.id)} 
                            title="Like"
                            disabled={!isConnected}
                          >
                            <span>❤️</span> {post.likeCount}
                          </button>
                          <button 
                            className="action-btn reply-btn" 
                            onClick={() => handleReply(post.id)} 
                            title="Reply"
                            disabled={!isConnected}
                          >
                            <span>💬</span> {replies[post.id] ? replies[post.id].length : 0}
                          </button>
                          <button 
                            className="action-btn share-btn" 
                            title="Share"
                            onClick={() => handleShare(post.id)}
                          >
                            <span>🔗</span>
                          </button>
                          {isModerator && (
                            <button 
                              className="action-btn moderate-btn" 
                              onClick={() => handleModerate(post.id)} 
                              title="Moderate"
                            >
                              <span>🛡️</span>
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="post-preview">{post.content}</p>
                      <div className="post-meta">
                        <span className="post-author">
                          <AuthorDisplay 
                            author={post.author} 
                            moderatorStatus={moderatorStatus}
                            contractService={contractService}
                          />
                        </span>
                        <span className="post-time">
                          {new Date(post.createdAt).toLocaleDateString()} at {new Date(post.createdAt).toLocaleTimeString()}
                        </span>
                        <span className="post-id">Post #{post.id}</span>
                      </div>
                      
                      {/* Threaded Replies */}
                      {replies[post.id] && replies[post.id].length > 0 && (
                        <div className="replies-section">
                          <h4 className="replies-header">
                            Replies ({replies[post.id].length})
                          </h4>
                          <div className="replies-list">
                            {replies[post.id].map((reply) => (
                              <div key={reply.id} className="reply-card">
                                <div className="reply-content">
                                  <p className="reply-text">{reply.content}</p>
                                  <div className="reply-meta">
                                    <span className="reply-author">
                                      <AuthorDisplay 
                                        author={reply.author} 
                                        moderatorStatus={moderatorStatus}
                                        contractService={contractService}
                                      />
                                    </span>
                                    <span className="reply-time">
                                      {new Date(reply.createdAt).toLocaleDateString()} at {new Date(reply.createdAt).toLocaleTimeString()}
                                    </span>
                                    <span className="reply-id">Reply #{reply.id}</span>
                                  </div>
                                </div>
                                <div className="reply-actions">
                                  <button 
                                    className="action-btn like-btn" 
                                    onClick={() => handleLike(reply.id)} 
                                    title="Like Reply"
                                    disabled={!isConnected}
                                  >
                                    <span>❤️</span> {reply.likeCount}
                                  </button>
                                  {isModerator && (
                                    <button 
                                      className="action-btn moderate-btn" 
                                      onClick={() => handleModerate(reply.id)} 
                                      title="Moderate Reply"
                                    >
                                      <span>🛡️</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reply Modal */}
      {showReplyModal && (
        <div className="modal-overlay" onClick={() => setShowReplyModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Reply to Post #{replyToPost}</h2>
              <button className="modal-close" onClick={() => setShowReplyModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <textarea
                className="post-textarea"
                placeholder="Write your reply... (Max 2000 characters)"
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                maxLength={2000}
                rows={6}
              />
              <div className="character-count">
                {replyContent.length}/2000 characters
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowReplyModal(false)}>
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleCreateReply}
                disabled={!replyContent.trim()}
              >
                Post Reply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Post Modal */}
      {showCreatePost && (
        <div className="modal-overlay" onClick={() => setShowCreatePost(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Post</h2>
              <button className="modal-close" onClick={() => setShowCreatePost(false)}>×</button>
            </div>
            <div className="modal-body">
              <textarea
                className="post-textarea"
                placeholder="What's on your mind? (Max 2000 characters)"
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                maxLength={2000}
                rows={6}
              />
              <div className="character-count">
                {newPostContent.length}/2000 characters
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowCreatePost(false)}>
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleCreatePost}
                disabled={!newPostContent.trim()}
              >
                Create Post
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default ForumPage;
