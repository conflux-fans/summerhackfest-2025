import { Group } from '@mantine/core';
import { ConnectButton } from './ConnectButton';
import { NetworkDropdown } from './NetworkDropdown';

export function Header() {
  return (
    <Group gap="xs">
      <NetworkDropdown />
      <ConnectButton />
    </Group>
  );
}
