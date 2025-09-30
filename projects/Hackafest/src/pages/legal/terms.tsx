import React from 'react';
import Card from '../../components/Card';

const TermsOfServicePage: React.FC = () => {
  return (
    <div className="py-3xl">
      <div className="container max-w-4xl">
        <div className="text-center mb-3xl">
          <h1 className="mb-lg">Terms of Service</h1>
          <p className="text-xl text-muted">
            Legal terms and conditions for using the OWNERSHIP platform.
          </p>
          <p className="text-sm text-muted mt-4">
            Last updated: January 15, 2024
          </p>
        </div>

        <div className="space-y-8">
          <Card>
            <h2 className="text-2xl font-semibold mb-6 text-text">Agreement to Terms</h2>
            <div className="space-y-4 text-muted">
              <p>
                These Terms of Service ("Terms") govern your use of the OWNERSHIP platform operated by 
                MBP Enterprises ("Company," "we," "our," or "us"). By accessing or using our platform, 
                you agree to be bound by these Terms.
              </p>
              <p>
                If you disagree with any part of these Terms, you may not access or use our platform. 
                These Terms apply to all visitors, users, and others who access or use the service.
              </p>
            </div>
          </Card>

          <Card>
            <h2 className="text-2xl font-semibold mb-6 text-text">Description of Service</h2>
            
            <div className="space-y-4 text-muted">
              <p>
                OWNERSHIP is a Conflux-native platform that enables NFT ownership verification for 
                real-world access control. Our service includes:
              </p>
              
              <ul className="space-y-2 text-sm">
                <li>• NFT collection creation and deployment tools</li>
                <li>• Marketplace for buying and selling access NFTs</li>
                <li>• Cryptographic signature-based ownership verification</li>
                <li>• Mobile app integration for quick verification</li>
                <li>• Organizer dashboard and analytics</li>
                <li>• API access for third-party integrations</li>
              </ul>
              
              <p>
                The platform operates on the Conflux Network and requires compatible wallets 
                for full functionality.
              </p>
            </div>
          </Card>

          <Card>
            <h2 className="text-2xl font-semibold mb-6 text-text">User Accounts and Wallets</h2>
            
            <div className="space-y-4 text-muted">
              <h3 className="text-lg font-semibold mb-3 text-text">Wallet Connection</h3>
              <p>
                To use our platform, you must connect a compatible Conflux wallet. You are responsible 
                for maintaining the security of your wallet and private keys. We do not have access to 
                your private keys and cannot recover them if lost.
              </p>
              
              <h3 className="text-lg font-semibold mb-3 text-text">Account Responsibility</h3>
              <ul className="space-y-2 text-sm">
                <li>• You are responsible for all activities that occur under your account</li>
                <li>• You must provide accurate and complete information</li>
                <li>• You must maintain the security of your wallet and credentials</li>
                <li>• You must notify us immediately of any unauthorized use</li>
              </ul>
              
              <h3 className="text-lg font-semibold mb-3 text-text">Eligibility</h3>
              <p>
                You must be at least 18 years old to use our platform. By using the service, 
                you represent that you meet this age requirement and have the legal capacity 
                to enter into these Terms.
              </p>
            </div>
          </Card>

          <Card>
            <h2 className="text-2xl font-semibold mb-6 text-text">Acceptable Use</h2>
            
            <div className="space-y-4 text-muted">
              <h3 className="text-lg font-semibold mb-3 text-text">Permitted Uses</h3>
              <p>
                You may use our platform for lawful purposes in accordance with these Terms, 
                including creating NFT collections, verifying ownership, and accessing real-world 
                benefits tied to your NFTs.
              </p>
              
              <h3 className="text-lg font-semibold mb-3 text-text">Prohibited Activities</h3>
              <p>You agree not to:</p>
              <ul className="space-y-2 text-sm">
                <li>• Use the platform for illegal activities or fraudulent purposes</li>
                <li>• Attempt to circumvent security measures or access controls</li>
                <li>• Create fake or misleading collections or verifications</li>
                <li>• Interfere with or disrupt the platform's operation</li>
                <li>• Use automated tools to access the platform without permission</li>
                <li>• Violate any applicable laws or regulations</li>
                <li>• Infringe on intellectual property rights of others</li>
                <li>• Upload malicious code or attempt to hack the platform</li>
              </ul>
            </div>
          </Card>

          <Card>
            <h2 className="text-2xl font-semibold mb-6 text-text">NFTs and Digital Assets</h2>
            
            <div className="space-y-4 text-muted">
              <h3 className="text-lg font-semibold mb-3 text-text">Ownership and Rights</h3>
              <p>
                When you create or purchase NFTs through our platform, you own the blockchain record 
                of that NFT. However, ownership of an NFT does not necessarily convey copyright or 
                other intellectual property rights in the underlying content.
              </p>
              
              <h3 className="text-lg font-semibold mb-3 text-text">Platform Role</h3>
              <p>
                We provide tools and infrastructure for NFT creation and verification. We do not 
                create, own, or control the NFTs themselves. Collection creators are responsible 
                for their NFT content and metadata.
              </p>
              
              <h3 className="text-lg font-semibold mb-3 text-text">Risks</h3>
              <p>
                NFTs and blockchain technologies involve inherent risks, including but not limited to:
              </p>
              <ul className="space-y-2 text-sm">
                <li>• Market volatility and potential loss of value</li>
                <li>• Smart contract vulnerabilities or bugs</li>
                <li>• Blockchain network congestion or failure</li>
                <li>• Regulatory changes affecting digital assets</li>
              </ul>
            </div>
          </Card>

          <Card>
            <h2 className="text-2xl font-semibold mb-6 text-text">Fees and Payments</h2>
            
            <div className="space-y-4 text-muted">
              <h3 className="text-lg font-semibold mb-3 text-text">Platform Fees</h3>
              <p>
                We may charge fees for certain platform features, including collection creation, 
                marketplace transactions, and premium verification services. All fees will be 
                clearly disclosed before you incur them.
              </p>
              
              <h3 className="text-lg font-semibold mb-3 text-text">Blockchain Fees</h3>
              <p>
                You are responsible for all blockchain transaction fees (gas fees) required to 
                interact with the Conflux Network. These fees are paid directly to the network 
                and are not controlled by us.
              </p>
              
              <h3 className="text-lg font-semibold mb-3 text-text">Refunds</h3>
              <p>
                Due to the immutable nature of blockchain transactions, fees paid for completed 
                transactions are generally non-refundable. We may provide refunds at our discretion 
                for failed transactions or service errors.
              </p>
            </div>
          </Card>

          <Card>
            <h2 className="text-2xl font-semibold mb-6 text-text">Intellectual Property</h2>
            
            <div className="space-y-4 text-muted">
              <h3 className="text-lg font-semibold mb-3 text-text">Platform Content</h3>
              <p>
                The OWNERSHIP platform, including its design, code, features, and documentation, 
                is owned by MBP Enterprises and protected by intellectual property laws. You may 
                not copy, modify, or distribute our platform content without permission.
              </p>
              
              <h3 className="text-lg font-semibold mb-3 text-text">User Content</h3>
              <p>
                You retain ownership of content you create or upload to the platform. By using 
                our service, you grant us a limited license to use, display, and distribute your 
                content as necessary to provide the platform services.
              </p>
              
              <h3 className="text-lg font-semibold mb-3 text-text">Third-Party Content</h3>
              <p>
                You are responsible for ensuring you have the necessary rights to use any third-party 
                content in your NFT collections. We do not verify the intellectual property status 
                of user-generated content.
              </p>
            </div>
          </Card>

          <Card>
            <h2 className="text-2xl font-semibold mb-6 text-text">Privacy and Data</h2>
            
            <div className="space-y-4 text-muted">
              <p>
                Our collection and use of personal information is governed by our Privacy Policy. 
                By using the platform, you consent to the collection and use of information as 
                described in our Privacy Policy.
              </p>
              
              <h3 className="text-lg font-semibold mb-3 text-text">Blockchain Data</h3>
              <p>
                Information recorded on the Conflux blockchain is public and permanent. This includes 
                wallet addresses, transaction data, and NFT ownership records. We cannot modify or 
                delete blockchain data.
              </p>
            </div>
          </Card>

          <Card>
            <h2 className="text-2xl font-semibold mb-6 text-text">Disclaimers</h2>
            
            <div className="space-y-4 text-muted">
              <h3 className="text-lg font-semibold mb-3 text-text">Service Availability</h3>
              <p>
                We provide the platform on an "as is" and "as available" basis. We do not guarantee 
                continuous, uninterrupted access to the platform and may experience downtime for 
                maintenance or other reasons.
              </p>
              
              <h3 className="text-lg font-semibold mb-3 text-text">No Warranties</h3>
              <p>
                To the fullest extent permitted by law, we disclaim all warranties, express or implied, 
                including warranties of merchantability, fitness for a particular purpose, and 
                non-infringement.
              </p>
              
              <h3 className="text-lg font-semibold mb-3 text-text">Third-Party Services</h3>
              <p>
                Our platform may integrate with third-party services, including wallets, blockchain 
                networks, and external APIs. We are not responsible for the availability, accuracy, 
                or reliability of these third-party services.
              </p>
            </div>
          </Card>

          <Card>
            <h2 className="text-2xl font-semibold mb-6 text-text">Limitation of Liability</h2>
            
            <div className="space-y-4 text-muted">
              <p>
                To the maximum extent permitted by applicable law, MBP Enterprises shall not be liable 
                for any indirect, incidental, special, consequential, or punitive damages, including 
                without limitation, loss of profits, data, use, goodwill, or other intangible losses.
              </p>
              
              <p>
                Our total liability to you for all claims arising from or relating to the platform 
                shall not exceed the amount you paid us in the twelve months prior to the claim.
              </p>
              
              <h3 className="text-lg font-semibold mb-3 text-text">Force Majeure</h3>
              <p>
                We shall not be liable for any failure or delay in performance due to circumstances 
                beyond our reasonable control, including blockchain network failures, natural disasters, 
                or government actions.
              </p>
            </div>
          </Card>

          <Card>
            <h2 className="text-2xl font-semibold mb-6 text-text">Termination</h2>
            
            <div className="space-y-4 text-muted">
              <h3 className="text-lg font-semibold mb-3 text-text">By You</h3>
              <p>
                You may stop using the platform at any time. You can disconnect your wallet and 
                cease using our services without notice.
              </p>
              
              <h3 className="text-lg font-semibold mb-3 text-text">By Us</h3>
              <p>
                We may suspend or terminate your access to the platform at any time for violations 
                of these Terms, illegal activity, or other reasons at our discretion. We will provide 
                reasonable notice when possible.
              </p>
              
              <h3 className="text-lg font-semibold mb-3 text-text">Effect of Termination</h3>
              <p>
                Upon termination, your right to use the platform ceases immediately. However, your 
                NFTs and blockchain records remain unaffected, as we do not control them.
              </p>
            </div>
          </Card>

          <Card>
            <h2 className="text-2xl font-semibold mb-6 text-text">Governing Law</h2>
            
            <div className="space-y-4 text-muted">
              <p>
                These Terms shall be governed by and construed in accordance with the laws of the 
                jurisdiction where MBP Enterprises is incorporated, without regard to conflict of 
                law principles.
              </p>
              
              <p>
                Any disputes arising from these Terms or your use of the platform shall be resolved 
                through binding arbitration in accordance with applicable arbitration rules.
              </p>
            </div>
          </Card>

          <Card>
            <h2 className="text-2xl font-semibold mb-6 text-text">Changes to Terms</h2>
            
            <div className="space-y-4 text-muted">
              <p>
                We reserve the right to modify these Terms at any time. Changes will be posted on 
                this page with an updated "Last modified" date. For material changes, we will:
              </p>
              
              <ul className="space-y-2 text-sm">
                <li>• Provide at least 30 days advance notice</li>
                <li>• Send notification via email (if provided)</li>
                <li>• Display prominent notice on the platform</li>
              </ul>
              
              <p>
                Your continued use of the platform after changes take effect constitutes acceptance 
                of the modified Terms.
              </p>
            </div>
          </Card>

          <Card>
            <h2 className="text-2xl font-semibold mb-6 text-text">Contact Information</h2>
            
            <div className="space-y-4 text-muted">
              <p>
                If you have questions about these Terms, please contact us:
              </p>
              
              <div className="bg-surface border border-border rounded-xl p-4 text-sm">
                <div><strong className="text-text">Email:</strong> legal@ownership.app</div>
                <div><strong className="text-text">Address:</strong> MBP Enterprises Legal Department</div>
                <div><strong className="text-text">Response Time:</strong> Within 5 business days</div>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="text-2xl font-semibold mb-6 text-text">Severability</h2>
            
            <div className="space-y-4 text-muted">
              <p>
                If any provision of these Terms is found to be unenforceable or invalid, that provision 
                will be limited or eliminated to the minimum extent necessary so that the remaining 
                Terms will otherwise remain in full force and effect.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TermsOfServicePage;