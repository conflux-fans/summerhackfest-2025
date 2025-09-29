"use client";

import PageLayout from '../components/layout/PageLayout';
import Button from '../components/ui/Button';

export default function Home() {
  return (
    <PageLayout>
      <div style={{ textAlign: 'center', maxWidth: '1200px', width: '100%', margin: '0 auto' }}>
        {/* Hero Section */}
        <div style={{ marginBottom: '5rem' }}>
          <div style={{
            display: 'inline-block',
            padding: '6px 16px',
            background: 'var(--gray-alpha-200)',
            borderRadius: '50px',
            fontSize: '14px',
            fontWeight: '500',
            marginBottom: '2rem',
            border: '1px solid var(--gray-alpha-200)',
            fontFamily: 'var(--font-geist-sans)'
          }}>
            🚀 Powered by Conflux Blockchain
          </div>
          
          <h1 style={{ 
            fontSize: 'clamp(2.5rem, 8vw, 4.5rem)', 
            fontWeight: '700', 
            marginTop: '0',
            marginBottom: '1.5rem',
            background: 'linear-gradient(135deg, var(--foreground) 0%, var(--foreground) 50%, #666 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontFamily: 'var(--font-geist-sans)',
            letterSpacing: '-0.02em',
            lineHeight: '1.1'
          }}>
            FluxSub
          </h1>
          
          <p style={{ 
            fontSize: '1.3rem', 
            marginBottom: '2rem', 
            maxWidth: '700px', 
            margin: '0 auto 2rem auto',
            opacity: '0.8',
            lineHeight: '1.6',
            fontWeight: '400',
            fontFamily: 'var(--font-geist-sans)'
          }}>
            The future of subscription management. Decentralized, transparent, and secure.
          </p>
          
          <p style={{ 
            fontSize: '1rem', 
            marginBottom: '3rem', 
            maxWidth: '600px', 
            margin: '0 auto 3rem auto',
            opacity: '0.6',
            lineHeight: '1.6',
            fontFamily: 'var(--font-geist-sans)'
          }}>
            Manage subscriptions with Conflux blockchain-powered smart contracts for complete transparency and control.
          </p>
        </div>
        
        {/* CTA Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
          gap: '2rem', 
          marginBottom: '5rem',
          width: '100%'
        }}>
          <div style={{ 
            background: 'linear-gradient(135deg, var(--background) 0%, rgba(59, 130, 246, 0.02) 100%)', 
            padding: '3rem 2.5rem', 
            borderRadius: '24px',
            border: '2px solid rgba(59, 130, 246, 0.15)',
            boxShadow: '0 12px 40px rgba(59, 130, 246, 0.15), 0 4px 12px rgba(0,0,0,0.05)',
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden',
            backdropFilter: 'blur(10px)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-8px)';
            e.currentTarget.style.boxShadow = '0 20px 60px rgba(59, 130, 246, 0.2), 0 8px 20px rgba(0,0,0,0.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 12px 40px rgba(59, 130, 246, 0.15), 0 4px 12px rgba(0,0,0,0.05)';
          }}>
            <div style={{
              position: 'absolute',
              top: '-50%',
              right: '-50%',
              width: '100%',
              height: '100%',
              background: 'linear-gradient(45deg, transparent, var(--gray-alpha-100), transparent)',
              opacity: 0.5,
              borderRadius: '50%'
            }}></div>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ 
                fontSize: '3rem', 
                marginBottom: '1.5rem',
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                borderRadius: '16px',
                width: '64px',
                height: '64px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem auto'
              }}>🏪</div>
              <h2 style={{ 
                fontSize: '1.75rem', 
                fontWeight: '700', 
                marginBottom: '1rem',
                fontFamily: 'var(--font-geist-sans)',
                color: 'var(--foreground)'
              }}>For Merchants</h2>
              <p style={{ 
                marginBottom: '2rem',
                lineHeight: '1.6',
                opacity: '0.7',
                fontSize: '1rem',
                fontFamily: 'var(--font-geist-sans)'
              }}>
                Create and manage subscription services with Conflux blockchain-based smart contracts. Automate billing and gain customer insights.
              </p>
              <Button href="/merchant" color="blue">
                <span>Start Selling</span>
                <span style={{ fontSize: '18px' }}>→</span>
              </Button>
            </div>
          </div>
          
          <div style={{ 
            background: 'linear-gradient(135deg, var(--background) 0%, rgba(16, 185, 129, 0.02) 100%)', 
            padding: '3rem 2.5rem', 
            borderRadius: '24px',
            border: '2px solid rgba(16, 185, 129, 0.15)',
            boxShadow: '0 12px 40px rgba(16, 185, 129, 0.15), 0 4px 12px rgba(0,0,0,0.05)',
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden',
            backdropFilter: 'blur(10px)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-8px)';
            e.currentTarget.style.boxShadow = '0 20px 60px rgba(16, 185, 129, 0.2), 0 8px 20px rgba(0,0,0,0.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 12px 40px rgba(16, 185, 129, 0.15), 0 4px 12px rgba(0,0,0,0.05)';
          }}>
            <div style={{
              position: 'absolute',
              top: '-50%',
              left: '-50%',
              width: '100%',
              height: '100%',
              background: 'linear-gradient(45deg, transparent, var(--gray-alpha-100), transparent)',
              opacity: 0.5,
              borderRadius: '50%'
            }}></div>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ 
                fontSize: '3rem', 
                marginBottom: '1.5rem',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                borderRadius: '16px',
                width: '64px',
                height: '64px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem auto'
              }}>👤</div>
              <h2 style={{ 
                fontSize: '1.75rem', 
                fontWeight: '700', 
                marginBottom: '1rem',
                fontFamily: 'var(--font-geist-sans)',
                color: 'var(--foreground)'
              }}>For Users</h2>
              <p style={{ 
                marginBottom: '2rem',
                lineHeight: '1.6',
                opacity: '0.7',
                fontSize: '1rem',
                fontFamily: 'var(--font-geist-sans)'
              }}>
                Track and manage all your subscriptions in one secure, decentralized platform. Never lose track of recurring payments again.
              </p>
              <Button href="/dashboard" color="green">
                <span>Get Started</span>
                <span style={{ fontSize: '18px' }}>→</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div style={{ 
          background: 'var(--background)', 
          padding: '4rem 3rem', 
          borderRadius: '24px',
          border: '1px solid var(--gray-alpha-200)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: 'linear-gradient(90deg, transparent, var(--gray-alpha-200), transparent)'
          }}></div>
          
          <h2 style={{ 
            fontSize: '2.25rem', 
            fontWeight: '700', 
            marginBottom: '1rem',
            fontFamily: 'var(--font-geist-sans)',
            background: 'linear-gradient(135deg, var(--foreground), #666)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>Why Choose FluxSub?</h2>
          
          <p style={{
            fontSize: '1.1rem',
            opacity: '0.6',
            marginBottom: '3rem',
            fontFamily: 'var(--font-geist-sans)'
          }}>
            Built with cutting-edge Conflux blockchain technology for the future of subscriptions
          </p>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '2.5rem' 
          }}>
            <div style={{ textAlign: 'center', padding: '1.5rem' }}>
              <div style={{ 
                fontSize: '3.5rem', 
                marginBottom: '1.5rem',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                borderRadius: '20px',
                width: '80px',
                height: '80px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem auto',
                boxShadow: '0 4px 20px rgba(245, 158, 11, 0.2)'
              }}>🔒</div>
              <h3 style={{ 
                fontWeight: '700', 
                marginBottom: '1rem',
                fontSize: '1.3rem',
                fontFamily: 'var(--font-geist-sans)',
                color: 'var(--foreground)'
              }}>Bank-Grade Security</h3>
              <p style={{ 
                fontSize: '1rem',
                opacity: '0.7',
                lineHeight: '1.6',
                fontFamily: 'var(--font-geist-sans)'
              }}>Conflux blockchain-powered security ensures your data and transactions are protected with military-grade encryption and immutable records.</p>
            </div>
            <div style={{ textAlign: 'center', padding: '1.5rem' }}>
              <div style={{ 
                fontSize: '3.5rem', 
                marginBottom: '1.5rem',
                background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                borderRadius: '20px',
                width: '80px',
                height: '80px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem auto',
                boxShadow: '0 4px 20px rgba(139, 92, 246, 0.2)'
              }}>📊</div>
              <h3 style={{ 
                fontWeight: '700', 
                marginBottom: '1rem',
                fontSize: '1.3rem',
                fontFamily: 'var(--font-geist-sans)',
                color: 'var(--foreground)'
              }}>Complete Transparency</h3>
              <p style={{ 
                fontSize: '1rem',
                opacity: '0.7',
                lineHeight: '1.6',
                fontFamily: 'var(--font-geist-sans)'
              }}>Real-time visibility into all subscription activities, payments, and analytics. No hidden fees, no surprises, just transparent operations.</p>
            </div>
            <div style={{ textAlign: 'center', padding: '1.5rem' }}>
              <div style={{ 
                fontSize: '3.5rem', 
                marginBottom: '1.5rem',
                background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
                borderRadius: '20px',
                width: '80px',
                height: '80px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem auto',
                boxShadow: '0 4px 20px rgba(6, 182, 212, 0.2)'
              }}>⚡</div>
              <h3 style={{ 
                fontWeight: '700', 
                marginBottom: '1rem',
                fontSize: '1.3rem',
                fontFamily: 'var(--font-geist-sans)',
                color: 'var(--foreground)'
              }}>Lightning Fast</h3>
              <p style={{ 
                fontSize: '1rem',
                opacity: '0.7',
                lineHeight: '1.6',
                fontFamily: 'var(--font-geist-sans)'
              }}>Automated smart contract management reduces overhead, eliminates errors, and processes transactions in seconds, not days.</p>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}