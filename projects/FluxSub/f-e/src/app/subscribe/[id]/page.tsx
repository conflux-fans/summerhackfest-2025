"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { ethers } from 'ethers';
import Button from '../../../components/ui/Button';
import PageLayout from '../../../components/layout/PageLayout';
import { useWallet } from '../../../contexts/WalletContext';
import contractService, { SubscriptionService } from '../../../services/ContractService';

export default function SubscribePage() {
  const params = useParams();
  const router = useRouter();
  const serviceId = params.id as string;
  
  const [service, setService] = useState<SubscriptionService | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [initialFunding, setInitialFunding] = useState('');
  const [walletBalance, setWalletBalance] = useState<string>('0');
  const [hasExistingSubscription, setHasExistingSubscription] = useState(false);
  const [checkingSubscription, setCheckingSubscription] = useState(false);
  
  const { isConnected, walletInfo, isContractServiceReady } = useWallet();

  useEffect(() => {
    if (serviceId && isContractServiceReady) {
      loadService();
    }
  }, [serviceId, isContractServiceReady]);

  useEffect(() => {
    if (isConnected && walletInfo && isContractServiceReady && service) {
      loadWalletBalance();
      checkExistingSubscription();
    }
  }, [isConnected, walletInfo, isContractServiceReady, service]);

  const loadService = async () => {
    if (!serviceId) return;
    
    setLoading(true);
    try {
      const serviceData = await contractService.getSubscriptionService(parseInt(serviceId));
      console.log('Service data loaded:', serviceData);
      console.log('Service amount (raw):', serviceData.amount);
      console.log('Service amount (formatted):', formatCFX(serviceData.amount));
      setService(serviceData);
    } catch (error) {
      console.error('Error loading service:', error);
      toast.error('Service not found or failed to load');
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const loadWalletBalance = async () => {
    if (!walletInfo?.account) return;
    
    try {
      const balance = await contractService.getBalance(walletInfo.account);
      setWalletBalance(balance);
    } catch (error) {
      console.error('Error loading wallet balance:', error);
    }
  };

  const checkExistingSubscription = async () => {
    if (!walletInfo?.account || !service) return;
    
    setCheckingSubscription(true);
    try {
      const userSubscriptions = await contractService.getUserSubscriptions(walletInfo.account);
      
      // Check if user already has a subscription to this service
      const existingSubscription = userSubscriptions.find(sub => 
        sub.subscriptionId === parseInt(serviceId)
      );
      
      setHasExistingSubscription(!!existingSubscription);
      console.log('Existing subscription check:', { 
        serviceId, 
        userSubscriptions, 
        existingSubscription,
        hasExisting: !!existingSubscription 
      });
    } catch (error) {
      console.error('Error checking existing subscription:', error);
    } finally {
      setCheckingSubscription(false);
    }
  };

  const handleSubscribe = async () => {
    if (!isConnected || !walletInfo || !isContractServiceReady) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!service) return;

    if (hasExistingSubscription) {
      toast.error('You already have a subscription to this service');
      return;
    }

    setSubscribing(true);
    try {
      const fundingAmount = initialFunding ? parseFloat(initialFunding) : 0;
      
      // Validate funding amount
      if (fundingAmount < 0) {
        toast.error('Funding amount cannot be negative');
        return;
      }
      
      if (fundingAmount > 1000000) {
        toast.error('Funding amount is too large (max 1,000,000 CFX)');
        return;
      }
      
      // Convert to wei properly - try multiple approaches
      let fundingWei = '0';
      if (fundingAmount > 0) {
        try {
          // Method 1: Use ethers.parseEther
          fundingWei = ethers.parseEther(fundingAmount.toString()).toString();
        } catch (error) {
          console.warn('ethers.parseEther failed, trying manual conversion:', error);
          // Method 2: Manual conversion using BigInt
          const amountStr = fundingAmount.toString();
          const [integerPart, decimalPart = ''] = amountStr.split('.');
          const paddedDecimal = decimalPart.padEnd(18, '0').slice(0, 18);
          fundingWei = (BigInt(integerPart) * BigInt('1000000000000000000') + BigInt(paddedDecimal)).toString();
        }
      }
      
      console.log('Subscribing with funding:', { 
        fundingAmount, 
        fundingWei,
        fundingAmountType: typeof fundingAmount,
        fundingAmountString: fundingAmount.toString(),
        parseEtherResult: ethers.parseEther(fundingAmount.toString()).toString()
      });
      
      // Safety check - if fundingWei is suspiciously large, abort
      const fundingWeiBigInt = BigInt(fundingWei);
      const maxReasonableWei = BigInt('1000000000000000000000000'); // 1,000,000 CFX in wei
      if (fundingWeiBigInt > maxReasonableWei) {
        toast.error('Funding amount is too large. Please enter a smaller amount.');
        console.error('Funding amount too large:', { fundingWei, fundingWeiBigInt, maxReasonableWei });
        return;
      }
      
      // Additional safety check - if fundingWei is still the problematic value, force it to 0
      if (fundingWei === '0xc097ce7bc90715b34b9f1000000000' || fundingWei.includes('c097ce7bc90715b34b9f1000000000')) {
        console.warn('Detected problematic funding value, setting to 0');
        fundingWei = '0';
      }
      
      await contractService.subscribe(parseInt(serviceId), fundingWei);
      toast.success('Successfully subscribed to the service!');
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Error subscribing:', error);
      
      // Handle specific error types
      if (error.message?.includes('insufficient funds')) {
        toast.error('Insufficient CFX balance. Please add more CFX to your wallet or reduce the funding amount.');
      } else if (error.message?.includes('user rejected')) {
        toast.error('Transaction was cancelled by user');
      } else if (error.message?.includes('gas')) {
        toast.error('Transaction failed due to gas issues. Please try again.');
      } else {
        toast.error('Failed to subscribe to the service. Please try again.');
      }
    } finally {
      setSubscribing(false);
    }
  };

  const formatCFX = (amount: string) => {
    // Check if the amount is already in CFX format (has decimal point) or in wei
    if (amount.includes('.')) {
      // Already in CFX format, just format the decimal places
      return parseFloat(amount).toFixed(4);
    } else {
      // In wei format, convert to CFX
      return (parseInt(amount) / 1e18).toFixed(4);
    }
  };

  const formatPeriod = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''}`;
    } else {
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    }
  };

  // Show loading state while contract service is initializing or service is loading
  if (loading || !isContractServiceReady) {
    return (
      <PageLayout>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid var(--gray-200)',
            borderTop: '4px solid var(--blue-500)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ color: 'var(--gray-600)' }}>
            {!isContractServiceReady ? 'Initializing wallet connection... Please check if your wallet is connected in the header.' : 'Loading service details...'}
          </p>
        </div>
      </PageLayout>
    );
  }

  // Show connect wallet UI if wallet is not connected
  if (!isConnected) {
    return (
      <PageLayout>
        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
          padding: '2rem'
        }}>
          {/* Show service info if available */}
          {service && (
            <div style={{
              background: 'var(--gray-alpha-100)',
              borderRadius: '16px',
              padding: '2rem',
              border: '1px solid var(--gray-alpha-200)',
              marginBottom: '2rem'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '12px',
                  background: 'var(--blue-500)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem'
                }}>
                  📋
                </div>
                <div>
                  <h1 style={{
                    fontSize: '1.5rem',
                    fontWeight: '600',
                    margin: '0 0 0.25rem 0',
                    color: 'var(--foreground)'
                  }}>
                    {service.name}
                  </h1>
                  <p style={{
                    color: 'var(--gray-600)',
                    margin: '0',
                    fontSize: '0.9rem'
                  }}>
                    by {service.merchant.slice(0, 6)}...{service.merchant.slice(-4)}
                  </p>
                </div>
              </div>

              <div style={{
                marginBottom: '1.5rem'
              }}>
                <p style={{
                  color: 'var(--gray-700)',
                  lineHeight: '1.6',
                  margin: '0 0 1rem 0'
                }}>
                  {service.description}
                </p>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem'
              }}>
                <div style={{
                  background: 'var(--gray-alpha-200)',
                  padding: '1rem',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{
                    fontSize: '0.8rem',
                    color: 'var(--gray-600)',
                    marginBottom: '0.25rem'
                  }}>
                    Amount per Period
                  </div>
                  <div style={{
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    color: 'var(--foreground)'
                  }}>
                    {formatCFX(service.amount)} CFX
                  </div>
                </div>
                <div style={{
                  background: 'var(--gray-alpha-200)',
                  padding: '1rem',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{
                    fontSize: '0.8rem',
                    color: 'var(--gray-600)',
                    marginBottom: '0.25rem'
                  }}>
                    Billing Period
                  </div>
                  <div style={{
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    color: 'var(--foreground)'
                  }}>
                    {formatPeriod(service.period)}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div style={{
            background: 'linear-gradient(135deg, var(--background) 0%, rgba(59, 130, 246, 0.02) 100%)',
            padding: '4rem 3rem',
            borderRadius: '24px',
            border: '2px solid rgba(59, 130, 246, 0.15)',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 12px 40px rgba(59, 130, 246, 0.15), 0 4px 12px rgba(0,0,0,0.05)'
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
                fontSize: '4rem',
                marginBottom: '2rem',
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                borderRadius: '20px',
                width: '80px',
                height: '80px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 2rem auto',
                boxShadow: '0 4px 20px rgba(59, 130, 246, 0.2)'
              }}>🔗</div>
              <h2 style={{
                fontSize: '1.75rem',
                fontWeight: '700',
                marginBottom: '1rem',
                fontFamily: 'var(--font-geist-sans)',
                color: 'var(--foreground)'
              }}>
                Connect Your Wallet
              </h2>
              <p style={{
                opacity: '0.7',
                marginBottom: '2rem',
                fontFamily: 'var(--font-geist-sans)',
                fontSize: '1.1rem',
                lineHeight: '1.6'
              }}>
                Please connect your wallet using the "Connect Wallet" button in the header to subscribe to this service on Conflux blockchain.
              </p>
              <div style={{
                padding: '1rem',
                background: 'rgba(59, 130, 246, 0.1)',
                borderRadius: '8px',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                marginBottom: '1rem'
              }}>
                <p style={{
                  margin: '0',
                  fontSize: '0.9rem',
                  color: 'var(--foreground)',
                  fontFamily: 'var(--font-geist-sans)'
                }}>
                  💡 <strong>Tip:</strong> Look for the "Connect Wallet" button in the top navigation bar
                </p>
              </div>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!service) {
    return (
      <PageLayout>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <h2 style={{ color: 'var(--red-500)' }}>Service Not Found</h2>
          <p style={{ color: 'var(--gray-600)' }}>The subscription service you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/')}>
            Go Home
          </Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        padding: '2rem'
      }}>
        <div style={{
          background: 'var(--gray-alpha-100)',
          borderRadius: '16px',
          padding: '2rem',
          border: '1px solid var(--gray-alpha-200)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '12px',
              background: 'var(--blue-500)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem'
            }}>
              📋
            </div>
            <div>
              <h1 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                margin: '0 0 0.25rem 0',
                color: 'var(--foreground)'
              }}>
                {service.name}
              </h1>
              <p style={{
                color: 'var(--gray-600)',
                margin: '0',
                fontSize: '0.9rem'
              }}>
                by {service.merchant.slice(0, 6)}...{service.merchant.slice(-4)}
              </p>
            </div>
          </div>

          <div style={{
            marginBottom: '1.5rem'
          }}>
            <p style={{
              color: 'var(--gray-700)',
              lineHeight: '1.6',
              margin: '0 0 1rem 0'
            }}>
              {service.description}
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            <div style={{
              background: 'var(--gray-alpha-200)',
              padding: '1rem',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '0.8rem',
                color: 'var(--gray-600)',
                marginBottom: '0.25rem'
              }}>
                Amount per Period
              </div>
              <div style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: 'var(--foreground)'
              }}>
                {formatCFX(service.amount)} CFX
              </div>
            </div>
            <div style={{
              background: 'var(--gray-alpha-200)',
              padding: '1rem',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '0.8rem',
                color: 'var(--gray-600)',
                marginBottom: '0.25rem'
              }}>
                Billing Period
              </div>
              <div style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: 'var(--foreground)'
              }}>
                {formatPeriod(service.period)}
              </div>
            </div>
          </div>

          {checkingSubscription ? (
            <div style={{
              textAlign: 'center',
              padding: '2rem',
              background: 'var(--gray-alpha-200)',
              borderRadius: '8px',
              marginBottom: '1rem'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                border: '3px solid var(--gray-200)',
                borderTop: '3px solid var(--blue-500)',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 1rem auto'
              }}></div>
              <p style={{ margin: '0', color: 'var(--gray-600)' }}>
                Checking your subscription status...
              </p>
            </div>
          ) : hasExistingSubscription ? (
            <div style={{
              textAlign: 'center',
              padding: '2rem',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.05))',
              borderRadius: '12px',
              border: '2px solid rgba(16, 185, 129, 0.2)',
              marginBottom: '1rem'
            }}>
              <div style={{
                fontSize: '3rem',
                marginBottom: '1rem'
              }}>✅</div>
              <h3 style={{ 
                margin: '0 0 0.5rem 0', 
                color: 'var(--foreground)',
                fontFamily: 'var(--font-geist-sans)'
              }}>
                Already Subscribed!
              </h3>
              <p style={{ 
                margin: '0 0 1rem 0', 
                color: 'var(--gray-600)',
                fontFamily: 'var(--font-geist-sans)'
              }}>
                You already have an active subscription to this service.
              </p>
              <Button 
                onClick={() => router.push('/dashboard')}
                color="green"
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '10px'
                }}
              >
                View My Subscriptions
              </Button>
            </div>
          ) : (
            <div>
              <div style={{
                marginBottom: '1rem'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.5rem'
                }}>
                  <label style={{
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    color: 'var(--foreground)'
                  }}>
                    Initial Funding (CFX) - Optional
                  </label>
                  <span style={{
                    fontSize: '0.8rem',
                    color: 'var(--gray-600)'
                  }}>
                    Balance: {formatCFX(walletBalance)} CFX
                  </span>
                </div>
                <input
                  type="number"
                  value={initialFunding}
                  onChange={(e) => setInitialFunding(e.target.value)}
                  placeholder="0.0"
                  step="0.001"
                  min="0"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--gray-300)',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    background: 'var(--background)',
                    color: 'var(--foreground)'
                  }}
                />
                <p style={{
                  fontSize: '0.8rem',
                  color: 'var(--gray-600)',
                  margin: '0.25rem 0 0 0'
                }}>
                  Add CFX to your subscription balance for automatic payments
                </p>
              </div>

              <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                <Button
                  onClick={handleSubscribe}
                  disabled={subscribing || !isContractServiceReady || hasExistingSubscription}
                  color="green"
                  style={{ width: '100%' }}
                >
                  {subscribing ? 'Subscribing...' : `Subscribe for ${formatCFX(service.amount)} CFX`}
                </Button>
                
                <Button
                  onClick={() => {
                    console.log('Testing subscription with 0 funding...');
                    setInitialFunding('0');
                    setTimeout(() => handleSubscribe(), 100);
                  }}
                  disabled={subscribing || !isContractServiceReady || hasExistingSubscription}
                  variant="secondary"
                  style={{ width: '100%' }}
                >
                  Test: Subscribe with 0 CFX
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
