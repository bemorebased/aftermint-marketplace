// Number formatting utilities
export const formatNumber = (num: number | string): string => {
  const numValue = typeof num === 'string' ? parseFloat(num) : num;
  
  if (isNaN(numValue)) return '0';
  
  // For numbers >= 1000, add commas
  if (numValue >= 1000) {
    return numValue.toLocaleString('en-US');
  }
  
  return numValue.toString();
};

// Format large numbers with K, M, B suffixes
export const formatCompactNumber = (num: number | string): string => {
  const numValue = typeof num === 'string' ? parseFloat(num) : num;
  
  if (isNaN(numValue)) return '0';
  
  if (numValue >= 1_000_000_000) {
    return (numValue / 1_000_000_000).toFixed(1) + 'B';
  }
  if (numValue >= 1_000_000) {
    return (numValue / 1_000_000).toFixed(1) + 'M';
  }
  if (numValue >= 1_000) {
    return (numValue / 1_000).toFixed(1) + 'K';
  }
  
  return numValue.toString();
};

// Format currency values
export const formatCurrency = (amount: number | string, currency = 'BASED'): string => {
  const numValue = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numValue)) return `0 ${currency}`;
  
  // Format with up to 6 decimal places, removing trailing zeros
  const formatted = numValue.toFixed(6).replace(/\.?0+$/, '');
  return `${formatted} ${currency}`;
};

// Format percentage
export const formatPercentage = (value: number, decimals = 1): string => {
  if (isNaN(value)) return '0%';
  return `${value.toFixed(decimals)}%`;
}; 