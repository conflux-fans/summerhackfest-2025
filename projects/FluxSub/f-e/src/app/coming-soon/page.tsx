"use client";

import { useRouter } from 'next/navigation';
import PageLayout from '../../components/layout/PageLayout';
import Button from '../../components/ui/Button';

export default function ComingSoonPage() {
  const router = useRouter();

  return (
    <PageLayout>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center',
        padding: '2rem'
      }}>
        {/* Animated Icon */}
        <div style={{
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '3rem',
          marginBottom: '2rem',
          boxShadow: '0 20px 40px rgba(59, 130, 246, 0.3)',
          animation: 'pulse 2s infinite'
        }}>
          🚀
        </div>

        {/* Main Content */}
        <h1 style={{
          fontSize: 'clamp(2.5rem, 6vw, 4rem)',
          fontWeight: '700',
          marginBottom: '1rem',
          fontFamily: 'var(--font-geist-sans)',
          background: 'linear-gradient(135deg, var(--foreground), #666)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          lineHeight: '1.2'
        }}>
          Coming Soon
        </h1>

        <p style={{
          fontSize: '1.2rem',
          opacity: '0.7',
          marginBottom: '2rem',
          fontFamily: 'var(--font-geist-sans)',
          lineHeight: '1.6',
          maxWidth: '600px'
        }}>
          We&apos;re working hard to bring you amazing new features and content. 
          This page is currently under development and will be available soon.
        </p>

        {/* Feature Preview Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginBottom: '3rem',
          maxWidth: '800px',
          width: '100%'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--background) 0%, rgba(59, 130, 246, 0.02) 100%)',
            padding: '1.5rem',
            borderRadius: '16px',
            border: '1px solid rgba(59, 130, 246, 0.15)',
            boxShadow: '0 4px 20px rgba(59, 130, 246, 0.1)'
          }}>
            <div style={{
              fontSize: '2rem',
              marginBottom: '1rem'
            }}>⚡</div>
            <h3 style={{
              fontSize: '1.1rem',
              fontWeight: '600',
              marginBottom: '0.5rem',
              fontFamily: 'var(--font-geist-sans)',
              color: 'var(--foreground)'
            }}>
              Lightning Fast
            </h3>
            <p style={{
              fontSize: '0.9rem',
              opacity: '0.7',
              fontFamily: 'var(--font-geist-sans)',
              lineHeight: '1.5'
            }}>
              Optimized for speed and performance on Conflux blockchain
            </p>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, var(--background) 0%, rgba(16, 185, 129, 0.02) 100%)',
            padding: '1.5rem',
            borderRadius: '16px',
            border: '1px solid rgba(16, 185, 129, 0.15)',
            boxShadow: '0 4px 20px rgba(16, 185, 129, 0.1)'
          }}>
            <div style={{
              fontSize: '2rem',
              marginBottom: '1rem'
            }}>🔒</div>
            <h3 style={{
              fontSize: '1.1rem',
              fontWeight: '600',
              marginBottom: '0.5rem',
              fontFamily: 'var(--font-geist-sans)',
              color: 'var(--foreground)'
            }}>
              Secure & Decentralized
            </h3>
            <p style={{
              fontSize: '0.9rem',
              opacity: '0.7',
              fontFamily: 'var(--font-geist-sans)',
              lineHeight: '1.5'
            }}>
              Built on Conflux blockchain for maximum security
            </p>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, var(--background) 0%, rgba(139, 92, 246, 0.02) 100%)',
            padding: '1.5rem',
            borderRadius: '16px',
            border: '1px solid rgba(139, 92, 246, 0.15)',
            boxShadow: '0 4px 20px rgba(139, 92, 246, 0.1)'
          }}>
            <div style={{
              fontSize: '2rem',
              marginBottom: '1rem'
            }}>🎯</div>
            <h3 style={{
              fontSize: '1.1rem',
              fontWeight: '600',
              marginBottom: '0.5rem',
              fontFamily: 'var(--font-geist-sans)',
              color: 'var(--foreground)'
            }}>
              User Focused
            </h3>
            <p style={{
              fontSize: '0.9rem',
              opacity: '0.7',
              fontFamily: 'var(--font-geist-sans)',
              lineHeight: '1.5'
            }}>
              Designed with user experience as the top priority
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          <Button
            onClick={() => router.push('/')}
            color="blue"
            style={{
              padding: '1rem 2rem',
              borderRadius: '12px',
              fontSize: '1.1rem'
            }}
          >
            🏠 Go Home
          </Button>
          <Button
            onClick={() => router.push('/dashboard')}
            color="green"
            style={{
              padding: '1rem 2rem',
              borderRadius: '12px',
              fontSize: '1.1rem'
            }}
          >
            📊 Dashboard
          </Button>
        </div>

        {/* Progress Indicator */}
        <div style={{
          marginTop: '3rem',
          padding: '1.5rem',
          background: 'var(--gray-alpha-100)',
          borderRadius: '12px',
          border: '1px solid var(--gray-alpha-200)',
          maxWidth: '400px',
          width: '100%'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.5rem'
          }}>
            <span style={{
              fontSize: '0.9rem',
              fontWeight: '600',
              fontFamily: 'var(--font-geist-sans)',
              color: 'var(--foreground)'
            }}>
              Development Progress
            </span>
            <span style={{
              fontSize: '0.9rem',
              fontWeight: '600',
              fontFamily: 'var(--font-geist-sans)',
              color: '#3b82f6'
            }}>
              75%
            </span>
          </div>
          <div style={{
            width: '100%',
            height: '8px',
            background: 'var(--gray-alpha-200)',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: '75%',
              height: '100%',
              background: 'linear-gradient(90deg, #3b82f6, #1d4ed8)',
              borderRadius: '4px',
              animation: 'progress 2s ease-in-out'
            }}></div>
          </div>
          <p style={{
            fontSize: '0.8rem',
            opacity: '0.6',
            margin: '0.5rem 0 0 0',
            fontFamily: 'var(--font-geist-sans)'
          }}>
            We&apos;re making great progress! Stay tuned for updates.
          </p>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 75%; }
        }
      `}</style>
    </PageLayout>
  );
}
