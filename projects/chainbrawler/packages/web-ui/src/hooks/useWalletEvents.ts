import { isSupportedChain } from "@chainbrawler/core";
import { notifications } from "@mantine/notifications";
import { useModal } from "connectkit";
import { useEffect, useRef } from "react";
import { useAccount } from "wagmi";

interface UseWalletEventsOptions {
  onConnect?: (address: string, chainId: number) => void;
  onDisconnect?: () => void;
  onChainChanged?: (chainId: number) => void;
  onError?: (error: Error) => void;
}

export function useWalletEvents(options: UseWalletEventsOptions = {}) {
  const { address, isConnected, chain } = useAccount();
  const { setOpen } = useModal();

  // Track previous states to prevent duplicate notifications
  const prevStateRef = useRef({
    isConnected: false,
    chainId: 0,
    address: "",
    initialized: false,
  });

  // Handle connection events
  useEffect(() => {
    if (!prevStateRef.current.initialized) {
      prevStateRef.current.initialized = true;
      return;
    }

    const currentChainId = chain?.id || 0;
    const currentAddress = address || "";

    // Check for new connection
    if (isConnected && address && chain && !prevStateRef.current.isConnected) {
      notifications.show({
        title: "🎮 Wallet Connected",
        message: `Connected to ${chain.name} with ${address.slice(0, 6)}...${address.slice(-4)}`,
        color: "violet",
        autoClose: 3000,
      });
      options.onConnect?.(address, currentChainId);
    }

    // Check for disconnection
    if (!isConnected && prevStateRef.current.isConnected) {
      notifications.show({
        title: "👋 Wallet Disconnected",
        message: "Your wallet has been disconnected",
        color: "yellow",
        autoClose: 3000,
      });
      options.onDisconnect?.();
    }

    // Check for chain change
    if (
      isConnected &&
      currentChainId !== prevStateRef.current.chainId &&
      prevStateRef.current.chainId !== 0
    ) {
      notifications.show({
        title: "🔗 Network Switched",
        message: `Switched to ${chain?.name || "Unknown Network"}`,
        color: "blue",
        autoClose: 2000,
      });
      options.onChainChanged?.(currentChainId);
    }

    // Update previous state
    prevStateRef.current = {
      isConnected,
      chainId: currentChainId,
      address: currentAddress,
      initialized: true,
    };
  }, [isConnected, address, chain, options]);

  // Handle unsupported networks
  useEffect(() => {
    if (isConnected && chain && !isSupportedChain(chain.id)) {
      notifications.show({
        title: "⚠️ Unsupported Network",
        message: `Please switch to Conflux Espace Testnet (Chain ID: 71) to play ChainBrawler`,
        color: "red",
        autoClose: 5000,
      });
    }
  }, [isConnected, chain]);

  return {
    // Utility functions
    openWalletModal: () => setOpen(true),
    // Wallet state for convenience
    address,
    isConnected,
    chain,
  };
}
