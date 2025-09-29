"use client";

import { useState } from 'react';
import PageLayout from '../../components/layout/PageLayout';
import Button from '../../components/ui/Button';
import SubscriptionList from '../../components/web3/SubscriptionList';
import CreateSubscription from '../../components/web3/CreateSubscription';
import { useWallet } from '../../contexts/WalletContext';

export default function MerchantDashboard() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const { isConnected, walletInfo, isContractServiceReady, updateTrigger } = useWallet();
  
  // Debug logging
  console.log('MerchantDashboard state:', { isConnected, walletInfo, isContractServiceReady, updateTrigger });

  const handleSubscriptionCreated = (subId: number) => {
    setNotification({ type: 'success', message: `Subscription #${subId} created successfully!` });
    setShowCreateForm(false);
    setTimeout(() => setNotification(null), 5000);
  };

  const handleError = (error: string) => {
    setNotification({ type: 'error', message: error });
    setTimeout(() => setNotification(null), 5000);
  };

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
            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            color: 'white',
            borderRadius: '50px',
            fontSize: '14px',
            fontWeight: '500',
            marginBottom: '1rem',
            fontFamily: 'var(--font-geist-sans)'
          }}>
            🏪 Merchant Portal
          </div>
          
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '1rem',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
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
                Merchant Dashboard
              </h1>
              <p style={{ 
                fontSize: '1rem', 
                opacity: '0.7',
                lineHeight: '1.6',
                margin: '0',
                fontFamily: 'var(--font-geist-sans)'
              }}>
                Manage your subscription services, track revenue, and monitor customer engagement through Conflux blockchain technology.
              </p>
            </div>
            
            <Button 
              color="blue" 
              onClick={() => setShowCreateForm(!showCreateForm)}
              style={{
                fontSize: '1rem',
                padding: '0.75rem 1.5rem',
                borderRadius: '10px'
              }}
            >
              {showCreateForm ? '← Back to List' : '+ Create Service'}
            </Button>
          </div>
        </div>

        {/* Notification */}
        {notification && (
          <div style={{
            position: 'fixed',
            top: '100px',
            right: '20px',
            zIndex: 1000,
            padding: '1rem 1.5rem',
            background: notification.type === 'success' ? '#10b981' : '#ef4444',
            color: 'white',
            borderRadius: '12px',
            fontFamily: 'var(--font-geist-sans)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            {notification.message}
          </div>
        )}

        {/* Main Content */}
        <div style={{
          display: 'grid',
          gap: '2rem',
          gridTemplateColumns: showCreateForm ? '1fr 1fr' : '1fr'
        }}>
          {/* Subscription List */}
          <SubscriptionList 
            key={`merchant-${isConnected}-${isContractServiceReady}`} 
            userMode={false} 
          />
          
          {/* Create Subscription Form */}
          {showCreateForm && (
            <CreateSubscription 
              key={`create-${isConnected}-${isContractServiceReady}`}
              onSuccess={handleSubscriptionCreated}
              onError={handleError}
            />
          )}
        </div>

        {/* Quick Actions */}
        {!showCreateForm && (
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
                Revenue Analytics
              </h3>
              <p style={{
                fontSize: '0.9rem',
                opacity: '0.7',
                fontFamily: 'var(--font-geist-sans)',
                lineHeight: '1.5'
              }}>
                Track subscription revenue, customer growth, and payment trends from Conflux blockchain data.
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
                👥
              </div>
              <h3 style={{
                fontSize: '1.2rem',
                fontWeight: '600',
                marginBottom: '0.5rem',
                fontFamily: 'var(--font-geist-sans)',
                color: 'var(--foreground)'
              }}>
                Customer Management
              </h3>
              <p style={{
                fontSize: '0.9rem',
                opacity: '0.7',
                fontFamily: 'var(--font-geist-sans)',
                lineHeight: '1.5'
              }}>
                Manage customer subscriptions, handle billing issues, and track customer engagement metrics.
              </p>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, var(--background) 0%, rgba(245, 158, 11, 0.02) 100%)',
              padding: '1.5rem',
              borderRadius: '16px',
              border: '1px solid rgba(245, 158, 11, 0.15)',
              boxShadow: '0 4px 20px rgba(245, 158, 11, 0.1)',
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
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                marginBottom: '1rem',
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.2)'
              }}>
                ⚙️
              </div>
              <h3 style={{
                fontSize: '1.2rem',
                fontWeight: '600',
                marginBottom: '0.5rem',
                fontFamily: 'var(--font-geist-sans)',
                color: 'var(--foreground)'
              }}>
                Service Settings
              </h3>
              <p style={{
                fontSize: '0.9rem',
                opacity: '0.7',
                fontFamily: 'var(--font-geist-sans)',
                lineHeight: '1.5'
              }}>
                Configure pricing, billing cycles, and service parameters for your subscription offerings.
              </p>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}