import { MantineProvider } from '@mantine/core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { NetworkDropdown } from '../components/NetworkDropdown';

// Mock the API service and hooks
vi.mock('../services/api', () => ({
  DevKitApiService: {
    getCurrentNetwork: vi.fn().mockResolvedValue({ network: 'local' }),
  },
}));

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MantineProvider>{component}</MantineProvider>
    </QueryClientProvider>
  );
};

describe('NetworkDropdown', () => {
  it('should render network selector', () => {
    renderWithProviders(<NetworkDropdown />);

    // Check if the component renders
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should show current network', () => {
    renderWithProviders(<NetworkDropdown />);

    // Should show local network as selected based on our mock
    expect(screen.getByText('Local')).toBeInTheDocument();
  });
});
