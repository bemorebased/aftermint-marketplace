import React from 'react';

export default function SplashScreen() {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-theme-background">
      <div className="text-center">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-theme-primary mb-2">AfterMint</h1>
          <p className="text-theme-text-secondary">NFT Marketplace on BasedAI</p>
        </div>
        <div className="w-16 h-16 border-4 border-theme-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-theme-text-secondary">Initializing wallet connections...</p>
      </div>
    </div>
  );
} 