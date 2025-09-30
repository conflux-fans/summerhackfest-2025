import React, { useState } from 'react';
import Button from '../components/Button';
import Card from '../components/Card';
import FormField from '../components/FormField';

interface Wallet {
  id: string;
  address: string;
  type: 'ConfluxPortal' | 'MetaMask' | 'WalletConnect';
  isPrimary: boolean;
  lastUsed: string;
}

interface Device {
  id: string;
  name: string;
  type: 'mobile' | 'desktop';
  lastUsed: string;
  trusted: boolean;
}

const AccountPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'wallets' | 'devices' | 'email' | 'security'>('wallets');
  const [wallets, setWallets] = useState<Wallet[]>([
    {
      id: '1',
      address: '0x1234567890abcdef1234567890abcdef12345678',
      type: 'ConfluxPortal',
      isPrimary: true,
      lastUsed: '2 hours ago'
    },
    {
      id: '2',
      address: '0x9876543210fedcba9876543210fedcba98765432',
      type: 'MetaMask',
      isPrimary: false,
      lastUsed: '1 day ago'
    }
  ]);

  const [devices, setDevices] = useState<Device[]>([
    {
      id: '1',
      name: 'iPhone 14 Pro',
      type: 'mobile',
      lastUsed: '2 hours ago',
      trusted: true
    },
    {
      id: '2',
      name: 'MacBook Pro',
      type: 'desktop',
      lastUsed: '5 minutes ago',
      trusted: true
    }
  ]);

  const [email, setEmail] = useState('');
  const [notifications, setNotifications] = useState({
    verificationAlerts: true,
    marketplaceUpdates: false,
    securityNotifications: true,
    weeklyReports: true
  });

  const setPrimaryWallet = (walletId: string) => {
    setWallets(prev => prev.map(wallet => ({
      ...wallet,
      isPrimary: wallet.id === walletId
    })));
  };

  const removeWallet = (walletId: string) => {
    setWallets(prev => prev.filter(wallet => wallet.id !== walletId));
  };

  const revokeDevice = (deviceId: string) => {
    setDevices(prev => prev.filter(device => device.id !== deviceId));
  };

  const revokeAllSessions = () => {
    if (confirm('Are you sure you want to revoke all sessions and devices? You will need to reconnect everything.')) {
      setDevices([]);
      alert('All sessions and devices have been revoked.');
    }
  };

  const renderWallets = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-text">Linked Wallets</h2>
        <Button variant="primary">Add Wallet</Button>
      </div>

      <div className="space-y-4">
        {wallets.map((wallet) => (
          <Card key={wallet.id}>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <h3 className="text-lg font-medium text-text mr-3">{wallet.type}</h3>
                  {wallet.isPrimary && (
                    <span className="bg-accent bg-opacity-20 text-accent text-xs px-2 py-1 rounded">
                      Primary
                    </span>
                  )}
                </div>
                
                <div className="text-sm text-muted font-mono mb-2">
                  {wallet.address}
                </div>
                
                <div className="text-xs text-muted">
                  Last used: {wallet.lastUsed}
                </div>
              </div>
              
              <div className="flex space-x-2">
                {!wallet.isPrimary && (
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={() => setPrimaryWallet(wallet.id)}
                  >
                    Set Primary
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => removeWallet(wallet.id)}
                  className="text-danger hover:bg-danger hover:bg-opacity-10"
                  disabled={wallet.isPrimary && wallets.length === 1}
                >
                  Remove
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="bg-surface border border-border rounded-xl p-4">
        <h3 className="text-lg font-semibold mb-2 text-text">Add Wallet</h3>
        <p className="text-sm text-muted mb-4">
          Connect additional wallets to manage multiple NFT collections and increase verification options.
        </p>
        <div className="flex space-x-4">
          <Button variant="secondary" size="sm">ConfluxPortal</Button>
          <Button variant="secondary" size="sm">MetaMask</Button>
          <Button variant="secondary" size="sm">WalletConnect</Button>
        </div>
      </div>
    </div>
  );

  const renderDevices = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-text">Trusted Devices</h2>
        <Button variant="secondary" onClick={revokeAllSessions}>
          Revoke All
        </Button>
      </div>

      <div className="space-y-4">
        {devices.map((device) => (
          <Card key={device.id}>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center mr-3">
                    <span className="text-bg text-sm">
                      {device.type === 'mobile' ? '📱' : '💻'}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-text">{device.name}</h3>
                    <div className="text-sm text-muted">
                      {device.type === 'mobile' ? 'Mobile Device' : 'Desktop'}
                    </div>
                  </div>
                </div>
                
                <div className="text-xs text-muted">
                  Last used: {device.lastUsed}
                </div>
              </div>
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => revokeDevice(device.id)}
                className="text-danger hover:bg-danger hover:bg-opacity-10"
              >
                Revoke
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {devices.length === 0 && (
        <Card className="text-center py-8">
          <p className="text-muted mb-4">No trusted devices found.</p>
          <p className="text-sm text-muted">
            Link your phone or other devices for faster verification.
          </p>
        </Card>
      )}
    </div>
  );

  const renderEmail = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-text">Email & Notifications</h2>

      <Card>
        <h3 className="text-lg font-semibold mb-4 text-text">Email Address</h3>
        <div className="space-y-4">
          <FormField label="Email (Optional)">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-text focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </FormField>
          
          <div className="text-sm text-muted">
            Email is optional but recommended for security notifications and important updates.
          </div>
          
          <Button variant="primary" size="sm">
            {email ? 'Update Email' : 'Add Email'}
          </Button>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold mb-4 text-text">Notification Preferences</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-text font-medium">Verification Alerts</div>
              <div className="text-sm text-muted">Get notified of successful and failed verifications</div>
            </div>
            <input
              type="checkbox"
              checked={notifications.verificationAlerts}
              onChange={(e) => setNotifications(prev => ({ ...prev, verificationAlerts: e.target.checked }))}
              className="w-5 h-5"
            />
          </div>
          
          <div className="flex justify-between items-center">
            <div>
              <div className="text-text font-medium">Marketplace Updates</div>
              <div className="text-sm text-muted">New collections and marketplace features</div>
            </div>
            <input
              type="checkbox"
              checked={notifications.marketplaceUpdates}
              onChange={(e) => setNotifications(prev => ({ ...prev, marketplaceUpdates: e.target.checked }))}
              className="w-5 h-5"
            />
          </div>
          
          <div className="flex justify-between items-center">
            <div>
              <div className="text-text font-medium">Security Notifications</div>
              <div className="text-sm text-muted">Login attempts and security events</div>
            </div>
            <input
              type="checkbox"
              checked={notifications.securityNotifications}
              onChange={(e) => setNotifications(prev => ({ ...prev, securityNotifications: e.target.checked }))}
              className="w-5 h-5"
            />
          </div>
          
          <div className="flex justify-between items-center">
            <div>
              <div className="text-text font-medium">Weekly Reports</div>
              <div className="text-sm text-muted">Summary of your verification activity</div>
            </div>
            <input
              type="checkbox"
              checked={notifications.weeklyReports}
              onChange={(e) => setNotifications(prev => ({ ...prev, weeklyReports: e.target.checked }))}
              className="w-5 h-5"
            />
          </div>
        </div>
        
        <div className="mt-6">
          <Button variant="primary" size="sm">Save Preferences</Button>
        </div>
      </Card>
    </div>
  );

  const renderSecurity = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-text">Security Settings</h2>

      <Card>
        <h3 className="text-lg font-semibold mb-4 text-text">Account Security</h3>
        <div className="space-y-4">
          <div className="bg-success bg-opacity-10 border border-success rounded-xl p-4">
            <div className="flex items-center">
              <span className="text-success mr-2">✓</span>
              <div>
                <div className="text-success font-medium">Wallet-based Authentication</div>
                <div className="text-success text-sm">Your account is secured by cryptographic signatures</div>
              </div>
            </div>
          </div>
          
          <div className="bg-success bg-opacity-10 border border-success rounded-xl p-4">
            <div className="flex items-center">
              <span className="text-success mr-2">✓</span>
              <div>
                <div className="text-success font-medium">Non-custodial</div>
                <div className="text-success text-sm">Private keys remain in your wallet at all times</div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold mb-4 text-text">Session Management</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-text font-medium">Active Sessions</div>
              <div className="text-sm text-muted">Currently connected devices and browsers</div>
            </div>
            <div className="text-accent font-medium">{devices.length}</div>
          </div>
          
          <div className="flex justify-between items-center">
            <div>
              <div className="text-text font-medium">Last Activity</div>
              <div className="text-sm text-muted">Most recent account access</div>
            </div>
            <div className="text-text">5 minutes ago</div>
          </div>
        </div>
      </Card>

      <Card className="border-danger">
        <h3 className="text-lg font-semibold mb-4 text-danger">Danger Zone</h3>
        <div className="space-y-4">
          <div>
            <h4 className="text-text font-medium mb-2">Revoke All Sessions</h4>
            <p className="text-sm text-muted mb-4">
              This will sign you out of all devices and revoke all trusted connections. 
              You'll need to reconnect your wallets and re-pair your devices.
            </p>
            <Button 
              variant="secondary" 
              onClick={revokeAllSessions}
              className="border-danger text-danger hover:bg-danger hover:bg-opacity-10"
            >
              Revoke All Sessions
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="py-3xl">
      <div className="container max-w-4xl">
        <div className="text-center mb-3xl">
          <h1 className="mb-lg">Account Settings</h1>
          <p className="text-xl text-muted">
            Manage your wallets, devices, and security preferences.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex mb-8 border-b border-border">
          {[
            { id: 'wallets', label: 'Wallets' },
            { id: 'devices', label: 'Devices' },
            { id: 'email', label: 'Email & Notifications' },
            { id: 'security', label: 'Security' }
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
          {activeTab === 'wallets' && renderWallets()}
          {activeTab === 'devices' && renderDevices()}
          {activeTab === 'email' && renderEmail()}
          {activeTab === 'security' && renderSecurity()}
        </div>
      </div>
    </div>
  );
};

export default AccountPage;