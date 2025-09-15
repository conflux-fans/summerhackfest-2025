import type { ChainBrawlerConfig } from "@chainbrawler/core";
import { getContractAddresses, isSupportedChain } from "@chainbrawler/core";
import { useMemo } from "react";
import { useAccount, useConfig, usePublicClient, useWalletClient } from "wagmi";
import { ChainBrawlerProvider } from "./app/providers/ChainBrawlerProvider";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { LoadingScreen } from "./components/LoadingScreen";
import { WalletConnection } from "./components/WalletConnection";
import { WelcomeScreen } from "./components/WelcomeScreen";
import { GamePage } from "./features/game/GamePage";
import { useAppState } from "./hooks/useAppState";

function ContractDeploymentScreen({ chainId }: { chainId: number }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "20px",
        textAlign: "center",
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
      }}
    >
      <h1 style={{ marginBottom: "20px", color: "white" }}>🚀 Contract Not Deployed</h1>
      <p style={{ marginBottom: "20px", color: "#94a3b8", maxWidth: "600px" }}>
        The ChainBrawler contract is not deployed on chain {chainId}. Please switch to a supported
        network or deploy the contract.
      </p>
      <div
        style={{
          backgroundColor: "rgba(30, 41, 59, 0.8)",
          padding: "20px",
          borderRadius: "12px",
          marginBottom: "20px",
          textAlign: "left",
          maxWidth: "600px",
          border: "1px solid rgba(59, 130, 246, 0.2)",
        }}
      >
        <h3 style={{ marginBottom: "10px", color: "white" }}>Supported Networks:</h3>
        <ul style={{ marginBottom: "10px", color: "#94a3b8" }}>
          <li>ChainBrawler Local (ID: 2030)</li>
          <li>Conflux Espace Testnet (ID: 71)</li>
        </ul>
        <p style={{ fontSize: "14px", color: "#64748b" }}>
          <strong>Note:</strong> Make sure you're connected to a supported network.
        </p>
      </div>
      <button
        onClick={() => window.location.reload()}
        style={{
          padding: "12px 24px",
          backgroundColor: "#7950f2",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontSize: "16px",
        }}
      >
        Refresh Page
      </button>
    </div>
  );
}

function AppContent() {
  const { isLoading, hasSeenWelcome, setHasSeenWelcome } = useAppState();
  const { isConnected, address, chain } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const wagmiConfig = useConfig();

  // Get contract address for current chain
  const currentChainId = chain?.id;
  const contractAddress = useMemo(() => {
    if (!currentChainId) return null;
    try {
      const addresses = getContractAddresses(currentChainId);
      return addresses.chainBrawler;
    } catch (error) {
      console.error("Failed to get contract address:", error);
      return null;
    }
  }, [currentChainId]);

  // Create ChainBrawler config
  const chainBrawlerConfig = useMemo((): ChainBrawlerConfig | null => {
    if (!contractAddress || !publicClient || !walletClient) {
      return null;
    }

    return {
      address: contractAddress,
      chain: publicClient.chain,
      publicClient: publicClient,
      walletClient: walletClient,
      wagmiConfig: wagmiConfig,
      contractClient: null,
    };
  }, [contractAddress, publicClient, walletClient, wagmiConfig]);

  // Show loading screen while app is initializing
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Show welcome screen for first-time users
  if (!hasSeenWelcome) {
    return <WelcomeScreen onContinue={() => setHasSeenWelcome(true)} />;
  }

  // Show wallet connection screen if not connected or on unsupported chain
  if (!isConnected || !address || !currentChainId || !isSupportedChain(currentChainId)) {
    return <WalletConnection />;
  }

  // Show contract deployment screen if contract not found
  if (!contractAddress) {
    return <ContractDeploymentScreen chainId={currentChainId} />;
  }

  // Show loading while ChainBrawler config is being prepared
  if (!chainBrawlerConfig) {
    return <LoadingScreen />;
  }

  // Render the game
  return (
    <ErrorBoundary>
      <ChainBrawlerProvider chainBrawlerConfig={chainBrawlerConfig}>
        <GamePage />
      </ChainBrawlerProvider>
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}
