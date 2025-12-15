# 🎄 BattleArena - A Festive Blockchain Game 🎅

<div align="center">

![BattleArena](https://img.shields.io/badge/Christmas-Carnival-red?style=for-the-badge&logo=christmas&logoColor=white)
![Somnia](https://img.shields.io/badge/Powered%20by-Somnia-blue?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=for-the-badge&logo=next.js)
![Phaser](https://img.shields.io/badge/Phaser-3.90-green?style=for-the-badge&logo=phaser)

**🎁 Spread Christmas Joy on the Blockchain! 🎁**

[Play Now](#installation) | [Features](#features) | [Tech Stack](#tech-stack) | [Demo Video](#demo)

</div>

---

## 🌟 About the Project

**BattleArena** is a festive, blockchain-powered arcade game built for the **Somnia Christmas Mini-Games Hackathon**! Help Santa save Christmas by stopping the Grinches from stealing all the joy. Throw snowballs, collect power-ups, and compete on Santa's Nice List to earn NFT rewards!

This game combines classic arcade action with Web3 technology, featuring:
- 🎮 **Real-time blockchain gameplay** powered by Somnia's ultra-fast L1
- 🎁 **NFT rewards** for high scores submitted on-chain
- 🏆 **Live leaderboard** using Somnia Data Streams (SDS)
- ⭐ **Festive Christmas theme** with snow effects, holiday music, and cheerful graphics

---

## ✨ Features

### 🎮 Game Mechanics
- **Santa's Sleigh**: Control Santa as he defends Christmas!
- **Grinch Enemies**: Stop the ornament-stealing Grinches with snowballs
- **Combo System**: Build combos for massive score multipliers (up to 5x!)
- **Progressive Difficulty**: Survive increasingly challenging festive rounds
- **Power-ups Galore**:
  - 🍬 **Candy Cane**: Rapid-fire triple snowballs
  - 🎁 **Gift Box**: 2x score multiplier
  - ❄️ **Snowflake Shield**: Protective ice barrier
  - ⚡ **Speed Boost**: Lightning-fast sleigh movement
  - ❤️ **Health Pack**: Restore Santa's energy

### 🎄 Blockchain Features
- **Wallet Integration**: Connect with RainbowKit (MetaMask, WalletConnect, etc.)
- **On-Chain Score Submission**: Mint NFTs by submitting your joy score
- **Real-Time Leaderboard**: Live updates via Somnia Data Streams
- **Smart Contract**: Fully verified and deployed on Somnia Mainnet
- **Gas-Efficient**: Lightning-fast transactions with minimal fees

### 🎨 UI/UX Excellence
- **Christmas-Themed Design**: Red, green, and gold festive colors throughout
- **Animated Snow Effects**: Beautiful falling snow and twinkling stars
- **Responsive Layout**: Play on desktop or mobile devices
- **Smooth Animations**: Polished transitions and visual feedback
- **Accessibility**: Clear UI with high-contrast festive elements

---

## 🚀 Tech Stack

### Frontend
- **Framework**: Next.js 16.0 (React 19.2)
- **Game Engine**: Phaser 3.90
- **Styling**: Tailwind CSS 4.0
- **UI Components**: Radix UI + shadcn/ui
- **Animations**: Framer Motion compatible

### Blockchain
- **Network**: Somnia Mainnet L1
- **Wallet**: RainbowKit + wagmi 2.19
- **Real-Time Data**: Somnia Data Streams (SDS) 0.9.5
- **Smart Contract**: Solidity (ERC-721 NFTs)

### Development
- **Language**: TypeScript 5
- **Package Manager**: npm
- **Linting**: ESLint 9
- **Build Tool**: Next.js built-in

---

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- A Web3 wallet (MetaMask recommended)
- Somnia Testnet/Mainnet tokens (for submitting scores)

### Setup Steps

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/christmas-carnival.git
cd christmas-carnival
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_CONTRACT_ADDRESS=your_contract_address_here
NEXT_PUBLIC_CHAIN_ID=your_chain_id
NEXT_PUBLIC_RPC_URL=your_rpc_url
```

4. **Run the development server**
```bash
npm run dev
```

5. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

6. **Connect your wallet**
Click "Connect Wallet" and select your preferred wallet

7. **Start playing!**
Click "Start Christmas Adventure" and spread some joy! 🎅🎄

---

## 🎮 How to Play

### Controls
- **Move**: Arrow keys or WASD
- **Shoot**: Spacebar (throw snowballs)
- **Pause**: ESC key

### Gameplay Tips
1. **Build Combos**: Destroy Grinches quickly to maintain your combo multiplier
2. **Collect Power-ups**: Grab falling power-ups for temporary advantages
3. **Watch Your Health**: Avoid collisions with Grinches and ornaments
4. **Submit Scores**: High scores can be minted as NFTs on the blockchain!
5. **Compete**: Climb Santa's Nice List leaderboard

### Scoring System
- **Base Points**: 10 points per Grinch defeated
- **Combo Multipliers**: 
  - 3+ combo: 2x points
  - 5+ combo: 3x points
  - 10+ combo: 5x points
- **Power-up Bonus**: 2x score multiplier when active
- **Round Completion**: Bonus points for surviving each round

---

## 🏆 Hackathon Submission

### Somnia Christmas Mini-Games Hackathon

This project is submitted for the **Somnia Christmas Mini-Games Campaign**!

**Prizes:**
- 🥇 **Top 5 Dev Selection**: Share 2,500 SOMI (500 SOMI each)
- 🗳️ **Top 3 Community Vote**: Share 1,200 SOMI
  - 1st place: 600 SOMI
  - 2nd place: 400 SOMI
  - 3rd place: 200 SOMI

**Why This Project Stands Out:**
1. **Full Blockchain Integration**: Real smart contracts, NFT minting, live data streams
2. **Polished UX**: Professional UI with smooth animations and festive theming
3. **Technical Excellence**: Leverages Somnia's unique features (SDS, fast finality)
4. **Christmas Spirit**: Authentic holiday theme with engaging gameplay
5. **Replayability**: Combo system, power-ups, and leaderboard competition

---

## 🎬 Demo

### Screenshots

#### Main Menu
![Main Menu](./docs/screenshots/menu.png)
*Festive welcome screen with animated snow effects*

#### Gameplay
![Gameplay](./docs/screenshots/gameplay.png)
*Santa defending Christmas from Grinches*

#### Leaderboard
![Leaderboard](./docs/screenshots/leaderboard.png)
*Real-time Santa's Nice List with live updates*

### Video Demo
🎥 [Watch the Full Demo Video](https://youtu.be/your-demo-video)

---

## 📝 Smart Contract

### Contract Details
- **Network**: Somnia Mainnet
- **Contract Address**: `0x...` (deployed)
- **Token Standard**: ERC-721 (NFTs)
- **Features**:
  - Score submission and NFT minting
  - Leaderboard tracking (top 10)
  - User token enumeration
  - Champion rewards for high scores

### Key Functions
```solidity
function submitScore(uint256 score) external
function getLeaderboard() external view returns (ScoreEntry[] memory)
function getUserTokens(address user) external view returns (uint256[] memory)
function claimReward() external
```

---

## 🛠️ Development

### Build for Production
```bash
npm run build
npm start
```

### Lint Code
```bash
npm run lint
```

### Project Structure
```
christmas-carnival/
├── src/
│   ├── app/              # Next.js app router
│   ├── components/       # React components
│   │   ├── Game.tsx      # Game wrapper
│   │   ├── PhaserGameImproved.tsx  # Main game logic
│   │   ├── Leaderboard.tsx         # Live leaderboard
│   │   ├── Header.tsx              # Navigation header
│   │   └── ui/                     # shadcn components
│   ├── contracts/        # Smart contract ABIs
│   ├── lib/              # Utilities (Somnia client)
│   └── utils/            # Helper functions
├── public/               # Static assets
└── docs/                 # Documentation
```

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 🎁 Credits

### Team
- **Developer**: [Your Name]
- **Design**: Festive Christmas theme
- **Blockchain**: Somnia integration

### Special Thanks
- **Somnia Team**: For the amazing L1 and Data Streams
- **Phaser Community**: For the powerful game engine
- **shadcn**: For beautiful UI components

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🎄 Community & Support

- **Discord**: [Join our community](https://discord.gg/somnia)
- **Twitter**: [@ChristmasCarnival](#)
- **Documentation**: [Full docs](./docs/README.md)
- **Issues**: [Report bugs](https://github.com/yourusername/christmas-carnival/issues)

---

<div align="center">

**🎅 Built for the Somnia Christmas Hackathon 🎄**

⭐ Star this repo if you enjoyed playing! ⭐

[Play Now](#installation) | [Join Hackathon](https://docs.google.com/forms/d/e/1FAIpQLSfJ...)

</div>

---

## 🔔 Updates

### Version 1.0.0 (December 2025)
- ✨ Initial release for Somnia Christmas Hackathon
- 🎮 Complete Christmas-themed arcade game
- 🎄 Full blockchain integration with NFT rewards
- 🏆 Real-time leaderboard with Somnia Data Streams
- 🎨 Polished UI/UX with festive animations

---

**Happy Holidays and Merry Gaming! 🎅🎄🎁**
