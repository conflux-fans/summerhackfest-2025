import { AppShell, Burger, Container, Group, NavLink, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconCode,
  IconCurrencyDollar,
  IconHome,
  IconNetwork,
  IconSettings,
  IconWallet,
} from '@tabler/icons-react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { Header } from './components/Header';
import Accounts from './pages/Accounts';
import Contracts from './pages/Contracts';
import Dashboard from './pages/Dashboard';
import Network from './pages/Network';
import Protocols from './pages/Protocols.tsx';
import Settings from './pages/Settings';
import { useWebSocket } from './services/websocket';

const navigation = [
  { label: 'Dashboard', icon: IconHome, path: '/' },
  { label: 'Accounts', icon: IconWallet, path: '/accounts' },
  { label: 'Contracts', icon: IconCode, path: '/contracts' },
  { label: 'Protocols', icon: IconCurrencyDollar, path: '/protocols' },
  { label: 'Node Control', icon: IconNetwork, path: '/network' },
  { label: 'Settings', icon: IconSettings, path: '/settings' },
];

export default function App() {
  const [opened, { toggle }] = useDisclosure();
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize WebSocket connection
  useWebSocket();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 250,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Text size="xl" fw={700} c="blue">
              Conflux Box
            </Text>
          </Group>
          <Header />
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <AppShell.Section grow>
          {navigation.map((item) => (
            <NavLink
              key={item.path}
              active={location.pathname === item.path}
              label={item.label}
              leftSection={<item.icon size="1rem" stroke={1.5} />}
              onClick={() => {
                navigate(item.path);
                toggle();
              }}
              mb="xs"
            />
          ))}
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>
        <Container size="xl">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/accounts" element={<Accounts />} />
            <Route path="/contracts" element={<Contracts />} />
            <Route path="/protocols" element={<Protocols />} />
            <Route path="/network" element={<Network />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
