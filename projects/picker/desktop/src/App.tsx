import { useState } from 'react'
import './App.css'
import MarketplaceContent from './components/MarketplaceContent'
import ProfileContent from './components/ProfileContent'
import ChatbotContent from './components/ChatbotContent'
import LogStream from './components/LogStream'
import MainContent from './components/MainContent'
import { clientAPI } from './client/api'
import type { ResponseUserInfo } from './types'

// 用户类型定义
interface User {
  id: string;
  username: string;
  avatar: string;
  wallet: number;
  premium: number;
}

function App() {
  const [activePage, setActivePage] = useState<'home' | 'chatbot' | 'marketplace' | 'profile'>('home')
  
  // 登录状态管理
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showSignupModal, setShowSignupModal] = useState(false)

  // 表单状态管理
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [verifyEmail, setVerifyEmail] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showLogoutMenu, setShowLogoutMenu] = useState(false);

  // API调用函数
  const handleLogin = async (email: string, password: string) => {
    try {
      const response: ResponseUserInfo = await clientAPI.login(email, password);

      setCurrentUser({
        id: response.user_info.user_id,
        username: response.user_info.user_name || "OpenPick",
        avatar: response.user_info.user_name.substring(0, 2).toUpperCase() || "OP",
        wallet: response.wallet_balance ? Math.round(response.wallet_balance / 1e7) / 1e2 : 0,
        premium: response.user_info.premium_balance || 0,
      });
      setIsLoggedIn(true);
      setShowLoginModal(false);
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. ' + (error instanceof Error ? error.message : 'Please try again.'));
    }
  };

  const handleRegister = async (email: string, username: string, password: string) => {
    try {
      await clientAPI.register(email, username, password, 'gen');
      
      // 注册成功后，显示验证邮箱的弹窗
      setShowSignupModal(false);
      setShowVerifyModal(true);
      setVerifyEmail(email);
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed. ' + (error instanceof Error ? error.message : 'Please try again.'));
    }
  };

  const handleVerifyEmail = async (email: string, code: string) => {
    try {
      await clientAPI.verifyEmail(email, code);
      alert('Email verified successfully! You can now login.');
      setShowVerifyModal(false);
      setShowLoginModal(true);
    } catch (error) {
      console.error('Email verification error:', error);
      alert('Verification failed. ' + (error instanceof Error ? error.message : 'Please try again.'));
    }
  };

  const handleLogout = async () => {
    try {
      await clientAPI.logout();
      setIsLoggedIn(false);
      setCurrentUser(null);
      setShowLogoutMenu(false);
    } catch (error) {
      console.error('Logout error:', error);
      alert('Logout failed. ' + (error instanceof Error ? error.message : 'Please try again.'));
    }
  };

  return (
    <div className="app">
      {/* Top Header */}
      <div className="top-header">
        <div className="header-left">
          <div className="logo">
            <span className="logo-text">OpenPick</span>
          </div>
          <nav className="nav-menu">
            <button 
              className={`nav-item ${activePage === 'home' ? 'active' : ''}`}
              onClick={() => setActivePage('home')}
            >
              <span className="nav-icon">🏠</span>
              <span className="nav-text">Home</span>
            </button>
            <button 
              className={`nav-item ${activePage === 'chatbot' ? 'active' : ''}`}
              onClick={() => setActivePage('chatbot')}
            >
              <span className="nav-icon">🤖</span>
              <span className="nav-text">Chatbot</span>
            </button>
            <button 
              className={`nav-item ${activePage === 'marketplace' ? 'active' : ''}`}
              onClick={() => setActivePage('marketplace')}
            >
              <span className="nav-icon">🛒</span>
              <span className="nav-text">Marketplace</span>
            </button>
            <button 
              className={`nav-item ${activePage === 'profile' ? 'active' : ''}`}
              onClick={() => setActivePage('profile')}
            >
              <span className="nav-icon">👤</span>
              <span className="nav-text">Profile</span>
            </button>
          </nav>
        </div>
        <div className="header-right">
          {isLoggedIn ? (
            <div 
              className="user-info"
              onClick={() => setShowLogoutMenu(!showLogoutMenu)}
              onMouseLeave={() => setTimeout(() => setShowLogoutMenu(false), 2000)}
            >
              <div className="user-avatar">{currentUser?.avatar || 'Us'}</div>
              <div className="user-details">
                <span className="username">{currentUser?.username || 'User'}</span>
                <div className="user-stats">
                  <span className="wallet-badge">Wallet:{currentUser?.wallet || 0}</span>
                  <span className="premium-badge">Premium:{currentUser?.premium || 0}</span>
                </div>
              </div>
              {showLogoutMenu && (
                <div className="logout-menu">
                  <button 
                    className="logout-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLogout();
                    }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <button 
                className="login-button"
                onClick={() => setShowLoginModal(true)}
              >
                Login
              </button>
              <button 
                className="signup-button"
                onClick={() => setShowSignupModal(true)}
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="app-main">
        {/* Sidebar */}
        <div className="sidebar">
        
        <div className="post-section">
          <div className="section-header">
            <span className="section-icon">📝</span>
            <span className="section-title">Post</span>
          </div>
          <div className="post-item">
            <div className="post-meta">
              <span className="post-id">240301</span>
              <span className="post-action">Update</span>
            </div>
            <div className="post-title">New Features Release</div>
            <div className="post-subtitle">Read more</div>
          </div>
        </div>

        <div className="support-section">
          <div className="section-header">
            <span className="section-icon">🛠️</span>
            <span className="section-title">Support</span>
          </div>
          <div className="qr-code">
            <div className="qr-placeholder">QR</div>
          </div>
          <div className="support-contact">
            <span className="contact-icon">📧</span>
            <span className="contact-text">Contact Support</span>
          </div>
        </div>

        </div>

        {/* Main Content */}
        <div className="main-content">
          {activePage === 'home' ? (
            <MainContent />
          ) : activePage === 'chatbot' ? (
            <ChatbotContent />
          ) : activePage === 'marketplace' ? (
            <MarketplaceContent />
          ) : (
            <ProfileContent />
          )}
        </div>
      </div>

      {/* Bottom Log Stream */}
      <LogStream />

      {/* Login Modal */}
      {showLoginModal && (
        <div className="modal-overlay" onClick={() => setShowLoginModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Login</h2>
              <button className="modal-close" onClick={() => setShowLoginModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="login-email">Email</label>
                <input
                  type="email"
                  id="login-email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="Enter your email"
                />
              </div>
              <div className="form-group">
                <label htmlFor="login-password">Password</label>
                <input
                  type="password"
                  id="login-password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter your password"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="modal-button secondary"
                onClick={() => setShowLoginModal(false)}
              >
                Cancel
              </button>
              <button 
                className="modal-button primary"
                onClick={() => handleLogin(loginEmail, loginPassword)}
              >
                Login
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sign Up Modal */}
      {showSignupModal && (
        <div className="modal-overlay" onClick={() => setShowSignupModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Sign Up</h2>
              <button className="modal-close" onClick={() => setShowSignupModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="signup-email">Email</label>
                <input
                  type="email"
                  id="signup-email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="Enter your email"
                />
              </div>
              <div className="form-group">
                <label htmlFor="signup-username">Username</label>
                <input
                  type="text"
                  id="signup-username"
                  value={signupUsername}
                  onChange={(e) => setSignupUsername(e.target.value)}
                  placeholder="Choose a username"
                />
              </div>
              <div className="form-group">
                <label htmlFor="signup-password">Password</label>
                <input
                  type="password"
                  id="signup-password"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  placeholder="Create a password"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="modal-button secondary"
                onClick={() => setShowSignupModal(false)}
              >
                Cancel
              </button>
              <button 
                className="modal-button primary"
                onClick={() => handleRegister(signupEmail, signupUsername, signupPassword)}
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Verification Modal */}
      {showVerifyModal && (
        <div className="modal-overlay" onClick={() => setShowVerifyModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Verify Email</h2>
              <button className="modal-close" onClick={() => setShowVerifyModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p>A verification code has been sent to {verifyEmail}, Please verify and complete registration.</p>
              <div className="form-group">
                <label htmlFor="verify-code">Verification Code</label>
                <input
                  type="text"
                  id="verify-code"
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value)}
                  placeholder="Enter verification code"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="modal-button secondary"
                onClick={() => setShowVerifyModal(false)}
              >
                Cancel
              </button>
              <button 
                className="modal-button primary"
                onClick={() => handleVerifyEmail(verifyEmail, verifyCode)}
              >
                Verify
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
