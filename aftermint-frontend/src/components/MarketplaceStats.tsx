import React from 'react';
import { TrendingUp, ShoppingBag, Tag, Zap } from 'lucide-react';
import { MarketplaceStats as StatsType } from '@/lib/services/storageService';
import { formatNumber } from '@/lib/services/homepageService';

interface MarketplaceStatsProps {
  stats: StatsType;
  loading?: boolean;
}

const MarketplaceStats: React.FC<MarketplaceStatsProps> = ({ stats, loading = false }) => {
  const statItems = [
    {
      label: '24h Volume',
      value: loading ? '...' : `${stats.volume24hInEth.toFixed(2)} BASED`,
      icon: TrendingUp,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    {
      label: 'Active Listings',
      value: loading ? '...' : formatNumber(stats.activeListings),
      icon: ShoppingBag,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      label: '24h Sales',
      value: loading ? '...' : formatNumber(stats.salesCount24h),
      icon: Zap,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    },
    {
      label: 'Active Offers',
      value: loading ? '...' : formatNumber(stats.activeOffers),
      icon: Tag,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {statItems.map((item, index) => (
        <div
          key={index}
          className="glass-card rounded-lg border border-theme-border p-4 hover:border-theme-primary/30 transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <div className={`p-2 rounded-lg ${item.bgColor}`}>
              <item.icon size={20} className={item.color} />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-theme-text-primary mb-1">
              {item.value}
            </p>
            <p className="text-sm text-theme-text-secondary">
              {item.label}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MarketplaceStats; 