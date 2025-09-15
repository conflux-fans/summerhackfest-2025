import { Alert, Badge, Button, Group, Stack, Text } from "@mantine/core";
import { IconAlertCircle, IconNetwork, IconPlus, IconWallet } from "@tabler/icons-react";
import { ConnectKitButton, useModal } from "connectkit";
import { useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import {
  addConfluxMainnetToWallet,
  addConfluxTestnetToWallet,
  getConfluxMainnetInfo,
  getConfluxTestnetInfo,
  switchToConfluxMainnet,
  switchToConfluxTestnet,
} from "../utils/chainUtils";

export function WalletTest() {
  const { address, isConnected, isConnecting, chain } = useAccount();
  const { connect, connectors, error, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { setOpen } = useModal();
  const [chainActionLoading, setChainActionLoading] = useState(false);
  const [chainActionError, setChainActionError] = useState<string | null>(null);

  const confluxTestnetInfo = getConfluxTestnetInfo();
  const confluxMainnetInfo = getConfluxMainnetInfo();
  const isOnConfluxTestnet = chain?.id === confluxTestnetInfo.chainId;
  const isOnConfluxMainnet = chain?.id === confluxMainnetInfo.chainId;
  const isOnConflux = isOnConfluxTestnet || isOnConfluxMainnet;

  console.log("WalletTest - Wallet state:", {
    address,
    isConnected,
    isConnecting,
    chain: chain?.name,
    chainId: chain?.id,
    connectors: connectors.length,
    setOpenAvailable: !!setOpen,
    isOnConflux,
  });

  const handleAddConfluxTestnet = async () => {
    setChainActionLoading(true);
    setChainActionError(null);

    try {
      await addConfluxTestnetToWallet();
      console.log("Conflux testnet added successfully");
    } catch (error: any) {
      console.error("Failed to add Conflux testnet:", error);
      setChainActionError(error.message);
    } finally {
      setChainActionLoading(false);
    }
  };

  const handleAddConfluxMainnet = async () => {
    setChainActionLoading(true);
    setChainActionError(null);

    try {
      await addConfluxMainnetToWallet();
      console.log("Conflux mainnet added successfully");
    } catch (error: any) {
      console.error("Failed to add Conflux mainnet:", error);
      setChainActionError(error.message);
    } finally {
      setChainActionLoading(false);
    }
  };

  const handleSwitchToConfluxTestnet = async () => {
    setChainActionLoading(true);
    setChainActionError(null);

    try {
      await switchToConfluxTestnet();
      console.log("Switched to Conflux testnet successfully");
    } catch (error: any) {
      console.error("Failed to switch to Conflux testnet:", error);
      setChainActionError(error.message);
    } finally {
      setChainActionLoading(false);
    }
  };

  const handleSwitchToConfluxMainnet = async () => {
    setChainActionLoading(true);
    setChainActionError(null);

    try {
      await switchToConfluxMainnet();
      console.log("Switched to Conflux mainnet successfully");
    } catch (error: any) {
      console.error("Failed to switch to Conflux mainnet:", error);
      setChainActionError(error.message);
    } finally {
      setChainActionLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <Stack gap="md">
        <Text size="xl" fw={700}>
          Wallet Connection Test
        </Text>

        <Alert icon={<IconAlertCircle size={16} />} color="blue" title="Debug Info">
          <Text size="sm">
            Connected: {isConnected ? "Yes" : "No"}
            <br />
            Address: {address || "None"}
            <br />
            Chain: {chain?.name || "None"} (ID: {chain?.id || "None"})<br />
            Connectors: {connectors.length}
            <br />
            ConnectKit Modal: {typeof setOpen === "function" ? "Available" : "Not Available"}
            <br />
            On Conflux: {isOnConflux ? "Yes" : "No"}
          </Text>
        </Alert>

        {/* Chain Management Section */}
        <Stack gap="sm">
          <Group>
            <Text fw={600}>Chain Management:</Text>
            <Badge color={isOnConflux ? "green" : "red"} variant="light">
              {isOnConflux ? "On Conflux" : "Wrong Chain"}
            </Badge>
          </Group>

          <Text size="sm" c="dimmed">
            Supported: Conflux Testnet (Chain ID: {confluxTestnetInfo.chainId}) or Mainnet (Chain
            ID: {confluxMainnetInfo.chainId})
          </Text>

          <Stack gap="sm">
            <Text size="sm" c="dimmed">
              Add Conflux networks:
            </Text>
            <Group gap="sm">
              <Button
                onClick={handleAddConfluxTestnet}
                loading={chainActionLoading}
                leftSection={<IconPlus size={16} />}
                variant="outline"
                size="sm"
                color="blue"
              >
                Add Testnet
              </Button>

              <Button
                onClick={handleAddConfluxMainnet}
                loading={chainActionLoading}
                leftSection={<IconPlus size={16} />}
                variant="outline"
                size="sm"
                color="green"
              >
                Add Mainnet
              </Button>
            </Group>

            <Text size="sm" c="dimmed">
              Switch to Conflux networks:
            </Text>
            <Group gap="sm">
              <Button
                onClick={handleSwitchToConfluxTestnet}
                loading={chainActionLoading}
                leftSection={<IconNetwork size={16} />}
                variant="outline"
                size="sm"
                color="blue"
                disabled={isOnConfluxTestnet}
              >
                Switch to Testnet
              </Button>

              <Button
                onClick={handleSwitchToConfluxMainnet}
                loading={chainActionLoading}
                leftSection={<IconNetwork size={16} />}
                variant="outline"
                size="sm"
                color="green"
                disabled={isOnConfluxMainnet}
              >
                Switch to Mainnet
              </Button>
            </Group>
          </Stack>

          {chainActionError && (
            <Alert color="red" title="Chain Action Error">
              <Text size="sm">{chainActionError}</Text>
            </Alert>
          )}
        </Stack>

        <Stack gap="sm">
          <Text fw={600}>ConnectKit Button:</Text>
          <ConnectKitButton />
        </Stack>

        <Stack gap="sm">
          <Text fw={600}>Manual Connect:</Text>
          {connectors.map((connector) => (
            <Button
              key={connector.uid}
              onClick={() => connect({ connector })}
              loading={isPending}
              disabled={isConnected}
            >
              {connector.name}
            </Button>
          ))}
        </Stack>

        <Stack gap="sm">
          <Text fw={600}>ConnectKit Modal:</Text>
          <Button
            onClick={() => {
              console.log("Opening ConnectKit modal, setOpen:", setOpen);
              if (setOpen) {
                setOpen(true);
              } else {
                console.error("setOpen not available");
              }
            }}
            leftSection={<IconWallet size={16} />}
          >
            Open Wallet Modal
          </Button>
        </Stack>

        {isConnected && (
          <Stack gap="sm">
            <Text fw={600}>Connected Account:</Text>
            <Text size="sm" c="dimmed">
              Address: {address}
            </Text>
            <Text size="sm" c="dimmed">
              Chain: {chain?.name} (ID: {chain?.id})
            </Text>
            <Button onClick={() => disconnect()} color="red">
              Disconnect
            </Button>
          </Stack>
        )}

        {error && (
          <Alert color="red" title="Connection Error">
            <Text size="sm">{error.message}</Text>
          </Alert>
        )}
      </Stack>
    </div>
  );
}
