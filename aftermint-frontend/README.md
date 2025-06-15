# AfterMint - NFT Marketplace Frontend

AfterMint is a modern NFT marketplace frontend built for the BasedAI network. The application provides a beautiful, intuitive interface for browsing, buying, and selling NFTs.

## Features

- Browse NFT collections
- View detailed NFT information
- Buy and make offers on NFTs
- Multiple theme options (Dark, Kek, Based)
- Multiple view modes (Based/Collector view, Trader view)
- Wallet connection using RainbowKit
- Responsive design for all devices

## Tech Stack

- **Framework**: Next.js 14
- **Styling**: TailwindCSS
- **Web3 Integration**: wagmi, RainbowKit
- **Icons**: Lucide React

## Getting Started

First, install the dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `/src/app` - Next.js app directory containing pages and layouts
- `/src/components` - Reusable UI components
- `/src/components/layout` - Layout components like Header and Footer
- `/src/app/globals.css` - Global styles and theme definitions

## Pages

- `/` - Homepage with featured collections and trending NFTs
- `/collection` - Browse all collections
- `/collection/[address]` - View a specific collection and its NFTs
- `/nft/[collection]/[tokenId]` - Detailed view for a specific NFT

## Theme Support

AfterMint supports three different themes:

1. **Dark** (default) - A sleek dark theme with green accents
2. **Kek** - A warm amber/gold-colored theme
3. **Based** - A purple-accented theme

Themes can be switched using the theme toggle in the header.

## View Modes

The marketplace offers two distinct view modes:

1. **Based/Collector View** - A grid layout focused on the visual aspects of NFTs
2. **Trader View** - A table/list view with more detailed information for traders

## License

[MIT](LICENSE)
