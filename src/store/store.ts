import { create } from 'zustand';
import * as ml5 from 'ml5';
import { MNISTData } from '../utils/mnist';

interface DigitPoint {
  position: [number, number, number];
  digit: number;
  confidence: number;
  latentVector: number[];
}

interface Store {
  digits: DigitPoint[];
  selectedDigit: DigitPoint | null;
  model: any | null;
  isLoading: boolean;
  setDigits: (digits: DigitPoint[]) => void;
  setSelectedDigit: (digit: DigitPoint | null) => void;
  setModel: (model: any) => void;
  setIsLoading: (isLoading: boolean) => void;
  initializeModel: () => Promise<void>;
}

export const useStore = create<Store>((set) => ({
  digits: [],
  selectedDigit: null,
  model: null,
  isLoading: true,
  setDigits: (digits: DigitPoint[]) => set({ digits }),
  setSelectedDigit: (digit: DigitPoint | null) => set({ selectedDigit: digit }),
  setModel: (model: any) => set({ model }),
  setIsLoading: (isLoading: boolean) => set({ isLoading }),
  initializeModel: async () => {
    set({ isLoading: true });
    try {
      const classifier = new ml5.imageClassifier('MNIST', () => {
        set({ model: classifier, isLoading: false });
      });
    } catch (error) {
      console.error('Error initializing MNIST model:', error);
      set({ isLoading: false });
    }
  },
})); 