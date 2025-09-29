import { ethers } from 'ethers';
import { CONTRACTS, getCurrentContracts, getCurrentNetwork } from '../config/contracts';
import FluxSubABI from '../../abi/FluxSub.json';
import FluxSubFactoryABI from '../../abi/FluxSubFactory.json';

export interface SubscriptionService {
  id: number;
  merchant: string;
  name: string;
  description: string;
  amount: string;
  period: number;
  active: boolean;
  createdAt: number;
  totalSubscribers: number;
}

export interface UserSubscription {
  userSubscriptionId: number; // The unique ID for this user's subscription instance
  subscriptionId: number; // The service ID this subscription is for
  user: string;
  merchant: string;
  amount: string;
  period: number;
  nextCharge: number;
  balance: string;
  active: boolean;
  paused: boolean;
  subscribedAt: number;
  lastCharged: number;
}

export interface SubscriptionMember {
  address: string;
  subscribedAt: number;
  balance: string;
  active: boolean;
}

class ContractService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;
  private fluxSubContract: ethers.Contract | null = null;
  private fluxSubFactoryContract: ethers.BrowserProvider | null = null;

  async initialize(provider: ethers.BrowserProvider) {
    console.log('ContractService.initialize called with:', provider);
    this.provider = provider;
    this.signer = await provider.getSigner();
    console.log('Signer obtained:', this.signer);
    
    // Check network first
    const currentNetwork = await provider.getNetwork();
    const expectedNetwork = getCurrentNetwork();
    console.log('Current network:', currentNetwork);
    console.log('Expected network:', expectedNetwork);
    
    // Accept both Conflux Core (1029) and Conflux eSpace (1030)
    const validChainIds = [1029, 1030];
    const currentChainId = Number(currentNetwork.chainId);
    
    if (!validChainIds.includes(currentChainId)) {
      const error = `Network mismatch! Expected Conflux network (Chain ID: 1029 or 1030), but connected to Chain ID: ${currentChainId}. Please switch your wallet to a Conflux network.`;
      console.error(error);
      throw new Error(error);
    }
    
    console.log(`✅ Connected to valid Conflux network (Chain ID: ${currentChainId})`);
    
    const contracts = getCurrentContracts();
    console.log('Current contracts:', contracts);
    console.log('Current network:', expectedNetwork);
    
    // Initialize FluxSub contract
    this.fluxSubContract = new ethers.Contract(
      contracts.FluxSub,
      FluxSubABI,
      this.signer
    );
    console.log('FluxSub contract initialized:', this.fluxSubContract);
    
    // Test contract connection
    try {
      const isPaused = await this.fluxSubContract.paused();
      console.log('Contract connection test successful. Contract paused:', isPaused);
    } catch (error) {
      console.error('Contract connection test failed:', error);
      throw new Error(`Failed to connect to contract at ${contracts.FluxSub}. Please check the contract address and network.`);
    }

    // Initialize FluxSubFactory contract
    this.fluxSubFactoryContract = new ethers.Contract(
      contracts.FluxSubFactory,
      FluxSubFactoryABI,
      this.signer
    ) as any;
    console.log('FluxSubFactory contract initialized:', this.fluxSubFactoryContract);

    console.log('✅ ContractService initialized successfully with network:', currentNetwork.name);
  }

  // Check if service is initialized
  private checkInitialized() {
    if (!this.provider || !this.signer || !this.fluxSubContract) {
      throw new Error('ContractService not initialized. Please connect wallet first.');
    }
  }

  // Check if service is initialized (public method)
  isInitialized(): boolean {
    const initialized = !!(this.provider && this.signer && this.fluxSubContract);
    console.log('ContractService.isInitialized check:', { 
      provider: !!this.provider, 
      signer: !!this.signer, 
      fluxSubContract: !!this.fluxSubContract,
      result: initialized 
    });
    return initialized;
  }

  // Create a new subscription service
  async createSubscriptionService(
    name: string,
    description: string,
    amount: string,
    period: number
  ): Promise<number> {
    this.checkInitialized();
    
    try {
      const amountWei = ethers.parseEther(amount);
      
      const tx = await this.fluxSubContract!.createSubscriptionService(
        name,
        description,
        amountWei,
        period
      );
      
      console.log('Transaction sent:', tx.hash);
      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt);
      
      // Get the subscription ID from the event
      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = this.fluxSubContract!.interface.parseLog(log); 
          return parsed?.name === 'SubscriptionCreated';
        } catch {
          return false;
        }
      });
      
      if (event) {
        const parsed = this.fluxSubContract!.interface.parseLog(event);
        return Number(parsed!.args.subscriptionId);
      }
      
      throw new Error('Could not find subscription ID in transaction receipt');
    } catch (error) {
      console.error('Error creating subscription service:', error);
      throw error;
    }
  }

  // Subscribe to a service
  async subscribe(subscriptionId: number, initialFunding: string): Promise<number> {
    this.checkInitialized();
    
    try {
      // initialFunding is already in wei format, don't convert it again
      const fundingWei = BigInt(initialFunding);
      
      console.log('ContractService.subscribe called with:', { subscriptionId, initialFunding, fundingWei });
      
      const tx = await this.fluxSubContract!.subscribe(
        subscriptionId,
        fundingWei,
        { value: fundingWei }
      );
      
      console.log('Subscription transaction sent:', tx.hash);
      const receipt = await tx.wait();
      console.log('Subscription confirmed:', receipt);
      
      // Get the user subscription ID from the event
      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = this.fluxSubContract!.interface.parseLog(log); 
          return parsed?.name === 'UserSubscribed';
        } catch {
          return false;
        }
      });
      
      if (event) {
        const parsed = this.fluxSubContract!.interface.parseLog(event);
        return Number(parsed!.args.subscriptionId);
      }
      
      throw new Error('Could not find user subscription ID in transaction receipt');
    } catch (error) {
      console.error('Error subscribing:', error);
      throw error;
    }
  }

  // Fund a subscription
  async fundSubscription(userSubscriptionId: number, amount: string): Promise<void> {
    this.checkInitialized();
    
    try {
      const amountWei = ethers.parseEther(amount);
      
      const tx = await this.fluxSubContract!.fundSubscription(
        userSubscriptionId,
        { value: amountWei }
      );
      
      console.log('Funding transaction sent:', tx.hash);
      await tx.wait();
      console.log('Funding confirmed');
    } catch (error) {
      console.error('Error funding subscription:', error);
      throw error;
    }
  }

  // Cancel a subscription
  async cancelSubscription(userSubscriptionId: number): Promise<void> {
    this.checkInitialized();
    
    try {
      const tx = await this.fluxSubContract!.cancelSubscription(userSubscriptionId);
      
      console.log('Cancellation transaction sent:', tx.hash);
      await tx.wait();
      console.log('Cancellation confirmed');
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw error;
    }
  }

  // Charge a subscription (merchant only)
  async chargeSubscription(userSubscriptionId: number): Promise<void> {
    this.checkInitialized();
    
    try {
      const tx = await this.fluxSubContract!.chargeSubscription(userSubscriptionId);
      
      console.log('Charge transaction sent:', tx.hash);
      await tx.wait();
      console.log('Charge confirmed');
    } catch (error) {
      console.error('Error charging subscription:', error);
      throw error;
    }
  }

  // Get wallet balance
  async getBalance(address: string): Promise<string> {
    this.checkInitialized();
    
    try {
      const balance = await this.provider!.getBalance(address);
      return balance.toString();
    } catch (error) {
      console.error('Error getting balance:', error);
      throw error;
    }
  }

  // Get subscription service details
  async getSubscriptionService(subscriptionId: number): Promise<SubscriptionService> {
    this.checkInitialized();
    
    try {
      const service = await this.fluxSubContract!.getSubscriptionService(subscriptionId);
      
      return {
        id: Number(service.id),
        merchant: service.merchant,
        name: service.name,
        description: service.description,
        amount: ethers.formatEther(service.amount),
        period: Number(service.period),
        active: service.active,
        createdAt: Number(service.createdAt),
        totalSubscribers: Number(service.totalSubscribers)
      };
    } catch (error) {
      console.error('Error getting subscription service:', error);
      throw error;
    }
  }

  // Get user subscription details
  async getUserSubscription(userSubscriptionId: number): Promise<UserSubscription> {
    this.checkInitialized();
    
    try {
      const subscription = await this.fluxSubContract!.getUserSubscription(userSubscriptionId);
      
      return {
        userSubscriptionId: userSubscriptionId,
        subscriptionId: Number(subscription.subscriptionId),
        user: subscription.user,
        merchant: subscription.merchant,
        amount: ethers.formatEther(subscription.amount),
        period: Number(subscription.period),
        nextCharge: Number(subscription.nextCharge),
        balance: ethers.formatEther(subscription.balance),
        active: subscription.active,
        paused: subscription.paused,
        subscribedAt: Number(subscription.subscribedAt),
        lastCharged: Number(subscription.lastCharged)
      };
    } catch (error) {
      console.error('Error getting user subscription:', error);
      throw error;
    }
  }

  // Get all user subscriptions
  async getUserSubscriptions(userAddress: string): Promise<UserSubscription[]> {
    this.checkInitialized();
    
    try {
      console.log('Getting user subscriptions for address:', userAddress);
      const subscriptionIds = await this.fluxSubContract!.getUserSubscriptions(userAddress);
      console.log('Raw subscription IDs from contract:', subscriptionIds);
      
      // Handle case where user has no subscriptions
      if (!subscriptionIds || subscriptionIds.length === 0) {
        console.log('No subscriptions found for user');
        return [];
      }
      
      const subscriptions: UserSubscription[] = [];
      for (const id of subscriptionIds) {
        try {
          const subscription = await this.getUserSubscription(Number(id));
          // Add the userSubscriptionId to the subscription object
          subscription.userSubscriptionId = Number(id);
          subscriptions.push(subscription);
        } catch (error) {
          console.warn(`Could not fetch subscription ${id}:`, error);
        }
      }
      
      console.log('Successfully loaded subscriptions:', subscriptions);
      return subscriptions;
    } catch (error: any) {
      console.error('Error getting user subscriptions:', error);
      
      // Provide more specific error messages
      if (error.message?.includes('missing revert data')) {
        throw new Error('Contract call failed - this might be due to network issues or the contract not being properly deployed. Please check your network connection and try again.');
      } else if (error.message?.includes('CALL_EXCEPTION')) {
        throw new Error('Contract call exception - please ensure you are connected to the correct Conflux network and the contract is deployed.');
      } else {
        throw new Error(`Failed to load subscriptions: ${error.message || 'Unknown error'}`);
      }
    }
  }

  // Get merchant subscriptions
  async getMerchantSubscriptions(merchantAddress: string): Promise<SubscriptionService[]> {
    this.checkInitialized();
    
    try {
      const subscriptionIds = await this.fluxSubContract!.getMerchantSubscriptions(merchantAddress);
      
      const services: SubscriptionService[] = [];
      for (const id of subscriptionIds) {
        try {
          const service = await this.getSubscriptionService(Number(id));
          services.push(service);
        } catch (error) {
          console.warn(`Could not fetch service ${id}:`, error);
        }
      }
      
      return services;
    } catch (error) {
      console.error('Error getting merchant subscriptions:', error);
      throw error;
    }
  }

  // Get subscription members
  async getSubscriptionMembers(subscriptionId: number): Promise<SubscriptionMember[]> {
    this.checkInitialized();
    
    try {
      const [members, subscribedAt, balances, active] = await this.fluxSubContract!.getSubscriptionMembersWithDetails(subscriptionId);
      
      return members.map((address: string, index: number) => ({
        address,
        subscribedAt: Number(subscribedAt[index]),
        balance: ethers.formatEther(balances[index]),
        active: active[index]
      }));
    } catch (error) {
      console.error('Error getting subscription members:', error);
      throw error;
    }
  }

  // Utility functions
  formatPeriod(seconds: number): string {
    if (seconds === 86400) return 'Daily';
    if (seconds === 604800) return 'Weekly';
    if (seconds === 2592000) return 'Monthly';
    if (seconds === 7776000) return 'Quarterly';
    if (seconds === 31536000) return 'Yearly';
    return `${seconds}s`;
  }

  formatAddress(address: string): string {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  formatDate(timestamp: number): string {
    return new Date(timestamp * 1000).toLocaleDateString();
  }
}

// Export singleton instance
export const contractService = new ContractService();
export default contractService;
