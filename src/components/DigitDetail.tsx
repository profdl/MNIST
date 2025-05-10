import React from 'react';
import { useStore } from '../store/store';

export function DigitDetail() {
  const { selectedDigit, isLoading } = useStore();
  const isLatentPrediction = selectedDigit && !selectedDigit.imageUrl.includes('/mnist-sample/');

  return (
    <div 
      className="fixed top-4 right-4 bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-xl z-50"
      style={{ pointerEvents: 'auto' }}
    >
      {selectedDigit ? (
        <>
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
                <h2 className="text-xl font-bold text-gray-800">
                  {isLatentPrediction ? 'Predicted ' : ''}
                  Digit {selectedDigit.digit}
                </h2>
                <span className="text-sm font-medium text-blue-600">
                  {(selectedDigit.confidence * 100).toFixed(1)}%
                </span>
              </div>
              
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                <div 
                  className="h-full bg-blue-500"
                  style={{ width: `${selectedDigit.confidence * 100}%` }}
                />
              </div>

              <div className="text-xs text-gray-500 font-mono bg-gray-50 p-2 rounded overflow-x-auto">
                Position: [{selectedDigit.latentVector.slice(0, 3).map(v => v.toFixed(3)).join(', ')}]
              </div>
              
              {isLatentPrediction && (
                <div className="mt-2 text-xs text-gray-600">
                  <span className="font-medium">Latent space prediction</span>
                </div>
              )}
            </div>
          </div>
          
          <button 
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            onClick={() => useStore.getState().setSelectedDigit(null)}
          >
            ×
          </button>
        </>
      ) : isLoading ? (
        <div className="flex items-center justify-center h-24 w-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-gray-500">
              Generating digit...
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-24 w-64">
          <p className="text-gray-500 text-center">
            Click on any digit in the visualization to see its details,<br />
            or click on empty space to generate a new digit
          </p>
        </div>
      )}
    </div>
  );
}
