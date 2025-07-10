# SafeSend dApp - TODO List

## High Priority ⚡ (UI First)
- [ ] ensure the contract keeps some of the deposited money - contract fee - the app should have a disclaimer in the ui of what this fee is.
- [x] Set up Vite + React project with Yarn
- [x] Install WalletConnect v2 and Web3 dependencies  
- [x] Generate ABI from safesend.sol
- [x] Set up TailwindCSS and basic dark theme
- [x] Create Send form UI with mock data
- [x] Create Claim form UI with mock data
- [x] Create Dashboard UI with mock deposits list
- [ ] Improve password generation length and transaction confirmation to have other details to make it safer.
- [ ] allow integration with specific networks - if on a different network then prevent user from sending anything. contract hash should be correct for the right network. right now we will support testnet sepolia and we will look to add a cheaper network, arbitrum seems like a good starting point.


## Medium Priority 🔄 (UI Enhancement)
- [ ] refactor the app.jsx into several tabs pages and separate the logic correctly. we can make a pages folder with these pages. similarly a components folder for any ui components that don't contain business logic. split this task into smaller chunks
- [ ] Add mock data for sent deposits (with cancel button)
- [ ] Add mock data for received deposits (with claim button)
- [ ] Add password generation UI for send form
- [ ] Add deposit status indicators (pending, claimed, cancelled, expired)
- [ ] user must copy password before sending a transaction - remove alert and instead use animation to show it was pressed.
- [ ] remove connected address within tab and it should be outside the address

## Low Priority 🔧 (Integration)
- [x] Add transaction history view
- [x] Create WalletConnect integration component
- [ ] Build contract service for smart contract interaction
- [ ] Add network switching (Sepolia/mainnet)
- [ ] Add error handling and transaction status
- [ ] Test and polish mobile-first design
- [ ] Add contract link and GitHub commit hash to header for transparency
- [ ] improve loading states, especially on first load.
- [ ] refresh button should be smoother loading
- [ ] refresh button on reclaim screen (is it needed)
- [ ] refresh button on history screen (is it needed)
- [ ] fix ui on error as the text goes huge - better to just get the reil reason and show it.
- [ ] verify it expires correctly and unclaimable afterwards
- [ ] shareable link once sent 
- [ ] ensure explainer modal is working correctly - should show on load one time and then will work if the button is pressed.

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
