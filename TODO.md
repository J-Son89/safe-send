# SafeSend dApp - TODO List

## High Priority ⚡ (UI First)
- [x] Set up Vite + React project with Yarn
- [x] Install WalletConnect v2 and Web3 dependencies  
- [x] Generate ABI from safesend.sol
- [x] Set up TailwindCSS and basic dark theme
- [ ] Create Send form UI with mock data
- [ ] Create Claim form UI with mock data
- [ ] Create Dashboard UI with mock deposits list

## Medium Priority 🔄 (UI Enhancement)
- [ ] Add mock data for sent deposits (with cancel button)
- [ ] Add mock data for received deposits (with claim button)
- [ ] Add password generation UI for send form
- [ ] Add deposit status indicators (pending, claimed, cancelled, expired)

## Low Priority 🔧 (Integration)
- [ ] Add transaction history view
- [ ] Create WalletConnect integration component
- [ ] Build contract service for smart contract interaction
- [ ] Add network switching (Sepolia/mainnet)
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