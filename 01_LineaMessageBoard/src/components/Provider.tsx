"use client";
import React from "react";

// Web3Auth Imports
import {
  Web3AuthProvider,
  type Web3AuthContextConfig,
} from "@web3auth/modal/react";
import { WEB3AUTH_NETWORK } from "@web3auth/modal";

// Wagmi Imports
import { WagmiProvider } from "@web3auth/modal/react/wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// QueryClient for Wagmi Hooks Configuration
const queryClient = new QueryClient();

const clientId =
  "BO3rmIfEGKaxBQaw35GRdMF9ph612nabqB8qhl7QShceIdwGzpDrc8V2DYaX240pWuv5Sq-c0kC6892f4YAJVz0";

// Web3Auth Configuration
const web3AuthContextConfig: Web3AuthContextConfig = {
  web3AuthOptions: {
    clientId, // Pass your Web3Auth Client ID, ideally using an environment variable // Get your Client ID from Web3Auth Dashboard
    web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET, // or WEB3AUTH_NETWORK.SAPPHIRE_MAINNET
  },
};

// Provider Component
export default function Provider({ children }: { children: React.ReactNode }) {
  return (
    <Web3AuthProvider config={web3AuthContextConfig}>
      <QueryClientProvider client={queryClient}>
        <WagmiProvider>{children}</WagmiProvider>
      </QueryClientProvider>
    </Web3AuthProvider>
  );
}
