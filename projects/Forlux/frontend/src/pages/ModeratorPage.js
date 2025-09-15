import React, { useState, useEffect } from 'react';
import './ModeratorPage.css';

const ModeratorPage = ({
  isConnected,
  isModerator,
  userAddress,
  contractService,
  loading,
  error,
  handleModerate,
  posts,
  replies,
  refreshSidebarData
}) => {
  const [moderatorStats, setModeratorStats] = useState({
    totalPosts: 0,
    totalReplies: 0,
    totalLikes: 0
  });
  const [flaggedPosts, setFlaggedPosts] = useState([]);
  const [contractOwner, setContractOwner] = useState('');
  const [selectedPost, setSelectedPost] = useState(null);
  const [showModerationModal, setShowModerationModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPostDetails, setSelectedPostDetails] = useState(null);

  // Load moderator dashboard data
  useEffect(() => {
    if (isConnected && isModerator && contractService) {
      loadModeratorData();
    }
  }, [isConnected, isModerator, contractService]);

  const loadModeratorData = async () => {
    try {
      // Load contract statistics and owner info
      const [statsResult, contractInfoResult] = await Promise.all([
        contractService.getPostStatistics(),
        contractService.getContractInfo()
      ]);

      if (statsResult.success) {
        setModeratorStats({
          totalPosts: parseInt(statsResult.data.totalPosts),
          totalReplies: parseInt(statsResult.data.totalReplies),
          totalLikes: parseInt(statsResult.data.totalLikes)
        });
      }

      if (contractInfoResult.success) {
        setContractOwner(contractInfoResult.data.owner);
      }

      // Load recent posts for moderation review using real contract function
      const postsResult = await contractService.getTopLevelPosts(0, 20);
      if (postsResult.success) {
        const allPosts = postsResult.data;
        // Filter posts that might need moderation (recent posts with low engagement)
        const flagged = allPosts.filter(post => {
          const hoursSinceCreated = (new Date() - post.createdAt) / (1000 * 60 * 60);
          const engagementScore = parseInt(post.likeCount) + (replies[post.id]?.length || 0);
          return hoursSinceCreated < 24 && engagementScore < 2; // Flag recent posts with low engagement
        });
        setFlaggedPosts(flagged);
      }

    } catch (error) {
      console.error('Error loading moderator data:', error);
    }
  };

  const handleModeratePost = async (postId) => {
    try {
      await handleModerate(postId);
      setShowModerationModal(false);
      setSelectedPost(null);
      await loadModeratorData(); // Refresh data
    } catch (error) {
      console.error('Error moderating post:', error);
    }
  };

  const openModerationModal = (post) => {
    setSelectedPost(post);
    setShowModerationModal(true);
  };

  const openDetailsModal = (post) => {
    setSelectedPostDetails(post);
    setShowDetailsModal(true);
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!isConnected) {
    return (
      <div className="moderator-page">
        <div className="moderator-header">
          <h1>Moderator Dashboard</h1>
          <p>Please connect your wallet to access moderator features.</p>
        </div>
      </div>
    );
  }

  if (!isModerator) {
    return (
      <div className="moderator-page">
        <div className="moderator-header">
          <h1>Access Denied</h1>
          <p>You do not have moderator privileges.</p>
          <p>Only contract moderators can access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="moderator-page">
      <div className="moderator-layout">
        {/* Sidebar */}
        <div className="moderator-sidebar">
          <div className="sidebar-section">
            <h3>🛡️ Moderator Dashboard</h3>
            <p style={{ color: '#9ca3af', fontSize: '0.875rem', margin: 0 }}>
              Manage forum content and community guidelines
            </p>
            {contractOwner && (
              <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(31, 41, 55, 0.3)', borderRadius: '6px', border: '1px solid rgba(75, 85, 99, 0.3)' }}>
                <p style={{ color: '#9ca3af', fontSize: '0.75rem', margin: '0 0 0.25rem 0' }}>Contract Owner:</p>
                <p style={{ color: '#60a5fa', fontSize: '0.75rem', margin: 0, fontFamily: 'monospace' }}>
                  {formatAddress(contractOwner)}
                </p>
                <p style={{ color: '#9ca3af', fontSize: '0.75rem', margin: '0.5rem 0 0 0' }}>
                  Only the contract owner is currently a moderator.
                </p>
              </div>
            )}
          </div>

          <div className="sidebar-section">
            <h3>📊 Statistics</h3>
            <div className="moderator-stats">
              <div className="stat-card">
                <div className="stat-number">{moderatorStats.totalPosts}</div>
                <div className="stat-label">Total Posts</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{moderatorStats.totalReplies}</div>
                <div className="stat-label">Total Replies</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{moderatorStats.totalLikes}</div>
                <div className="stat-label">Total Likes</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{flaggedPosts.length}</div>
                <div className="stat-label">Flagged Posts</div>
              </div>
            </div>
          </div>

          <div className="sidebar-section">
            <h3>⚡ Quick Actions</h3>
            <div className="quick-actions">
              <button 
                className="quick-action-btn"
                onClick={loadModeratorData}
                disabled={loading}
              >
                🔄 Refresh All Data
              </button>
              <button 
                className="quick-action-btn"
                onClick={() => window.open('https://evm.confluxscan.org/', '_blank')}
              >
                🔍 View Contract
              </button>
              <button 
                className="quick-action-btn"
                onClick={() => {
                  const allPosts = [...posts];
                  allPosts.forEach(post => {
                    if (replies[post.id]) {
                      allPosts.push(...replies[post.id]);
                    }
                  });
                  console.log('All forum data:', allPosts);
                  alert('Forum data logged to console');
                }}
              >
                📊 Export Data
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="moderator-content">
          {/* Flagged Posts Section */}
          <div className="section-header">
            <h2>🚩 Flagged for Review</h2>
            <button 
              className="refresh-btn"
              onClick={loadModeratorData}
              disabled={loading}
            >
              {loading ? '⏳' : '🔄'} Refresh
            </button>
          </div>
          
          <div className="flagged-posts">
            {flaggedPosts.length === 0 ? (
              <div className="no-content">
                <p>No posts flagged for review</p>
              </div>
            ) : (
              flaggedPosts.map(post => (
                <div key={post.id} className="flagged-post">
                  <div className="post-header">
                    <div className="post-author">
                      <span className="author-avatar">👤</span>
                      <span className="author-address">{formatAddress(post.author)}</span>
                      <span className="post-time">{formatTimeAgo(post.createdAt)}</span>
                    </div>
                    <div className="post-engagement">
                      <span>❤️ {post.likeCount}</span>
                      <span>💬 {replies[post.id]?.length || 0}</span>
                    </div>
                  </div>
                  <div className="post-content">
                    <p>{post.content}</p>
                  </div>
                  <div className="post-actions">
                    <button 
                      className="action-btn moderate-btn"
                      onClick={() => openModerationModal(post)}
                    >
                      ⚖️ Moderate
                    </button>
                    <button 
                      className="action-btn view-btn"
                      onClick={() => openDetailsModal(post)}
                    >
                      🔍 View Details
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Moderator Information */}
          <div className="section-header" style={{ marginTop: '2rem' }}>
            <h2>🛡️ Moderator Tools</h2>
          </div>
          
          <div className="no-content">
            <p>Use the actions below to moderate flagged posts. All moderation actions are recorded on-chain.</p>
          </div>
        </div>
      </div>
      </div>

      {/* Moderation Modal */}
      {showModerationModal && selectedPost && (
        <div className="moderation-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Moderate Post #{selectedPost.id}</h3>
              <button 
                className="close-btn"
                onClick={() => setShowModerationModal(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <div className="post-preview">
                <div className="post-header">
                  <div className="post-author">
                    <span className="author-avatar">👤</span>
                    <span className="author-address">{formatAddress(selectedPost.author)}</span>
                    <span className="post-time">{formatTimeAgo(selectedPost.createdAt)}</span>
                  </div>
                  <div className="post-engagement">
                    <span>❤️ {selectedPost.likeCount}</span>
                    <span>💬 {replies[selectedPost.id]?.length || 0}</span>
                  </div>
                </div>
                <div className="post-content">
                  <p>{selectedPost.content}</p>
                </div>
              </div>
              
              <div className="moderation-warning">
                <p>⚠️ Are you sure you want to moderate this post? This action cannot be undone.</p>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="cancel-btn"
                onClick={() => setShowModerationModal(false)}
              >
                Cancel
              </button>
              <button 
                className="moderate-btn"
                onClick={() => handleModeratePost(selectedPost.id)}
              >
                Moderate Post
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Post Details Modal */}
      {showDetailsModal && selectedPostDetails && (
        <div className="moderation-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Post Details #{selectedPostDetails.id}</h3>
              <button 
                className="close-btn"
                onClick={() => setShowDetailsModal(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <div className="post-preview">
                <div className="post-header">
                  <div className="post-author">
                    <span className="author-avatar">👤</span>
                    <span className="author-address">{formatAddress(selectedPostDetails.author)}</span>
                    <span className="post-time">{formatTimeAgo(selectedPostDetails.createdAt)}</span>
                  </div>
                  <div className="post-engagement">
                    <span>❤️ {selectedPostDetails.likeCount}</span>
                    <span>💬 {replies[selectedPostDetails.id]?.length || 0}</span>
                  </div>
                </div>
                <div className="post-content">
                  <p>{selectedPostDetails.content}</p>
                </div>
              </div>
              
              <div className="contract-info">
                <h4>Contract Information</h4>
                <p><strong>Contract Address:</strong> {contractService?.contractAddress || 'Not available'}</p>
                <p><strong>Network:</strong> Conflux eSpace</p>
                <p><strong>Post ID:</strong> #{selectedPostDetails.id}</p>
                <a 
                  href={`https://evm.confluxscan.net/address/${contractService?.contractAddress || ''}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contract-link"
                >
                  View on ConfluxScan
                </a>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="cancel-btn"
                onClick={() => setShowDetailsModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ModeratorPage;
