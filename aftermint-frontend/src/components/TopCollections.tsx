import React from 'react';
import Link from 'next/link';
import { Award, TrendingUp, ExternalLink } from 'lucide-react';
import { CollectionStats } from '@/lib/services/storageService';
import { formatNumber } from '@/lib/services/homepageService';

interface TopCollectionsProps {
  collections: CollectionStats[];
  loading?: boolean;
}

const TopCollections: React.FC<TopCollectionsProps> = ({ collections, loading = false }) => {
  // Known collection names mapping
  const collectionNames: { [key: string]: { name: string; symbol: string } } = {
    '0x1639269ed4fe6ff1fc1218cc1cb485313eb50a21': { name: 'LifeNodes', symbol: 'LIFENODES' },
    '0x22af27d00c53c0fba14446958864db7e3fe0852c': { name: 'PixelPepes', symbol: 'PXLPP' },
    '0xd36199215717f858809b0e62441c1f81adbf3d2c': { name: 'CosmicPond', symbol: 'COSMIC' },
    '0x92c2075f517890ed333086f3c4e2bfc3ebf57b5d': { name: 'Dank Pepes', symbol: 'DANK' },
    '0xd819b90f7a7f8e85639671d2951285573bbf8771': { name: 'Based Pepe', symbol: 'BPEPE' },
    '0x40b6184b901334c0a88f528c1a0a1de7a77490f1': { name: 'KEKTECH', symbol: 'KEKTECH' },
    '0xd4b1516eea9ccd966629c2972dab8683069ed7bc': { name: 'BasedBeasts', symbol: 'BEASTS' },
    '0xa0c2262735c1872493c92ec39aff0d9b6894d8fd': { name: 'PepperCorn Genesis', symbol: 'PEPPER' },
    '0x2f3df3922990e63a239d712964795efd9a150dd1': { name: 'KEKISTANIOS', symbol: 'KEKIS' },
    '0xd81dcfbb84c6a29c0c074f701eceddf6cba7877f': { name: 'Peps', symbol: 'PEPS' },
    '0x949e7fe81c82d0b4f4c3e17f2ca1774848e4ae81': { name: 'FancyFrogFamily', symbol: 'FFF' },
    '0xae6a76d106fd5f799a2501e1d563852da88c3db5': { name: 'Gang Game Evolution', symbol: 'GANG' }
  };

  const getCollectionInfo = (address: string) => {
    const info = collectionNames[address.toLowerCase()];
    return info || { 
      name: `Collection ${address.substring(0, 6)}...${address.substring(38)}`, 
      symbol: 'NFT' 
    };
  };

  if (loading) {
    return (
      <div className="glass-card rounded-lg border border-theme-border p-6">
        <h3 className="text-xl font-bold text-theme-text-primary mb-4 flex items-center gap-2">
          <Award size={20} />
          Top Collections (24h)
        </h3>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-theme-surface/50 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-theme-border"></div>
                <div>
                  <div className="w-32 h-4 bg-theme-border rounded mb-1"></div>
                  <div className="w-20 h-3 bg-theme-border rounded"></div>
                </div>
              </div>
              <div className="text-right">
                <div className="w-24 h-4 bg-theme-border rounded mb-1"></div>
                <div className="w-16 h-3 bg-theme-border rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-lg border border-theme-border p-6">
      <h3 className="text-xl font-bold text-theme-text-primary mb-4 flex items-center gap-2">
        <Award size={20} />
        Top Collections (24h)
      </h3>
      
      {collections.length === 0 ? (
        <div className="text-center py-8">
          <Award className="w-12 h-12 mx-auto mb-4 text-theme-text-secondary" />
          <p className="text-theme-text-secondary">No collection data available</p>
        </div>
      ) : (
        <div className="space-y-3">
          {collections.slice(0, 6).map((collection, index) => {
            const collectionInfo = getCollectionInfo(collection.address);
            return (
              <Link
                key={collection.address}
                href={`/collection/${collection.address}`}
                className="flex items-center justify-between p-3 rounded-lg bg-theme-surface/50 hover:bg-theme-surface transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-theme-primary/10 text-theme-primary font-bold text-sm">
                    #{index + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-theme-text-primary group-hover:text-theme-primary">
                        {collectionInfo.name}
                      </span>
                      <span className="text-xs text-theme-text-secondary font-mono">
                        {collectionInfo.symbol}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-theme-text-secondary">
                      <span>{formatNumber(collection.salesCount24h)} sales</span>
                      {collection.listingsCount > 0 && (
                        <>
                          <span>•</span>
                          <span>{formatNumber(collection.listingsCount)} listed</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <TrendingUp size={14} className="text-green-500" />
                    <p className="text-sm font-medium text-theme-text-primary">
                      {collection.volume24hInEth.toFixed(2)} BASED
                    </p>
                  </div>
                  <p className="text-xs text-theme-text-secondary">
                    ${(collection.volume24hInEth * 0.1).toFixed(2)} {/* Rough USD estimate */}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
      
      {collections.length > 6 && (
        <div className="mt-4 text-center">
          <Link
            href="/collections"
            className="inline-flex items-center gap-2 text-theme-primary hover:text-theme-primary/80 text-sm font-medium"
          >
            View All Collections
            <ExternalLink size={14} />
          </Link>
        </div>
      )}
    </div>
  );
};

export default TopCollections; 