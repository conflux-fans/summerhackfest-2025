import { Badge, Group, Text, Tooltip } from "@mantine/core";
import { IconCheck, IconInfoCircle, IconX } from "@tabler/icons-react";

interface RPCStatusProps {
  confluxApiKey?: string;
  alchemyApiKey?: string;
  infuraApiKey?: string;
}

export function RPCStatus({ confluxApiKey, alchemyApiKey, infuraApiKey }: RPCStatusProps) {
  return (
    <Group gap="xs" justify="center">
      <Text size="xs" c="dimmed">
        RPC Status:
      </Text>
      <Tooltip label="Conflux RPC (Primary for ChainBrawler)">
        <Badge
          color={confluxApiKey ? "green" : "blue"}
          variant="light"
          size="sm"
          leftSection={confluxApiKey ? <IconCheck size={12} /> : <IconInfoCircle size={12} />}
        >
          Conflux {confluxApiKey ? "Pro" : "Public"}
        </Badge>
      </Tooltip>
      <Tooltip label="Alchemy RPC (Fallback)">
        <Badge
          color={alchemyApiKey ? "green" : "gray"}
          variant="light"
          size="sm"
          leftSection={alchemyApiKey ? <IconCheck size={12} /> : <IconX size={12} />}
        >
          Alchemy {alchemyApiKey ? "Pro" : "Demo"}
        </Badge>
      </Tooltip>
      <Tooltip label="Infura RPC (Fallback)">
        <Badge
          color={infuraApiKey ? "green" : "gray"}
          variant="light"
          size="sm"
          leftSection={infuraApiKey ? <IconCheck size={12} /> : <IconX size={12} />}
        >
          Infura {infuraApiKey ? "Pro" : "Demo"}
        </Badge>
      </Tooltip>
    </Group>
  );
}
