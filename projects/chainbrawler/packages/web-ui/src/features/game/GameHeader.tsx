import { AppShell, Container, Group, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { IconSwords } from "@tabler/icons-react";
import { WalletActionBar } from "../../components/wallet/WalletActionBar";

interface GameHeaderProps {
  onRefresh: () => Promise<void>;
}

export function GameHeader({ onRefresh }: GameHeaderProps) {
  return (
    <AppShell.Header
      style={{
        backgroundColor: "rgba(15, 23, 42, 0.9)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid rgba(59, 130, 246, 0.2)",
      }}
    >
      <Container size="xl" h="100%">
        <Group h="100%" justify="space-between">
          {/* Left: Game Title and Branding */}
          <Group>
            <ThemeIcon
              size="xl"
              variant="gradient"
              gradient={{ from: "violet", to: "blue", deg: 45 }}
            >
              <IconSwords size={28} />
            </ThemeIcon>
            <Stack gap={0} display={{ base: "none", md: "flex" }}>
              <Title order={2} c="white">
                ChainBrawler
              </Title>
              <Text size="xs" c="dimmed">
                Blockchain RPG Arena
              </Text>
            </Stack>
          </Group>

          {/* Right: Unified Wallet Action Bar */}
          <WalletActionBar onRefresh={onRefresh} />
        </Group>
      </Container>
    </AppShell.Header>
  );
}
