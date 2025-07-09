# SafeSend dApp - TODO List

## High Priority ⚡
- [ ] Set up Vite + React project with Yarn
- [ ] Install WalletConnect v2 and Web3 dependencies  
- [ ] Generate ABI from safesend.sol
- [ ] Set up TailwindCSS and basic dark theme
- [ ] Create WalletConnect integration component
- [ ] Build contract service for smart contract interaction

## Medium Priority 🔄
- [ ] Create Send form with password generation
- [ ] Create Claim form with deposit lookup
- [ ] Build Dashboard to view deposits
- [ ] Add network switching (Sepolia/mainnet)

## Low Priority 🔧
- [ ] Add error handling and transaction status
- [ ] Test and polish mobile-first design

## Environment Variables Needed
- `VITE_CONTRACT_ADDRESS` - SafeSend contract address
- `VITE_NETWORK` - Default network (sepolia/mainnet)
- `VITE_WALLETCONNECT_PROJECT_ID` - WalletConnect project ID

## Dependencies to Install
- `@walletconnect/web3-provider`
- `@walletconnect/modal`
- `ethers`
- `tailwindcss`

---
*Updated: 2025-07-09*