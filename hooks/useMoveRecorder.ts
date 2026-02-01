import { useRef, useEffect } from "react";
import type { EIP1193Provider } from "viem";
import type { GameState } from "../types";
import { sendMove } from "../blockchain/sendMove";

interface UseMoveRecorderParams {
  gameState: GameState;
  walletAddress: string | null;
  provider: EIP1193Provider | null;
  addLog: (message: string) => void;
}

/**
 * Watches gameState for position changes and fires a recordMove
 * transaction for each valid move (±1 in exactly one axis).
 *
 * Does nothing when the wallet is not connected — the game remains
 * fully playable without blockchain interaction.
 */
export function useMoveRecorder({
  gameState,
  walletAddress,
  provider,
  addLog,
}: UseMoveRecorderParams) {
  const prevPosRef = useRef(gameState.playerPos);

  useEffect(() => {
    const { playerPos, score, isGameOver, isWon } = gameState;

    // Guard: skip if wallet not connected or game ended
    if (!walletAddress || !provider || isGameOver || isWon) {
      prevPosRef.current = playerPos;
      return;
    }

    const dx = playerPos.x - prevPosRef.current.x;
    const dy = playerPos.y - prevPosRef.current.y;

    // Only treat as a valid move if exactly one axis changed by 1.
    // This naturally skips restart teleports (position jumps > 1).
    const isValidMove = (Math.abs(dx) === 1 && dy === 0) || (dx === 0 && Math.abs(dy) === 1);

    if (!isValidMove) {
      prevPosRef.current = playerPos;
      return;
    }

    const direction = dy > 0 ? "Forward" : dy < 0 ? "Backward" : dx > 0 ? "Right" : "Left";

    // Update ref before the async call to avoid stale comparisons
    prevPosRef.current = playerPos;

    // Fire and forget — game is not blocked by the transaction
    sendMove({ provider, direction, score }).then((hash) => {
      if (hash) {
        addLog(`On-chain: tx ${hash.slice(0, 10)}...`);
      } else {
        addLog("On-chain: tx rejected or failed");
      }
    });
  }, [gameState, walletAddress, provider, addLog]);
}
