import React from 'react';
import { useStore } from '../store/store';

export function DigitDetail() {
  const { selectedDigit } = useStore();

  if (!selectedDigit) return null;

  return (
    <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-2">Selected Digit: {selectedDigit.digit}</h2>
      <div className="space-y-2">
        <p>Confidence: {(selectedDigit.confidence * 100).toFixed(2)}%</p>
        <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
          {/* Placeholder for digit image */}
          <span className="text-6xl">{selectedDigit.digit}</span>
        </div>
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Latent Vector</h3>
          <div className="text-sm text-gray-600">
            [{selectedDigit.latentVector.map(v => v.toFixed(3)).join(', ')}]
          </div>
        </div>
      </div>
    </div>
  );
}
