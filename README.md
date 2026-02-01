# Crossyfluffle 🐰

A fast-paced "Crossy Road" style arcade game built with React 19 and Vite.

## 🚀 Quick Start

```bash
pnpm install
pnpm dev
```

## 🎮 How to Play

- **Desktop**: Move Fluffle using **Arrow Keys**.
- **Mobile**: Use the on-screen **D-Pad**.
- **Goal**: Cross busy roads and reach the final grass lane safely.

## 🔄 Game Flow Diagram

```mermaid
graph TD
    A[Start Game] --> B[Initialize Lanes & Cars]
    B --> C{Game Active?}

    C -- Yes --> D[Player Input: Move]
    D --> E[Update Player Position]
    E --> F[Log Activity]

    C -- Yes --> G[requestAnimationFrame]
    G --> H[Update Car Positions]
    H --> I{Collision Detected?}

    I -- Yes --> J[Game Over State]
    I -- No --> K{Reached Finish Line?}

    K -- Yes --> L[Win State]
    K -- No --> C

    J --> M[Show Overlay & Restart Option]
    L --> M
    M --> A
```
