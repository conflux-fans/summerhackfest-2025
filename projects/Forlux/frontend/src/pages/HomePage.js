import React, { useState } from 'react';
import './HomePage.css';

function HomePage({ isConnected, handleConnect, navigateToForum }) {
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
                  <div className="function-name">moderatePost(id)</div>
                  <div className="function-description">Moderate a post (moderators and owner only).</div>
                  <div className="function-example">
                    <code>forum.moderatePost(123)</code>
                  </div>
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
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <main className="homepage-main">
      {/* Background Elements */}
      <div className="background-gradient"></div>
      
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            {/* Main Title */}
            <h1 className="hero-title">
               Forlux
            </h1>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          {/* Features Hero */}
          <div className="features-hero">
            <h2>OnChain Forum Features</h2>
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
        </div>
      </section>
    </main>
  );
}

export default HomePage;