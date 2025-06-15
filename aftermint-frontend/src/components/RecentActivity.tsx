import React from 'react';
import Link from 'next/link';
import { Clock, ShoppingBag, Tag, TrendingUp, ExternalLink } from 'lucide-react';
import { RecentActivity as ActivityType } from '@/lib/services/storageService';
import { formatTimeAgo } from '@/lib/services/homepageService';

interface RecentActivityProps {
  activities: ActivityType[];
  loading?: boolean;
}

const RecentActivity: React.FC<RecentActivityProps> = ({ activities, loading = false }) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'sale':
        return <TrendingUp size={16} className="text-green-500" />;
      case 'listing':
        return <ShoppingBag size={16} className="text-blue-500" />;
      case 'offer':
        return <Tag size={16} className="text-orange-500" />;
      default:
        return <Clock size={16} className="text-theme-text-secondary" />;
    }
  };

  const getActivityLabel = (type: string) => {
    switch (type) {
      case 'sale':
        return 'Sold';
      case 'listing':
        return 'Listed';
      case 'offer':
        return 'Offered';
      default:
        return 'Activity';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'sale':
        return 'text-green-500';
      case 'listing':
        return 'text-blue-500';
      case 'offer':
        return 'text-orange-500';
      default:
        return 'text-theme-text-secondary';
    }
  };

  if (loading) {
    return (
      <div className="glass-card rounded-lg border border-theme-border p-6">
        <h3 className="text-xl font-bold text-theme-text-primary mb-4 flex items-center gap-2">
          <Clock size={20} />
          Recent Activity
        </h3>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-theme-surface/50 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-theme-border"></div>
                <div>
                  <div className="w-24 h-4 bg-theme-border rounded mb-1"></div>
                  <div className="w-16 h-3 bg-theme-border rounded"></div>
                </div>
              </div>
              <div className="text-right">
                <div className="w-20 h-4 bg-theme-border rounded mb-1"></div>
                <div className="w-12 h-3 bg-theme-border rounded"></div>
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
        <Clock size={20} />
        Recent Activity
      </h3>
      
      {activities.length === 0 ? (
        <div className="text-center py-8">
          <Clock className="w-12 h-12 mx-auto mb-4 text-theme-text-secondary" />
          <p className="text-theme-text-secondary">No recent activity</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.slice(0, 8).map((activity, index) => (
            <div
              key={`${activity.nftContract}-${activity.tokenId}-${index}`}
              className="flex items-center justify-between p-3 rounded-lg bg-theme-surface/50 hover:bg-theme-surface transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-theme-border">
                  {getActivityIcon(activity.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${getActivityColor(activity.type)}`}>
                      {getActivityLabel(activity.type)}
                    </span>
                    <Link
                      href={`/nft/${activity.nftContract}/${activity.tokenId}`}
                      className="text-sm text-theme-text-primary hover:text-theme-primary font-mono"
                    >
                      #{activity.tokenId}
                    </Link>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-theme-text-secondary">
                    <span>{formatTimeAgo(activity.timestamp)}</span>
                    {activity.from && (
                      <>
                        <span>•</span>
                        <Link
                          href={`https://explorer.bf1337.org/address/${activity.from}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-theme-primary font-mono"
                        >
                          {activity.from.substring(0, 6)}...{activity.from.substring(38)}
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-theme-text-primary">
                  {parseFloat(activity.price).toFixed(3)} BASED
                </p>
                <p className="text-xs text-theme-text-secondary">
                  ${(activity.priceInEth * 0.1).toFixed(2)} {/* Rough USD estimate */}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {activities.length > 8 && (
        <div className="mt-4 text-center">
          <Link
            href="/activity"
            className="inline-flex items-center gap-2 text-theme-primary hover:text-theme-primary/80 text-sm font-medium"
          >
            View All Activity
            <ExternalLink size={14} />
          </Link>
        </div>
      )}
    </div>
  );
};

export default RecentActivity; 