import { Anchor, Box, Container, Group, Stack, Text } from "@mantine/core";
import {
  IconBrandDiscord,
  IconBrandGithub,
  IconBrandTwitter,
  IconExternalLink,
} from "@tabler/icons-react";

export function AppFooter() {
  return (
    <Box
      h={80}
      px="md"
      style={{
        background: "rgba(15, 23, 42, 0.8)",
        backdropFilter: "blur(10px)",
        borderTop: "1px solid rgba(59, 130, 246, 0.2)",
        display: "flex",
        alignItems: "center",
      }}
    >
      <Container size="xl" h="100%">
        <Group justify="space-between" h="100%">
          <Stack gap="xs">
            <Text size="sm" c="dimmed">
              © 2024 ChainBrawler. All rights reserved.
            </Text>
            <Text size="xs" c="dimmed">
              Built with React, Mantine, and Web3
            </Text>
          </Stack>

          <Group gap="md">
            <Anchor
              href="https://github.com/chainbrawler"
              target="_blank"
              rel="noopener noreferrer"
              c="dimmed"
              size="sm"
            >
              <Group gap="xs">
                <IconBrandGithub size={16} />
                GitHub
                <IconExternalLink size={12} />
              </Group>
            </Anchor>

            <Anchor
              href="https://twitter.com/chainbrawler"
              target="_blank"
              rel="noopener noreferrer"
              c="dimmed"
              size="sm"
            >
              <Group gap="xs">
                <IconBrandTwitter size={16} />
                Twitter
                <IconExternalLink size={12} />
              </Group>
            </Anchor>

            <Anchor
              href="https://discord.gg/chainbrawler"
              target="_blank"
              rel="noopener noreferrer"
              c="dimmed"
              size="sm"
            >
              <Group gap="xs">
                <IconBrandDiscord size={16} />
                Discord
                <IconExternalLink size={12} />
              </Group>
            </Anchor>
          </Group>
        </Group>
      </Container>
    </Box>
  );
}
