import { useState, useCallback, useEffect } from "react";
import type { EIP1193Provider } from "viem";
import { connectWallet } from "../blockchain/connectWallet";

export function useWallet() {
  const [address, setAddress] = useState<string | null>(null);

  const provider: EIP1193Provider | null =
    typeof window !== "undefined" && window.ethereum ? (window.ethereum as EIP1193Provider) : null;

  const connect = useCallback(async () => {
    const addr = await connectWallet();
    setAddress(addr);
  }, []);

  // Listen for account changes (disconnect, switch account in MetaMask)
  useEffect(() => {
    if (!provider?.on) return;

    const onAccountsChanged = (accounts: string[]) => {
      setAddress(accounts[0] ?? null);
    };

    provider.on("accountsChanged", onAccountsChanged);
    return () => {
      provider.removeListener("accountsChanged", onAccountsChanged);
    };
  }, [provider]);

  return {
    address,
    isConnected: address !== null,
    connect,
    provider,
  };
}
