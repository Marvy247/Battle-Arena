# TODO: Build Real-Time Blockchain Battle Arena dApp

## Overview
This TODO outlines the steps to build a fully functional "Real-Time Blockchain Battle Arena" dApp for the Somnia Data Streams Mini Hackathon. The dApp features a 2D spaceship game (Phaser.js), on-chain score submission via smart contracts, live leaderboard updates via SDS streams, and deployment on Somnia Testnet. Goal: Seamless demo showcasing real-time UX, technical excellence, and Somnia integration.

## Phase 1: Project Setup and Dependencies
- [x] Initialize Next.js project with TypeScript for frontend (handles routing, SSR for better performance).
- [x] Install core dependencies: Phaser.js (for game canvas), wagmi and viem (Web3 interactions), rainbowkit (wallet connection), @somnia-network/datastreams-sdk (SDS integration), and shadcn/ui components with Tailwind CSS for styling.
- [x] Set up project structure: /components (game, leaderboard), /contracts (smart contracts), /utils (SDS helpers), /pages (main app).
- [x] Configure environment variables for Somnia Testnet RPC, SDS endpoints, and wallet keys.

## Phase 2: Smart Contracts Development
- [x] Write Solidity contracts: BattleArena.sol (combines score submission, NFT minting, and leaderboard in one contract).
- [x] Implement NFT minting for scores (ERC-721 standard) with metadata including player address, score, and timestamp.
- [x] Deploy contracts to Somnia Testnet using Foundry; verify on block explorer.
- [x] Test contracts locally with Foundry for basic functionality (minting, score storage, leaderboard updates).

## Phase 3: Game Development
- [ ] Build game core with Phaser.js: Spaceship controls (WASD/arrow keys), asteroids/enemies spawning, collision detection, scoring system (points for dodging/destroying).
- [ ] Add visual effects: Particle explosions, power-ups, animated UI overlays for score display.
- [ ] Implement game loop: Start screen, gameplay rounds (e.g., 60-second waves), end-round submission prompt.
- [ ] Integrate wallet connection: wagmi, viem and rainbowkit to connect MetaMask for score submission.

## Phase 4: SDS Integration and Real-Time Features
- [ ] Set up SDS SDK: Subscribe to streams for new score submissions and leaderboard updates.
- [ ] Implement reactive leaderboard: Fetch initial data from contracts, then listen to SDS streams for instant updates (e.g., new high scores trigger UI animations).
- [ ] Add simulated multiplayer: Program "bot" players with timers to submit scores periodically, updating leaderboard dynamically for demo.
- [ ] Ensure real-time UX: Leaderboard refreshes sub-second on stream events, with confetti/glow effects for new entries.

## Phase 5: Frontend UI and User Experience
- [ ] Design UI components: Game canvas, leaderboard table, wallet connect button, submit score modal.
- [ ] Add responsive design: Mobile-friendly for demo accessibility.
- [ ] Implement error handling: Network issues, wallet disconnections, with user-friendly messages.
- [ ] Polish visuals: Custom CSS animations, sound effects (optional), and branding aligned with Somnia theme.

## Phase 6: Testing and Deployment
- [ ] Unit test contracts and frontend: Use Jest for React components, Hardhat for contracts.
- [ ] Integration testing: Full game flow (play -> submit -> leaderboard update) on local Somnia Testnet fork.
- [ ] Deploy dApp: Host on Vercel/Netlify, ensure SDS streams work on live Testnet.
- [ ] End-to-end demo prep: Record 3-5 min video showing gameplay, on-chain submission, instant updates; include narration on SDS benefits.

## Phase 7: Final Touches and Submission
- [ ] Create GitHub repo: Public, with README explaining SDS usage, setup instructions, and demo link.
- [ ] Request test tokens from Telegram group if needed for deployment.
- [ ] Validate against hackathon criteria: Technical excellence (stable code), Real-Time UX (reactive streams), Somnia Integration (Testnet deployment), Potential Impact (gaming showcase).
- [ ] Submit: GitHub link, deployed dApp URL, demo video by Nov 15.

## Notes
- Timeline: Aim to complete Phases 1-3 in first week, 4-6 in second, 7 final day.
- Risks: SDS SDK compatibility—refer to docs (https://docs.somnia.network); test early.
- Progress Tracking: Update this TODO as steps complete; mark [x] when done.
