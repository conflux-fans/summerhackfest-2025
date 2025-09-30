import React, { useState } from 'react';
import Button from '../components/Button';
import Card from '../components/Card';
import Stepper from '../components/Stepper';
import FormField from '../components/FormField';

interface CollectionData {
  name: string;
  symbol: string;
  description: string;
  royalty: string;
  baseUri: string;
  category: string;
  gateType: string;
  validityStart: string;
  validityEnd: string;
  transferable: boolean;
  revocationPolicy: string;
  supply: string;
  supplyType: string;
  price: string;
  currency: string;
  allowlist: string;
  perWalletLimit: string;
}

const CreatePage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<CollectionData>({
    name: '',
    symbol: '',
    description: '',
    royalty: '5',
    baseUri: '',
    category: '',
    gateType: 'hold-one',
    validityStart: '',
    validityEnd: '',
    transferable: true,
    revocationPolicy: 'none',
    supply: '',
    supplyType: 'fixed',
    price: '0',
    currency: 'CFX',
    allowlist: '',
    perWalletLimit: '10'
  });

  const steps = ['Collection Details', 'Access Rules', 'Mint Config', 'Review & Deploy'];

  const handleInputChange = (field: keyof CollectionData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <FormField label="Collection Name" required>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="form-input"
                placeholder="My NFT Collection"
              />
            </FormField>

            <FormField label="Symbol" required>
              <input
                type="text"
                value={formData.symbol}
                onChange={(e) => handleInputChange('symbol', e.target.value)}
                className="form-select"
                placeholder="MNC"
              />
            </FormField>

            <FormField label="Description" required>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="form-textarea"
                placeholder="Describe your collection and its real-world utility..."
              />
            </FormField>

            <FormField label="Royalty Percentage" helper="Percentage of secondary sales">
              <input
                type="number"
                value={formData.royalty}
                onChange={(e) => handleInputChange('royalty', e.target.value)}
                min="0"
                max="10"
                className="form-select"
              />
            </FormField>

            <FormField label="Base URI" helper="IPFS or server URL for metadata">
              <input
                type="text"
                value={formData.baseUri}
                onChange={(e) => handleInputChange('baseUri', e.target.value)}
                className="form-select"
                placeholder="ipfs://..."
              />
            </FormField>

            <FormField label="Category">
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="form-select"
              >
                <option value="">Select category</option>
                <option value="event">Event Access</option>
                <option value="membership">Membership</option>
                <option value="space">Premium Space</option>
                <option value="rwa">Real World Asset</option>
                <option value="other">Other</option>
              </select>
            </FormField>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <FormField label="Gate Type" required>
              <select
                value={formData.gateType}
                onChange={(e) => handleInputChange('gateType', e.target.value)}
                className="form-select"
              >
                <option value="hold-one">Hold ≥1 token</option>
                <option value="specific-trait">Specific trait required</option>
                <option value="min-rarity">Minimum rarity level</option>
              </select>
            </FormField>

            <div className="grid grid-2 gap-6">
              <FormField label="Validity Start">
                <input
                  type="datetime-local"
                  value={formData.validityStart}
                  onChange={(e) => handleInputChange('validityStart', e.target.value)}
                  className="form-select"
                />
              </FormField>

              <FormField label="Validity End">
                <input
                  type="datetime-local"
                  value={formData.validityEnd}
                  onChange={(e) => handleInputChange('validityEnd', e.target.value)}
                  className="form-select"
                />
              </FormField>
            </div>

            <FormField label="Transferability">
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={formData.transferable}
                    onChange={() => handleInputChange('transferable', true)}
                    className="mr-2"
                  />
                  <span className="text-text">Transferable</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={!formData.transferable}
                    onChange={() => handleInputChange('transferable', false)}
                    className="mr-2"
                  />
                  <span className="text-text">Soul-bound</span>
                </label>
              </div>
            </FormField>

            <FormField label="Revocation Policy">
              <select
                value={formData.revocationPolicy}
                onChange={(e) => handleInputChange('revocationPolicy', e.target.value)}
                className="form-select"
              >
                <option value="none">No revocation</option>
                <option value="creator">Creator can revoke</option>
                <option value="time-based">Time-based expiry</option>
                <option value="condition-based">Condition-based</option>
              </select>
            </FormField>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <FormField label="Supply Type" required>
              <select
                value={formData.supplyType}
                onChange={(e) => handleInputChange('supplyType', e.target.value)}
                className="form-select"
              >
                <option value="fixed">Fixed Supply</option>
                <option value="dynamic">Dynamic Supply</option>
              </select>
            </FormField>

            <FormField label="Total Supply" required>
              <input
                type="number"
                value={formData.supply}
                onChange={(e) => handleInputChange('supply', e.target.value)}
                min="1"
                className="form-select"
                placeholder="1000"
              />
            </FormField>

            <div className="grid grid-2 gap-6">
              <FormField label="Price" required>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  min="0"
                  step="0.001"
                  className="form-select"
                  placeholder="0.1"
                />
              </FormField>

              <FormField label="Currency">
                <select
                  value={formData.currency}
                  onChange={(e) => handleInputChange('currency', e.target.value)}
                  className="form-select"
                >
                  <option value="CFX">CFX</option>
                  <option value="USDT">USDT</option>
                  <option value="USDC">USDC</option>
                </select>
              </FormField>
            </div>

            <FormField label="Per-Wallet Limit">
              <input
                type="number"
                value={formData.perWalletLimit}
                onChange={(e) => handleInputChange('perWalletLimit', e.target.value)}
                min="1"
                className="form-select"
              />
            </FormField>

            <FormField label="Allowlist" helper="Enter wallet addresses, one per line">
              <textarea
                value={formData.allowlist}
                onChange={(e) => handleInputChange('allowlist', e.target.value)}
                rows={6}
                className="form-select"
                placeholder="0x1234...&#10;0x5678...&#10;0x9abc..."
              />
            </FormField>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold mb-6 text-text">Review & Deploy</h3>
            
            <Card>
              <h4 className="text-lg font-semibold mb-4 text-text">Collection Details</h4>
              <div className="grid grid-2 gap-4 text-sm">
                <div>
                  <span className="text-muted">Name:</span>
                  <span className="text-text ml-2">{formData.name}</span>
                </div>
                <div>
                  <span className="text-muted">Symbol:</span>
                  <span className="text-text ml-2">{formData.symbol}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-muted">Description:</span>
                  <p className="text-text mt-1">{formData.description}</p>
                </div>
              </div>
            </Card>

            <Card>
              <h4 className="text-lg font-semibold mb-4 text-text">Access Rules</h4>
              <div className="grid grid-2 gap-4 text-sm">
                <div>
                  <span className="text-muted">Gate Type:</span>
                  <span className="text-text ml-2">{formData.gateType}</span>
                </div>
                <div>
                  <span className="text-muted">Transferable:</span>
                  <span className="text-text ml-2">{formData.transferable ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </Card>

            <Card>
              <h4 className="text-lg font-semibold mb-4 text-text">Mint Configuration</h4>
              <div className="grid grid-2 gap-4 text-sm">
                <div>
                  <span className="text-muted">Supply:</span>
                  <span className="text-text ml-2">{formData.supply}</span>
                </div>
                <div>
                  <span className="text-muted">Price:</span>
                  <span className="text-text ml-2">{formData.price} {formData.currency}</span>
                </div>
              </div>
            </Card>

            <div className="bg-surface border border-border rounded-xl p-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted">Estimated Gas Cost:</span>
                <span className="text-text">~0.02 CFX</span>
              </div>
            </div>

            <Button variant="primary" size="lg" className="w-full">
              Deploy Contract
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="py-3xl">
      <div className="container max-w-4xl">
        <div className="text-center mb-3xl">
          <h1 className="mb-lg">Create a collection for real-world access.</h1>
          <p className="text-xl text-muted">
            Define metadata, supply, and verification rules. Mint on Conflux.
          </p>
        </div>

        <Card>
          <Stepper steps={steps} currentStep={currentStep} />
          
          <div className="min-h-[600px]">
            {renderStepContent()}
          </div>

          <div className="flex justify-between pt-8 border-t border-border">
            <Button
              variant="secondary"
              onClick={prevStep}
              disabled={currentStep === 0}
            >
              Previous
            </Button>
            
            <Button
              variant="primary"
              onClick={nextStep}
              disabled={currentStep === steps.length - 1}
            >
              Next
            </Button>
          </div>
        </Card>

        {currentStep === steps.length - 1 && (
          <Card className="mt-8">
            <h3 className="text-lg font-semibold mb-4 text-text">Post-Deploy Actions</h3>
            <div className="flex flex-wrap gap-4">
              <Button variant="primary">Mint Now</Button>
              <Button variant="secondary">Go to Dashboard</Button>
              <Button variant="ghost">Share Mint Link</Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CreatePage;