import type { ChainBrawlerConfig } from "@chainbrawler/core";
import { WebChainBrawlerProvider } from "@chainbrawler/react";
import type React from "react";
import { BrowserRouter } from "react-router-dom";

interface ChainBrawlerProviderProps {
  children: React.ReactNode;
  chainBrawlerConfig?: ChainBrawlerConfig;
}

export function ChainBrawlerProvider({ children, chainBrawlerConfig }: ChainBrawlerProviderProps) {
  // Always wrap with BrowserRouter and WebChainBrawlerProvider
  // The WebChainBrawlerProvider will handle the case when config is undefined
  return (
    <BrowserRouter>
      <WebChainBrawlerProvider config={chainBrawlerConfig}>{children}</WebChainBrawlerProvider>
    </BrowserRouter>
  );
}
