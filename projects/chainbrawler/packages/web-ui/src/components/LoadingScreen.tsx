import { Box, Container, Group, Loader, Stack, Text } from "@mantine/core";
import { IconSword } from "@tabler/icons-react";

export function LoadingScreen() {
  return (
    <Box
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Container size="sm">
        <Stack align="center" gap="xl">
          <Group gap="md">
            <IconSword size={48} color="#3b82f6" />
            <Text size="xl" fw={600} c="white">
              ChainBrawler
            </Text>
          </Group>

          <Loader size="lg" color="blue" />

          <Stack align="center" gap="xs">
            <Text size="lg" fw={500} c="white">
              Loading Game...
            </Text>
            <Text size="sm" c="dimmed" ta="center">
              Preparing your adventure
            </Text>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
