export const CROSSYFLUFFLE_ABI = [
  {
    inputs: [
      { name: "direction", type: "string" },
      { name: "score", type: "uint256" },
    ],
    name: "recordMove",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "player", type: "address" }],
    name: "getPlayerStats",
    outputs: [
      { name: "", type: "uint256" },
      { name: "", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;
