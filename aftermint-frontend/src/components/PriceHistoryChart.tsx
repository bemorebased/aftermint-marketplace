'use client';

import React, { useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

type PricePoint = {
  date: string;
  price: number;
};

interface PriceHistoryChartProps {
  data: PricePoint[];
  currency?: string;
}

const PriceHistoryChart: React.FC<PriceHistoryChartProps> = ({ 
  data, 
  currency = 'BASED'
}) => {
  return (
    <div className="h-60 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
        >
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="date" 
            tick={{ fill: 'hsl(var(--text-secondary))' }}
            axisLine={{ stroke: 'hsl(var(--border-color))' }}
            tickLine={{ stroke: 'hsl(var(--border-color))' }}
          />
          <YAxis 
            tick={{ fill: 'hsl(var(--text-secondary))' }}
            axisLine={{ stroke: 'hsl(var(--border-color))' }}
            tickLine={{ stroke: 'hsl(var(--border-color))' }}
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip
            contentStyle={{ 
              backgroundColor: 'hsl(var(--surface))',
              borderColor: 'hsl(var(--border-color))',
              color: 'hsl(var(--text-primary))'
            }}
            formatter={(value: number) => [`${value} ${currency}`, 'Price']}
            labelFormatter={(label) => `Date: ${label}`}
          />
          <Line 
            type="monotone" 
            dataKey="price" 
            stroke="hsl(var(--primary))" 
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
            fillOpacity={1}
            fill="url(#colorPrice)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PriceHistoryChart;
