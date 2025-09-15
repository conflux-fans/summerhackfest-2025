import React, { useState, useEffect } from 'react';
import './UserProfilePage.css';
import usernameService from '../services/usernameService';

// Helper function to create author display with moderator indicator
const AuthorDisplay = ({ author, moderatorStatus }) => {
  const displayName = usernameService.getDisplayName(author);
  const isModerator = moderatorStatus[author] || false;
  const profilePicture = usernameService.getProfilePicture(author);
  const defaultAvatar = usernameService.getDefaultAvatar(author);
  
  return (
    <span className="author-with-moderator">
      <span className="author-avatar">
        {profilePicture ? (
          <img src={profilePicture} alt="Profile" className="author-profile-picture" />
        ) : (
          <span className="author-default-avatar">{defaultAvatar}</span>
        )}
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

function UserProfilePage({ 
  isConnected, 
  userAddress, 
  userReplies, 
  likedPosts, 
  fetchUserReplies, 
  fetchLikedPosts,
  fetchUserPosts,
  refreshSidebarData,
  handleLike,
  handleModerate,
  isModerator,
  loading,
  error,
  contractService
}) {
  const [activeTab, setActiveTab] = useState('posts');
  const [loadingUserData, setLoadingUserData] = useState(false);
  const [userPosts, setUserPosts] = useState([]);
  const [copySuccess, setCopySuccess] = useState(false);
  const [moderatorStatus, setModeratorStatus] = useState({});

  // Fetch user data when component mounts
  useEffect(() => {
    if (isConnected && userAddress) {
      loadUserData();
    }
  }, [isConnected, userAddress]);

  // Refresh data when likedPosts changes (from external updates)
  useEffect(() => {
    if (isConnected && userAddress && likedPosts) {
      // Update moderator status when likedPosts changes
      checkModeratorStatus();
    }
  }, [likedPosts]);


  const loadUserData = async () => {
    setLoadingUserData(true);
    try {
      // Use refreshSidebarData to get the latest data
      if (refreshSidebarData) {
        await refreshSidebarData();
      } else {
        // Fallback to individual functions if refreshSidebarData is not available
        await Promise.all([
          fetchUserReplies(),
          fetchLikedPosts()
        ]);
      }
      
      const posts = await fetchUserPosts();
      setUserPosts(posts);
      
      // Check moderator status for all authors
      await checkModeratorStatus();
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoadingUserData(false);
    }
  };

  const checkModeratorStatus = async () => {
    if (!contractService) return;
    
    const allAuthors = new Set();
    
    // Collect all unique authors from user posts
    userPosts.forEach(post => allAuthors.add(post.author));
    
    // Collect all unique authors from user replies
    userReplies.forEach(reply => allAuthors.add(reply.author));
    
    // Collect all unique authors from liked posts
    likedPosts.forEach(post => allAuthors.add(post.author));
    
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

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString() + ' at ' + new Date(timestamp).toLocaleTimeString();
  };

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(userAddress);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = userAddress;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };


  const renderUserPosts = () => (
    <div className="user-data-section">
      <div className="section-header">
        <h3>Your Posts ({userPosts.length})</h3>
        <button 
          className="refresh-btn" 
          onClick={loadUserData}
          disabled={loadingUserData}
        >
          {loadingUserData ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
      
      {loadingUserData ? (
        <div className="loading-message">
          <p>Loading your posts...</p>
        </div>
      ) : userPosts.length === 0 ? (
        <div className="no-data-message">
          <p>You haven't created any posts yet. Create your first post!</p>
        </div>
      ) : (
        <div className="posts-list">
          {userPosts.map((post) => (
            <div key={post.id} className="post-card">
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
                    title="Like Post"
                    disabled={!isConnected}
                  >
                    <span>❤️</span> {post.likeCount}
                  </button>
                  {isModerator && (
                    <button 
                      className="action-btn moderate-btn" 
                      onClick={() => handleModerate(post.id)} 
                      title="Moderate Post"
                    >
                      <span>🛡️</span>
                    </button>
                  )}
                </div>
              </div>
              <div className="post-meta">
                <span className="post-author">
                  <AuthorDisplay 
                    author={post.author} 
                    moderatorStatus={moderatorStatus}
                  />
                </span>
                <span className="post-time">{formatDate(post.createdAt)}</span>
                <span className="post-id">Post #{post.id}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderReplies = () => (
    <div className="user-data-section">
      <div className="section-header">
        <h3>Your Replies ({userReplies.length})</h3>
        <button 
          className="refresh-btn" 
          onClick={loadUserData}
          disabled={loadingUserData}
        >
          {loadingUserData ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
      
      {loadingUserData ? (
        <div className="loading-message">
          <p>Loading your replies...</p>
        </div>
      ) : userReplies.length === 0 ? (
        <div className="no-data-message">
          <p>You haven't replied to any posts yet. Start a conversation!</p>
        </div>
      ) : (
        <div className="replies-list">
          {userReplies.map((reply) => (
            <div key={reply.id} className="reply-card">
              <div className="reply-content">
                <p className="reply-text">{reply.content}</p>
                <div className="reply-meta">
                  <span className="reply-author">
                    <AuthorDisplay 
                      author={reply.author} 
                      moderatorStatus={moderatorStatus}
                    />
                  </span>
                  <span className="reply-time">{formatDate(reply.createdAt)}</span>
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
      )}
    </div>
  );

  const renderLikedPosts = () => (
    <div className="user-data-section">
      <div className="section-header">
        <h3>Liked Posts ({likedPosts.length})</h3>
        <button 
          className="refresh-btn" 
          onClick={async () => {
            setLoadingUserData(true);
            try {
              if (refreshSidebarData) {
                await refreshSidebarData();
              }
              await checkModeratorStatus();
            } catch (error) {
              console.error('Error refreshing liked posts:', error);
            } finally {
              setLoadingUserData(false);
            }
          }}
          disabled={loadingUserData}
        >
          {loadingUserData ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
      
      {loadingUserData ? (
        <div className="loading-message">
          <p>Loading your liked posts...</p>
        </div>
      ) : likedPosts.length === 0 ? (
        <div className="no-data-message">
          <p>You haven't liked any posts or replies yet. Like some content to see it here!</p>
        </div>
      ) : (
        <div className="liked-posts-list">
          {likedPosts.map((item) => (
            <div key={item.id} className="post-card">
              <div className="post-header">
                <h3 className="post-title">
                  {item.contentType === 'reply' && (
                    <span className="content-type-badge">💬 Reply</span>
                  )}
                  {item.content.length > 100 
                    ? `${item.content.substring(0, 100)}...` 
                    : item.content}
                </h3>
                <div className="post-actions">
                  <button 
                    className="action-btn like-btn" 
                    onClick={() => handleLike(item.id)} 
                    title="Unlike"
                    disabled={!isConnected}
                  >
                    <span>❤️</span> {item.likeCount}
                  </button>
                  {isModerator && (
                    <button 
                      className="action-btn moderate-btn" 
                      onClick={() => handleModerate(item.id)} 
                      title="Moderate"
                    >
                      <span>🛡️</span>
                    </button>
                  )}
                </div>
              </div>
              <p className="post-preview">{item.content}</p>
              <div className="post-meta">
                <span className="post-author">
                  <AuthorDisplay 
                    author={item.author} 
                    moderatorStatus={moderatorStatus}
                  />
                </span>
                <span className="post-time">{formatDate(item.createdAt)}</span>
                <span className="post-id">
                  {item.contentType === 'reply' ? `Reply #${item.id}` : `Post #${item.id}`}
                  {item.contentType === 'reply' && item.parentPostId && (
                    <span className="parent-post-ref"> (to Post #{item.parentPostId})</span>
                  )}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (!isConnected) {
    return (
      <main className="user-profile-main">
        <div className="container">
          <div className="not-connected-message">
            <h2>Please Connect Your Wallet</h2>
            <p>You need to connect your wallet to view your profile data.</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="user-profile-main">
      <div className="container">
        <div className="profile-header">
          <h1>User Profile</h1>
          <div className="user-info">
            <div className="user-avatar">
              <span className="default-avatar">{usernameService.getDefaultAvatar(userAddress)}</span>
            </div>
            <div className="user-details">
              <h2>@{formatAddress(userAddress)}</h2>
              <p>Conflux eSpace User</p>
              <div className="user-address-container">
                <span className="user-address">{formatAddress(userAddress)}</span>
                <button 
                  className="copy-address-btn"
                  onClick={copyAddress}
                  title="Copy full address"
                >
                  {copySuccess ? '✓' : '📋'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="profile-tabs">
          <button 
            className={`tab-btn ${activeTab === 'posts' ? 'active' : ''}`}
            onClick={() => setActiveTab('posts')}
          >
            📝 My Posts ({userPosts.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'replies' ? 'active' : ''}`}
            onClick={() => setActiveTab('replies')}
          >
            💬 My Replies ({userReplies.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'liked' ? 'active' : ''}`}
            onClick={() => setActiveTab('liked')}
          >
            ❤️ Liked Posts ({likedPosts.length})
          </button>
        </div>

        <div className="profile-content">
          {error && (
            <div className="error-message">
              <p>Error: {error}</p>
            </div>
          )}

          {activeTab === 'posts' && renderUserPosts()}
          {activeTab === 'replies' && renderReplies()}
          {activeTab === 'liked' && renderLikedPosts()}
        </div>
      </div>

    </main>
  );
}

export default UserProfilePage;
