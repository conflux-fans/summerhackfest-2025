import React, { useState } from 'react';
import './FeaturesPage.css';

function FeaturesPage({ isConnected, userAddress, walletType }) {
  const [activeFeature, setActiveFeature] = useState('overview');

  const features = [
    {
      id: 'overview',
      title: 'Overview',
      icon: '📊',
      description: 'Complete decentralized forum solution'
    },
    {
      id: 'posts',
      title: 'Post Management',
      icon: '📝',
      description: 'Create, manage, and organize posts'
    },
    {
      id: 'replies',
      title: 'Threaded Replies',
      icon: '💬',
      description: 'Nested conversation threads'
    },
    {
      id: 'social',
      title: 'Social Features',
      icon: '❤️',
      description: 'Like system and user interactions'
    },
    {
      id: 'moderation',
      title: 'Moderation',
      icon: '🛡️',
      description: 'Content moderation and management'
    },
    {
      id: 'technical',
      title: 'Technical Specs',
      icon: '⚙️',
      description: 'Smart contract specifications'
    }
  ];

  const renderFeatureContent = () => {
    switch (activeFeature) {
      case 'overview':
        return (
          <div className="feature-content">
            <div className="feature-header">
              <h2>🚀 OnChain Forum Overview</h2>
              <p>A comprehensive, serverless forum smart contract for Conflux eSpace with frontend-optimized data fetching.</p>
            </div>
            
            <div className="overview-grid">
              <div className="overview-card">
                <div className="card-icon">🌐</div>
                <h3>Decentralized</h3>
                <p>No servers, no downtime. Your forum runs entirely on the blockchain.</p>
              </div>
              <div className="overview-card">
                <div className="card-icon">🔒</div>
                <h3>Immutable</h3>
                <p>All posts and interactions are permanently recorded on-chain.</p>
              </div>
              <div className="overview-card">
                <div className="card-icon">⚡</div>
                <h3>Fast</h3>
                <p>Optimized for frontend performance with batch data fetching.</p>
              </div>
              <div className="overview-card">
                <div className="card-icon">🎯</div>
                <h3>Flexible</h3>
                <p>Support for both IPFS CID and plain text content modes.</p>
              </div>
            </div>

            <div className="stats-section">
              <h3>Smart Contract Statistics</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-number">2000</span>
                  <span className="stat-label">Max Content Length</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">60s</span>
                  <span className="stat-label">Rate Limit</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">100</span>
                  <span className="stat-label">Pagination Limit</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">∞</span>
                  <span className="stat-label">Storage Capacity</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'posts':
        return (
          <div className="feature-content">
            <div className="feature-header">
              <h2>📝 Post Management</h2>
              <p>Create, manage, and organize posts with full blockchain integration.</p>
            </div>

            <div className="feature-section">
              <h3>Core Post Functions</h3>
              <div className="function-list">
                <div className="function-item">
                  <div className="function-name">createPost(content, parentId)</div>
                  <div className="function-description">Create a new post or reply. Set parentId to 0 for top-level posts.</div>
                  <div className="function-example">
                    <code>forum.createPost("Hello World!", 0)</code>
                  </div>
                </div>
                <div className="function-item">
                  <div className="function-name">deletePost(id)</div>
                  <div className="function-description">Soft delete your own post. Content is preserved but marked as deleted.</div>
                  <div className="function-example">
                    <code>forum.deletePost(123)</code>
                  </div>
                </div>
                <div className="function-item">
                  <div className="function-name">getPost(id)</div>
                  <div className="function-description">Retrieve complete post information including metadata.</div>
                  <div className="function-example">
                    <code>forum.getPost(123)</code>
                  </div>
                </div>
              </div>
            </div>

            <div className="feature-section">
              <h3>Post Structure</h3>
              <div className="code-block">
                <pre>{`struct Post {
    uint256 id;           // Unique post identifier
    uint256 parentId;     // 0 for top-level posts
    address author;       // Post creator address
    string content;       // Post content (text or IPFS CID)
    uint256 createdAt;    // Block timestamp
    bool deleted;         // Soft deletion flag
    uint256 likeCount;    // Total likes received
}`}</pre>
              </div>
            </div>

            <div className="feature-section">
              <h3>Content Modes</h3>
              <div className="content-modes">
                <div className="mode-card">
                  <h4>📄 Plain Text Mode</h4>
                  <p>Direct text storage on-chain. Perfect for short messages and quick posts.</p>
                  <ul>
                    <li>Maximum 2000 characters</li>
                    <li>No external dependencies</li>
                    <li>Instant access</li>
                  </ul>
                </div>
                <div className="mode-card">
                  <h4>🌐 IPFS CID Mode</h4>
                  <p>Store content on IPFS, reference via CID. Ideal for longer content and media.</p>
                  <ul>
                    <li>Unlimited content size</li>
                    <li>Decentralized storage</li>
                    <li>Media support</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      case 'replies':
        return (
          <div className="feature-content">
            <div className="feature-header">
              <h2>💬 Threaded Replies</h2>
              <p>Build nested conversation threads with unlimited depth and organization.</p>
            </div>

            <div className="feature-section">
              <h3>Reply System</h3>
              <div className="reply-demo">
                <div className="thread-visualization">
                  <div className="post-thread">
                    <div className="thread-post main-post">
                      <div className="post-header">
                        <span className="post-author">@alice</span>
                        <span className="post-time">2 hours ago</span>
                      </div>
                      <div className="post-content">What do you think about the new Conflux features?</div>
                      <div className="post-actions">
                        <button className="action-btn">❤️ 12</button>
                        <button className="action-btn">💬 3</button>
                      </div>
                    </div>
                    
                    <div className="reply-thread">
                      <div className="thread-post reply-post">
                        <div className="post-header">
                          <span className="post-author">@bob</span>
                          <span className="post-time">1 hour ago</span>
                        </div>
                        <div className="post-content">I'm excited about the new features!</div>
                        <div className="post-actions">
                          <button className="action-btn">❤️ 5</button>
                          <button className="action-btn">💬 1</button>
                        </div>
                      </div>
                      
                      <div className="nested-reply">
                        <div className="thread-post nested-post">
                          <div className="post-header">
                            <span className="post-author">@charlie</span>
                            <span className="post-time">30 min ago</span>
                          </div>
                          <div className="post-content">Same here! The performance improvements are amazing.</div>
                          <div className="post-actions">
                            <button className="action-btn">❤️ 2</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="feature-section">
              <h3>Reply Functions</h3>
              <div className="function-list">
                <div className="function-item">
                  <div className="function-name">getReplies(parentId)</div>
                  <div className="function-description">Get all direct replies to a specific post.</div>
                  <div className="function-example">
                    <code>forum.getReplies(123)</code>
                  </div>
                </div>
                <div className="function-item">
                  <div className="function-name">getTopLevelPosts()</div>
                  <div className="function-description">Get all main posts (no replies) for the main feed.</div>
                  <div className="function-example">
                    <code>forum.getTopLevelPosts()</code>
                  </div>
                </div>
                <div className="function-item">
                  <div className="function-name">getPostsByAuthor(author)</div>
                  <div className="function-description">Get all posts created by a specific user.</div>
                  <div className="function-example">
                    <code>forum.getPostsByAuthor(0x123...)</code>
                  </div>
                </div>
              </div>
            </div>

            <div className="feature-section">
              <h3>Threading Benefits</h3>
              <div className="benefits-grid">
                <div className="benefit-item">
                  <div className="benefit-icon">🔗</div>
                  <h4>Organized Conversations</h4>
                  <p>Keep discussions structured and easy to follow.</p>
                </div>
                <div className="benefit-item">
                  <div className="benefit-icon">📊</div>
                  <h4>Context Preservation</h4>
                  <p>Maintain conversation context with parent-child relationships.</p>
                </div>
                <div className="benefit-item">
                  <div className="benefit-icon">🎯</div>
                  <h4>Targeted Responses</h4>
                  <p>Reply to specific posts within complex discussions.</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'social':
        return (
          <div className="feature-content">
            <div className="feature-header">
              <h2>❤️ Social Features</h2>
              <p>Engage with the community through likes, interactions, and social proof.</p>
            </div>

            <div className="feature-section">
              <h3>Like System</h3>
              <div className="like-demo">
                <div className="demo-post">
                  <div className="post-content">
                    <h4>Amazing Conflux Update!</h4>
                    <p>The new features are incredible. Can't wait to try them out!</p>
                  </div>
                  <div className="post-stats">
                    <div className="like-counter">
                      <span className="like-icon">❤️</span>
                      <span className="like-count">42 likes</span>
                    </div>
                    <div className="interaction-buttons">
                      <button className="interaction-btn like-btn">❤️ Like</button>
                      <button className="interaction-btn reply-btn">💬 Reply</button>
                      <button className="interaction-btn share-btn">🔗 Share</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="feature-section">
              <h3>Social Functions</h3>
              <div className="function-list">
                <div className="function-item">
                  <div className="function-name">like(id, liked)</div>
                  <div className="function-description">Like or unlike a post. Toggle functionality built-in.</div>
                  <div className="function-example">
                    <code>forum.like(123, true)  // Like the post</code>
                  </div>
                </div>
                <div className="function-item">
                  <div className="function-name">hasUserLiked(id, user)</div>
                  <div className="function-description">Check if a specific user has liked a post.</div>
                  <div className="function-example">
                    <code>forum.hasUserLiked(123, 0x123...)</code>
                  </div>
                </div>
                <div className="function-item">
                  <div className="function-name">getUserLikesForPosts(user, postIds)</div>
                  <div className="function-description">Batch check like status for multiple posts.</div>
                  <div className="function-example">
                    <code>forum.getUserLikesForPosts(user, [1,2,3,4,5])</code>
                  </div>
                </div>
              </div>
            </div>

            <div className="feature-section">
              <h3>Social Benefits</h3>
              <div className="benefits-grid">
                <div className="benefit-item">
                  <div className="benefit-icon">📈</div>
                  <h4>Engagement Metrics</h4>
                  <p>Track post popularity and community engagement.</p>
                </div>
                <div className="benefit-item">
                  <div className="benefit-icon">🎯</div>
                  <h4>Content Discovery</h4>
                  <p>Popular posts surface naturally through likes.</p>
                </div>
                <div className="benefit-item">
                  <div className="benefit-icon">🤝</div>
                  <h4>Community Building</h4>
                  <p>Foster positive interactions and community spirit.</p>
                </div>
              </div>
            </div>

            <div className="feature-section">
              <h3>Events & Real-time Updates</h3>
              <div className="events-list">
                <div className="event-item">
                  <div className="event-name">PostLiked</div>
                  <div className="event-description">Emitted when a post is liked or unliked</div>
                  <div className="event-params">
                    <code>event PostLiked(uint256 indexed id, address indexed user, bool liked, uint256 likeCount)</code>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'moderation':
        return (
          <div className="feature-content">
            <div className="feature-header">
              <h2>🛡️ Moderation System</h2>
              <p>Maintain community standards with flexible moderation tools and transparent governance.</p>
            </div>

            <div className="feature-section">
              <h3>Moderation Features</h3>
              <div className="moderation-demo">
                <div className="moderation-panel">
                  <div className="moderator-badge">
                    <span className="badge-icon">🛡️</span>
                    <span className="badge-text">Moderator</span>
                  </div>
                  <div className="moderation-actions">
                    <button className="mod-action-btn delete-btn">🗑️ Delete Post</button>
                    <button className="mod-action-btn warn-btn">⚠️ Issue Warning</button>
                    <button className="mod-action-btn ban-btn">🚫 Ban User</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="feature-section">
              <h3>Moderation Functions</h3>
              <div className="function-list">
                <div className="function-item">
                  <div className="function-name">addModerator(moderator)</div>
                  <div className="function-description">Add a new moderator to the forum (owner only).</div>
                  <div className="function-example">
                    <code>forum.addModerator(0x123...)</code>
                  </div>
                </div>
                <div className="function-item">
                  <div className="function-name">removeModerator(moderator)</div>
                  <div className="function-description">Remove moderator privileges (owner only).</div>
                  <div className="function-example">
                    <code>forum.removeModerator(0x123...)</code>
                  </div>
                </div>
                <div className="function-item">
                  <div className="function-name">moderatePost(id)</div>
                  <div className="function-description">Moderate a post (moderators and owner only).</div>
                  <div className="function-example">
                    <code>forum.moderatePost(123)</code>
                  </div>
                </div>
              </div>
            </div>

            <div className="feature-section">
              <h3>Moderation Principles</h3>
              <div className="principles-grid">
                <div className="principle-item">
                  <div className="principle-icon">🔍</div>
                  <h4>Transparency</h4>
                  <p>All moderation actions are recorded on-chain and publicly visible.</p>
                </div>
                <div className="principle-item">
                  <div className="principle-icon">⚖️</div>
                  <h4>Fairness</h4>
                  <p>Clear rules and consistent application across all users.</p>
                </div>
                <div className="principle-item">
                  <div className="principle-icon">🛡️</div>
                  <h4>Protection</h4>
                  <p>Safeguard community members from spam and abuse.</p>
                </div>
                <div className="principle-item">
                  <div className="principle-icon">📝</div>
                  <h4>Accountability</h4>
                  <p>Moderator actions are traceable and auditable.</p>
                </div>
              </div>
            </div>

            <div className="feature-section">
              <h3>Moderation Events</h3>
              <div className="events-list">
                <div className="event-item">
                  <div className="event-name">ModeratorAdded</div>
                  <div className="event-description">Emitted when a new moderator is added</div>
                </div>
                <div className="event-item">
                  <div className="event-name">ModeratorRemoved</div>
                  <div className="event-description">Emitted when a moderator is removed</div>
                </div>
                <div className="event-item">
                  <div className="event-name">PostModerated</div>
                  <div className="event-description">Emitted when a post is moderated</div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'technical':
        return (
          <div className="feature-content">
            <div className="feature-header">
              <h2>⚙️ Technical Specifications</h2>
              <p>Comprehensive technical details and implementation specifics.</p>
            </div>

            <div className="feature-section">
              <h3>Smart Contract Details</h3>
              <div className="contract-specs">
                <div className="spec-item">
                  <span className="spec-label">Solidity Version:</span>
                  <span className="spec-value">^0.8.19</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">License:</span>
                  <span className="spec-value">MIT</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Network:</span>
                  <span className="spec-value">Conflux eSpace</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Storage:</span>
                  <span className="spec-value">On-chain + IPFS</span>
                </div>
              </div>
            </div>

            <div className="feature-section">
              <h3>Performance Optimizations</h3>
              <div className="optimization-grid">
                <div className="optimization-item">
                  <div className="opt-icon">📊</div>
                  <h4>Batch Operations</h4>
                  <p>Efficient batch data fetching for frontend performance.</p>
                </div>
                <div className="optimization-item">
                  <div className="opt-icon">🔍</div>
                  <h4>Pagination Support</h4>
                  <p>Built-in pagination with configurable limits.</p>
                </div>
                <div className="optimization-item">
                  <div className="opt-icon">⚡</div>
                  <h4>Event-Driven</h4>
                  <p>Real-time updates through blockchain events.</p>
                </div>
                <div className="optimization-item">
                  <div className="opt-icon">💾</div>
                  <h4>Gas Optimized</h4>
                  <p>Efficient storage patterns and minimal gas usage.</p>
                </div>
              </div>
            </div>

            <div className="feature-section">
              <h3>Rate Limiting & Security</h3>
              <div className="security-features">
                <div className="security-item">
                  <div className="security-icon">⏱️</div>
                  <h4>Rate Limiting</h4>
                  <p>60-second cooldown between posts to prevent spam.</p>
                </div>
                <div className="security-item">
                  <div className="security-icon">🔒</div>
                  <h4>Access Control</h4>
                  <p>Role-based permissions for owners and moderators.</p>
                </div>
                <div className="security-item">
                  <div className="security-icon">🛡️</div>
                  <h4>Input Validation</h4>
                  <p>Comprehensive validation for all user inputs.</p>
                </div>
                <div className="security-item">
                  <div className="security-icon">📝</div>
                  <h4>Content Limits</h4>
                  <p>2000 character limit for plain text content.</p>
                </div>
              </div>
            </div>

            <div className="feature-section">
              <h3>Frontend Integration</h3>
              <div className="integration-example">
                <h4>Example Usage</h4>
                <div className="code-block">
                  <pre>{`// Connect to contract
const forum = new ethers.Contract(contractAddress, abi, signer);

// Create a post
await forum.createPost("Hello World!", 0);

// Like a post
await forum.like(1, true);

// Get recent posts
const posts = await forum.getRecentPosts(10);

// Get user's posts
const userPosts = await forum.getPostsByAuthor(userAddress);

// Listen for events
forum.on("PostCreated", (id, parentId, author, content) => {
  console.log("New post created:", { id, parentId, author, content });
});`}</pre>
                </div>
              </div>
            </div>

            <div className="feature-section">
              <h3>Contract Information</h3>
              <div className="contract-info">
                <div className="info-card">
                  <h4>Current Status</h4>
                  <div className="status-item">
                    <span>Content Mode:</span>
                    <span className="status-value">Plain Text</span>
                  </div>
                  <div className="status-item">
                    <span>Total Posts:</span>
                    <span className="status-value">0</span>
                  </div>
                  <div className="status-item">
                    <span>Owner:</span>
                    <span className="status-value">0x0000...0000</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <main className="features-main">
      <div className="container">
        {/* Hero Section */}
        <div className="features-hero">
          <h1>OnChain Forum Features</h1>
          <p>Discover the powerful capabilities of our decentralized forum built on Conflux blockchain</p>
        </div>

        {/* Feature Navigation */}
        <div className="feature-navigation">
          {features.map((feature) => (
            <button
              key={feature.id}
              className={`nav-button ${activeFeature === feature.id ? 'active' : ''}`}
              onClick={() => setActiveFeature(feature.id)}
            >
              <span className="nav-icon">{feature.icon}</span>
              <span className="nav-title">{feature.title}</span>
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="features-content">
          {renderFeatureContent()}
        </div>

        {/* Quick Stats Bar */}
        <div className="stats-bar">
          <div className="stat-item">
            <span className="stat-number">2000</span>
            <span className="stat-label">Max Content Length</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">60s</span>
            <span className="stat-label">Rate Limit</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">100</span>
            <span className="stat-label">Pagination Limit</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">∞</span>
            <span className="stat-label">Storage Capacity</span>
          </div>
        </div>

        {/* User Status */}
        {isConnected && (
          <div className="user-status-bar">
            <div className="status-content">
              <span className="status-label">Connected with {walletType}:</span>
              <span className="status-address">{userAddress ? `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}` : 'Not connected'}</span>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default FeaturesPage;
