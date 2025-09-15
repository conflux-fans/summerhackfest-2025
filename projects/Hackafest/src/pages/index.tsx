import React from 'react';
import Link from 'next/link';
import Button from '../components/Button';
import Card from '../components/Card';

const HomePage: React.FC = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1>
              Proving NFT ownership in the real world.
            </h1>
            <p>
              Conflux-native verification with cryptographic signatures. Fast, low-cost, secure.
            </p>
            
            <div className="hero-cta">
              <Link href="/nft-showcase">
                <Button variant="primary" size="lg">Try NFT Demo</Button>
              </Link>
              <Link href="/create">
                <Button variant="secondary" size="lg">Create Collection</Button>
              </Link>
              <Link href="/marketplace">
                <Button variant="ghost" size="lg">Explore Marketplace</Button>
              </Link>
            </div>
            
            <div className="hero-visual">
              <div className="flow-diagram">
                <div className="flow-step">
                  <div className="flow-icon flow-icon-primary">
                    NFT
                  </div>
                  <div className="flow-label">Own Token</div>
                </div>
                <div className="flow-connector"></div>
                <div className="flow-step">
                  <div className="flow-icon flow-icon-secondary">
                    ✓
                  </div>
                  <div className="flow-label">Sign Proof</div>
                </div>
                <div className="flow-connector"></div>
                <div className="flow-step">
                  <div className="flow-icon flow-icon-success">
                    ACCESS
                  </div>
                  <div className="flow-label">Get Access</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">How it works</h2>
          
          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon">1</div>
              <h3>Link wallet(s)</h3>
              <p>Connect your Conflux wallet to establish your digital identity.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">2</div>
              <h3>Sign to prove ownership</h3>
              <p>Cryptographically sign a message to verify NFT ownership without transfers.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">3</div>
              <h3>Verified instantly</h3>
              <p>Get immediate access to real-world benefits and experiences.</p>
            </div>
          </div>
          
          <div className="cta-buttons">
            <Link href="/verify">
              <Button variant="primary">Try Verify</Button>
            </Link>
            <Link href="/docs">
              <Button variant="secondary">Read Docs</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Conflux */}
      <section className="why-conflux-section">
        <div className="container">
          <h2 className="section-title">Why Conflux</h2>
          
          <div className="feature-grid">
            <Card hover>
              <h3 style={{ marginBottom: '1rem', color: 'var(--text)' }}>Low Fees</h3>
              <p style={{ color: 'var(--muted)', margin: 0 }}>Minimal transaction costs make verification accessible for everyone.</p>
            </Card>
            
            <Card hover>
              <h3 style={{ marginBottom: '1rem', color: 'var(--text)' }}>Fast Finality*</h3>
              <p style={{ color: 'var(--muted)', margin: 0 }}>Sub-second UI feedback with rapid block confirmation on Conflux.</p>
            </Card>
            
            <Card hover>
              <h3 style={{ marginBottom: '1rem', color: 'var(--text)' }}>Scalable Tree-Graph</h3>
              <p style={{ color: 'var(--muted)', margin: 0 }}>High throughput consensus mechanism supports mass adoption.</p>
            </Card>
          </div>
          
          <p style={{ fontSize: '0.75rem', color: 'var(--muted)', textAlign: 'center', marginTop: '2rem' }}>
            *Sub-second UI feedback with on-device signature + rapid block confirmation on Conflux.
          </p>
        </div>
      </section>

      {/* Use Cases */}
      <section className="use-cases-section">
        <div className="container">
          <h2 className="section-title">Use cases</h2>
          
          <div className="feature-grid">
            <Card hover>
              <h3 style={{ marginBottom: '1rem', color: 'var(--text)' }}>Events & Memberships</h3>
              <p style={{ color: 'var(--muted)', margin: 0 }}>Gate access to conferences, concerts, and exclusive communities with NFT ownership.</p>
            </Card>
            
            <Card hover>
              <h3 style={{ marginBottom: '1rem', color: 'var(--text)' }}>RWA Access</h3>
              <p style={{ color: 'var(--muted)', margin: 0 }}>Unlock real-world assets and services tied to your digital ownership.</p>
            </Card>
            
            <Card hover>
              <h3 style={{ marginBottom: '1rem', color: 'var(--text)' }}>Premium Spaces</h3>
              <p style={{ color: 'var(--muted)', margin: 0 }}>Access exclusive physical locations and premium experiences.</p>
            </Card>
          </div>
          
          <div className="cta-buttons">
            <Link href="/create">
              <Button variant="primary" size="lg">Create Collection</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust & Security */}
      <section className="trust-section">
        <div className="container">
          <div className="trust-content">
            <h2 className="section-title">Trust & security</h2>
            
            <ul className="trust-list">
              <li>
                <span className="bullet">•</span>
                <span><strong style={{ color: 'var(--text)' }}>Non-custodial:</strong> Your private keys never leave your wallet</span>
              </li>
              <li>
                <span className="bullet">•</span>
                <span><strong style={{ color: 'var(--text)' }}>Least-privilege permissions:</strong> Only signature access required</span>
              </li>
              <li>
                <span className="bullet">•</span>
                <span><strong style={{ color: 'var(--text)' }}>Audit-ready logs:</strong> Complete verification history for compliance</span>
              </li>
            </ul>
            
            <div className="trust-highlight">
              <p>
                Non-custodial by design. You sign locally; we verify cryptographically. Private keys never leave your wallet.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="cta-section" style={{ background: 'var(--surface)' }}>
        <div className="container">
          <h2 className="section-title" style={{ marginBottom: '1.5rem' }}>Turn NFTs into real-world keys.</h2>
          <p style={{ fontSize: '1.25rem', color: 'var(--muted)', marginBottom: '3rem', maxWidth: '48rem', marginLeft: 'auto', marginRight: 'auto' }}>
            Bridge the gap between digital ownership and physical access with Conflux-native verification.
          </p>
          
          <div className="cta-buttons">
            <Link href="/create">
              <Button variant="primary" size="lg">Start Creating</Button>
            </Link>
            <Link href="/marketplace">
              <Button variant="secondary" size="lg">Explore NFTs</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;