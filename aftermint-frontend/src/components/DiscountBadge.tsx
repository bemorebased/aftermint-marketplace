import React from 'react';
import { Badge, Zap } from 'lucide-react';

interface DiscountBadgeProps {
  type: 'fee-discount' | 'holder' | 'subscriber';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const DiscountBadge: React.FC<DiscountBadgeProps> = ({ 
  type, 
  size = 'md',
  showLabel = true 
}) => {
  const sizeClasses = {
    sm: 'text-xs p-1',
    md: 'text-sm p-1.5',
    lg: 'text-base p-2'
  };
  
  const typeConfig = {
    'fee-discount': {
      icon: <Zap size={size === 'sm' ? 12 : size === 'md' ? 14 : 16} />,
      label: '0% Fees',
      bgColor: 'bg-theme-primary/20',
      textColor: 'text-theme-primary'
    },
    'holder': {
      icon: <Badge size={size === 'sm' ? 12 : size === 'md' ? 14 : 16} />,
      label: 'NFT Holder',
      bgColor: 'bg-purple-500/20',
      textColor: 'text-purple-500'
    },
    'subscriber': {
      icon: <Zap size={size === 'sm' ? 12 : size === 'md' ? 14 : 16} />,
      label: 'Subscriber',
      bgColor: 'bg-cyan-500/20',
      textColor: 'text-cyan-500'
    }
  };
  
  const config = typeConfig[type];
  
  return (
    <div className={`inline-flex items-center gap-1 rounded-full ${config.bgColor} ${config.textColor} ${sizeClasses[size]}`}>
      {config.icon}
      {showLabel && <span className="font-medium">{config.label}</span>}
    </div>
  );
};

export default DiscountBadge;
