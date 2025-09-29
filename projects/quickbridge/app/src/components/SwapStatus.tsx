import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { ArrowLeft, Clock, CheckCircle2, AlertCircle, Zap, Shield } from 'lucide-react';

function SwapStatus() {
  const { txid } = useParams<{ txid: string }>();
  const { address, isConnected } = useAccount();
  const [statusData, setStatusData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!txid) {
      setError('No transaction ID provided');
      setLoading(false);
      setNotFound(false);
      return;
    }

    setError('');
    setStatusData(null);
    setNotFound(false);

    const fetchStatus = async () => {
      setLoading(true);
      try {
        const response = await fetch(`https://relayer.meson.fi/api/v1/swap?hash=${txid}`);
        if (!response.ok) {
          if (response.status === 404) {
            setLoading(false);
            setNotFound(true);
            setTimeout(() => {
              setNotFound(false);
              fetchStatus();
            }, 5000);
            return;
          }
          throw new Error('Failed to fetch status');
        }
        const data = await response.json();
        setStatusData(data.result);
      } catch (err: any) {
        setError(err.message);
        setNotFound(false);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [txid]);

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          <div className="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 shadow-2xl p-8">
            <div className="flex flex-col items-center space-y-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-xl opacity-50"></div>
                <div className="relative bg-gradient-to-r from-blue-500 to-purple-500 p-5 rounded-full">
                  <Shield className="w-10 h-10 text-white" />
                </div>
              </div>
              <div className="text-center space-y-3">
                <h2 className="text-3xl font-bold text-white">Connect Wallet</h2>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Connect your wallet to view swap status
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 shadow-2xl p-8">
            <div className="flex flex-col items-center space-y-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-xl opacity-50"></div>
                <div className="relative bg-gradient-to-r from-blue-500 to-purple-500 p-5 rounded-full">
                  <Zap className="w-10 h-10 text-white animate-pulse" />
                </div>
              </div>
              <div className="text-center space-y-3">
                <h2 className="text-3xl font-bold text-white">Checking Status</h2>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Fetching swap details...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 shadow-2xl p-8">
            <div className="flex flex-col items-center space-y-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-xl opacity-50"></div>
                <div className="relative bg-gradient-to-r from-blue-500 to-purple-500 p-5 rounded-full">
                  <Clock className="w-10 h-10 text-white" />
                </div>
              </div>
              <div className="text-center space-y-3">
                <h2 className="text-3xl font-bold text-white">Awaiting Swap Initiation</h2>
                <p className="text-gray-300 text-sm leading-relaxed">
                  The swap transaction is being processed. We'll check again shortly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !statusData) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 shadow-2xl p-8">
            <div className="flex flex-col items-center space-y-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-600 rounded-full blur-xl opacity-50"></div>
                <div className="relative bg-gradient-to-r from-red-500 to-red-600 p-5 rounded-full">
                  <AlertCircle className="w-10 h-10 text-white" />
                </div>
              </div>
              <div className="text-center space-y-3">
                <h2 className="text-3xl font-bold text-white">Error</h2>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {error || 'Unable to load swap status'}
                </p>
                <Link
                  to="/bridge"
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Bridge</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isExpired = !!statusData.expired; // Falsy if absent
  const hasExecuted = !!statusData.EXECUTED; // Truthy if tx hash present
  const hasReleased = !!statusData.RELEASED; // Truthy if tx hash present
  const swap = statusData.swap; // Access the swap details

  return (
    <div className="py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8 space-y-4">
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
            Swap Status
          </h1>
          <p className="text-gray-300 text-lg">Transaction: {txid}</p>
        </div>
        <div className="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 shadow-2xl p-8 space-y-6">
          {/* Swap Details Section */}
          {swap && (
            <div className="space-y-4 p-4 bg-black/20 rounded-2xl border border-white/10">
              <h3 className="text-white font-semibold text-lg">Swap Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">From:</span>
                  <div className="text-white font-mono mt-1">
                    {swap.from.amount} {swap.from.token} on {swap.from.network}
                  </div>
                </div>
                <div>
                  <span className="text-gray-400">To:</span>
                  <div className="text-white font-mono mt-1">
                    {swap.to.amount} {swap.to.token} on {swap.to.network}
                  </div>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                Swap ID: {swap.id}
              </div>
            </div>
          )}

          {/* Status Banner */}
          {isExpired && (
            <div className="flex items-center justify-center py-4 bg-red-500/20 border border-red-500/30 rounded-2xl text-red-300">
              <AlertCircle className="w-5 h-5 mr-2" />
              <span className="text-sm font-medium">Swap Expired</span>
            </div>
          )}
          {!isExpired && hasReleased && (
            <div className="flex items-center justify-center py-4 bg-green-500/20 border border-green-500/30 rounded-2xl text-green-300">
              <CheckCircle2 className="w-5 h-5 mr-2" />
              <span className="text-sm font-medium">Swap Requested/Executed</span>
            </div>
          )}
          {!isExpired && !hasReleased && (
            <div className="flex items-center justify-center py-4 bg-blue-500/20 border border-blue-500/30 rounded-2xl text-blue-300">
              <Clock className="w-5 h-5 mr-2 animate-pulse" />
              <span className="text-sm font-medium">Swap In Progress</span>
            </div>
          )}

          {/* Timeline */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-300 text-sm">Posted</span>
              <span className="text-white font-mono text-sm">{statusData.POSTED || '-'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300 text-sm">Bonded</span>
              <span className="text-white font-mono text-sm">{statusData.BONDED || '-'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300 text-sm">Locked</span>
              <span className="text-white font-mono text-sm">{statusData.LOCKED || '-'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300 text-sm">Executed</span>
              <span className={`text-white font-mono text-sm ${hasExecuted ? 'text-green-400' : ''}`}>
                {statusData.EXECUTED || 'Pending'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300 text-sm">Released</span>
              <span className={`text-white font-mono text-sm ${hasReleased ? 'text-green-400' : ''}`}>
                {statusData.RELEASED || 'Pending'}
              </span>
            </div>
            {statusData.CANCELLED && (
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm">Cancelled</span>
                <span className="text-white font-mono text-sm">{statusData.CANCELLED}</span>
              </div>
            )}
            {statusData.UNLOCKED && (
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm">Unlocked</span>
                <span className="text-white font-mono text-sm">{statusData.UNLOCKED}</span>
              </div>
            )}
          </div>
          <div className="pt-6 border-t border-white/20">
            <Link
              to="/bridge"
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-500 hover:to-pink-500 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>New Swap</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SwapStatus;