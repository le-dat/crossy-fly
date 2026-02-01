import React from "react";

interface WalletButtonProps {
  address: string | null;
  onConnect: () => void;
}

const WalletButton: React.FC<WalletButtonProps> = ({ address, onConnect }) => {
  if (address) {
    return (
      <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 px-3 py-1 rounded-full text-xs font-mono">
        {address.slice(0, 6)}...{address.slice(-4)}
      </div>
    );
  }

  return (
    <button
      onClick={onConnect}
      className="bg-white/10 hover:bg-white/20 border border-white/20 text-white/70 hover:text-white px-3 py-1 rounded-full text-xs transition-colors"
    >
      Connect Wallet
    </button>
  );
};

export default WalletButton;
