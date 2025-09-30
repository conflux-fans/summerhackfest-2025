"use client";

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Button from '../ui/Button';
import { useWallet } from '../../contexts/WalletContext';
import contractService from '../../services/ContractService';

interface CreateSubscriptionProps {
  onSuccess?: (subId: number) => void;
  onError?: (error: string) => void;
}

export default function CreateSubscription({ onSuccess, onError }: CreateSubscriptionProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [hasCheckedConnection, setHasCheckedConnection] = useState(false);
  const { isConnected, isContractServiceReady, updateTrigger } = useWallet();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    amount: '',
    period: '2592000', // 30 days in seconds
    initialFunding: ''
  });

  // Delayed connection check - wait 500ms for header to complete wallet connection
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('CreateSubscription delayed connection check after 500ms');
      setHasCheckedConnection(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected || !isContractServiceReady) {
      onError?.('Please connect your wallet and wait for contract service to initialize');
      return;
    }

    if (!formData.name.trim() || !formData.description.trim() || !formData.amount || !formData.initialFunding) {
      onError?.('Please fill in all required fields');
      return;
    }

    setIsCreating(true);
    
    try {
      // Create the subscription service
      const subscriptionId = await contractService.createSubscriptionService(
        formData.name,
        formData.description,
        formData.amount,
        parseInt(formData.period)
      );

      toast.success(`Subscription service created with ID: ${subscriptionId}`);
      onSuccess?.(subscriptionId);
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        amount: '',
        period: '2592000',
        initialFunding: ''
      });
    } catch (error: any) {
      console.error('Error creating subscription service:', error);
      const errorMessage = error.message || 'Failed to create subscription service';
      toast.error(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid var(--gray-alpha-200)',
    background: 'var(--background)',
    fontSize: '1rem',
    fontFamily: 'var(--font-geist-sans)',
    outline: 'none',
    transition: 'border-color 0.2s ease'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '8px',
    fontSize: '0.9rem',
    fontWeight: '600',
    fontFamily: 'var(--font-geist-sans)',
    color: 'var(--foreground)'
  };

  return (
    <div style={{
      background: 'var(--background)',
      padding: '3rem',
      borderRadius: '24px',
      border: '1px solid var(--gray-alpha-200)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
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
      <h3 style={{
        fontSize: '2rem',
        fontWeight: '700',
        marginBottom: '0.5rem',
        fontFamily: 'var(--font-geist-sans)',
        background: 'linear-gradient(135deg, var(--foreground), #666)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
      }}>
        Create Subscription Service
      </h3>
      <p style={{
        fontSize: '1rem',
        opacity: '0.6',
        fontFamily: 'var(--font-geist-sans)',
        marginBottom: '2rem'
      }}>
        Create a subscription service that users can subscribe to. Each user will be charged automatically based on the billing period you set.
      </p>

      {/* Show loading state while waiting for connection check */}
      {!hasCheckedConnection && (
        <div style={{
          background: 'linear-gradient(135deg, var(--background) 0%, rgba(16, 185, 129, 0.02) 100%)',
          padding: '2rem',
          borderRadius: '16px',
          border: '2px solid rgba(16, 185, 129, 0.15)',
          textAlign: 'center',
          marginBottom: '2rem',
          position: 'relative',
          overflow: 'hidden'
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
              display: 'inline-block',
              width: '32px',
              height: '32px',
              border: '3px solid var(--gray-alpha-200)',
              borderTop: '3px solid #10b981',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              marginBottom: '1rem'
            }}></div>
            <p style={{
              marginBottom: '0',
              fontFamily: 'var(--font-geist-sans)',
              opacity: '0.8',
              fontSize: '1rem'
            }}>
              Checking wallet connection...
            </p>
          </div>
        </div>
      )}

          {hasCheckedConnection && (!isConnected || !isContractServiceReady) && (
        <div style={{
          background: 'linear-gradient(135deg, var(--background) 0%, rgba(59, 130, 246, 0.02) 100%)',
          padding: '2rem',
          borderRadius: '16px',
          border: '2px solid rgba(59, 130, 246, 0.15)',
          textAlign: 'center',
          marginBottom: '2rem',
          position: 'relative',
          overflow: 'hidden'
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
              fontSize: '2.5rem',
              marginBottom: '1rem',
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              borderRadius: '12px',
              width: '48px',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto'
            }}>🔗</div>
                <p style={{
                  marginBottom: '1.5rem',
                  fontFamily: 'var(--font-geist-sans)',
                  opacity: '0.8',
                  fontSize: '1.1rem'
                }}>
                  {!isConnected 
                    ? 'Please connect your wallet to create a subscription'
                    : 'Setting up contract connections, please wait...'
                  }
                </p>
            <Button 
              onClick={() => window.location.reload()}
              color="blue"
              style={{
                fontSize: '1rem',
                padding: '0.75rem 1.5rem',
                borderRadius: '10px'
              }}
            >
              🔗 Refresh Page
            </Button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <label style={labelStyle}>Service Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="e.g., Premium Content Access"
            required
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Describe what subscribers will get..."
            required
            style={{
              ...inputStyle,
              minHeight: '80px',
              resize: 'vertical'
            }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>Amount per Period (CFX)</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              placeholder="0.01"
              step="0.001"
              min="0"
              required
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Period</label>
            <select
              name="period"
              value={formData.period}
              onChange={handleInputChange}
              required
              style={inputStyle}
            >
              <option value="86400">Daily</option>
              <option value="604800">Weekly</option>
              <option value="2592000">Monthly</option>
              <option value="7776000">Quarterly</option>
              <option value="31536000">Yearly</option>
            </select>
          </div>
        </div>

        <div>
          <label style={labelStyle}>Initial Funding (CFX)</label>
          <input
            type="number"
            name="initialFunding"
            value={formData.initialFunding}
            onChange={handleInputChange}
            placeholder="0.05"
            step="0.001"
            min="0"
            required
            style={inputStyle}
          />
          <div style={{
            fontSize: '0.8rem',
            color: 'var(--foreground)',
            opacity: '0.6',
            marginTop: '4px',
            fontFamily: 'var(--font-geist-sans)'
          }}>
            Amount to fund the subscription initially. Users can add more funds later.
          </div>
        </div>

        <div style={{
          padding: '1rem',
          background: 'var(--gray-alpha-100)',
          borderRadius: '8px',
          fontSize: '0.9rem',
          color: 'var(--foreground)',
          opacity: '0.8',
          fontFamily: 'var(--font-geist-sans)'
        }}>
          <strong>How it works:</strong> This creates a subscription service that users can subscribe to using the service ID. 
          When users subscribe, they pay the initial funding amount and will be charged automatically based on the billing period. 
          You'll get a unique service ID that you can share with customers.
        </div>

            <Button
              type="submit"
              color="green"
              disabled={!isConnected || !isContractServiceReady || isCreating}
              style={{ marginTop: '1rem' }}
            >
          {isCreating ? (
            <>
              <span style={{
                display: 'inline-block',
                width: '16px',
                height: '16px',
                border: '2px solid transparent',
                borderTop: '2px solid currentColor',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></span>
              Creating...
            </>
          ) : (
            <>Create Service</>
          )}
        </Button>
      </form>
    </div>
  );
}