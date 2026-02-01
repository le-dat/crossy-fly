/**
 * Requests wallet accounts via EIP-1193 provider (window.ethereum).
 * Returns the connected address, or null if unavailable / user denied.
 * Never throws.
 */
export async function connectWallet(): Promise<string | null> {
  if (!window.ethereum?.request) return null;

  try {
    const accounts = (await window.ethereum.request({
      method: "eth_requestAccounts",
    })) as string[];
    return accounts[0] ?? null;
  } catch {
    return null;
  }
}
