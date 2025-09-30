// Router provider for ChainBrawler React applications
// Provides React Router DOM context to child components

import React, { type ReactNode } from "react";
import { BrowserRouter as Router } from "react-router-dom";

export interface RouterProviderProps {
  children: ReactNode;
}

export function RouterProvider({ children }: RouterProviderProps) {
  return <Router>{children}</Router>;
}
