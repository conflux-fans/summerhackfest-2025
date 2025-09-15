import React from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import Link from 'next/link';

const DocsPage: React.FC = () => {
  return (
    <div className="py-3xl">
      <div className="container max-w-4xl">
        <div className="text-center mb-3xl">
          <h1 className="mb-lg">How it Works</h1>
          <p className="text-xl text-muted">
            Technical documentation for Conflux-native NFT ownership verification.
          </p>
        </div>

        {/* Overview */}
        <section className="mb-3xl">
          <Card>
            <h2 className="text-2xl font-semibold mb-6 text-text">Overview</h2>
            
            <div className="space-y-4 text-muted">
              <p>
                OWNERSHIP is a Conflux-native platform that enables real-world access control through NFT ownership verification. 
                Unlike traditional approaches that require transferring or locking assets, our system uses cryptographic signatures 
                to prove ownership while keeping NFTs safely in users' wallets.
              </p>
              
              <p>
                Built specifically for the Conflux Network, the platform leverages Conflux's Tree-Graph consensus mechanism 
                for fast, low-cost transactions and rapid finality. This makes it practical for real-time verification scenarios 
                like event check-ins, membership validation, and access control.
              </p>
              
              <div className="bg-surface border border-border rounded-xl p-4 mt-6">
                <h3 className="text-lg font-semibold mb-2 text-text">Key Features</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <span className="text-accent mr-2">•</span>
                    <span><strong className="text-text">Non-custodial:</strong> Private keys never leave user wallets</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-accent mr-2">•</span>
                    <span><strong className="text-text">Conflux-optimized:</strong> Built for Tree-Graph consensus</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-accent mr-2">•</span>
                    <span><strong className="text-text">Real-time verification:</strong> Sub-second signature validation</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-accent mr-2">•</span>
                    <span><strong className="text-text">Flexible access rules:</strong> Custom verification policies</span>
                  </li>
                </ul>
              </div>
            </div>
          </Card>
        </section>

        {/* Verification Flow */}
        <section className="mb-3xl">
          <Card>
            <h2 className="text-2xl font-semibold mb-6 text-text">Verification Flow</h2>
            
            <div className="mb-6">
              <div className="bg-bg border border-border rounded-xl p-4 font-mono text-sm overflow-x-auto">
                <pre className="text-muted">{`┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   User      │    │   Client    │    │   Server    │    │  Conflux    │
│   Wallet    │    │    App      │    │  Verifier   │    │  Network    │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                    │                    │                    │
       │  1. Connect Wallet │                    │                    │
       │◄───────────────────│                    │                    │
       │                    │                    │                    │
       │  2. Request Sign   │                    │                    │
       │◄───────────────────│                    │                    │
       │                    │                    │                    │
       │  3. Sign Message   │                    │                    │
       │───────────────────►│                    │                    │
       │                    │  4. Submit Proof   │                    │
       │                    │───────────────────►│                    │
       │                    │                    │  5. Verify On-Chain│
       │                    │                    │───────────────────►│
       │                    │                    │  6. Ownership Data │
       │                    │                    │◄───────────────────│
       │                    │  7. Access Result  │                    │
       │                    │◄───────────────────│                    │
       │  8. Access Granted │                    │                    │
       │◄───────────────────│                    │                    │`}</pre>
              </div>
            </div>
            
            <div className="space-y-4 text-muted">
              <div>
                <h3 className="text-lg font-semibold mb-2 text-text">Step-by-Step Process</h3>
                <ol className="space-y-3 text-sm">
                  <li><strong className="text-text">1. Wallet Connection:</strong> User connects ConfluxPortal or compatible wallet</li>
                  <li><strong className="text-text">2. Signature Request:</strong> App generates verification message for signing</li>
                  <li><strong className="text-text">3. User Signs:</strong> Cryptographic signature proves wallet ownership</li>
                  <li><strong className="text-text">4. Proof Submission:</strong> Signed message sent to verification server</li>
                  <li><strong className="text-text">5. On-chain Verification:</strong> Server checks NFT ownership on Conflux</li>
                  <li><strong className="text-text">6. Policy Check:</strong> Verification against access rules and policies</li>
                  <li><strong className="text-text">7. Result Return:</strong> Access granted or denied response</li>
                  <li><strong className="text-text">8. Access Control:</strong> Real-world access enabled or restricted</li>
                </ol>
              </div>
            </div>
          </Card>
        </section>

        {/* Access Rules */}
        <section className="mb-3xl">
          <Card>
            <h2 className="text-2xl font-semibold mb-6 text-text">Access Rules</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3 text-text">Rule Types</h3>
                <div className="grid md:grid-2 gap-4">
                  <div className="bg-surface border border-border rounded-xl p-4">
                    <h4 className="font-semibold text-text mb-2">Hold ≥1 Token</h4>
                    <p className="text-sm text-muted">User must own at least one NFT from the collection</p>
                    <code className="text-xs text-accent block mt-2">balanceOf(user) &gt;= 1</code>
                  </div>
                  
                  <div className="bg-surface border border-border rounded-xl p-4">
                    <h4 className="font-semibold text-text mb-2">Specific Trait</h4>
                    <p className="text-sm text-muted">NFT must have specific metadata attributes</p>
                    <code className="text-xs text-accent block mt-2">metadata.tier === "VIP"</code>
                  </div>
                  
                  <div className="bg-surface border border-border rounded-xl p-4">
                    <h4 className="font-semibold text-text mb-2">Minimum Rarity</h4>
                    <p className="text-sm text-muted">NFT rarity level meets minimum threshold</p>
                    <code className="text-xs text-accent block mt-2">rarity_score &gt;= 50</code>
                  </div>
                  
                  <div className="bg-surface border border-border rounded-xl p-4">
                    <h4 className="font-semibold text-text mb-2">Time-based</h4>
                    <p className="text-sm text-muted">Access valid within specific time window</p>
                    <code className="text-xs text-accent block mt-2">now &gt;= start &amp;&amp; now &lt;= end</code>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3 text-text">Example Configurations</h3>
                <div className="bg-bg border border-border rounded-xl p-4">
                  <pre className="text-sm text-muted overflow-x-auto">{`{
  "collection": "0x1234...5678",
  "rules": {
    "type": "specific-trait",
    "trait_type": "access_level", 
    "value": "premium"
  },
  "validity": {
    "start": "2024-01-01T00:00:00Z",
    "end": "2024-12-31T23:59:59Z"
  },
  "transferable": false,
  "revocation": "creator"
}`}</pre>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Security & Privacy */}
        <section className="mb-3xl">
          <Card>
            <h2 className="text-2xl font-semibold mb-6 text-text">Security & Privacy</h2>
            
            <div className="grid md:grid-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-3 text-text">Cryptographic Security</h3>
                <ul className="space-y-3 text-sm text-muted">
                  <li className="flex items-start">
                    <span className="text-success mr-2">•</span>
                    <span><strong className="text-text">EIP-191/EIP-712:</strong> Standard signature formats for verification</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-success mr-2">•</span>
                    <span><strong className="text-text">Message replay protection:</strong> Nonces prevent signature reuse</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-success mr-2">•</span>
                    <span><strong className="text-text">Wallet isolation:</strong> Private keys never transmitted</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-success mr-2">•</span>
                    <span><strong className="text-text">Domain separation:</strong> App-specific signature contexts</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3 text-text">Privacy Protection</h3>
                <ul className="space-y-3 text-sm text-muted">
                  <li className="flex items-start">
                    <span className="text-success mr-2">•</span>
                    <span><strong className="text-text">Minimal data collection:</strong> Only verification logs stored</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-success mr-2">•</span>
                    <span><strong className="text-text">Anonymous verification:</strong> No PII required for access</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-success mr-2">•</span>
                    <span><strong className="text-text">Data retention limits:</strong> Automatic log expiration</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-success mr-2">•</span>
                    <span><strong className="text-text">User consent:</strong> Clear permission models</span>
                  </li>
                </ul>
              </div>
            </div>
          </Card>
        </section>

        {/* Rate Limits & Performance */}
        <section className="mb-3xl">
          <Card>
            <h2 className="text-2xl font-semibold mb-6 text-text">Rate Limits and Expected Latency</h2>
            
            <div className="grid md:grid-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-3 text-text">API Rate Limits</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted">Verification requests</span>
                    <span className="text-text">100/minute</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted">Signature validation</span>
                    <span className="text-text">1000/minute</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted">Collection queries</span>
                    <span className="text-text">500/minute</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-muted">Bulk verification</span>
                    <span className="text-text">10/minute</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3 text-text">Performance Metrics</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted">Signature verification</span>
                    <span className="text-text">&lt;100ms</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted">On-chain lookup</span>
                    <span className="text-text">&lt;500ms</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted">End-to-end verification</span>
                    <span className="text-text">&lt;1s</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-muted">Conflux block finality</span>
                    <span className="text-text">~1s</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Roadmap */}
        <section className="mb-3xl">
          <Card>
            <h2 className="text-2xl font-semibold mb-6 text-text">Roadmap</h2>
            
            <div className="space-y-6">
              <div className="grid md:grid-3 gap-6">
                <div className="bg-success bg-opacity-10 border border-success rounded-xl p-4">
                  <h3 className="text-lg font-semibold mb-2 text-success">Phase 1: Conflux Native</h3>
                  <ul className="space-y-1 text-sm text-muted">
                    <li>• Conflux eSpace support</li>
                    <li>• Basic NFT verification</li>
                    <li>• Signature-based access</li>
                    <li>• Mobile app pairing</li>
                  </ul>
                  <div className="mt-3 text-xs text-success font-medium">COMPLETED</div>
                </div>
                
                <div className="bg-accent bg-opacity-10 border border-accent rounded-xl p-4">
                  <h3 className="text-lg font-semibold mb-2 text-accent">Phase 2: Enhanced Features</h3>
                  <ul className="space-y-1 text-sm text-muted">
                    <li>• Advanced access rules</li>
                    <li>• Batch verification</li>
                    <li>• Analytics dashboard</li>
                    <li>• Webhook integrations</li>
                  </ul>
                  <div className="mt-3 text-xs text-accent font-medium">IN PROGRESS</div>
                </div>
                
                <div className="bg-surface border border-border rounded-xl p-4">
                  <h3 className="text-lg font-semibold mb-2 text-text">Phase 3: Multi-Chain</h3>
                  <ul className="space-y-1 text-sm text-muted">
                    <li>• Ethereum compatibility</li>
                    <li>• Cross-chain verification</li>
                    <li>• Bridge integrations</li>
                    <li>• Universal access</li>
                  </ul>
                  <div className="mt-3 text-xs text-muted font-medium">PLANNED</div>
                </div>
              </div>
              
              <div className="bg-bg border border-border rounded-xl p-4">
                <p className="text-sm text-muted">
                  <strong className="text-text">Note:</strong> Conflux remains our primary focus. Multi-chain support will 
                  be additive, maintaining Conflux as the core verification layer with the best performance and lowest costs.
                </p>
              </div>
            </div>
          </Card>
        </section>

        {/* Get Started */}
        <section>
          <Card className="text-center">
            <h2 className="text-2xl font-semibold mb-4 text-text">Ready to Get Started?</h2>
            <p className="text-muted mb-6">
              Start building with OWNERSHIP today. Create your first collection or integrate verification into your app.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/create">
                <Button variant="primary" size="lg">Create Collection</Button>
              </Link>
              <Link href="/verify">
                <Button variant="secondary" size="lg">Try Verification</Button>
              </Link>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default DocsPage;