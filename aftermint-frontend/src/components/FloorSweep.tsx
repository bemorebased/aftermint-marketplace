"use client";

import React, { useState } from 'react';

interface FloorSweepProps {
  floorPrice: number;
  maxItems: number;
  onSweepChange: (quantity: number, totalPrice: number) => void;
}

// First, let's define a simple slider component
const Slider = ({ value, max, onChange }: { value: number, max: number, onChange: (v: number) => void }) => {
  return (
    <div className="relative h-6 w-full">
      <div className="absolute inset-0 rounded-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-theme-primary to-cyan-400"></div>
      </div>
      <input
        type="range"
        min="1"
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      <div 
        className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-theme-primary to-cyan-400 rounded-full"
        style={{ width: `${(value / max) * 100}%` }}
      ></div>
      <div 
        className="absolute top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-white shadow-md"
        style={{ left: `calc(${(value / max) * 100}% - 10px)` }}
      ></div>
    </div>
  );
};

const FloorSweep: React.FC<FloorSweepProps> = ({ floorPrice, maxItems = 10, onSweepChange }) => {
  const [quantity, setQuantity] = useState(2);
  const totalPrice = quantity * floorPrice;
  
  const handleChange = (newQuantity: number) => {
    setQuantity(newQuantity);
    onSweepChange(newQuantity, newQuantity * floorPrice);
  };
  
  return (
    <div className="glass-card p-4 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Floor Sweep</h3>
      
      <div className="space-y-6">
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-theme-text-secondary">Quantity:</span>
            <span className="font-bold text-theme-primary">{quantity}</span>
          </div>
          <Slider value={quantity} max={maxItems} onChange={handleChange} />
        </div>
        
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-theme-text-secondary">Total Price:</p>
            <p className="text-xl font-bold text-theme-primary">{totalPrice.toFixed(2)} BASED</p>
          </div>
          
          <button className="btn-futuristic rounded-md">
            Sweep Floor
          </button>
        </div>
      </div>
    </div>
  );
};

export default FloorSweep;
