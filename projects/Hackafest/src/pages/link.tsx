import React, { useState } from 'react';
import Button from '../components/Button';
import Card from '../components/Card';

interface Device {
  id: string;
  name: string;
  lastUsed: string;
  trusted: boolean;
}

const LinkPage: React.FC = () => {
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [devices, setDevices] = useState<Device[]>([
    {
      id: '1',
      name: 'iPhone 14 Pro',
      lastUsed: '2 hours ago',
      trusted: true
    },
    {
      id: '2',
      name: 'Samsung Galaxy S23',
      lastUsed: '1 day ago',
      trusted: true
    }
  ]);
  const [showSuccess, setShowSuccess] = useState(false);

  const generatePairingCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setPairingCode(code);
    setShowSuccess(false);
    
    // Simulate pairing success after 10 seconds
    setTimeout(() => {
      setShowSuccess(true);
      setPairingCode(null);
      
      // Add new device to list
      const newDevice: Device = {
        id: Date.now().toString(),
        name: 'New Mobile Device',
        lastUsed: 'Just now',
        trusted: true
      };
      setDevices(prev => [newDevice, ...prev]);
    }, 10000);
  };

  const revokeDevice = (deviceId: string) => {
    setDevices(prev => prev.filter(device => device.id !== deviceId));
  };

  const copyPairingLink = () => {
    if (pairingCode) {
      const link = `https://ownership.app/pair?code=${pairingCode}`;
      navigator.clipboard.writeText(link);
      alert('Pairing link copied to clipboard!');
    }
  };

  return (
    <div className="py-3xl">
      <div className="container max-w-4xl">
        <div className="text-center mb-3xl">
          <h1 className="mb-lg">Link to Phone</h1>
          <p className="text-xl text-muted">
            Pair your website account with mobile app for fast check-ins.
          </p>
        </div>

        <div className="grid md:grid-2 gap-8">
          {/* Pairing Section */}
          <Card>
            <h2 className="text-2xl font-semibold mb-6 text-text">Add New Device</h2>
            
            {!pairingCode && !showSuccess && (
              <div className="text-center space-y-6">
                <div className="bg-surface border border-border rounded-xl p-6">
                  <div className="w-16 h-16 bg-accent rounded-xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-bg text-2xl">📱</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-text">Pair Your Phone</h3>
                  <p className="text-muted text-sm mb-4">
                    Generate a secure pairing code to connect your mobile device
                  </p>
                </div>
                
                <Button variant="primary" size="lg" onClick={generatePairingCode}>
                  Generate Pairing Code
                </Button>
              </div>
            )}

            {pairingCode && (
              <div className="text-center space-y-6">
                <div className="bg-accent bg-opacity-10 border border-accent rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-4 text-accent">Pairing Code Generated</h3>
                  
                  <div className="bg-bg border border-border rounded-xl p-4 mb-4">
                    <div className="text-4xl font-mono font-bold text-text tracking-wider">
                      {pairingCode}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="text-sm text-muted">
                      <p className="mb-2">On your phone app:</p>
                      <ol className="text-left space-y-1">
                        <li>1. Open the OWNERSHIP mobile app</li>
                        <li>2. Tap "Pair Device" or scan QR code</li>
                        <li>3. Enter the code above</li>
                        <li>4. Sign the verification message</li>
                      </ol>
                    </div>
                    
                    <div className="border-t border-border pt-4">
                      <Button variant="secondary" onClick={copyPairingLink} className="w-full mb-2">
                        Copy Pairing Link
                      </Button>
                      <p className="text-xs text-muted">
                        Or share this link: https://ownership.app/pair?code={pairingCode}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-center space-x-2 text-muted">
                  <div className="animate-spin border-2 border-accent border-t-transparent rounded-full w-4 h-4"></div>
                  <span className="text-sm">Waiting for device pairing...</span>
                </div>
                
                <Button variant="ghost" onClick={() => setPairingCode(null)}>
                  Cancel
                </Button>
              </div>
            )}

            {showSuccess && (
              <div className="text-center space-y-6">
                <div className="bg-success bg-opacity-10 border border-success rounded-xl p-6">
                  <div className="w-16 h-16 bg-success rounded-xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-2xl">✓</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-success">Device Paired Successfully!</h3>
                  <p className="text-success text-sm">
                    Your mobile device has been linked to your account. You can now use it for fast verification.
                  </p>
                </div>
                
                <Button variant="primary" onClick={() => setShowSuccess(false)}>
                  Pair Another Device
                </Button>
              </div>
            )}
          </Card>

          {/* Device Management */}
          <Card>
            <h2 className="text-2xl font-semibold mb-6 text-text">Trusted Devices</h2>
            
            {devices.length > 0 ? (
              <div className="space-y-4">
                {devices.map((device) => (
                  <div key={device.id} className="bg-surface border border-border rounded-xl p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h3 className="text-lg font-medium text-text mr-2">{device.name}</h3>
                          {device.trusted && (
                            <span className="bg-success bg-opacity-20 text-success text-xs px-2 py-1 rounded">
                              Trusted
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted">Last used: {device.lastUsed}</p>
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
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted">No trusted devices yet.</p>
                <p className="text-sm text-muted mt-2">
                  Pair your first device to enable fast mobile verification.
                </p>
              </div>
            )}
          </Card>
        </div>

        {/* How It Works */}
        <Card className="mt-8">
          <h2 className="text-2xl font-semibold mb-6 text-text">How Device Pairing Works</h2>
          
          <div className="grid md:grid-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-bg font-semibold">1</span>
              </div>
              <h3 className="text-lg font-medium mb-2 text-text">Generate Code</h3>
              <p className="text-sm text-muted">
                Create a secure 6-character pairing code on this website
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-bg font-semibold">2</span>
              </div>
              <h3 className="text-lg font-medium mb-2 text-text">Enter on Phone</h3>
              <p className="text-sm text-muted">
                Open the mobile app and enter the pairing code or scan QR
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-bg font-semibold">3</span>
              </div>
              <h3 className="text-lg font-medium mb-2 text-text">Sign & Verify</h3>
              <p className="text-sm text-muted">
                Sign a verification message to establish the trusted connection
              </p>
            </div>
          </div>
        </Card>

        {/* Security Information */}
        <Card className="mt-8 bg-surface border border-border">
          <h3 className="text-lg font-semibold mb-4 text-text">Security & Privacy</h3>
          
          <div className="space-y-3 text-sm">
            <div className="flex items-start">
              <span className="text-success mr-3 mt-1">•</span>
              <span className="text-muted">
                <strong className="text-text">You can revoke any device instantly.</strong> Remove access from lost or stolen devices.
              </span>
            </div>
            <div className="flex items-start">
              <span className="text-success mr-3 mt-1">•</span>
              <span className="text-muted">
                <strong className="text-text">No private keys stored.</strong> Device pairing only creates verification shortcuts.
              </span>
            </div>
            <div className="flex items-start">
              <span className="text-success mr-3 mt-1">•</span>
              <span className="text-muted">
                <strong className="text-text">Cryptographic signatures.</strong> Each verification request is cryptographically signed.
              </span>
            </div>
            <div className="flex items-start">
              <span className="text-success mr-3 mt-1">•</span>
              <span className="text-muted">
                <strong className="text-text">Session management.</strong> Paired devices can be managed and revoked at any time.
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LinkPage;