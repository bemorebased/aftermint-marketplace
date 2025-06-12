# AfterMint NFT Marketplace

AfterMint is a modern NFT marketplace built for the BasedAI blockchain. Features a comprehensive error tracking system, real-time monitoring, and support for multiple NFT collections.

## 🚀 Live Demo
- **Frontend**: [Deploy to Vercel](https://vercel.com/new/clone?repository-url=https://github.com/bemorebased/aftermint-marketplace)
- **Explorer**: https://explorer.bf1337.org
- **Chain**: BasedAI (ID: 32323)

## 🔧 Tech Stack
- **Frontend**: Next.js 14, TypeScript, TailwindCSS
- **Blockchain**: ethers.js, wagmi, RainbowKit
- **UI**: Radix UI, next-themes
- **Monitoring**: Custom error tracking system

## 📋 Key Features
- ✅ Real-time error tracking and monitoring
- ✅ Multiple NFT collection support  
- ✅ Wallet integration (MetaMask, WalletConnect)
- ✅ IPFS image handling with fallbacks
- ✅ Responsive design with dark/light themes
- ✅ Activity tracking and analytics
- ✅ Pagination and advanced filtering

## 🏗️ Architecture

### Smart Contracts
- **LifeNodes NFT**: `0x1639269Ed4fe6Ff1FC1218Cc1cB485313eb50A21`
- **Marketplace**: `0xEdD719ECA832b667ec537D9c4d9e846FEAee7Ccc`

### Error Tracking System
The app includes a comprehensive error monitoring system:
- Runtime error capture (unhandled errors, promise rejections)
- API call monitoring with timing and failure tracking
- Smart contract call tracking
- Visual debug interface accessible via `Ctrl+Shift+E`
- Real-time error indicator (🎯 button)

## 🛠️ Development

### Prerequisites
- Node.js 18+
- npm or yarn
- Git

### Local Setup
```bash
git clone https://github.com/bemorebased/aftermint-marketplace.git
cd aftermint-marketplace/aftermint-frontend
npm install
npm run dev
```

### Environment Variables
Create a `.env.local` file in the `aftermint-frontend` directory:
```env
NEXT_PUBLIC_CHAIN_ID=32323
NEXT_PUBLIC_RPC_URL=https://mainnet.basedaibridge.com/rpc/
NEXT_PUBLIC_EXPLORER_URL=https://explorer.bf1337.org
NEXT_PUBLIC_LIFENODES_CONTRACT=0x1639269Ed4fe6Ff1FC1218Cc1cB485313eb50A21
NEXT_PUBLIC_MARKETPLACE_CONTRACT=0xEdD719ECA832b667ec537D9c4d9e846FEAee7Ccc
```

### Error Monitoring Commands
Access error tracking in the browser console:
```javascript
// Get current error summary
getErrorSummary()

// Export detailed error table
exportErrors()

// Clear error history
clearErrors()
```

## 🚀 Deployment

### Vercel (Recommended)
1. Fork this repository
2. Connect your fork to Vercel
3. Deploy automatically with the included `vercel.json` configuration

### Manual Deployment
```bash
cd aftermint-frontend
npm run build
npm run start
```

## 🤖 Background Agents & Automation

**ACTIVE MONITORING ENABLED** with automated workflows:

### 🔄 **Continuous Integration**
- **Automated testing** on every push
- **Security audits** with CodeQL analysis  
- **Type checking** and linting validation
- **Dependency vulnerability scanning**

### 🚨 **Error Monitoring**
- **Real-time health checks** every 30 minutes
- **Automatic issue creation** for critical errors
- **Console error detection** via Lighthouse
- **Performance regression alerts**

### 📊 **Performance Monitoring**
- **Lighthouse audits** on every deployment
- **Core Web Vitals tracking** (FCP, LCP, CLS)
- **Accessibility and SEO scores**
- **Performance regression detection**

### 🔧 **Setup Instructions**
1. **Vercel Integration**: Add these secrets to your GitHub repo:
   - `VERCEL_TOKEN`: Your Vercel API token
   - `VERCEL_ORG_ID`: Your Vercel organization ID  
   - `VERCEL_PROJECT_ID`: Your Vercel project ID

2. **Workflows Active**:
   - `.github/workflows/ci.yml` - Main CI/CD pipeline
   - `.github/workflows/error-monitoring.yml` - Automated error detection

## 🐛 Debugging

### Error Tracking Interface
- **Visual Indicator**: Look for the green 🎯 button (bottom-left)
- **Debug Panel**: Press `Ctrl+Shift+E` or click the 🎯 button
- **Console Export**: Use `exportErrors()` in browser console
- **Real-time Monitoring**: Errors appear instantly in the debug panel

### Common Issues
1. **IPFS Images**: Uses SafeImage component with fallbacks
2. **Wallet Connection**: Check MetaMask/WalletConnect setup
3. **API Timeouts**: Monitor API calls in error tracker
4. **Contract Errors**: Smart contract call tracking included

## 📝 API Endpoints
- `/api/prices` - Token price data from CoinGecko
- Explorer API integration for NFT metadata and activity

## 🔗 Resources
- [BasedAI Explorer](https://explorer.bf1337.org)
- [BasedAI Bridge](https://mainnet.basedaibridge.com)
- [LifeNodes Collection](https://explorer.bf1337.org/address/0x1639269Ed4fe6Ff1FC1218Cc1cB485313eb50A21)

## 🤝 Contributing
1. Fork the repository
2. Create a feature branch
3. Test thoroughly using the error tracking system
4. Submit a pull request

## 📄 License
MIT License - see LICENSE file for details

---

**Built with ❤️ for the BasedAI ecosystem** 