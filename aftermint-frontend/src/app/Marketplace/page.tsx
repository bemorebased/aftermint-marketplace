import React from 'react';
import Header from '@/components/layout/Header';
import CollectionCard from '@/components/CollectionCard';
import { Filter } from 'lucide-react';

// Mock collections data
const collections: any[] = [
  // Collection data similar to featuredCollections on home page
  // Add 8-12 collections for a good grid display
];

export default function Marketplace() {
  return (
    <main>
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Explore Collections</h1>
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters sidebar */}
          <aside className="w-full md:w-64 flex-shrink-0">
            <div className="glass-card rounded-lg p-4 sticky top-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Filters</h2>
                <Filter size={18} />
              </div>
              
              {/* Price Range Filter */}
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-2">Price Range</h3>
                <div className="flex items-center gap-2">
                  <input 
                    type="number" 
                    placeholder="Min" 
                    className="w-full p-2 rounded bg-theme-card-highlight border border-theme-border text-theme-text-primary"
                  />
                  <span>-</span>
                  <input 
                    type="number" 
                    placeholder="Max" 
                    className="w-full p-2 rounded bg-theme-card-highlight border border-theme-border text-theme-text-primary"
                  />
                </div>
              </div>
              
              {/* Status Filter */}
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-2">Status</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded border-theme-border text-theme-primary" />
                    <span>Buy Now</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded border-theme-border text-theme-primary" />
                    <span>On Auction</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded border-theme-border text-theme-primary" />
                    <span>New</span>
                  </label>
                </div>
              </div>
              
              {/* Other filters can be added here */}
              
              <button className="btn-futuristic w-full rounded-md">
                Apply Filters
              </button>
            </div>
          </aside>
          
          {/* Collections grid */}
          <div className="flex-grow">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {collections.map(collection => (
                <CollectionCard key={collection.id} {...collection} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
