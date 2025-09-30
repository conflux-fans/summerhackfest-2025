"use client";

import PageLayout from '../../components/layout/PageLayout';
import SubscriptionList from '../../components/web3/SubscriptionList';
import { useWallet } from '../../contexts/WalletContext';

export default function UserDashboard() {
  const { isConnected, walletInfo, isContractServiceReady, updateTrigger } = useWallet();
  
  // Debug logging
  console.log('UserDashboard state:', { isConnected, walletInfo, isContractServiceReady, updateTrigger });

  return (
    <PageLayout>
      <div style={{ maxWidth: '1000px', width: '100%', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ 
          marginBottom: '2rem', 
          paddingBottom: '2rem',
          borderBottom: '1px solid var(--gray-alpha-200)'
        }}>
          <div style={{
            display: 'inline-block',
            padding: '6px 16px',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: 'white',
            borderRadius: '50px',
            fontSize: '14px',
            fontWeight: '500',
            marginBottom: '1rem',
            fontFamily: 'var(--font-geist-sans)'
          }}>
            👤 User Portal
          </div>
          
          <div>
            <h1 style={{ 
              fontSize: 'clamp(2rem, 6vw, 2.5rem)', 
              fontWeight: '700', 
              marginTop: '0',
              marginBottom: '0.5rem',
              fontFamily: 'var(--font-geist-sans)',
              letterSpacing: '-0.02em',
              lineHeight: '1.2',
              background: 'linear-gradient(135deg, var(--foreground), #666)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              My Subscriptions
            </h1>
            <p style={{ 
              fontSize: '1rem', 
              opacity: '0.7',
              lineHeight: '1.6',
              margin: '0',
              fontFamily: 'var(--font-geist-sans)'
            }}>
              Track and manage all your subscription services in one secure, decentralized dashboard.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div>
          {/* Subscription List */}
          <SubscriptionList 
            key={`user-${isConnected}-${isContractServiceReady}`} 
            userMode={true} 
          />
        </div>

        {/* Quick Actions */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '1.5rem',
          marginTop: '2rem'
        }}>
            <div style={{
              background: 'linear-gradient(135deg, var(--background) 0%, rgba(59, 130, 246, 0.02) 100%)',
              padding: '1.5rem',
              borderRadius: '16px',
              border: '1px solid rgba(59, 130, 246, 0.15)',
              boxShadow: '0 4px 20px rgba(59, 130, 246, 0.1)',
              cursor: 'pointer',
              transition: 'transform 0.2s ease',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                marginBottom: '1rem',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)'
              }}>
                📊
              </div>
              <h3 style={{
                fontSize: '1.2rem',
                fontWeight: '600',
                marginBottom: '0.5rem',
                fontFamily: 'var(--font-geist-sans)',
                color: 'var(--foreground)'
              }}>
                Spending Analytics
              </h3>
              <p style={{
                fontSize: '0.9rem',
                opacity: '0.7',
                fontFamily: 'var(--font-geist-sans)',
                lineHeight: '1.5'
              }}>
                View detailed reports of your subscription spending and trends from Conflux blockchain data.
              </p>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, var(--background) 0%, rgba(139, 92, 246, 0.02) 100%)',
              padding: '1.5rem',
              borderRadius: '16px',
              border: '1px solid rgba(139, 92, 246, 0.15)',
              boxShadow: '0 4px 20px rgba(139, 92, 246, 0.1)',
              cursor: 'pointer',
              transition: 'transform 0.2s ease',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                marginBottom: '1rem',
                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.2)'
              }}>
                🔔
              </div>
              <h3 style={{
                fontSize: '1.2rem',
                fontWeight: '600',
                marginBottom: '0.5rem',
                fontFamily: 'var(--font-geist-sans)',
                color: 'var(--foreground)'
              }}>
                Smart Notifications
              </h3>
              <p style={{
                fontSize: '0.9rem',
                opacity: '0.7',
                fontFamily: 'var(--font-geist-sans)',
                lineHeight: '1.5'
              }}>
                Get notified before renewals and when prices change through Conflux on-chain events.
              </p>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, var(--background) 0%, rgba(16, 185, 129, 0.02) 100%)',
              padding: '1.5rem',
              borderRadius: '16px',
              border: '1px solid rgba(16, 185, 129, 0.15)',
              boxShadow: '0 4px 20px rgba(16, 185, 129, 0.1)',
              cursor: 'pointer',
              transition: 'transform 0.2s ease',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                marginBottom: '1rem',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
              }}>
                🔗
              </div>
              <h3 style={{
                fontSize: '1.2rem',
                fontWeight: '600',
                marginBottom: '0.5rem',
                fontFamily: 'var(--font-geist-sans)',
                color: 'var(--foreground)'
              }}>
                Web3 Integration
              </h3>
              <p style={{
                fontSize: '0.9rem',
                opacity: '0.7',
                fontFamily: 'var(--font-geist-sans)',
                lineHeight: '1.5'
              }}>
                All data is stored on Conflux blockchain ensuring transparency and user ownership of subscription data.
              </p>
            </div>
        </div>
      </div>
    </PageLayout>
  );
}