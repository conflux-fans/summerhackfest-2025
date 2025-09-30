import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { WagmiProviderWrapper } from './providers/WagmiProvider';

// Import Mantine styles
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css';
// import 'connectkit/styles.css'; // TODO: Fix ConnectKit styles import

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <WagmiProviderWrapper>
        <QueryClientProvider client={queryClient}>
          <MantineProvider
            theme={{
              primaryColor: 'blue',
            }}
          >
            <ModalsProvider>
              <Notifications />
              <App />
            </ModalsProvider>
          </MantineProvider>
        </QueryClientProvider>
      </WagmiProviderWrapper>
    </BrowserRouter>
  </React.StrictMode>
);
