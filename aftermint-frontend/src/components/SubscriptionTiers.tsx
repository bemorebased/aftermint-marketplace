"use client";

import React from 'react';
import { Check } from 'lucide-react';

interface SubscriptionTier {
  id: string;
  name: string;
  period: string;
  price: string;
  features: string[];
  recommended?: boolean;
}

const tiers: SubscriptionTier[] = [
  {
    id: '7days',
    name: 'Basic',
    period: '7 days',
    price: '5,000',
    features: [
      'Zero marketplace fees',
      'Priority notifications',
      'Access to exclusive drops'
    ]
  },
  {
    id: '30days',
    name: 'Standard',
    period: '30 days',
    price: '15,000',
    features: [
      'Zero marketplace fees',
      'Priority notifications',
      'Access to exclusive drops',
      'Advanced trading tools'
    ],
    recommended: true
  },
  {
    id: '365days',
    name: 'Premium',
    period: '365 days',
    price: '77,000',
    features: [
      'Zero marketplace fees',
      'Priority notifications',
      'Access to exclusive drops',
      'Advanced trading tools',
      'VIP discord access',
      'Early access to new features'
    ]
  }
];

const SubscriptionTiers = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {tiers.map((tier) => (
        <div 
          key={tier.id}
          className={`glass-card rounded-lg p-6 relative ${
            tier.recommended ? 'border-theme-primary' : ''
          }`}
        >
          {tier.recommended && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-theme-primary text-white px-3 py-1 rounded-full text-sm font-medium">
              Recommended
            </div>
          )}
          
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-theme-text-primary">{tier.name}</h3>
            <p className="text-theme-text-secondary">{tier.period}</p>
            <div className="mt-4">
              <span className="text-3xl font-bold text-theme-primary">{tier.price}</span>
              <span className="text-theme-text-secondary ml-1">BASED</span>
            </div>
          </div>
          
          <ul className="space-y-3 mb-6">
            {tier.features.map((feature, index) => (
              <li key={index} className="flex items-start gap-2">
                <Check size={18} className="text-theme-primary mt-0.5 flex-shrink-0" />
                <span className="text-theme-text-primary">{feature}</span>
              </li>
            ))}
          </ul>
          
          <button className="btn-futuristic w-full rounded-md py-2.5">
            Subscribe
          </button>
        </div>
      ))}
    </div>
  );
};

export default SubscriptionTiers;
