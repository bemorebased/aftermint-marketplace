"use client";

import React, { useState } from 'react';
import { CheckCircle, AlertCircle, ChevronDown, ChevronUp, CreditCard, ShieldCheck } from 'lucide-react';

const SubscriptionPage = () => {
  const [selectedPlan, setSelectedPlan] = useState<'7days' | '30days' | '365days' | null>(null);
  const [showFAQ, setShowFAQ] = useState<number | null>(null);
  
  const faqItems = [
    {
      question: "What benefits do subscribers receive?",
      answer: "Subscribers enjoy 0% marketplace fees (compared to standard 1%), access to exclusive drops, and priority support. Different subscription tiers offer different durations of these benefits."
    },
    {
      question: "Can I get additional benefits with LifeNodes NFT?",
      answer: "Yes! LifeNodes NFT holders also receive 0% marketplace fees and exclusive benefits. These benefits stack with any active subscription for maximum value."
    },
    {
      question: "How do I cancel my subscription?",
      answer: "Subscriptions automatically expire after their duration period. There's no need to cancel, and you won't be charged again unless you manually renew."
    },
    {
      question: "Can I upgrade my subscription?",
      answer: "Yes, you can upgrade to a longer subscription at any time. When you upgrade, any remaining time from your current subscription will be added to your new subscription period."
    },
    {
      question: "How do marketplace fees work?",
      answer: "The standard marketplace fee is 1% of the sale price. With a subscription or LifeNodes NFT, this is reduced to 0%. This means you keep 100% of your sale proceeds."
    }
  ];
  
  // Mock data for tiers - replace with actual data from your contract/backend
  const tiers = [
    {
      id: 'tier_1',
      name: '7-Day Pass',
      price: '1 BASED',
      duration: '7 days',
      feeBps: 0,
      description: 'Unlock 0% marketplace fees for a full week.',
      popular: false,
    },
    {
      id: 'tier_2',
      name: 'Monthly Pro',
      price: '7 BASED',
      duration: '30 days',
      feeBps: 0,
      description: 'Enjoy a whole month of 0% marketplace fees.',
      popular: true,
    },
    {
      id: 'tier_3',
      name: 'Annual Elite',
      price: '30 BASED',
      duration: '365 days',
      feeBps: 0,
      description: 'The best value for long-term 0% marketplace fees.',
      popular: false,
    },
  ];

  const handleSubscribe = (tierId: string) => {
    // Placeholder for subscription logic
    alert(`Subscribing to tier: ${tierId}. Integration with smart contract needed.`);
    // TODO: Implement actual subscription logic, e.g., calling a smart contract function
    // You'll need to interact with the wallet (wagmi/viem) to send a transaction.
  };

  return (
    <div className="container mx-auto py-12 px-4 md:px-6 lg:px-8 max-w-4xl">
      <div className="text-center mb-12">
        <ShieldCheck className="w-16 h-16 text-theme-primary mx-auto mb-4" />
        <h1 className="text-4xl md:text-5xl font-bold text-theme-text-primary mb-3">Subscription Plans</h1>
        <p className="text-lg text-theme-text-secondary max-w-2xl mx-auto">
          Choose a plan to enjoy reduced marketplace fees and other exclusive benefits on your trades.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {tiers.map((tier) => (
          <div 
            key={tier.id}
            className={`p-8 rounded-xl border flex flex-col 
                        ${tier.popular ? 'border-theme-primary shadow-2xl relative' : 'border-theme-border shadow-lg'}
                        bg-theme-surface hover:shadow-xl transition-shadow duration-300`}
          >
            {tier.popular && (
              <div className="absolute top-0 right-0 bg-theme-primary text-theme-on_primary text-xs font-semibold px-3 py-1 rounded-bl-lg rounded-tr-lg">
                POPULAR
              </div>
            )}
            <h2 className="text-2xl font-semibold text-theme-text-primary mb-2">{tier.name}</h2>
            <p className="text-3xl font-bold text-theme-primary mb-1">{tier.price}</p>
            <p className="text-sm text-theme-text-secondary mb-4">for {tier.duration}</p>
            
            <ul className="space-y-2 text-theme-text-secondary mb-6 flex-grow">
                <li className="flex items-center">
                    <ShieldCheck className="w-4 h-4 mr-2 text-green-500" />
                    <span>{tier.feeBps / 100}% Marketplace Fees</span>
                </li>
                <li className="flex items-center">
                    <ShieldCheck className="w-4 h-4 mr-2 text-green-500" />
                    <span>Access to premium features (soon)</span>
                </li>
                 <li className="flex items-center">
                    <ShieldCheck className="w-4 h-4 mr-2 text-green-500" />
                    <span>Priority support (soon)</span>
                </li>
            </ul>
            
            <p className="text-sm text-theme-text-tertiary mb-6 flex-grow">{tier.description}</p>

            <button 
              onClick={() => handleSubscribe(tier.id)}
              className={`w-full mt-auto flex items-center justify-center gap-2 px-6 py-3 font-semibold rounded-lg transition-colors duration-200 
                          ${tier.popular 
                            ? 'bg-theme-primary hover:bg-theme-primary-hover text-theme-on_primary shadow-md' 
                            : 'bg-theme-button-secondary hover:bg-theme-button-secondary-hover text-theme-text-primary border border-theme-border shadow-sm'}
                         `}
            >
              <CreditCard className="w-5 h-5" />
              Subscribe
            </button>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center text-sm text-theme-text-secondary">
        <p>Payments are processed securely on the BasedAI blockchain. Your subscription status will be updated automatically.</p>
        <p>By subscribing, you agree to our Terms of Service and Privacy Policy.</p>
      </div>
    </div>
  );
};

export default SubscriptionPage; 