"use client";

import { Grid, List, LayoutGrid, Users } from 'lucide-react';

interface ViewModeToggleProps {
  currentMode: 'grid' | 'trader' | 'compact';
  onChange: (mode: 'grid' | 'trader' | 'compact') => void;
  itemsPerPage: 20 | 40;
  onItemsPerPageChange: (items: 20 | 40) => void;
}

export default function ViewModeToggle({ 
  currentMode, 
  onChange, 
  itemsPerPage, 
  onItemsPerPageChange 
}: ViewModeToggleProps) {
  return (
    <div className="flex items-center gap-4">
      {/* Items per page selector */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-theme-text-secondary">Show:</span>
        <div className="flex items-center gap-1 p-0.5 rounded-lg border border-theme-border bg-theme-surface">
          <button 
            onClick={() => onItemsPerPageChange(20)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              itemsPerPage === 20 
                ? 'bg-theme-primary text-black' 
                : 'text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-card-highlight'
            }`}
          >
            20
          </button>
          <button 
            onClick={() => onItemsPerPageChange(40)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              itemsPerPage === 40 
                ? 'bg-theme-primary text-black' 
                : 'text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-card-highlight'
            }`}
          >
            40
          </button>
        </div>
      </div>

      {/* View mode selector */}
      <div className="flex items-center gap-1 p-0.5 rounded-lg border border-theme-border bg-theme-surface">
      <button
          onClick={() => onChange('grid')}
          title="Grid View"
          className={`p-2 rounded-md transition-colors ${
            currentMode === 'grid' 
            ? 'bg-theme-primary text-black'
              : 'text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-card-highlight'
          }`}
      >
          <Grid size={18} />
      </button>
      <button
        onClick={() => onChange('trader')}
          title="Trader View"
          className={`p-2 rounded-md transition-colors ${
          currentMode === 'trader'
            ? 'bg-theme-primary text-black'
              : 'text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-card-highlight'
          }`}
      >
        <List size={18} />
        </button>
        <button 
          onClick={() => onChange('compact')}
          title="Compact View"
          className={`p-2 rounded-md transition-colors ${
            currentMode === 'compact' 
              ? 'bg-theme-primary text-black' 
              : 'text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-card-highlight'
          }`}
        >
          <LayoutGrid size={18} />
      </button>
      </div>
    </div>
  );
}
