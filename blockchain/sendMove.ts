import { createWalletClient, custom, type EIP1193Provider } from "viem";
import { CROSSYFLUFFLE_ABI } from "./abi";
import { CHAIN, CONTRACT_ADDRESS } from "./config";

interface SendMoveParams {
  provider: EIP1193Provider;
  direction: string;
  score: number;
}

/**
 * Sends a recordMove transaction via the connected wallet.
 * Returns the transaction hash on success, or null on any error.
 * Never throws.
 */
export async function sendMove({
  provider,
  direction,
  score,
}: SendMoveParams): Promise<string | null> {
  try {
    const client = createWalletClient({
      chain: CHAIN,
      transport: custom(provider),
    });

    const hash = await client.writeContract({
      address: CONTRACT_ADDRESS,
      abi: CROSSYFLUFFLE_ABI,
      functionName: "recordMove",
      args: [direction, BigInt(score)],
    });

    return hash;
  } catch {
    return null;
  }
}
