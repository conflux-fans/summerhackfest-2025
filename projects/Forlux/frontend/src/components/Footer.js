import React from 'react';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-brand">
            <h2>Forlux</h2>
            <p>Join the community discussion about Conflux blockchain technology.</p>
            <div className="social-links">
              <a href="https://discord.gg/4A2q3xJKjC" target="_blank" rel="noopener noreferrer" className="social-link">
                Discord
              </a>
              <a href="https://t.me/ConfluxDevs" target="_blank" rel="noopener noreferrer" className="social-link">
                Telegram
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="social-link">
                GitHub
              </a>
            </div>
          </div>
          
          <div className="footer-nav">
            <div className="footer-section">
              <h4>Resources</h4>
              <ul>
                <li><a href="https://docs.confluxnetwork.org" target="_blank" rel="noopener noreferrer">Conflux Documentation</a></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p>&copy; 2025 Forlux. Built for the Conflux community.</p>
            <p>Licensed under MIT License</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
