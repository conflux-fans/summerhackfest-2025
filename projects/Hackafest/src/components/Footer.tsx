import React from 'react';
import Link from 'next/link';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="container footer-content">
        <div className="footer-grid">
          <div className="footer-section">
            <h3>Product</h3>
            <ul>
              <li><Link href="/create">Create Collection</Link></li>
              <li><Link href="/marketplace">Marketplace</Link></li>
              <li><Link href="/verify">Verify Ownership</Link></li>
              <li><Link href="/link">Link Phone</Link></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h3>Company</h3>
            <ul>
              <li><Link href="/about">About</Link></li>
              <li><Link href="/contact">Contact</Link></li>
              <li><Link href="/careers">Careers</Link></li>
              <li><Link href="/blog">Blog</Link></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h3>Developers</h3>
            <ul>
              <li><Link href="/docs">Documentation</Link></li>
              <li><Link href="/api">API Reference</Link></li>
              <li><Link href="/sdk">SDK</Link></li>
              <li><Link href="/github">GitHub</Link></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h3>Legal</h3>
            <ul>
              <li><Link href="/legal/privacy">Privacy Policy</Link></li>
              <li><Link href="/legal/terms">Terms of Service</Link></li>
              <li><Link href="/security">Security</Link></li>
              <li><Link href="/compliance">Compliance</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>
            Conflux-native ownership verification. © MBP Enterprises.
          </p>
          
          <div className="newsletter-form">
            <input
              type="email"
              placeholder="Enter your email"
              className="form-input"
              style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
            />
            <button className="btn btn-primary btn-sm">
              Subscribe
            </button>
          </div>
        </div>
        
        <p style={{ color: 'var(--muted)', fontSize: '0.75rem', marginTop: '1rem', textAlign: 'center' }}>
          By subscribing, you agree to our Privacy Policy and consent to receive updates from our team.
        </p>
      </div>
    </footer>
  );
};

export default Footer;