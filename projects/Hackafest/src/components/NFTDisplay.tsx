import React, { useState } from 'react';
import Image from 'next/image';
import Card from './Card';
import Button from './Button';
import styles from './NFTDisplay/NFTDisplay.module.css';

interface NFTDisplayProps {
  nft: {
    id: string;
    tokenId: string;
    name: string;
    description?: string;
    image: string;
    contractAddress: string;
    rarity?: string;
    traits?: Record<string, string>;
    owner?: string;
    verified?: boolean;
  };
  showActions?: boolean;
  onVerify?: () => void;
  onTransfer?: () => void;
  onViewDetails?: () => void;
  className?: string;
}

const NFTDisplay: React.FC<NFTDisplayProps> = ({
  nft,
  showActions = true,
  onVerify,
  onTransfer,
  onViewDetails,
  className = ''
}) => {
  const [imageError, setImageError] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = async () => {
    if (onVerify) {
      setIsVerifying(true);
      try {
        await onVerify();
      } finally {
        setIsVerifying(false);
      }
    }
  };

  return (
    <Card 
      className={`${styles['nft-display']} ${className}`}
      hover
      interactive={!!onViewDetails}
    >
      <div className={styles['nft-image-container']}>
        {!imageError ? (
          <Image
            src={nft.image}
            alt={nft.name}
            width={300}
            height={300}
            className={styles['nft-image']}
            onError={() => setImageError(true)}
            priority
          />
        ) : (
          <div className={styles['nft-image-placeholder']}>
            <div className={styles['nft-image-icon']}>🖼️</div>
            <p className={styles['nft-image-text']}>Image not available</p>
          </div>
        )}
        
        {nft.verified && (
          <div className={styles['nft-verified-badge']}>
            <span className={styles['verified-icon']}>✓</span>
            <span className={styles['verified-text']}>Verified</span>
          </div>
        )}
      </div>

      <div className={styles['nft-content']}>
        <div className={styles['nft-header']}>
          <h3 className={styles['nft-name']}>{nft.name}</h3>
          <div className={styles['nft-token-id']}>#{nft.tokenId}</div>
        </div>

        {nft.description && (
          <p className={styles['nft-description']}>{nft.description}</p>
        )}

        {nft.rarity && (
          <div className={styles['nft-rarity']}>
            <span className={styles['rarity-label']}>Rarity:</span>
            <span className={`${styles['rarity-value']} ${styles[`rarity-${nft.rarity.toLowerCase()}`]}`}>
              {nft.rarity}
            </span>
          </div>
        )}

        {nft.traits && Object.keys(nft.traits).length > 0 && (
          <div className={styles['nft-traits']}>
            <h4 className={styles['traits-title']}>Traits</h4>
            <div className={styles['traits-grid']}>
              {Object.entries(nft.traits).map(([key, value]) => (
                <div key={key} className={styles['trait-item']}>
                  <span className={styles['trait-key']}>{key}</span>
                  <span className={styles['trait-value']}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {nft.owner && (
          <div className={styles['nft-owner']}>
            <span className={styles['owner-label']}>Owner:</span>
            <span className={styles['owner-address']}>
              {nft.owner.slice(0, 6)}...{nft.owner.slice(-4)}
            </span>
          </div>
        )}

        {showActions && (
          <div className={styles['nft-actions']}>
            {onVerify && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleVerify}
                loading={isVerifying}
                className={styles['nft-action-btn']}
              >
                {isVerifying ? 'Verifying...' : 'Verify Ownership'}
              </Button>
            )}
            
            {onTransfer && (
              <Button
                variant="secondary"
                size="sm"
                onClick={onTransfer}
                className={styles['nft-action-btn']}
              >
                Transfer
              </Button>
            )}
            
            {onViewDetails && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onViewDetails}
                className={styles['nft-action-btn']}
              >
                View Details
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default NFTDisplay;
