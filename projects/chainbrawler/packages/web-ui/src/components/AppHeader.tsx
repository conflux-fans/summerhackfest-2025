import { Box, Container, Group, Text } from "@mantine/core";
import { IconSword } from "@tabler/icons-react";
import { ConnectKitButton } from "connectkit";

export function AppHeader() {
  return (
    <Box
      h={80}
      px="md"
      style={{
        background: "rgba(15, 23, 42, 0.8)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid rgba(59, 130, 246, 0.2)",
        display: "flex",
        alignItems: "center",
      }}
    >
      <Container size="xl" h="100%">
        <Group justify="space-between" h="100%">
          {/* Logo */}
          <Group gap="sm">
            <IconSword size={32} color="#3b82f6" />
            <Text size="xl" fw={700} c="white">
              ChainBrawler
            </Text>
          </Group>

          {/* Wallet Connection */}
          <Group gap="md">
            <ConnectKitButton />
          </Group>
        </Group>
      </Container>
    </Box>
  );
}
