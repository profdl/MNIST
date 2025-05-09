import React, { useEffect, useState } from 'react';
import { useStore } from '../store/store';

export function DigitDetail() {
  const { selectedDigit } = useStore();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (selectedDigit) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [selectedDigit]);

  if (!selectedDigit) return null;

  return (
    <div 
      className={`fixed top-4 right-4 bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-xl transition-all duration-300 transform z-50 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
      style={{ pointerEvents: 'auto' }}
    >
      <div className="flex items-start space-x-4">
        <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border-2 border-gray-200">
          <img 
            src={selectedDigit.imageUrl} 
            alt={`Digit ${selectedDigit.digit}`}
            className="w-full h-full object-contain"
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-gray-800">Digit {selectedDigit.digit}</h2>
            <span className="text-sm font-medium text-blue-600">
              {(selectedDigit.confidence * 100).toFixed(1)}%
            </span>
          </div>
          
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
            <div 
              className="h-full bg-blue-500 transition-all duration-500"
              style={{ width: `${selectedDigit.confidence * 100}%` }}
            />
          </div>

          <div className="text-xs text-gray-500 font-mono bg-gray-50 p-2 rounded overflow-x-auto">
            [{selectedDigit.latentVector.slice(0, 3).map(v => v.toFixed(3)).join(', ')}...]
          </div>
        </div>
      </div>
    </div>
  );
}
