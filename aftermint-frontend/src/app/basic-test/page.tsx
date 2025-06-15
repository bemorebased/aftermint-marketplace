"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function BasicTestPage() {
  const [metadata, setMetadata] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Just fetch one item to test the API
  useEffect(() => {
    fetch('/api/mock-metadata/0')
      .then(res => res.json())
      .then(data => {
        setMetadata(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching metadata:', err);
        setError('Could not load metadata');
        setLoading(false);
      });
  }, []);
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Basic Test Page</h1>
      <p className="mb-6">This page tests basic functionality without any wallet connections.</p>
      
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-2">Contract Information:</h2>
        <div className="bg-theme-surface p-4 rounded-lg mb-4">
          <p>Contract Address: <span className="font-mono">0x5FbDB2315678afecb367f032d93F642f64180aa3</span></p>
        </div>
      </div>
      
      {loading ? (
        <p>Loading metadata...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-2">NFT #0 Metadata:</h2>
          <div className="bg-theme-surface p-4 rounded-lg">
            <pre className="whitespace-pre-wrap break-all">
              {JSON.stringify(metadata, null, 2)}
            </pre>
          </div>
        </div>
      )}
      
      <div className="flex gap-4">
        <Link href="/" className="px-4 py-2 bg-theme-primary text-black rounded-lg">
          Home
        </Link>
        <Link href="/test-nft" className="px-4 py-2 bg-theme-surface border border-theme-border rounded-lg">
          Test NFT Page
        </Link>
      </div>
    </div>
  );
} 