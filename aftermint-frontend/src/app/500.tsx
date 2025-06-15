'use client';

import React from 'react';

export default function Custom500() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">500</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">Internal Server Error</p>
        <a 
          href="/" 
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
        >
          Go Home
        </a>
      </div>
    </div>
  );
} 