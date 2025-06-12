/**
 * Utility functions for the application
 */

import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines multiple class names and applies Tailwind's merge to prevent conflicts
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generates CSS variable name for a given theme property
 */
export function theme(property: string) {
  return `var(--${property})`;
}

/**
 * Creates a Tailwind CSS opacity modifier for HSL variables
 */
export function withOpacity(variable: string, opacity: number) {
  return `hsl(var(--${variable}) / ${opacity})`;
}

/**
 * Formats a number to a currency string
 */
export function formatCurrency(amount: number, currency = 'BASED', decimals = 2) {
  return `${amount.toFixed(decimals)} ${currency}`;
}

/**
 * Truncates text with ellipsis
 */
export function truncateText(text: string, length = 20) {
  if (text.length <= length) return text;
  return `${text.substring(0, length)}...`;
}

/**
 * Formats an Ethereum address for display
 */
export function formatAddress(address: string, chars = 4) {
  if (!address) return '';
  if (address.length <= chars * 2 + 2) return address;
  return `${address.substring(0, chars + 2)}...${address.substring(address.length - chars)}`;
}

/**
 * Calculates time ago from a date
 */
export function timeAgo(date: Date | string) {
  const now = new Date();
  const past = typeof date === 'string' ? new Date(date) : date;
  const seconds = Math.floor((now.getTime() - past.getTime()) / 1000);
  
  if (seconds < 60) return 'just now';
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days !== 1 ? 's' : ''} ago`;
  
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months !== 1 ? 's' : ''} ago`;
  
  const years = Math.floor(months / 12);
  return `${years} year${years !== 1 ? 's' : ''} ago`;
} 