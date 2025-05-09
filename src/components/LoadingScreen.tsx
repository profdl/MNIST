import React from 'react';
import { useStore } from '../store/store';

export function LoadingScreen() {
  const { isLoading } = useStore();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl text-center">
        <h2 className="text-2xl font-bold mb-4">Loading MNIST Model</h2>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-gray-600">Please wait while we initialize the model...</p>
      </div>
    </div>
  );
}
