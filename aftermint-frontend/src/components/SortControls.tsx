"use client";

import React from 'react';
import { ArrowDown, ArrowUp, Hash } from 'lucide-react';

type SortOption = 'price-low' | 'price-high' | 'id-low' | 'id-high';

interface SortControlsProps {
  currentSort: SortOption;
  onSortChange: (sort: SortOption) => void;
}

const SortControls: React.FC<SortControlsProps> = ({ currentSort, onSortChange }) => {
  return (
    <div className="flex space-x-2">
      <button 
        className={`p-2 rounded ${currentSort === 'price-low' ? 'bg-theme-primary text-white' : 'bg-theme-surface text-theme-text-secondary'}`}
        onClick={() => onSortChange('price-low')}
        title="Price: Low to High"
      >
        <ArrowDown size={16} />
      </button>
      
      <button 
        className={`p-2 rounded ${currentSort === 'price-high' ? 'bg-theme-primary text-white' : 'bg-theme-surface text-theme-text-secondary'}`}
        onClick={() => onSortChange('price-high')}
        title="Price: High to Low"
      >
        <ArrowUp size={16} />
      </button>
      
      <button 
        className={`p-2 rounded ${currentSort === 'id-low' ? 'bg-theme-primary text-white' : 'bg-theme-surface text-theme-text-secondary'}`}
        onClick={() => onSortChange('id-low')}
        title="ID: Low to High"
      >
        <Hash size={16} className="mr-1" />
        <ArrowDown size={16} />
      </button>
      
      <button 
        className={`p-2 rounded ${currentSort === 'id-high' ? 'bg-theme-primary text-white' : 'bg-theme-surface text-theme-text-secondary'}`}
        onClick={() => onSortChange('id-high')}
        title="ID: High to Low"
      >
        <Hash size={16} className="mr-1" />
        <ArrowUp size={16} />
      </button>
    </div>
  );
};

export default SortControls;
