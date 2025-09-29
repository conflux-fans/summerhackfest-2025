"use client";

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Button from '../ui/Button';
import { useWallet } from '../../contexts/WalletContext';
import contractService, { UserSubscription, SubscriptionService, SubscriptionMember } from '../../services/ContractService';
import NetworkSwitcher from '../NetworkSwitcher';

// Using the types from ContractService

interface SubscriptionListProps {
  userMode?: boolean; // true for user view, false for merchant view
}

export default function SubscriptionList({ userMode = true }: SubscriptionListProps) {
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [services, setServices] = useState<SubscriptionService[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [forceRender, setForceRender] = useState(0);
  const [hasCheckedConnection, setHasCheckedConnection] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [members, setMembers] = useState<SubscriptionMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [showFundModal, setShowFundModal] = useState(false);
  const [selectedSubscriptionId, setSelectedSubscriptionId] = useState<number | null>(null);
  const [fundAmount, setFundAmount] = useState('');
  const [fundingSubscription, setFundingSubscription] = useState(false);
  const [networkError, setNetworkError] = useState<string | null>(null);
  const { isConnected, walletInfo, isContractServiceReady, updateTrigger } = useWallet();
  
  // Debug logging
  console.log('SubscriptionList state:', { isConnected, walletInfo, isContractServiceReady, updateTrigger, forceRender, hasCheckedConnection });

  const loadSubscriptions = async () => {
    if (!isConnected || !walletInfo) {
      console.log('Wallet not connected');
      return;
    }

    if (!isContractServiceReady) {
      console.log('Contract service not ready yet, waiting...');
      return;
    }

    console.log('Loading subscriptions...');
    setLoading(true);
    setNetworkError(null);
    
    try {
      if (userMode) {
        // Load user subscriptions
        const userSubscriptions = await contractService.getUserSubscriptions(walletInfo.account);
        setSubscriptions(userSubscriptions);
      } else {
        // Load merchant services
        const merchantServices = await contractService.getMerchantSubscriptions(walletInfo.account);
        setServices(merchantServices);
      }
    } catch (error: any) {
      console.error('Error loading subscriptions:', error);
      
      // Check if it's a network-related error
      if (error.message?.includes('Network mismatch') || 
          error.message?.includes('missing revert data') ||
          error.message?.includes('CALL_EXCEPTION')) {
        setNetworkError(error.message);
      } else {
        toast.error('Failed to load subscriptions');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleShareService = (serviceId: number) => {
    // Generate shareable link
    const baseUrl = window.location.origin;
    const shareUrl = `${baseUrl}/subscribe/${serviceId}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(shareUrl).then(() => {
      toast.success('Share link copied to clipboard!');
      console.log('Share link copied:', shareUrl);
    }).catch((error) => {
      console.error('Failed to copy to clipboard:', error);
      toast.error('Failed to copy link to clipboard');
    });
  };

  const handleViewMembers = async (serviceId: number) => {
    setSelectedServiceId(serviceId);
    setShowMembersModal(true);
    setLoadingMembers(true);
    
    try {
      const subscriptionMembers = await contractService.getSubscriptionMembers(serviceId);
      setMembers(subscriptionMembers);
      console.log('Loaded members for service:', serviceId, subscriptionMembers);
    } catch (error) {
      console.error('Error loading members:', error);
      toast.error('Failed to load subscription members');
    } finally {
      setLoadingMembers(false);
    }
  };

  const closeMembersModal = () => {
    setShowMembersModal(false);
    setSelectedServiceId(null);
    setMembers([]);
  };

  // Load subscriptions when component mounts or wallet connects
  useEffect(() => {
    console.log('SubscriptionList useEffect triggered:', { isConnected, walletInfo, isContractServiceReady, userMode, updateTrigger });
    if (isConnected && walletInfo && isContractServiceReady) {
      loadSubscriptions();
    }
  }, [isConnected, walletInfo, isContractServiceReady, userMode, updateTrigger]);

  // Force re-render when wallet state changes
  useEffect(() => {
    console.log('Wallet state changed in SubscriptionList:', { isConnected, walletInfo, isContractServiceReady, updateTrigger });
  }, [isConnected, walletInfo, isContractServiceReady, updateTrigger]);

  // Force component to re-render when wallet state changes
  useEffect(() => {
    console.log('SubscriptionList component state update:', { isConnected, walletInfo, isContractServiceReady });
    setForceRender(prev => prev + 1);
  }, [isConnected, walletInfo, isContractServiceReady, updateTrigger]);

  // Delayed connection check - wait 500ms for header to complete wallet connection
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('SubscriptionList delayed connection check after 500ms');
      setHasCheckedConnection(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleCancel = async (userSubscriptionId: number) => {
    setActionLoading(userSubscriptionId);
    
    try {
      await contractService.cancelSubscription(userSubscriptionId);
      toast.success('Subscription cancelled successfully');
      await loadSubscriptions(); // Reload data
    } catch (error: any) {
      console.error('Error cancelling subscription:', error);
      toast.error(error.message || 'Failed to cancel subscription');
    } finally {
      setActionLoading(null);
    }
  };

  const handleFund = (userSubscriptionId: number) => {
    setSelectedSubscriptionId(userSubscriptionId);
    setShowFundModal(true);
    setFundAmount('');
  };

  const handleFundSubmit = async () => {
    if (!selectedSubscriptionId || !fundAmount || isNaN(parseFloat(fundAmount))) {
      toast.error('Please enter a valid amount');
      return;
    }

    const amount = parseFloat(fundAmount);
    if (amount <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }

    if (amount > 1000000) {
      toast.error('Amount is too large (max 1,000,000 CFX)');
      return;
    }

    setFundingSubscription(true);
    
    try {
      await contractService.fundSubscription(selectedSubscriptionId, fundAmount);
      toast.success(`Funded ${fundAmount} CFX successfully`);
      await loadSubscriptions(); // Reload data
      closeFundModal();
    } catch (error: any) {
      console.error('Error funding subscription:', error);
      toast.error(error.message || 'Failed to fund subscription');
    } finally {
      setFundingSubscription(false);
    }
  };

  const closeFundModal = () => {
    setShowFundModal(false);
    setSelectedSubscriptionId(null);
    setFundAmount('');
    setFundingSubscription(false);
  };

  const handleCharge = async (userSubscriptionId: number) => {
    setActionLoading(userSubscriptionId);
    
    try {
      await contractService.chargeSubscription(userSubscriptionId);
      toast.success('Subscription charged successfully');
      await loadSubscriptions(); // Reload data
    } catch (error: any) {
      console.error('Error charging subscription:', error);
      toast.error(error.message || 'Failed to charge subscription');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (sub: UserSubscription) => {
    if (!sub.active) return '#ef4444';
    if (sub.paused) return '#f59e0b';
    if (parseFloat(sub.balance) < parseFloat(sub.amount)) return '#f59e0b';
    return '#10b981';
  };

  const getStatusText = (sub: UserSubscription) => {
    if (!sub.active) return 'Cancelled';
    if (sub.paused) return 'Paused';
    if (parseFloat(sub.balance) < parseFloat(sub.amount)) return 'Low Balance';
    return 'Active';
  };

  // Show loading state while waiting for connection check
  if (!hasCheckedConnection) {
    console.log('SubscriptionList showing loading state while waiting for connection check');
    return (
      <div style={{
        background: 'linear-gradient(135deg, var(--background) 0%, rgba(16, 185, 129, 0.02) 100%)',
        padding: '4rem 3rem',
        borderRadius: '24px',
        border: '2px solid rgba(16, 185, 129, 0.15)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 12px 40px rgba(16, 185, 129, 0.15), 0 4px 12px rgba(0,0,0,0.05)'
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
            display: 'inline-block',
            width: '48px',
            height: '48px',
            border: '4px solid var(--gray-alpha-200)',
            borderTop: '4px solid #10b981',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '2rem'
          }}></div>
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            marginBottom: '1rem',
            fontFamily: 'var(--font-geist-sans)',
            color: 'var(--foreground)'
          }}>
            Checking Wallet Connection
          </h3>
          <p style={{
            fontFamily: 'var(--font-geist-sans)',
            opacity: '0.7',
            fontSize: '1.1rem'
          }}>
            Please wait while we check your wallet connection...
          </p>
        </div>
      </div>
    );
  }

  // Show connect wallet UI only if we've checked connection and wallet is not connected/ready
  if (hasCheckedConnection && (!isConnected || !isContractServiceReady)) {
    console.log('SubscriptionList rendering connect wallet UI after check:', { isConnected, isContractServiceReady, hasCheckedConnection, forceRender });
      return (
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
                <h3 style={{
                  fontSize: '1.75rem',
                  fontWeight: '700',
                  marginBottom: '1rem',
                  fontFamily: 'var(--font-geist-sans)',
                  color: 'var(--foreground)'
                }}>
                  {!isConnected ? 'Connect Your Wallet' : 'Initializing Contract Service'}
                </h3>
                <p style={{
                  opacity: '0.7',
                  marginBottom: '2rem',
                  fontFamily: 'var(--font-geist-sans)',
                  fontSize: '1.1rem',
                  lineHeight: '1.6'
                }}>
                  {!isConnected 
                    ? 'Please connect your wallet using the "Connect Wallet" button in the header to view and manage your subscriptions with Conflux blockchain.'
                    : 'Setting up contract connections, please wait...'
                  }
                </p>
                {!isConnected && (
                  <div style={{
                    padding: '1rem',
                    background: 'rgba(59, 130, 246, 0.1)',
                    borderRadius: '8px',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                    marginBottom: '2rem'
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
                )}
            <Button 
              onClick={() => window.location.reload()}
              color="blue"
              style={{
                fontSize: '1.1rem',
                padding: '1rem 2rem',
                borderRadius: '12px'
              }}
            >
              {!isConnected ? '🔄 Refresh Page' : '⏳ Retry Connection'}
            </Button>
          </div>
        </div>
      );
  }

  if (loading) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, var(--background) 0%, rgba(16, 185, 129, 0.02) 100%)',
        padding: '4rem 3rem',
        borderRadius: '24px',
        border: '2px solid rgba(16, 185, 129, 0.15)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 12px 40px rgba(16, 185, 129, 0.15), 0 4px 12px rgba(0,0,0,0.05)'
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
            display: 'inline-block',
            width: '48px',
            height: '48px',
            border: '4px solid var(--gray-alpha-200)',
            borderTop: '4px solid #10b981',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '2rem'
          }}></div>
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            marginBottom: '1rem',
            fontFamily: 'var(--font-geist-sans)',
            color: 'var(--foreground)'
          }}>
            Loading Subscriptions
          </h3>
          <p style={{
            fontFamily: 'var(--font-geist-sans)',
            opacity: '0.7',
            fontSize: '1.1rem'
          }}>
            Fetching your subscription data from Conflux blockchain...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Network Switcher - show when there's a network error */}
      {networkError && (
        <NetworkSwitcher 
          onNetworkChange={() => {
            setNetworkError(null);
            loadSubscriptions();
          }}
        />
      )}
      
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
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <Button 
          color="blue" 
          size="sm" 
          onClick={loadSubscriptions}
          style={{
            fontSize: '0.9rem',
            padding: '0.75rem 1.5rem',
            borderRadius: '10px'
          }}
        >
          🔄 Refresh
        </Button>
      </div>

          {(userMode ? subscriptions.length === 0 : services.length === 0) ? (
        <div style={{
          textAlign: 'center',
          padding: '3rem 2rem',
          opacity: '0.6'
        }}>
          <div style={{
            fontSize: '3rem',
            marginBottom: '1rem',
            opacity: '0.5'
          }}>📋</div>
              <p style={{ 
                fontFamily: 'var(--font-geist-sans)',
                fontSize: '1.1rem',
                margin: 0
              }}>
                {userMode ? 'No subscriptions found' : 'No services created'}
              </p>
              <p style={{ 
                fontFamily: 'var(--font-geist-sans)',
                fontSize: '0.9rem',
                margin: '0.5rem 0 0 0',
                opacity: '0.7'
              }}>
                {userMode ? 'Subscribe to services to get started' : 'Create your first subscription service to get started'}
              </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {userMode ? subscriptions.map((sub) => (
            <div key={sub.subscriptionId} style={{
              padding: '1.5rem',
              background: 'var(--gray-alpha-100)',
              borderRadius: '12px',
              border: '1px solid var(--gray-alpha-200)'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '1rem'
              }}>
                <div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    marginBottom: '0.5rem'
                  }}>
                    <h4 style={{
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      fontFamily: 'var(--font-geist-sans)'
                    }}>
                      Subscription #{sub.subscriptionId}
                    </h4>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      background: `${getStatusColor(sub)}20`,
                      color: getStatusColor(sub),
                      fontFamily: 'var(--font-geist-sans)'
                    }}>
                      {getStatusText(sub)}
                    </span>
                  </div>
                  <p style={{
                    fontSize: '0.9rem',
                    opacity: '0.7',
                    fontFamily: 'var(--font-geist-sans)'
                  }}>
                    Merchant: {contractService.formatAddress(sub.merchant)}
                  </p>
                </div>
                
                <div style={{
                  textAlign: 'right'
                }}>
                  <div style={{
                    fontSize: '1.2rem',
                    fontWeight: '700',
                    fontFamily: 'var(--font-geist-sans)'
                  }}>
                    {parseFloat(sub.amount).toFixed(4)} CFX
                  </div>
                  <div style={{
                    fontSize: '0.8rem',
                    opacity: '0.6',
                    fontFamily: 'var(--font-geist-sans)'
                  }}>
                    {contractService.formatPeriod(sub.period)}
                  </div>
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '1rem',
                marginBottom: '1rem'
              }}>
                <div>
                  <div style={{
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    opacity: '0.8',
                    marginBottom: '4px',
                    fontFamily: 'var(--font-geist-sans)'
                  }}>
                    Balance
                  </div>
                  <div style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    fontFamily: 'var(--font-geist-sans)'
                  }}>
                    {parseFloat(sub.balance).toFixed(4)} CFX
                  </div>
                </div>
                
                <div>
                  <div style={{
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    opacity: '0.8',
                    marginBottom: '4px',
                    fontFamily: 'var(--font-geist-sans)'
                  }}>
                    Next Charge
                  </div>
                  <div style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    fontFamily: 'var(--font-geist-sans)'
                  }}>
                    {contractService.formatDate(sub.nextCharge)}
                  </div>
                </div>
              </div>

              <div style={{
                display: 'flex',
                gap: '1rem',
                justifyContent: 'flex-end'
              }}>
                {userMode ? (
                  <>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleFund(sub.subscriptionId)}
                      disabled={actionLoading === sub.userSubscriptionId || !sub.active}
                    >
                      💰 Fund
                    </Button>
                    <Button
                      color="orange"
                      size="sm"
                      onClick={() => handleCancel(sub.userSubscriptionId)}
                      disabled={actionLoading === sub.userSubscriptionId || !sub.active}
                    >
                      {actionLoading === sub.userSubscriptionId ? '...' : '❌ Cancel'}
                    </Button>
                  </>
                ) : (
                  <Button
                    color="green"
                    size="sm"
                    onClick={() => handleCharge(sub.subscriptionId)}
                    disabled={actionLoading === sub.userSubscriptionId || !sub.active || sub.paused}
                  >
                    {actionLoading === sub.userSubscriptionId ? '...' : '💳 Charge'}
                  </Button>
                )}
              </div>
            </div>
          )) : services.map((service) => (
            <div key={service.id} style={{
              padding: '1.5rem',
              background: 'var(--gray-alpha-100)',
              borderRadius: '12px',
              border: '1px solid var(--gray-alpha-200)'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '1rem'
              }}>
                <div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    marginBottom: '0.5rem'
                  }}>
                    <h4 style={{
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      fontFamily: 'var(--font-geist-sans)'
                    }}>
                      {service.name}
                    </h4>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      background: service.active ? '#10b98120' : '#ef444420',
                      color: service.active ? '#10b981' : '#ef4444',
                      fontFamily: 'var(--font-geist-sans)'
                    }}>
                      {service.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p style={{
                    fontSize: '0.9rem',
                    opacity: '0.7',
                    fontFamily: 'var(--font-geist-sans)',
                    marginBottom: '0.5rem'
                  }}>
                    {service.description}
                  </p>
                  <p style={{
                    fontSize: '0.8rem',
                    opacity: '0.6',
                    fontFamily: 'var(--font-geist-sans)'
                  }}>
                    Service ID: {service.id} • {service.totalSubscribers} subscribers
                  </p>
                </div>
                
                <div style={{
                  textAlign: 'right'
                }}>
                  <div style={{
                    fontSize: '1.2rem',
                    fontWeight: '700',
                    fontFamily: 'var(--font-geist-sans)'
                  }}>
                    {parseFloat(service.amount).toFixed(4)} CFX
                  </div>
                  <div style={{
                    fontSize: '0.8rem',
                    opacity: '0.6',
                    fontFamily: 'var(--font-geist-sans)'
                  }}>
                    {contractService.formatPeriod(service.period)}
                  </div>
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '1rem',
                marginBottom: '1rem'
              }}>
                <div>
                  <div style={{
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    opacity: '0.8',
                    marginBottom: '4px',
                    fontFamily: 'var(--font-geist-sans)'
                  }}>
                    Created
                  </div>
                  <div style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    fontFamily: 'var(--font-geist-sans)'
                  }}>
                    {contractService.formatDate(service.createdAt)}
                  </div>
                </div>
                
                <div>
                  <div style={{
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    opacity: '0.8',
                    marginBottom: '4px',
                    fontFamily: 'var(--font-geist-sans)'
                  }}>
                    Subscribers
                  </div>
                  <div style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    fontFamily: 'var(--font-geist-sans)'
                  }}>
                    {service.totalSubscribers}
                  </div>
                </div>
              </div>

              <div style={{
                display: 'flex',
                gap: '1rem',
                justifyContent: 'flex-end'
              }}>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleViewMembers(service.id)}
                >
                  👥 View Members
                </Button>
                <Button
                  color="blue"
                  size="sm"
                  onClick={() => {
                    handleShareService(service.id);
                  }}
                >
                  🔗 Share Service
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Members Modal */}
      {showMembersModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '2rem'
        }}>
          <div style={{
            background: 'var(--background)',
            borderRadius: '20px',
            padding: '2rem',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'auto',
            border: '1px solid var(--gray-alpha-200)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            position: 'relative'
          }}>
            {/* Close button */}
            <button
              onClick={closeMembersModal}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: 'var(--foreground)',
                opacity: '0.6',
                padding: '0.5rem',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '1';
                e.currentTarget.style.backgroundColor = 'var(--gray-alpha-100)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '0.6';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              ✕
            </button>

            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              marginBottom: '1.5rem',
              fontFamily: 'var(--font-geist-sans)',
              color: 'var(--foreground)'
            }}>
              👥 Subscription Members
            </h2>

            {loadingMembers ? (
              <div style={{
                textAlign: 'center',
                padding: '2rem'
              }}>
                <div style={{
                  display: 'inline-block',
                  width: '32px',
                  height: '32px',
                  border: '3px solid var(--gray-alpha-200)',
                  borderTop: '3px solid #3b82f6',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  marginBottom: '1rem'
                }}></div>
                <p style={{
                  fontFamily: 'var(--font-geist-sans)',
                  opacity: '0.7'
                }}>
                  Loading members...
                </p>
              </div>
            ) : members.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '2rem',
                opacity: '0.6'
              }}>
                <div style={{
                  fontSize: '3rem',
                  marginBottom: '1rem',
                  opacity: '0.5'
                }}>👥</div>
                <p style={{
                  fontFamily: 'var(--font-geist-sans)',
                  fontSize: '1.1rem',
                  margin: 0
                }}>
                  No members found
                </p>
                <p style={{
                  fontFamily: 'var(--font-geist-sans)',
                  fontSize: '0.9rem',
                  margin: '0.5rem 0 0 0',
                  opacity: '0.7'
                }}>
                  This service doesn't have any subscribers yet
                </p>
              </div>
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}>
                {members.map((member, index) => (
                  <div key={member.address} style={{
                    padding: '1rem',
                    background: 'var(--gray-alpha-100)',
                    borderRadius: '12px',
                    border: '1px solid var(--gray-alpha-200)'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '0.5rem'
                    }}>
                      <div>
                        <div style={{
                          fontSize: '0.9rem',
                          fontWeight: '600',
                          fontFamily: 'var(--font-geist-sans)',
                          marginBottom: '0.25rem'
                        }}>
                          {contractService.formatAddress(member.address)}
                        </div>
                        <div style={{
                          fontSize: '0.8rem',
                          opacity: '0.6',
                          fontFamily: 'var(--font-geist-sans)'
                        }}>
                          Subscribed: {contractService.formatDate(member.subscribedAt)}
                        </div>
                      </div>
                      <div style={{
                        textAlign: 'right'
                      }}>
                        <div style={{
                          fontSize: '1rem',
                          fontWeight: '600',
                          fontFamily: 'var(--font-geist-sans)',
                          marginBottom: '0.25rem'
                        }}>
                          {parseFloat(member.balance).toFixed(4)} CFX
                        </div>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          background: member.active ? '#10b98120' : '#ef444420',
                          color: member.active ? '#10b981' : '#ef4444',
                          fontFamily: 'var(--font-geist-sans)'
                        }}>
                          {member.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{
              marginTop: '2rem',
              display: 'flex',
              justifyContent: 'flex-end'
            }}>
              <Button
                onClick={closeMembersModal}
                variant="secondary"
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '10px'
                }}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Fund Subscription Modal */}
      {showFundModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '2rem'
        }}>
          <div style={{
            background: 'var(--background)',
            borderRadius: '20px',
            padding: '2rem',
            maxWidth: '500px',
            width: '100%',
            border: '1px solid var(--gray-alpha-200)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            position: 'relative'
          }}>
            {/* Close button */}
            <button
              onClick={closeFundModal}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: 'var(--foreground)',
                opacity: '0.6',
                padding: '0.5rem',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '1';
                e.currentTarget.style.backgroundColor = 'var(--gray-alpha-100)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '0.6';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              ✕
            </button>

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
                background: 'linear-gradient(135deg, #10b981, #059669)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem'
              }}>
                💰
              </div>
              <div>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  margin: '0 0 0.25rem 0',
                  fontFamily: 'var(--font-geist-sans)',
                  color: 'var(--foreground)'
                }}>
                  Fund Subscription
                </h2>
                <p style={{
                  color: 'var(--gray-600)',
                  margin: '0',
                  fontSize: '0.9rem',
                  fontFamily: 'var(--font-geist-sans)'
                }}>
                  Add CFX to your subscription balance
                </p>
              </div>
            </div>

            <div style={{
              marginBottom: '1.5rem'
            }}>
              <label style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: '600',
                marginBottom: '0.5rem',
                color: 'var(--foreground)',
                fontFamily: 'var(--font-geist-sans)'
              }}>
                Amount (CFX)
              </label>
              <div style={{
                position: 'relative'
              }}>
                <input
                  type="number"
                  value={fundAmount}
                  onChange={(e) => setFundAmount(e.target.value)}
                  placeholder="0.0"
                  step="0.001"
                  min="0"
                  max="1000000"
                  style={{
                    width: '100%',
                    padding: '1rem',
                    border: '2px solid var(--gray-alpha-200)',
                    borderRadius: '12px',
                    fontSize: '1.1rem',
                    background: 'var(--background)',
                    color: 'var(--foreground)',
                    fontFamily: 'var(--font-geist-sans)',
                    transition: 'border-color 0.2s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#10b981';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--gray-alpha-200)';
                  }}
                />
                <div style={{
                  position: 'absolute',
                  right: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--gray-600)',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  fontFamily: 'var(--font-geist-sans)'
                }}>
                  CFX
                </div>
              </div>
              <p style={{
                fontSize: '0.8rem',
                color: 'var(--gray-600)',
                margin: '0.5rem 0 0 0',
                fontFamily: 'var(--font-geist-sans)'
              }}>
                This amount will be added to your subscription balance for automatic payments
              </p>
            </div>

            {/* Quick amount buttons */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '0.5rem',
              marginBottom: '2rem'
            }}>
              {['0.1', '0.5', '1', '5'].map((amount) => (
                <button
                  key={amount}
                  onClick={() => setFundAmount(amount)}
                  style={{
                    padding: '0.75rem',
                    border: '1px solid var(--gray-alpha-200)',
                    borderRadius: '8px',
                    background: 'var(--background)',
                    color: 'var(--foreground)',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontFamily: 'var(--font-geist-sans)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#10b981';
                    e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--gray-alpha-200)';
                    e.currentTarget.style.backgroundColor = 'var(--background)';
                  }}
                >
                  {amount} CFX
                </button>
              ))}
            </div>

            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'flex-end'
            }}>
              <Button
                onClick={closeFundModal}
                variant="secondary"
                disabled={fundingSubscription}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '10px'
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleFundSubmit}
                color="green"
                disabled={fundingSubscription || !fundAmount || parseFloat(fundAmount) <= 0}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '10px',
                  minWidth: '120px'
                }}
              >
                {fundingSubscription ? (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid transparent',
                      borderTop: '2px solid currentColor',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    Funding...
                  </div>
                ) : (
                  `Fund ${fundAmount || '0'} CFX`
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}