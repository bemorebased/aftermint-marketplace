# AfterMint Marketplace

A decentralized NFT marketplace built on BasedAI blockchain with advanced features for trading, collecting, and managing NFTs.

## 🚀 Features

### Core Marketplace
- **NFT Trading**: Buy, sell, and list NFTs with competitive fees
- **Collection Management**: Browse and manage NFT collections
- **Real-time Data**: Live floor prices, market stats, and activity feeds
- **Wallet Integration**: Connect with popular Web3 wallets

### Advanced Features
- **Profile Pages**: Enhanced user profiles with NFT collections and activity
- **Collection Analytics**: Comprehensive market data and statistics
- **Activity Tracking**: Real-time transaction history and marketplace events
- **Responsive Design**: Mobile-first UI with dark/light theme support

## 🛠 Tech Stack

### Frontend
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Wagmi**: Ethereum React hooks
- **Viem**: TypeScript Ethereum library

### Blockchain
- **BasedAI Network**: Layer 1 blockchain (Chain ID: 32323)
- **Solidity**: Smart contract development
- **Hardhat**: Development environment
- **OpenZeppelin**: Security-audited contracts

### APIs & Services
- **Blockscout API**: Blockchain data and NFT metadata
- **Custom APIs**: Price feeds and marketplace data

## 📁 Project Structure

```
AMmarketc3/
├── aftermint-frontend/          # Next.js frontend application
│   ├── src/
│   │   ├── app/                 # App Router pages
│   │   ├── components/          # Reusable UI components
│   │   ├── lib/                 # Utilities and services
│   │   └── utils/               # Helper functions
│   └── public/                  # Static assets
├── hardhat_project/             # Smart contract development
│   ├── contracts/               # Solidity contracts
│   ├── scripts/                 # Deployment and utility scripts
│   └── test/                    # Contract tests
├── docs/                        # API documentation
└── tasks/                       # Project management tasks
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd AMmarketc3
   ```

2. **Install dependencies**
   ```bash
   # Root dependencies
   npm install
   
   # Frontend dependencies
   cd aftermint-frontend
   npm install
   
   # Smart contract dependencies
   cd ../hardhat_project
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy environment template
   cp .env.example .env
   
   # Add your configuration (optional for development)
   # PRIVATE_KEY=your_private_key_here
   # BASED_AI_RPC_URL=https://mainnet.basedaibridge.com/rpc/
   ```

4. **Start Development Server**
   ```bash
   cd aftermint-frontend
   npm run dev
   ```

   Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 🔧 Development

### Frontend Development
```bash
cd aftermint-frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
```

### Smart Contract Development
```bash
cd hardhat_project
npx hardhat compile  # Compile contracts
npx hardhat test     # Run tests
npx hardhat node     # Start local blockchain
```

## 🌐 Network Configuration

### BasedAI Mainnet
- **Chain ID**: 32323
- **RPC URL**: https://mainnet.basedaibridge.com/rpc/
- **Explorer**: https://explorer.bf1337.org
- **Currency**: BASED

### Contract Addresses
- **Marketplace**: `0x1639269ed4fe6ff1fc1218cc1cb485313eb50a21`
- **Storage**: `0x7077ff6f5a65171d07656d8c91a828c355b37a9d`

## 📊 Key Features Implemented

### Phase 1: Profile Page Enhancement
- ✅ NFT collection display with grouping
- ✅ Wallet activity integration
- ✅ Enhanced profile service with Blockscout API
- ✅ Collection group components with market data

### Phase 2: Collection Page Activity
- ✅ Real-time transaction activity
- ✅ Collection statistics and analytics
- ✅ Activity feed with transaction details
- ✅ Enhanced market data accuracy

### Critical Marketplace Features
- ✅ Complete collection data fetching (not just 240 items)
- ✅ Accurate floor price calculations
- ✅ Comprehensive market statistics
- ✅ Proper pagination for large collections

## 🔒 Security

- No private keys or sensitive data in repository
- Environment variables for sensitive configuration
- Smart contracts use OpenZeppelin standards
- Comprehensive input validation and error handling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in this repository
- Check the documentation in the `docs/` folder
- Review the API documentation for integration details

## 🔄 Recent Updates

- **Next.js 15 Migration**: Updated to latest Next.js with async params handling
- **Enhanced NFT Display**: Improved image loading and metadata handling
- **Market Data Accuracy**: Fixed critical collection data fetching issues
- **Performance Optimizations**: Better API pagination and caching

---

Built with ❤️ for the BasedAI ecosystem 