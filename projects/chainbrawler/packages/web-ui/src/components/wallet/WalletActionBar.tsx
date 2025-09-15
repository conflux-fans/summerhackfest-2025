import { useWebChainBrawlerContext } from "@chainbrawler/react";
import {
  ActionIcon,
  Box,
  Button,
  Group,
  Indicator,
  Menu,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import {
  IconBolt,
  IconCoin,
  IconFlame,
  IconLogout,
  IconNetwork,
  IconRefresh,
  IconSwords,
  IconWallet,
  IconWifi,
  IconWifiOff,
} from "@tabler/icons-react";
import { Avatar, ConnectKitButton, useModal } from "connectkit";
import { useAccount, useBalance, useDisconnect, useEnsName } from "wagmi";
import { designTokens } from "../../theme";

interface WalletActionBarProps {
  onRefresh: () => Promise<void>;
}

export function WalletActionBar({ onRefresh }: WalletActionBarProps) {
  const { character, isLoading, error } = useWebChainBrawlerContext();
  const { address, isConnected, chain } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({ address });
  const { data: ensName } = useEnsName({ address });
  const { setOpen } = useModal();

  // Determine overall status for the indicator
  const getStatusColor = () => {
    if (isLoading) return "blue";
    if (error) return "red";
    if (!isConnected) return "gray";
    if (character?.inCombat) return "orange";
    if (character?.exists && character.isAlive) return "green";
    if (character?.exists && !character.isAlive) return "red";
    return "yellow"; // Connected but no character
  };

  const getStatusTooltip = () => {
    if (isLoading) return "Loading game data...";
    if (error) return `Error: ${error}`;
    if (!isConnected) return "Wallet not connected";
    if (character?.inCombat) return "Character in combat!";
    if (character?.exists && character.isAlive) return "Character ready for action";
    if (character?.exists && !character.isAlive) return "Character needs resurrection";
    return "Ready to create character";
  };

  return (
    <Group gap="xs" align="center">
      {/* Refresh Action */}
      <Tooltip label="Refresh game data">
        <ActionIcon
          variant="subtle"
          color="violet"
          onClick={onRefresh}
          loading={isLoading}
          size="lg"
          style={{
            transition: `all ${designTokens.animation.durations.normal} ${designTokens.animation.easings.easeOut}`,
          }}
        >
          <IconRefresh size={16} />
        </ActionIcon>
      </Tooltip>

      {/* Wallet Connection */}
      {isConnected && address ? (
        <Menu shadow="md" width={280} position="bottom-end">
          <Menu.Target>
            <Button
              variant="subtle"
              color="violet"
              leftSection={<Avatar address={address} size={20} />}
              size="sm"
              styles={{
                root: {
                  transition: `all ${designTokens.animation.durations.normal} ${designTokens.animation.easings.easeOut}`,
                  "&:hover": {
                    transform: "translateY(-1px)",
                  },
                },
              }}
            >
              <Group gap="xs">
                <Stack gap={0} align="flex-start">
                  <Text size="sm" fw={600}>
                    {ensName || `${address.slice(0, 4)}...${address.slice(-4)}`}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {balance
                      ? `${parseFloat(balance.formatted).toFixed(3)} ${balance.symbol}`
                      : "---"}
                  </Text>
                </Stack>
              </Group>
            </Button>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Label>Wallet Info</Menu.Label>
            <Menu.Item leftSection={<IconWallet size={14} />} disabled>
              {address.slice(0, 6)}...{address.slice(-4)}
            </Menu.Item>
            <Menu.Item leftSection={<IconCoin size={14} />} disabled>
              {balance
                ? `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}`
                : "Loading..."}
            </Menu.Item>
            <Menu.Item leftSection={<IconNetwork size={14} />} disabled>
              {chain?.name || "Unknown Network"}
            </Menu.Item>

            <Menu.Divider />

            <Menu.Label>Actions</Menu.Label>
            <Menu.Item leftSection={<IconWallet size={14} />} onClick={() => setOpen(true)}>
              Switch Wallet
            </Menu.Item>
            <Menu.Item leftSection={<IconRefresh size={14} />} onClick={onRefresh}>
              Refresh Data
            </Menu.Item>

            <Menu.Divider />

            <Menu.Item
              leftSection={<IconLogout size={14} />}
              color="red"
              onClick={() => disconnect()}
            >
              Disconnect
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      ) : (
        <ConnectKitButton />
      )}

      {/* Overall Status Indicator */}
      <Tooltip label={getStatusTooltip()} position="bottom-end">
        <Box pos="relative">
          <Indicator
            color={getStatusColor()}
            size={12}
            offset={4}
            position="top-end"
            processing={isLoading}
            disabled={false}
            styles={{
              indicator: {
                border: `2px solid ${designTokens.colors.surface.primary}`,
                animation: character?.inCombat || isLoading ? "pulse 2s infinite" : "none",
              },
            }}
          >
            <ActionIcon
              variant="subtle"
              size="lg"
              color={getStatusColor()}
              style={{
                cursor: "default",
                pointerEvents: "none",
              }}
            >
              {character?.inCombat ? (
                <IconFlame size={16} />
              ) : isLoading ? (
                <IconBolt size={16} />
              ) : error ? (
                <IconWifiOff size={16} />
              ) : isConnected ? (
                <IconWifi size={16} />
              ) : (
                <IconSwords size={16} />
              )}
            </ActionIcon>
          </Indicator>
        </Box>
      </Tooltip>
    </Group>
  );
}
