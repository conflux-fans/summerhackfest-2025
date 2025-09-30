import {
  Avatar,
  Badge,
  Button,
  Card,
  Divider,
  Group,
  Paper,
  Progress,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import {
  IconBolt,
  IconClover,
  IconHeart,
  IconShield,
  IconSwords,
  IconTarget,
  IconWand,
} from "@tabler/icons-react";
import React from "react";

// import { CHARACTER_CLASSES } from '@chainbrawler/core'

interface CharacterCreationFormProps {
  onCreateCharacter: (classId: number) => Promise<void>;
  isLoading: boolean;
  canCreate: boolean;
}

// Character class configurations with enhanced stats and descriptions
const CHARACTER_CLASS_CONFIGS = [
  {
    id: 0,
    name: "Warrior",
    description:
      "A fierce melee combatant with high attack power and decent defense. Masters of weapon combat.",
    icon: <IconSwords size={32} />,
    color: "red",
    primaryStat: "Combat",
    stats: {
      combat: 8,
      defense: 6,
      luck: 4,
      health: 100,
    },
    strengths: ["High damage output", "Good survivability", "Weapon mastery"],
    weaknesses: ["Limited magic resistance", "Slower critical hits"],
    playStyle: "Aggressive front-line fighter",
  },
  {
    id: 1,
    name: "Guardian",
    description:
      "A defensive specialist with exceptional armor and protective abilities. Tank role in combat.",
    icon: <IconShield size={32} />,
    color: "blue",
    primaryStat: "Defense",
    stats: {
      combat: 5,
      defense: 9,
      luck: 4,
      health: 120,
    },
    strengths: ["Exceptional defense", "High health pool", "Damage resistance"],
    weaknesses: ["Lower damage output", "Slower attacks"],
    playStyle: "Defensive tank and protector",
  },
  {
    id: 2,
    name: "Rogue",
    description:
      "A swift and cunning fighter who relies on luck and critical strikes. Master of stealth and precision.",
    icon: <IconTarget size={32} />,
    color: "green",
    primaryStat: "Luck",
    stats: {
      combat: 6,
      defense: 4,
      luck: 8,
      health: 80,
    },
    strengths: ["High critical chance", "Lucky dodges", "Rare item discovery"],
    weaknesses: ["Lower health", "Vulnerable to heavy attacks"],
    playStyle: "Hit-and-run with critical strikes",
  },
  {
    id: 3,
    name: "Mage",
    description:
      "A mystical spellcaster with balanced magical abilities. Uses arcane power for both offense and defense.",
    icon: <IconWand size={32} />,
    color: "violet",
    primaryStat: "Balance",
    stats: {
      combat: 6,
      defense: 6,
      luck: 6,
      health: 90,
    },
    strengths: ["Balanced stats", "Magical versatility", "Adaptive combat"],
    weaknesses: ["Master of none", "Requires strategy"],
    playStyle: "Versatile magical combat",
  },
];

export function CharacterCreationForm({
  onCreateCharacter,
  isLoading,
  canCreate,
}: CharacterCreationFormProps) {
  const [selectedClassId, setSelectedClassId] = React.useState<number | null>(null);

  const handleCreateCharacter = async () => {
    if (selectedClassId !== null && canCreate) {
      await onCreateCharacter(selectedClassId);
    }
  };

  const selectedClass = selectedClassId !== null ? CHARACTER_CLASS_CONFIGS[selectedClassId] : null;

  return (
    <Stack gap="xl" style={{ width: "100%", maxWidth: "800px" }}>
      {/* Class Selection Grid */}
      <Stack gap="md">
        <Title order={3} ta="center" c="white">
          Choose Your Class
        </Title>
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          {CHARACTER_CLASS_CONFIGS.map((charClass) => (
            <Card
              key={charClass.id}
              p="lg"
              radius="md"
              withBorder
              style={{
                cursor: canCreate ? "pointer" : "not-allowed",
                backgroundColor:
                  selectedClassId === charClass.id
                    ? "var(--mantine-color-dark-5)"
                    : "var(--mantine-color-dark-6)",
                borderColor:
                  selectedClassId === charClass.id
                    ? `var(--mantine-color-${charClass.color}-6)`
                    : "var(--mantine-color-dark-4)",
                transform: selectedClassId === charClass.id ? "scale(1.02)" : "scale(1)",
                transition: "all 0.2s ease",
                opacity: canCreate ? 1 : 0.6,
              }}
              onClick={() => canCreate && setSelectedClassId(charClass.id)}
            >
              <Stack gap="md" align="center">
                {/* Class Icon */}
                <ThemeIcon
                  size={80}
                  variant="gradient"
                  gradient={{ from: charClass.color, to: `${charClass.color}.7`, deg: 45 }}
                  radius="xl"
                >
                  {charClass.icon}
                </ThemeIcon>

                {/* Class Name */}
                <Stack gap="xs" align="center">
                  <Text size="xl" fw={700} c="white">
                    {charClass.name}
                  </Text>
                  <Badge color={charClass.color} size="md" variant="light">
                    {charClass.primaryStat} Specialist
                  </Badge>
                </Stack>

                {/* Description */}
                <Text size="sm" c="dimmed" ta="center" style={{ minHeight: "60px" }}>
                  {charClass.description}
                </Text>

                {/* Stats Preview */}
                <Stack gap="xs" style={{ width: "100%" }}>
                  <Group justify="space-between">
                    <Group gap="xs">
                      <IconSwords size={14} color="red" />
                      <Text size="sm" c="white">
                        Combat
                      </Text>
                    </Group>
                    <Text size="sm" fw={600} c="red">
                      {charClass.stats.combat}
                    </Text>
                  </Group>

                  <Group justify="space-between">
                    <Group gap="xs">
                      <IconShield size={14} color="blue" />
                      <Text size="sm" c="white">
                        Defense
                      </Text>
                    </Group>
                    <Text size="sm" fw={600} c="blue">
                      {charClass.stats.defense}
                    </Text>
                  </Group>

                  <Group justify="space-between">
                    <Group gap="xs">
                      <IconClover size={14} color="green" />
                      <Text size="sm" c="white">
                        Luck
                      </Text>
                    </Group>
                    <Text size="sm" fw={600} c="green">
                      {charClass.stats.luck}
                    </Text>
                  </Group>

                  <Group justify="space-between">
                    <Group gap="xs">
                      <IconHeart size={14} color="pink" />
                      <Text size="sm" c="white">
                        Health
                      </Text>
                    </Group>
                    <Text size="sm" fw={600} c="pink">
                      {charClass.stats.health}
                    </Text>
                  </Group>
                </Stack>

                {/* Play Style */}
                <Text size="xs" c={charClass.color} fw={600} ta="center">
                  "{charClass.playStyle}"
                </Text>
              </Stack>
            </Card>
          ))}
        </SimpleGrid>
      </Stack>

      {/* Selected Class Details */}
      {selectedClass && (
        <Paper p="xl" bg="dark.6" radius="md" withBorder>
          <Stack gap="lg">
            <Group justify="center" gap="lg">
              <Avatar size={60} color={selectedClass.color} variant="gradient">
                {selectedClass.icon}
              </Avatar>
              <Stack gap="xs">
                <Title order={2} c="white">
                  {selectedClass.name}
                </Title>
                <Badge color={selectedClass.color} size="lg">
                  {selectedClass.primaryStat} Specialist
                </Badge>
              </Stack>
            </Group>

            <Text size="md" c="dimmed" ta="center">
              {selectedClass.description}
            </Text>

            <Divider />

            {/* Detailed Stats */}
            <SimpleGrid cols={2} spacing="lg">
              <Stack gap="sm">
                <Text size="lg" fw={700} c="white">
                  Base Statistics
                </Text>
                {Object.entries(selectedClass.stats).map(([stat, value]) => (
                  <Stack key={stat} gap="xs">
                    <Group justify="space-between">
                      <Text size="sm" c="white" tt="capitalize">
                        {stat}
                      </Text>
                      <Text size="sm" fw={700}>
                        {value}
                      </Text>
                    </Group>
                    <Progress
                      value={(value / (stat === "health" ? 120 : 10)) * 100}
                      color={
                        stat === "combat"
                          ? "red"
                          : stat === "defense"
                            ? "blue"
                            : stat === "luck"
                              ? "green"
                              : "pink"
                      }
                      size="sm"
                    />
                  </Stack>
                ))}
              </Stack>

              <Stack gap="sm">
                <Text size="lg" fw={700} c="white">
                  Combat Profile
                </Text>
                <Stack gap="xs">
                  <Text size="sm" fw={600} c="green">
                    Strengths:
                  </Text>
                  {selectedClass.strengths.map((strength, idx) => (
                    <Text key={idx} size="xs" c="dimmed">
                      • {strength}
                    </Text>
                  ))}
                </Stack>
                <Stack gap="xs">
                  <Text size="sm" fw={600} c="orange">
                    Weaknesses:
                  </Text>
                  {selectedClass.weaknesses.map((weakness, idx) => (
                    <Text key={idx} size="xs" c="dimmed">
                      • {weakness}
                    </Text>
                  ))}
                </Stack>
              </Stack>
            </SimpleGrid>
          </Stack>
        </Paper>
      )}

      {/* Create Character Button */}
      <Group justify="center">
        <Button
          size="xl"
          variant="gradient"
          gradient={{
            from: selectedClass?.color || "violet",
            to: `${selectedClass?.color}.7` || "blue",
            deg: 45,
          }}
          leftSection={<IconBolt size={20} />}
          onClick={handleCreateCharacter}
          disabled={!canCreate || selectedClassId === null}
          loading={isLoading}
          style={{ minWidth: "250px", height: "60px", fontSize: "18px" }}
        >
          {selectedClassId !== null
            ? `Create ${CHARACTER_CLASS_CONFIGS[selectedClassId].name} Warrior`
            : "Select a Class to Create Character"}
        </Button>
      </Group>

      {!canCreate && (
        <Text size="sm" c="red" ta="center">
          Unable to create character. Please check your connection and try again.
        </Text>
      )}
    </Stack>
  );
}
