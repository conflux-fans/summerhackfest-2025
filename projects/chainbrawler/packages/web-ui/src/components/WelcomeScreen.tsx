import {
  Badge,
  Box,
  Button,
  Card,
  Container,
  Group,
  List,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import {
  IconBolt,
  IconCoins,
  IconRocket,
  IconSword,
  IconTrophy,
  IconUsers,
} from "@tabler/icons-react";

interface WelcomeScreenProps {
  onContinue: () => void;
}

export function WelcomeScreen({ onContinue }: WelcomeScreenProps) {
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
        <Card
          shadow="xl"
          radius="lg"
          padding="xl"
          style={{
            background: "rgba(30, 41, 59, 0.8)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(59, 130, 246, 0.2)",
          }}
        >
          <Stack align="center" gap="xl">
            {/* Logo and Title */}
            <Stack align="center" gap="md">
              <Group gap="sm">
                <IconSword size={48} color="#3b82f6" />
                <Title
                  order={1}
                  size="3rem"
                  style={{
                    background: "linear-gradient(45deg, #3b82f6, #8b5cf6)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    textAlign: "center",
                  }}
                >
                  ChainBrawler
                </Title>
              </Group>
              <Text size="lg" c="dimmed" ta="center">
                The Ultimate Blockchain RPG Experience
              </Text>
              <Badge size="lg" variant="gradient" gradient={{ from: "blue", to: "purple" }}>
                Beta Version
              </Badge>
            </Stack>

            {/* Features */}
            <Stack gap="md" w="100%">
              <Title order={3} ta="center">
                Game Features
              </Title>
              <List
                spacing="sm"
                size="md"
                center
                icon={
                  <ThemeIcon color="blue" size={24} radius="xl">
                    <IconBolt size={16} />
                  </ThemeIcon>
                }
              >
                <List.Item>
                  <Text fw={500}>Blockchain Integration</Text>
                  <Text size="sm" c="dimmed">
                    Own your characters and items on-chain
                  </Text>
                </List.Item>
                <List.Item>
                  <Text fw={500}>Turn-Based Combat</Text>
                  <Text size="sm" c="dimmed">
                    Strategic battles with unique abilities
                  </Text>
                </List.Item>
                <List.Item>
                  <Text fw={500}>Character Progression</Text>
                  <Text size="sm" c="dimmed">
                    Level up, gain skills, and customize your hero
                  </Text>
                </List.Item>
                <List.Item>
                  <Text fw={500}>Equipment System</Text>
                  <Text size="sm" c="dimmed">
                    Collect and upgrade weapons and armor
                  </Text>
                </List.Item>
                <List.Item>
                  <Text fw={500}>Mobile Optimized</Text>
                  <Text size="sm" c="dimmed">
                    Play anywhere, anytime on any device
                  </Text>
                </List.Item>
              </List>
            </Stack>

            {/* Stats */}
            <Group justify="center" gap="xl" wrap="wrap">
              <Stack align="center" gap="xs">
                <IconUsers size={32} color="#3b82f6" />
                <Text fw={600} size="lg">
                  10K+
                </Text>
                <Text size="sm" c="dimmed">
                  Players
                </Text>
              </Stack>
              <Stack align="center" gap="xs">
                <IconTrophy size={32} color="#f59e0b" />
                <Text fw={600} size="lg">
                  50K+
                </Text>
                <Text size="sm" c="dimmed">
                  Battles Won
                </Text>
              </Stack>
              <Stack align="center" gap="xs">
                <IconCoins size={32} color="#10b981" />
                <Text fw={600} size="lg">
                  1M+
                </Text>
                <Text size="sm" c="dimmed">
                  Tokens Earned
                </Text>
              </Stack>
            </Group>

            {/* Action Buttons */}
            <Stack gap="md" w="100%">
              <Button
                size="lg"
                variant="gradient"
                gradient={{ from: "blue", to: "purple" }}
                onClick={onContinue}
                leftSection={<IconRocket size={20} />}
                fullWidth
              >
                Start Your Adventure
              </Button>

              <Group justify="center" gap="sm">
                <Button variant="subtle" size="sm" c="dimmed">
                  Learn More
                </Button>
                <Button variant="subtle" size="sm" c="dimmed">
                  View Docs
                </Button>
              </Group>
            </Stack>
          </Stack>
        </Card>
      </Container>
    </Box>
  );
}
