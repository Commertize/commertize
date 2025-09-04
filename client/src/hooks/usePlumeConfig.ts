import { useQuery } from "@tanstack/react-query";

export interface PlumeConfig {
  CONTRACT_ADDRESS: string;
  PLUME_CHAIN_ID: number;
  PLUME_RPC_URL: string;
}

export interface PlumeNetworkStatus {
  chainId: number;
  rpcUrl: string;
  contractAddress: string;
  status: string;
  networkName: string;
  lastChecked: string;
  statusMessage?: string;
}

export interface KYCStatus {
  wallet: string;
  verified: boolean;
  verificationDate?: string;
  complianceLevel?: string;
  status?: string;
  error?: string;
}

export function usePlumeConfig() {
  return useQuery({
    queryKey: ["plume-config"],
    queryFn: async (): Promise<PlumeConfig> => {
      const response = await fetch("/config");
      if (!response.ok) {
        throw new Error("Failed to fetch Plume configuration");
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function usePlumeNetworkStatus() {
  return useQuery({
    queryKey: ["plume-network-status"],
    queryFn: async (): Promise<PlumeNetworkStatus> => {
      const response = await fetch("/api/plume/network-status");
      if (!response.ok) {
        throw new Error("Failed to fetch Plume network status");
      }
      return response.json();
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useKYCStatus(wallet: string | null) {
  return useQuery({
    queryKey: ["kyc-status", wallet],
    queryFn: async (): Promise<KYCStatus> => {
      if (!wallet) {
        throw new Error("Wallet address is required");
      }
      
      const response = await fetch(`/kyc-status/${wallet}`);
      if (!response.ok) {
        throw new Error("Failed to fetch KYC status");
      }
      return response.json();
    },
    enabled: !!wallet,
    staleTime: 30 * 1000, // 30 seconds
  });
}