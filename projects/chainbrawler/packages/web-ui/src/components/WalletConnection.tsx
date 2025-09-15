import {
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Container,
  Divider,
  Group,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconCheck,
  IconNetwork,
  IconRocket,
  IconWallet,
  IconX,
} from "@tabler/icons-react";
import { ConnectKitButton } from "connectkit";
import React, { useState } from "react";
import { confluxESpace, confluxESpaceTestnet } from "viem/chains";
import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { confluxESpaceLocal } from "../config/chains";
import { RPCStatus } from "./RPCStatus";

// Supported chains configuration - prioritize local development
const SUPPORTED_CHAINS = [
  {
    chainId: confluxESpaceLocal.id,
    name: "Conflux Local",
    color: "violet",
    description: "Local development network (Chain ID: 2030)",
  },
  {
    chainId: confluxESpaceTestnet.id,
    name: "Conflux Testnet",
    color: "blue",
    description: "Test network for development",
  },
  {
    chainId: confluxESpace.id,
    name: "Conflux Mainnet",
    color: "green",
    description: "Production network",
  },
] as const;

export function WalletConnection() {
  const { isConnected, address, chain, isConnecting } = useAccount();
  const { connect, connectors, error: connectError, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const [isAddingChain, setIsAddingChain] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Check if current chain is supported
  const isSupportedChain = chain?.id ? SUPPORTED_CHAINS.some((c) => c.chainId === chain.id) : false;
  const currentChainInfo = chain?.id ? SUPPORTED_CHAINS.find((c) => c.chainId === chain.id) : null;

  const handleConnect = async (chainId: number) => {
    setConnectionError(null);
    setIsAddingChain(true);

    try {
      // First, try to connect the wallet
      if (connectors[0]) {
        await connect({ connector: connectors[0] });
      } else {
        setConnectionError("No wallet connectors available");
        return;
      }

      // After connection, try to switch to the selected chain
      try {
        await switchChain({ chainId });
      } catch (switchError) {
        console.warn(
          `Failed to switch to chain ${chainId}, user may need to add network manually:`,
          switchError
        );
        setConnectionError(
          `Failed to switch to network. Please add the network manually in your wallet.`
        );
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      setConnectionError(
        `Connection failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setIsAddingChain(false);
    }
  };

  // Clear error when connection succeeds
  React.useEffect(() => {
    if (isConnected) {
      setConnectionError(null);
    }
  }, [isConnected]);

  // Log connection state for debugging
  React.useEffect(() => {
    console.log("🔗 WalletConnection state:", {
      isConnected,
      address: address ? `${address.slice(0, 6)}...${address.slice(-4)}` : null,
      chain: chain?.name,
      chainId: chain?.id,
      isConnecting,
      isPending,
      connectError: connectError?.message,
      connectionError,
      connectorsAvailable: connectors.length,
      isSupportedChain,
      currentChainInfo: currentChainInfo?.name,
    });
  }, [
    isConnected,
    address,
    chain,
    isConnecting,
    isPending,
    connectError,
    connectionError,
    connectors.length,
    isSupportedChain,
    currentChainInfo,
  ]);

  if (isConnecting) {
    return (
      <Box
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
        }}
      >
        <Container size="sm">
          <Stack align="center" gap="lg">
            <ThemeIcon size={80} color="blue" variant="light" radius="xl">
              <IconWallet size={40} />
            </ThemeIcon>
            <Title order={2} c="white" ta="center">
              Connecting Wallet...
            </Title>
            <Text c="dimmed" ta="center">
              Please approve the connection in your wallet
            </Text>
          </Stack>
        </Container>
      </Box>
    );
  }

  if (!isConnected) {
    return (
      <Box
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
        }}
      >
        <Container size="md">
          <Stack align="center" gap="xl">
            {/* Header */}
            <Stack align="center" gap="md">
              <ThemeIcon size={100} color="violet" variant="light" radius="xl">
                <IconRocket size={50} />
              </ThemeIcon>
              <Title order={1} c="white" ta="center">
                Welcome to ChainBrawler
              </Title>
              <Text size="lg" c="dimmed" ta="center" maw={600}>
                The Ultimate Blockchain RPG Experience. Connect your wallet to start your adventure.
              </Text>
              <RPCStatus
                confluxApiKey={(import.meta as any).env?.VITE_CONFLUX_API_KEY}
                alchemyApiKey={(import.meta as any).env?.VITE_ALCHEMY_API_KEY}
                infuraApiKey={(import.meta as any).env?.VITE_INFURA_API_KEY}
              />
            </Stack>

            {/* Network Selection */}
            <Card
              withBorder
              radius="md"
              p="xl"
              style={{ backgroundColor: "rgba(30, 41, 59, 0.8)" }}
            >
              <Stack gap="md">
                <Text size="lg" fw={600} c="white" ta="center">
                  Choose Your Network
                </Text>
                <Divider />
                <Stack gap="md">
                  {SUPPORTED_CHAINS.map((chainInfo) => (
                    <Card
                      key={chainInfo.chainId}
                      withBorder
                      radius="md"
                      p="md"
                      style={{ backgroundColor: "rgba(15, 23, 42, 0.6)" }}
                    >
                      <Stack gap="sm">
                        <Group justify="space-between" align="center">
                          <Stack gap={4}>
                            <Group gap="sm">
                              <Text fw={500} c="white">
                                {chainInfo.name}
                              </Text>
                              <Badge color={chainInfo.color} variant="light" size="sm">
                                Chain ID: {chainInfo.chainId}
                              </Badge>
                            </Group>
                            <Text size="sm" c="dimmed">
                              {chainInfo.description}
                            </Text>
                          </Stack>
                          <Group gap="sm">
                            <Button
                              size="lg"
                              color={chainInfo.color}
                              variant="filled"
                              onClick={() => handleConnect(chainInfo.chainId)}
                              loading={isAddingChain || isPending}
                              leftSection={<IconWallet size={20} />}
                              style={{
                                background: `linear-gradient(135deg, ${chainInfo.color === "blue" ? "#3b82f6 0%, #1d4ed8 100%" : "#10b981 0%, #059669 100%"})`,
                                border: "none",
                                minWidth: "180px",
                              }}
                            >
                              {isAddingChain ? "Connecting..." : `Connect to ${chainInfo.name}`}
                            </Button>
                            <ConnectKitButton />
                          </Group>
                        </Group>
                      </Stack>
                    </Card>
                  ))}
                </Stack>
              </Stack>
            </Card>

            {/* Error Display */}
            {(connectError || connectionError) && (
              <Alert color="red" title="Connection Error" icon={<IconAlertCircle size={16} />}>
                <Text size="sm">{connectError?.message || connectionError}</Text>
                {connectError && (
                  <Text size="xs" c="dimmed" mt="xs">
                    Error code: {connectError.name}
                  </Text>
                )}
              </Alert>
            )}
          </Stack>
        </Container>
      </Box>
    );
  }

  if (!isSupportedChain || !chain) {
    return (
      <Box
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
        }}
      >
        <Container size="sm">
          <Stack align="center" gap="lg">
            <ThemeIcon size={80} color="red" variant="light" radius="xl">
              <IconX size={40} />
            </ThemeIcon>
            <Title order={2} c="white" ta="center">
              Unsupported Network
            </Title>
            <Text c="dimmed" ta="center" maw={500}>
              {chain ? (
                <>
                  You're connected to <strong>{chain.name}</strong> (Chain ID: {chain.id}), but
                  ChainBrawler only supports Conflux networks.
                </>
              ) : (
                <>
                  Your wallet is connected but not on a supported network. Please switch to a
                  Conflux network to continue.
                </>
              )}
            </Text>

            <Stack gap="md" w="100%">
              <Text size="sm" c="dimmed" ta="center">
                Switch to a supported network:
              </Text>
              <Group justify="center" gap="md">
                {SUPPORTED_CHAINS.map((chainInfo) => (
                  <Button
                    key={chainInfo.chainId}
                    size="lg"
                    color={chainInfo.color}
                    variant="filled"
                    onClick={() => switchChain({ chainId: chainInfo.chainId })}
                    loading={isSwitching}
                    leftSection={<IconNetwork size={20} />}
                    style={{
                      background: `linear-gradient(135deg, ${chainInfo.color === "blue" ? "#3b82f6 0%, #1d4ed8 100%" : "#10b981 0%, #059669 100%"})`,
                      border: "none",
                      minWidth: "180px",
                    }}
                  >
                    Switch to {chainInfo.name}
                  </Button>
                ))}
              </Group>
              <Group justify="center" gap="md" mt="md">
                <Text size="sm" c="dimmed">
                  Or use ConnectKit:
                </Text>
                <ConnectKitButton />
              </Group>
            </Stack>

            <Button
              variant="subtle"
              color="gray"
              onClick={() => disconnect()}
              leftSection={<IconWallet size={16} />}
            >
              Disconnect Wallet
            </Button>
          </Stack>
        </Container>
      </Box>
    );
  }

  // Connected and on supported chain - show success
  return (
    <Box
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
      }}
    >
      <Container size="sm">
        <Stack align="center" gap="lg">
          <ThemeIcon size={80} color="green" variant="light" radius="xl">
            <IconCheck size={40} />
          </ThemeIcon>
          <Title order={2} c="white" ta="center">
            Ready to Play!
          </Title>
          <Text c="dimmed" ta="center">
            Connected to <strong>{currentChainInfo?.name}</strong>
          </Text>
          <Badge color={currentChainInfo?.color} variant="light" size="lg">
            Chain ID: {chain?.id}
          </Badge>
          <Text size="sm" c="dimmed" ta="center">
            Address: {address?.slice(0, 6)}...{address?.slice(-4)}
          </Text>
        </Stack>
      </Container>
    </Box>
  );
}
