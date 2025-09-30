import React from 'react';
import Card from '../../components/Card';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="py-3xl">
      <div className="container max-w-4xl">
        <div className="text-center mb-3xl">
          <h1 className="mb-lg">Privacy Policy</h1>
          <p className="text-xl text-muted">
            How we collect, use, and protect your information.
          </p>
          <p className="text-sm text-muted mt-4">
            Last updated: January 15, 2024
          </p>
        </div>

        <div className="space-y-8">
          <Card>
            <h2 className="text-2xl font-semibold mb-6 text-text">Overview</h2>
            <div className="space-y-4 text-muted">
              <p>
                MBP Enterprises ("we," "our," or "us") operates the OWNERSHIP platform, a Conflux-native 
                NFT ownership verification service. This Privacy Policy explains how we collect, use, 
                disclose, and protect information when you use our platform.
              </p>
              <p>
                Our platform is designed with privacy by design principles. We minimize data collection 
                and use cryptographic methods to verify ownership without requiring personal information.
              </p>
            </div>
          </Card>

          <Card>
            <h2 className="text-2xl font-semibold mb-6 text-text">Information We Collect</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3 text-text">Wallet Information</h3>
                <ul className="space-y-2 text-muted text-sm">
                  <li>• Conflux wallet addresses you connect to our platform</li>
                  <li>• Public cryptographic signatures for verification</li>
                  <li>• NFT ownership data from public blockchain records</li>
                  <li>• Transaction hashes related to verification activities</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-text">Verification Logs</h3>
                <ul className="space-y-2 text-muted text-sm">
                  <li>• Timestamps of verification attempts</li>
                  <li>• Success or failure status of verifications</li>
                  <li>• Collection addresses and token IDs verified</li>
                  <li>• IP addresses for security and rate limiting purposes</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-text">Optional Information</h3>
                <ul className="space-y-2 text-muted text-sm">
                  <li>• Email address (if you choose to provide it for notifications)</li>
                  <li>• Device information for mobile app pairing</li>
                  <li>• Collection metadata you create as an organizer</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-text">Technical Information</h3>
                <ul className="space-y-2 text-muted text-sm">
                  <li>• Browser type and version</li>
                  <li>• Device type and operating system</li>
                  <li>• Usage patterns and interaction data</li>
                  <li>• Performance and error logs</li>
                </ul>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="text-2xl font-semibold mb-6 text-text">How We Use Information</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2 text-text">Core Services</h3>
                <ul className="space-y-2 text-muted text-sm">
                  <li>• Verify NFT ownership through cryptographic signatures</li>
                  <li>• Maintain verification logs for audit and compliance</li>
                  <li>• Provide access control for real-world benefits</li>
                  <li>• Enable organizer dashboard analytics</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2 text-text">Platform Improvement</h3>
                <ul className="space-y-2 text-muted text-sm">
                  <li>• Analyze usage patterns to improve user experience</li>
                  <li>• Monitor system performance and reliability</li>
                  <li>• Detect and prevent fraudulent activities</li>
                  <li>• Develop new features and capabilities</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2 text-text">Communication</h3>
                <ul className="space-y-2 text-muted text-sm">
                  <li>• Send security notifications about your account</li>
                  <li>• Provide verification status updates (if email provided)</li>
                  <li>• Share important platform updates and changes</li>
                  <li>• Respond to support requests and inquiries</li>
                </ul>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="text-2xl font-semibold mb-6 text-text">Information Sharing</h2>
            
            <div className="space-y-4 text-muted">
              <p>
                We do not sell, trade, or otherwise transfer your personal information to third parties. 
                We may share information in the following limited circumstances:
              </p>
              
              <div className="space-y-3">
                <div>
                  <strong className="text-text">With Your Consent:</strong> When you explicitly agree 
                  to share information with specific partners or integrations.
                </div>
                <div>
                  <strong className="text-text">Legal Requirements:</strong> When required by law, 
                  court order, or government regulation.
                </div>
                <div>
                  <strong className="text-text">Security:</strong> To protect against fraud, abuse, 
                  or threats to our platform or users.
                </div>
                <div>
                  <strong className="text-text">Business Transfer:</strong> In connection with a merger, 
                  acquisition, or sale of assets (with notice to users).
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="text-2xl font-semibold mb-6 text-text">Data Security</h2>
            
            <div className="space-y-4 text-muted">
              <p>
                We implement industry-standard security measures to protect your information:
              </p>
              
              <div className="grid md:grid-2 gap-6 mt-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-text">Technical Safeguards</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Encryption in transit and at rest</li>
                    <li>• Secure cloud infrastructure</li>
                    <li>• Regular security audits and testing</li>
                    <li>• Access controls and authentication</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-text">Operational Security</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Employee training and background checks</li>
                    <li>• Incident response procedures</li>
                    <li>• Regular backup and recovery testing</li>
                    <li>• Third-party security assessments</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="text-2xl font-semibold mb-6 text-text">Data Retention</h2>
            
            <div className="space-y-4 text-muted">
              <p>
                We retain information only as long as necessary for the purposes outlined in this policy:
              </p>
              
              <div className="space-y-3 text-sm">
                <div>
                  <strong className="text-text">Verification Logs:</strong> Retained for 2 years 
                  for audit and compliance purposes, then automatically deleted.
                </div>
                <div>
                  <strong className="text-text">Account Information:</strong> Retained while your 
                  account is active and for 30 days after account closure.
                </div>
                <div>
                  <strong className="text-text">Collection Data:</strong> Retained as long as the 
                  collection is active on our platform.
                </div>
                <div>
                  <strong className="text-text">Support Communications:</strong> Retained for 1 year 
                  to assist with follow-up inquiries.
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="text-2xl font-semibold mb-6 text-text">Your Rights</h2>
            
            <div className="space-y-4 text-muted">
              <p>
                You have the following rights regarding your information:
              </p>
              
              <div className="space-y-3 text-sm">
                <div>
                  <strong className="text-text">Access:</strong> Request a copy of the personal 
                  information we hold about you.
                </div>
                <div>
                  <strong className="text-text">Correction:</strong> Request correction of inaccurate 
                  or incomplete information.
                </div>
                <div>
                  <strong className="text-text">Deletion:</strong> Request deletion of your personal 
                  information (subject to legal requirements).
                </div>
                <div>
                  <strong className="text-text">Portability:</strong> Request a copy of your data 
                  in a machine-readable format.
                </div>
                <div>
                  <strong className="text-text">Objection:</strong> Object to processing of your 
                  information for specific purposes.
                </div>
              </div>
              
              <p className="mt-4">
                To exercise these rights, contact us at privacy@ownership.app
              </p>
            </div>
          </Card>

          <Card>
            <h2 className="text-2xl font-semibold mb-6 text-text">Cookies and Tracking</h2>
            
            <div className="space-y-4 text-muted">
              <p>
                We use minimal tracking technologies:
              </p>
              
              <div className="space-y-3 text-sm">
                <div>
                  <strong className="text-text">Essential Cookies:</strong> Required for platform 
                  functionality and security.
                </div>
                <div>
                  <strong className="text-text">Analytics:</strong> Anonymous usage statistics to 
                  improve our service (opt-out available).
                </div>
                <div>
                  <strong className="text-text">Preferences:</strong> Store your settings and 
                  preferences locally.
                </div>
              </div>
              
              <p className="mt-4">
                You can control cookie settings through your browser. Note that disabling essential 
                cookies may affect platform functionality.
              </p>
            </div>
          </Card>

          <Card>
            <h2 className="text-2xl font-semibold mb-6 text-text">Changes to This Policy</h2>
            
            <div className="space-y-4 text-muted">
              <p>
                We may update this Privacy Policy periodically. Changes will be posted on this page 
                with an updated "Last modified" date. For significant changes, we will:
              </p>
              
              <ul className="space-y-2 text-sm">
                <li>• Notify users via email (if provided)</li>
                <li>• Display a prominent notice on our platform</li>
                <li>• Provide at least 30 days notice before changes take effect</li>
              </ul>
              
              <p>
                Continued use of our platform after changes constitute acceptance of the updated policy.
              </p>
            </div>
          </Card>

          <Card>
            <h2 className="text-2xl font-semibold mb-6 text-text">Contact Information</h2>
            
            <div className="space-y-4 text-muted">
              <p>
                If you have questions about this Privacy Policy or our data practices, contact us:
              </p>
              
              <div className="bg-surface border border-border rounded-xl p-4 text-sm">
                <div><strong className="text-text">Email:</strong> privacy@ownership.app</div>
                <div><strong className="text-text">Address:</strong> MBP Enterprises Privacy Office</div>
                <div><strong className="text-text">Response Time:</strong> Within 30 days</div>
              </div>
              
              <p className="text-xs">
                For EU residents: You may also contact your local data protection authority 
                if you have concerns about our data practices.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;