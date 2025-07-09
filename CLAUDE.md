# SafeSend dApp - Project Plan

## Project Configuration
- **Framework**: React with Vite
- **Language**: JavaScript (TypeScript later)
- **Package Manager**: Yarn
- **Node Version**: Latest LTS compatible with WalletConnect v2
- **Wallet Integration**: WalletConnect v2
- **Styling**: TailwindCSS
- **Design**: Mobile-first, dark theme, simple & sleek

## Smart Contract Integration
- **Contract Address**: Environment variable `VITE_CONTRACT_ADDRESS`
- **Network Support**: Sepolia testnet + mainnet (env configurable)
- **ABI**: Generated from safesend.sol

## Core Features (MVP)
1. **Wallet Connection**: WalletConnect v2 integration
2. **Send ETH**: Amount input, recipient address, simple password generation
3. **Claim ETH**: Password input, deposit lookup by ID
4. **Dashboard**: View sent/received deposits with basic status
5. **Network Switching**: Sepolia ↔ mainnet support

## Technical Architecture
```
src/
├── components/
│   ├── WalletConnect.jsx
│   ├── SendForm.jsx
│   ├── ClaimForm.jsx
│   └── Dashboard.jsx
├── hooks/
│   ├── useWallet.js
│   └── useContract.js
├── services/
│   ├── contractService.js
│   └── passwordService.js
├── utils/
│   └── constants.js
└── App.jsx
```

## Development Approach
- Mobile-first responsive design
- Simple, confidence-inspiring UI
- Focus on core contract functionality
- Extensible architecture for future features

## Next Steps
1. Set up Vite + React project
2. Install WalletConnect v2 and dependencies
3. Create basic components and contract integration
4. Build core send/claim functionality
5. Add polish and error handling