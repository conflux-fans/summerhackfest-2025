import { useState, useEffect } from 'react';
import { useAccount, useSignMessage, useChainId, useSwitchChain, useSendTransaction } from 'wagmi';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftRight, AlertCircle, CheckCircle2, Info, Wallet, ArrowRight, Zap, Shield, Clock, X, Loader2 } from 'lucide-react';
import { fetchQuote, initiateSwap, checkStatus, useTokenApproval } from '../utils/mesonUtils';
import usdcImg from '../assets/images/currencies/usdc.svg';
import usdtImg from '../assets/images/currencies/usdt.svg';
import ethImg from '../assets/images/currencies/eth.svg';
import baseImg from '../assets/images/networks/base.svg';
import confluxImg from '../assets/images/networks/conflux.svg';
// Network configuration with Meson slug mapping
const NETWORKS = [
  { chainId: 8453, id: 'base', name: 'Base', symbol: 'ETH', color: 'from-blue-500 to-blue-700', slug: 'base', image: baseImg },
  { chainId: 1030, id: 'conflux', name: 'Conflux eSpace', symbol: 'CFX', color: 'from-green-400 to-green-600', slug: 'cfx', image: confluxImg },
];
const TOKENS = [
  { id: 'usdc', name: 'USDC', image: usdcImg }
];
function MesonSwaps() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const currentChain = useChainId();
  const { switchChain } = useSwitchChain();
  const { sendTransaction, data: txHash, isPending: txPending, error: txError } = useSendTransaction();
  const navigate = useNavigate();
  const [fromNetwork, setFromNetwork] = useState(NETWORKS[1]);
  const [toNetwork, setToNetwork] = useState(NETWORKS[0]);
  const [token, setToken] = useState(TOKENS[0]);
  const [amount, setAmount] = useState('10');
  const [debouncedAmount, setDebouncedAmount] = useState('');
  const [quote, setQuote] = useState<any>(null);
  const [swapId, setSwapId] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [approveLoading, setApproveLoading] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [networkModalType, setNetworkModalType] = useState<'from' | 'to' | null>(null);
  const { needsApproval, approve, allowanceRefetch } = useTokenApproval(token.id, fromNetwork.id, amount, address, fromNetwork.chainId);
  const effectiveNeedsApproval = needsApproval && approvalStatus !== 'success';
  const isWrongChain = currentChain !== fromNetwork.chainId;
  const handleSwitchChain = () => {
    switchChain({ chainId: fromNetwork.chainId });
  };
  const handleSwapNetworks = () => {
    const temp = fromNetwork;
    setFromNetwork(toNetwork);
    setToNetwork(temp);
  };
  const handleFetchQuote = async () => {
    if (!debouncedAmount || !address || fromNetwork.slug === toNetwork.slug) {
      setQuote(null);
      return;
    }
    setLoading(true);
    setErrorMessage('');
    setQuote(null);
    try {
      const fromStr = `${fromNetwork.slug}:${token.id}`;
      const toStr = `${toNetwork.slug}:${token.id}`;
      const data = await fetchQuote(fromStr, toStr, debouncedAmount, address);
      setQuote(data);
    } catch (err: any) {
      setErrorMessage(err.message);
      setIsErrorModalOpen(true);
    } finally {
      setLoading(false);
    }
  };
  const handleInitiateSwap = async () => {
    if (!quote || !address || effectiveNeedsApproval) return;
    setLoading(true);
    setErrorMessage('');
    setSwapId('');
    setStatus('');
    try {
      const fromStr = `${fromNetwork.slug}:${token.id}`;
      const toStr = `${toNetwork.slug}:${token.id}`;
      const { swapId, tx } = await initiateSwap(fromStr, toStr, amount, address, signMessageAsync);
      setSwapId(swapId);
      // Send the on-chain transaction to lock the funds (no await for hash)
      sendTransaction({
        to: tx.to as `0x${string}`,
        value: BigInt(tx.value || 0),
        data: tx.data as `0x${string}`,
      });
    } catch (err: any) {
      setErrorMessage(err.message);
      setIsErrorModalOpen(true);
      setSwapId('');
    } finally {
      setLoading(false);
    }
  };
  const handleCheckStatus = async () => {
    if (!swapId) return;
    try {
      const stat = await checkStatus(swapId);
      setStatus(stat);
      console.log('Swap Status:', stat);
    } catch (err) {
      console.error('Status check failed:', err);
    }
  };
  const handleApprove = async () => {
    if (approvalStatus === 'pending') return;
    setApprovalStatus('pending');
    setErrorMessage('');
    setApproveLoading(true);
    try {
      await approve(); // waits until tx mined and refetches allowance
      setApprovalStatus('success');
    } catch (err: any) {
      setApprovalStatus('error');
      setErrorMessage(err.message);
      setIsErrorModalOpen(true);
      setTimeout(() => setApprovalStatus('idle'), 3000);
    } finally {
      setApproveLoading(false);
    }
  };
  const handleSelectNetwork = (selectedNetwork: typeof NETWORKS[0]) => {
    if (networkModalType === 'from') {
      if (selectedNetwork.id === toNetwork.id) {
        handleSwapNetworks();
      } else {
        setFromNetwork(selectedNetwork);
        setToNetwork(NETWORKS.find(n => n.id !== selectedNetwork.id)!);
      }
    } else if (networkModalType === 'to') {
      if (selectedNetwork.id === fromNetwork.id) {
        handleSwapNetworks();
      } else {
        setToNetwork(selectedNetwork);
        setFromNetwork(NETWORKS.find(n => n.id !== selectedNetwork.id)!);
      }
    }
    setNetworkModalType(null);
  };
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedAmount(amount);
    }, 500);
    return () => clearTimeout(timer);
  }, [amount]);
  useEffect(() => {
    handleFetchQuote();
  }, [debouncedAmount, fromNetwork.id, toNetwork.id, token.id, address]);
  useEffect(() => {
    if (swapId) {
      const interval = setInterval(handleCheckStatus, 10000);
      return () => clearInterval(interval);
    }
  }, [swapId]);
  useEffect(() => {
    if (approvalStatus === 'success' && !needsApproval) {
      setApprovalStatus('idle');
    }
  }, [approvalStatus, needsApproval]);
  // Navigate on successful tx hash
  useEffect(() => {
    if (txHash && swapId) {
      setTimeout(() => {
        navigate(`/swap/${txHash}`);   
      }, 3000);
     
    }
  }, [txHash, swapId, navigate]);
  // Handle tx error
  useEffect(() => {
    if (txError) {
      setErrorMessage(txError.message || 'Transaction failed');
      setIsErrorModalOpen(true);
      setSwapId('');
    }
  }, [txError]);
  if (!isConnected) {
    return (
      <div className=" flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 shadow-2xl p-8">
            <div className="flex flex-col items-center space-y-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-xl opacity-50"></div>
                <div className="relative bg-gradient-to-r from-blue-500 to-purple-500 p-5 rounded-full">
                  <Wallet className="w-10 h-10 text-white" />
                </div>
              </div>
              <div className="text-center space-y-3">
                <h2 className="text-3xl font-bold text-white">Connect Wallet</h2>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Connect your wallet to access lightning-fast cross-chain swaps powered by Meson Protocol
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className=" py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8 space-y-4">
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 py-2">
            Cross-Chain Bridge
          </h1>
          <p className="text-gray-300 text-lg">Powered by Meson Protocol</p>
          {/* Feature Pills */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-white text-sm font-medium">Lightning Fast</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
              <Shield className="w-4 h-4 text-green-400" />
              <span className="text-white text-sm font-medium">Secure</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
              <Clock className="w-4 h-4 text-blue-400" />
              <span className="text-white text-sm font-medium">1-3 Minutes</span>
            </div>
          </div>
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Swap Card */}
          <div className="lg:col-span-2">
            <div className="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
              <div className="p-8 space-y-6">
                {/* Token Selection */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-300 uppercase tracking-wide">Select Token</label>
                  <button
                    onClick={() => setIsTokenModalOpen(true)}
                    className="w-full flex items-center justify-between px-6 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-2xl text-white font-semibold focus:outline-none focus:border-white/40 transition-all"
                  >
                    <div className="flex items-center space-x-3">
                      <img src={token.image} alt={token.name} className="w-8 h-8" />
                      <span>{token.name}</span>
                    </div>
                    <ArrowLeftRight className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
                {/* Send ---- Receive */}
                <div className="flex flex-col lg:flex-row items-stretch space-y-6 lg:space-y-0 lg:space-x-4">
                  <div className="w-full lg:flex-1 space-y-3">
                    {/* From Network */}
                    <label className="block text-sm font-semibold text-gray-300 uppercase tracking-wide">Send From</label>
                    <button
                      onClick={() => setNetworkModalType('from')}
                      className="w-full flex items-center justify-between px-6 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-2xl text-white font-semibold focus:outline-none focus:border-white/40 transition-all"
                    >
                      <div className="flex items-center space-x-3">
                        <img src={fromNetwork.image} alt={fromNetwork.name} className="w-8 h-8" />
                        <span>{fromNetwork.name}</span>
                      </div>
                      <ArrowLeftRight className="w-5 h-5 text-gray-400" />
                    </button>
                    {/* Amount Input */}
                    <div className="space-y-3">
                      <label className="block text-sm font-semibold text-gray-300 uppercase tracking-wide">Amount</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="0.00"
                          className="w-full px-6 py-5 bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-2xl text-white text-2xl font-bold placeholder-gray-400 focus:outline-none focus:border-white/40 transition-all"
                        />
                        <div className="absolute right-6 top-1/2 -translate-y-1/2">
                          <span className="text-gray-300 font-semibold text-lg">{token.name}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Swap Direction Button */}
                  <button
                    onClick={handleSwapNetworks}
                    className="relative group bg-gradient-to-r from-blue-500 to-purple-500 p-4 rounded-full hover:scale-110 transition-all duration-300 self-center"
                  >
                    <ArrowLeftRight className="w-6 h-6 text-white" />
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                  </button>
                  <div className="w-full lg:flex-1 space-y-3">
                    {/* To Network */}
                    <label className="block text-sm font-semibold text-gray-300 uppercase tracking-wide">Receive To</label>
                    <button
                      onClick={() => setNetworkModalType('to')}
                      className="w-full flex items-center justify-between px-6 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-2xl text-white font-semibold focus:outline-none focus:border-white/40 transition-all"
                    >
                      <div className="flex items-center space-x-3">
                        <img src={toNetwork.image} alt={toNetwork.name} className="w-8 h-8" />
                        <span>{toNetwork.name}</span>
                      </div>
                      <ArrowLeftRight className="w-5 h-5 text-gray-400" />
                    </button>
                    {/* Estimated Receive */}
                    {quote && (
                      <div className="space-y-3">
                        <label className="block text-sm font-semibold text-gray-300 uppercase tracking-wide">You Receive (est.)</label>
                        <div className="relative">
                          <div className="w-full px-6 py-5 bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-2xl text-white text-2xl font-bold">
                            {(parseFloat(amount) - parseFloat(quote.result.totalFee)).toFixed(2)}
                          </div>
                          <div className="absolute right-6 top-1/2 -translate-y-1/2">
                            <span className="text-gray-300 font-semibold text-lg">{token.name}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {/* Action Buttons */}
                <div className="space-y-3 pt-4">
                  {isWrongChain ? (
                    <button
                      onClick={handleSwitchChain}
                      className="w-full relative group bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-white font-bold py-5 rounded-2xl transition-all duration-300 shadow-md"
                    >
                      <span className="relative z-10">Switch to {fromNetwork.name}</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-600 to-yellow-500 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                    </button>
                  ) : (
                    <>
                      {approvalStatus === 'success' && (
                        <div className="flex items-center justify-center py-3 text-green-400 text-sm font-medium">
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          Approved and ready to swap
                        </div>
                      )}
                      {effectiveNeedsApproval && (
                        <button
                          onClick={handleApprove}
                          disabled={approvalStatus === 'pending' || loading}
                          className="w-full relative group bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 disabled:from-gray-600 disabled:to-gray-500 text-white font-bold py-5 rounded-2xl transition-all duration-300 disabled:cursor-not-allowed"
                        >
                          <span className="relative z-10 flex items-center justify-center">
                            {approvalStatus === 'pending' ? (
                              <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Confirming transaction...
                              </>
                            ) : approvalStatus === 'error' ? (
                              <>
                                <AlertCircle className="w-5 h-5 mr-2 text-red-400" />
                                Approve {token.name} (Retry)
                              </>
                            ) : (
                              'Approve ' + token.name
                            )}
                          </span>
                          <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-orange-500 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                        </button>
                      )}
                      <button
                        onClick={handleInitiateSwap}
                        disabled={loading || txPending || !quote || effectiveNeedsApproval}
                        className="w-full relative group bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-gray-600 disabled:to-gray-500 text-white font-bold py-5 rounded-2xl transition-all duration-300 disabled:cursor-not-allowed"
                      >
                        <span className="relative z-10 flex items-center justify-center">
                          {loading ? (
                            <>
                              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                              Initiating Swap...
                            </>
                          ) : txPending ? (
                            <>
                              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                              Confirming Transaction...
                            </>
                          ) : 'Initiate Swap'}
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* Info Sidebar */}
          <div className="space-y-6">
            {/* Quote Details */}
            <div className="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 shadow-2xl p-6 space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <Info className="w-5 h-5" />
                <span>Swap Details</span>
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">Liqudity provider Fee</span>
                  <span className="text-white font-medium">{quote ? parseFloat(quote.result.lpFee) : '-'} {token.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">Protocol Fee</span>
                  <span className="text-white font-medium">{quote ? parseFloat(quote.result.serviceFee) : '-'} {token.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">Total Fee</span>
                  <span className="text-white font-medium">{quote ? parseFloat(quote.result.totalFee) : '-'} {token.name}</span>
                </div>
              </div>
            </div>
            {/* Swap Status */}
            {swapId && (
              <div className="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 shadow-2xl p-6 space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                  <Info className="w-5 h-5" />
                  <span>Swap Status</span>
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 text-sm">Swap ID</span>
                    <span className="text-white font-mono text-sm">{swapId}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 text-sm">Status</span>
                    <span className="text-white font-medium">{status || 'Checking...'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Token Selection Modal */}
        {isTokenModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-2xl p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white font-bold text-lg">Select Token</h3>
                <button onClick={() => setIsTokenModalOpen(false)}>
                  <X className="w-5 h-5 text-gray-400 hover:text-white" />
                </button>
              </div>
              <div className="space-y-2">
                {TOKENS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setToken(t);
                      setIsTokenModalOpen(false);
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-3 bg-gray-700 rounded-xl hover:bg-gray-600 transition"
                  >
                    <img src={t.image} alt={t.name} className="w-8 h-8" />
                    <span className="text-white font-medium">{t.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        {/* Network Selection Modal */}
        {networkModalType && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-2xl p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white font-bold text-lg">Select Network</h3>
                <button onClick={() => setNetworkModalType(null)}>
                  <X className="w-5 h-5 text-gray-400 hover:text-white" />
                </button>
              </div>
              <div className="space-y-2">
                {NETWORKS.map((net) => (
                  <button
                    key={net.id}
                    onClick={() => handleSelectNetwork(net)}
                    className="w-full flex items-center space-x-3 px-4 py-3 bg-gray-700 rounded-xl hover:bg-gray-600 transition"
                  >
                    <img src={net.image} alt={net.name} className="w-8 h-8" />
                    <span className="text-white font-medium">{net.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        {/* Error Modal */}
        {isErrorModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-2xl p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-red-500 font-bold text-lg flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2" /> Error
                </h3>
                <button onClick={() => setIsErrorModalOpen(false)}>
                  <X className="w-5 h-5 text-gray-400 hover:text-white" />
                </button>
              </div>
              <p className="text-gray-200">{errorMessage}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
export default MesonSwaps;