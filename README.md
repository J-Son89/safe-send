# SafeSend 🛡️

**Secure ETH Transfers with Password Verification**

SafeSend eliminates the risk of sending cryptocurrency to wrong addresses by adding an extra layer of security through password verification. No more lost funds due to typos or copy-paste errors!

## 🚨 The Problem We Solve

**1 in 4 crypto users** have lost money by sending to wrong addresses. Traditional crypto transactions are irreversible - one wrong character and your money is gone forever. SafeSend changes this.

## ✨ How SafeSend Works

1. **Send with Confidence**: Create a deposit with the recipient's address and a password
2. **Instant Notification**: Recipient receives a small notification amount immediately
3. **Password Protection**: Full amount can only be claimed with the correct password
4. **Always Recoverable**: Sender can cancel and reclaim funds at any time

## 🎯 Key Features

### 🔐 **Zero Wrong-Address Risk**
- Password verification prevents accidental sends
- Funds are held in escrow until password is provided
- No irreversible transactions to wrong addresses

### 💰 **Always Recoverable**
- Senders can cancel deposits anytime (even before expiry)
- No funds locked forever in wrong addresses
- Full control over your money until it's claimed

### 🚀 **Instant Notifications**
- Recipients get immediate notification of incoming funds
- Small amount sent instantly for awareness
- Main amount held securely until claimed

### 📱 **Mobile-First Design**
- Works seamlessly on any device
- QR code support for mobile wallets
- Optimized for on-the-go transactions

### 🔍 **Complete Transparency**
- All transactions on Ethereum blockchain
- Direct links to Etherscan for verification
- Real-time status tracking

## 🛠️ How to Use

### For Senders:
1. Connect your wallet (MetaMask or 100+ wallets via WalletConnect)
2. Enter recipient address and amount
3. Generate or create a password
4. Send the deposit ID and password to recipient
5. Cancel anytime if needed

### For Recipients:
1. Connect your wallet
2. View all claimable deposits automatically
3. Enter the password provided by sender
4. Claim your ETH instantly

## 💡 Use Cases

- **First-time crypto users**: Eliminate address mistakes
- **Large transactions**: Extra security for significant amounts
- **Business payments**: Recoverable corporate transfers
- **Family & friends**: Safe way to send crypto to newcomers
- **Cross-border payments**: Secure international transfers

## 🔧 Technical Stack

- **Frontend**: React + Vite + TailwindCSS
- **Blockchain**: Ethereum (Sepolia testnet)
- **Wallet Integration**: MetaMask + WalletConnect v2
- **Smart Contract**: Solidity with built-in security features

## 🌐 Try It Now

**Live Demo**: [SafeSend dApp](your-deployment-url)
**Contract**: `0xF83ecf278e24a91eA5Ce80ca33fa862239e56cc3` (Sepolia)

## 🚀 Getting Started (Development)

```bash
# Clone the repository
git clone https://github.com/your-username/safe-send-eth.git
cd safe-send-eth

# Install dependencies
yarn install

# Start development server
yarn dev
```

### Environment Setup

Create a `.env` file:
```
VITE_CONTRACT_ADDRESS=0xF83ecf278e24a91eA5Ce80ca33fa862239e56cc3
VITE_WALLETCONNECT_PROJECT_ID=your_project_id
VITE_SEPOLIA_RPC=https://ethereum-sepolia.blockpi.network/v1/rpc/public
```

## 🛡️ Security Features

- **Audited Smart Contract**: Open source and verifiable
- **Non-custodial**: You control your private keys
- **Expiry Protection**: Deposits automatically expire
- **Cancel Anytime**: Senders retain full control

## 🤝 Contributing

We welcome contributions! SafeSend is building the future of secure crypto transfers.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📊 Roadmap

- [ ] Mainnet deployment
- [ ] Multi-token support (ERC-20)
- [ ] Batch transactions
- [ ] Mobile app
- [ ] Integration APIs for businesses
- [ ] Advanced security features

## ⚖️ License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♀️ Support

- **Documentation**: [docs.safesend.eth](your-docs-url)
- **Discord**: [Join our community](your-discord-link)
- **Twitter**: [@SafeSendETH](your-twitter)
- **Email**: hello@safesend.eth

---

**SafeSend** - Because crypto should be safe by default. 🛡️

*Built with ❤️ for the Ethereum community*