import { MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider } from "connectkit";
import React from "react";
import ReactDOM from "react-dom/client";
import { WagmiProvider } from "wagmi";
import App from "./App.tsx";
import { config } from "./config/wagmi.ts";
import { theme } from "./theme";
import "./styles/globals.css";
import "./styles/connectkit.css";

// Import Mantine styles
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

// Create a client
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider
          mode="dark"
          customTheme={{
            "--ck-font-family": "Inter, system-ui, sans-serif",
            "--ck-border-radius": "12px",
            "--ck-primary-button-background": "#3b82f6",
            "--ck-primary-button-hover-background": "#2563eb",
            "--ck-body-color": "#1e293b",
            "--ck-body-background": "#0f172a",
            "--ck-modal-box-shadow": "0 20px 40px rgba(0, 0, 0, 0.6)",
            "--ck-accent-color": "#3b82f6",
            "--ck-accent-text-color": "#ffffff",
            "--ck-secondary-button-background": "rgba(59, 130, 246, 0.1)",
            "--ck-secondary-button-border-color": "rgba(59, 130, 246, 0.2)",
            "--ck-secondary-button-hover-background": "rgba(59, 130, 246, 0.2)",
          }}
          options={{
            initialChainId: 71,
            enforceSupportedChains: false,
            disclaimer:
              "By connecting your wallet, you agree to the Terms of Service and Privacy Policy.",
            embedGoogleFonts: true,
            hideBalance: false,
            hideQuestionMarkCTA: false,
            hideNoWalletCTA: false,
            walletConnectCTA: "link",
          }}
        >
          <MantineProvider theme={theme} defaultColorScheme="dark">
            <ModalsProvider>
              <Notifications
                position="top-right"
                containerWidth={320}
                notificationMaxHeight={120}
                autoClose={5000}
              />
              <App />
            </ModalsProvider>
          </MantineProvider>
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
);
