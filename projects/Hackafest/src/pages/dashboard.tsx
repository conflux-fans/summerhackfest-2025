import React, { useState } from 'react';
import Button from '../components/Button';
import Card from '../components/Card';
import Link from 'next/link';

interface Collection {
  id: string;
  name: string;
  symbol: string;
  status: 'deployed' | 'pending' | 'draft';
  supply: number;
  minted: number;
  verifications: number;
  contractAddress?: string;
}

interface VerificationLog {
  id: string;
  timestamp: string;
  wallet: string;
  collection: string;
  result: 'success' | 'failed';
  reason?: string;
}

interface Analytics {
  verificationsToday: number;
  verificationsWeek: number;
  uniqueWallets: number;
  successRate: number;
  failureReasons: { reason: string; count: number }[];
}

const DashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'collections' | 'verify' | 'analytics' | 'settings'>('collections');
  const [verificationCode, setVerificationCode] = useState<string | null>(null);

  const mockCollections: Collection[] = [
    {
      id: '1',
      name: 'VIP Conference Access',
      symbol: 'VCA',
      status: 'deployed',
      supply: 100,
      minted: 75,
      verifications: 142,
      contractAddress: '0x1234567890abcdef1234567890abcdef12345678'
    },
    {
      id: '2',
      name: 'Premium Gym Membership',
      symbol: 'PGM',
      status: 'deployed',
      supply: 500,
      minted: 234,
      verifications: 67,
      contractAddress: '0x9876543210fedcba9876543210fedcba98765432'
    },
    {
      id: '3',
      name: 'Art Gallery Access',
      symbol: 'AGA',
      status: 'pending',
      supply: 50,
      minted: 0,
      verifications: 0
    }
  ];

  const mockVerificationLogs: VerificationLog[] = [
    {
      id: '1',
      timestamp: '2024-01-15 14:30:22',
      wallet: '0xabc123...def456',
      collection: 'VIP Conference Access',
      result: 'success'
    },
    {
      id: '2',
      timestamp: '2024-01-15 14:28:15',
      wallet: '0x789xyz...123abc',
      collection: 'Premium Gym Membership',
      result: 'failed',
      reason: 'Insufficient balance'
    },
    {
      id: '3',
      timestamp: '2024-01-15 14:25:08',
      wallet: '0x456def...789ghi',
      collection: 'VIP Conference Access',
      result: 'success'
    }
  ];

  const mockAnalytics: Analytics = {
    verificationsToday: 47,
    verificationsWeek: 312,
    uniqueWallets: 156,
    successRate: 87.3,
    failureReasons: [
      { reason: 'Insufficient balance', count: 23 },
      { reason: 'Invalid signature', count: 12 },
      { reason: 'Expired token', count: 8 },
      { reason: 'Wrong trait', count: 5 }
    ]
  };

  const generateVerificationCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setVerificationCode(code);
  };

  const copyCode = () => {
    if (verificationCode) {
      navigator.clipboard.writeText(verificationCode);
      alert('Verification code copied to clipboard!');
    }
  };

  const exportLogs = () => {
    alert('Exporting verification logs as CSV...');
  };

  const renderCollections = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-text">Your Collections</h2>
        <Link href="/create">
          <Button variant="primary">New Collection</Button>
        </Link>
      </div>

      <div className="grid gap-6">
        {mockCollections.map((collection) => (
          <Card key={collection.id} hover>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <h3 className="text-lg font-semibold text-text mr-3">{collection.name}</h3>
                  <span className={`px-2 py-1 text-xs rounded ${
                    collection.status === 'deployed' 
                      ? 'bg-success bg-opacity-20 text-success'
                      : collection.status === 'pending'
                      ? 'bg-warning bg-opacity-20 text-warning'
                      : 'bg-muted bg-opacity-20 text-muted'
                  }`}>
                    {collection.status.toUpperCase()}
                  </span>
                </div>
                
                <div className="grid grid-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted">Symbol:</span>
                    <div className="text-text font-mono">{collection.symbol}</div>
                  </div>
                  <div>
                    <span className="text-muted">Supply:</span>
                    <div className="text-text">{collection.minted}/{collection.supply}</div>
                  </div>
                  <div>
                    <span className="text-muted">Verifications:</span>
                    <div className="text-text">{collection.verifications}</div>
                  </div>
                  <div>
                    <span className="text-muted">Contract:</span>
                    <div className="text-text font-mono text-xs">
                      {collection.contractAddress ? `${collection.contractAddress.slice(0, 8)}...` : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button variant="secondary" size="sm">Edit</Button>
                {collection.status === 'deployed' && (
                  <Button variant="ghost" size="sm">View</Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderVerify = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-text">Verification Management</h2>
      
      <div className="grid md:grid-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold mb-4 text-text">Generate Verification Code</h3>
          <p className="text-muted text-sm mb-6">
            Create a short code that users can enter to verify ownership quickly.
          </p>
          
          {!verificationCode ? (
            <Button variant="primary" onClick={generateVerificationCode} className="w-full">
              Generate Code
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="bg-accent bg-opacity-10 border border-accent rounded-xl p-4 text-center">
                <div className="text-3xl font-mono font-bold text-accent mb-2">
                  {verificationCode}
                </div>
                <p className="text-sm text-muted">Share this code with users for verification</p>
              </div>
              
              <div className="flex space-x-2">
                <Button variant="secondary" onClick={copyCode} className="flex-1">
                  Copy Code
                </Button>
                <Button variant="ghost" onClick={() => setVerificationCode(null)} className="flex-1">
                  Generate New
                </Button>
              </div>
            </div>
          )}
        </Card>
        
        <Card>
          <h3 className="text-lg font-semibold mb-4 text-text">Live Verification Feed</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {mockVerificationLogs.map((log) => (
              <div key={log.id} className="border-b border-border pb-3 last:border-b-0">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center mb-1">
                      <span className={`w-2 h-2 rounded-full mr-2 ${
                        log.result === 'success' ? 'bg-success' : 'bg-danger'
                      }`}></span>
                      <span className="text-sm font-medium text-text">{log.collection}</span>
                    </div>
                    <div className="text-xs text-muted">
                      {log.wallet} • {log.timestamp}
                    </div>
                    {log.reason && (
                      <div className="text-xs text-danger mt-1">{log.reason}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-text">Analytics</h2>
        <Button variant="secondary" onClick={exportLogs}>
          Export Logs
        </Button>
      </div>
      
      <div className="grid grid-4 gap-6">
        <Card className="text-center">
          <div className="text-3xl font-bold text-accent mb-2">{mockAnalytics.verificationsToday}</div>
          <div className="text-sm text-muted">Verifications Today</div>
        </Card>
        
        <Card className="text-center">
          <div className="text-3xl font-bold text-accent mb-2">{mockAnalytics.verificationsWeek}</div>
          <div className="text-sm text-muted">This Week</div>
        </Card>
        
        <Card className="text-center">
          <div className="text-3xl font-bold text-accent mb-2">{mockAnalytics.uniqueWallets}</div>
          <div className="text-sm text-muted">Unique Wallets</div>
        </Card>
        
        <Card className="text-center">
          <div className="text-3xl font-bold text-success mb-2">{mockAnalytics.successRate}%</div>
          <div className="text-sm text-muted">Success Rate</div>
        </Card>
      </div>
      
      <Card>
        <h3 className="text-lg font-semibold mb-4 text-text">Failure Reasons</h3>
        <div className="space-y-3">
          {mockAnalytics.failureReasons.map((reason, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-muted">{reason.reason}</span>
              <div className="flex items-center">
                <div className="w-32 bg-surface rounded-full h-2 mr-3">
                  <div 
                    className="bg-danger h-2 rounded-full"
                    style={{ width: `${(reason.count / 50) * 100}%` }}
                  ></div>
                </div>
                <span className="text-text font-medium w-8 text-right">{reason.count}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-text">Settings</h2>
      
      <div className="grid md:grid-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold mb-4 text-text">Payout Address</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-muted mb-2">Conflux Address</label>
              <input
                type="text"
                defaultValue="0x1234567890abcdef1234567890abcdef12345678"
                className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-text font-mono text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <Button variant="primary" size="sm">Update Address</Button>
          </div>
        </Card>
        
        <Card>
          <h3 className="text-lg font-semibold mb-4 text-text">Royalty Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-muted mb-2">Default Royalty (%)</label>
              <input
                type="number"
                defaultValue="5"
                min="0"
                max="10"
                className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-text focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <Button variant="primary" size="sm">Save Settings</Button>
          </div>
        </Card>
        
        <Card>
          <h3 className="text-lg font-semibold mb-4 text-text">Webhooks</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-muted mb-2">Webhook URL</label>
              <input
                type="url"
                placeholder="https://your-app.com/webhook"
                className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-text focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div className="text-sm text-muted">
              Receive real-time verification events at your endpoint
            </div>
            <Button variant="primary" size="sm">Add Webhook</Button>
          </div>
        </Card>
        
        <Card>
          <h3 className="text-lg font-semibold mb-4 text-text">API Access</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-muted mb-2">API Key</label>
              <div className="flex space-x-2">
                <input
                  type="password"
                  value="sk_live_1234567890abcdef"
                  readOnly
                  className="flex-1 bg-bg border border-border rounded-xl px-4 py-3 text-text font-mono text-sm focus:outline-none"
                />
                <Button variant="secondary" size="sm">Regenerate</Button>
              </div>
            </div>
            <div className="text-sm text-muted">
              Use this key to access the verification API programmatically
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="py-3xl">
      <div className="container">
        <div className="text-center mb-3xl">
          <h1 className="mb-lg">Organizer Dashboard</h1>
          <p className="text-xl text-muted">
            Manage your collections, verification codes, and analytics.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex mb-8 border-b border-border">
          {[
            { id: 'collections', label: 'Collections' },
            { id: 'verify', label: 'Verify' },
            { id: 'analytics', label: 'Analytics' },
            { id: 'settings', label: 'Settings' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'text-accent border-accent'
                  : 'text-muted border-transparent hover:text-text'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'collections' && renderCollections()}
          {activeTab === 'verify' && renderVerify()}
          {activeTab === 'analytics' && renderAnalytics()}
          {activeTab === 'settings' && renderSettings()}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;