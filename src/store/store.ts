import { create } from 'zustand';
import * as tf from '@tensorflow/tfjs';


interface DigitPoint {
  position: [number, number, number];
  digit: number;
  confidence: number;
  latentVector: number[];
  imageUrl: string;
}

interface Store {
  digits: DigitPoint[];
  selectedDigit: DigitPoint | null;
  model: tf.LayersModel | null;
  isLoading: boolean;
  setDigits: (digits: DigitPoint[]) => void;
  setSelectedDigit: (digit: DigitPoint | null) => void;
  setModel: (model: tf.LayersModel | null) => void;
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
  setModel: (model: tf.LayersModel | null) => set({ model }),
  setIsLoading: (isLoading: boolean) => set({ isLoading }),
  initializeModel: async () => {
    set({ isLoading: true });
    try {
      // Initialize TensorFlow.js
      await tf.ready();
      
      // Create a new model with the same architecture
      const model = tf.sequential();
      
      // Add layers
      model.add(tf.layers.conv2d({
        inputShape: [28, 28, 1],
        kernelSize: 3,
        filters: 32,
        activation: 'relu'
      }));
      
      model.add(tf.layers.maxPooling2d({ poolSize: [2, 2] }));
      
      model.add(tf.layers.conv2d({
        kernelSize: 3,
        filters: 64,
        activation: 'relu'
      }));
      
      model.add(tf.layers.maxPooling2d({ poolSize: [2, 2] }));
      
      model.add(tf.layers.flatten());
      
      model.add(tf.layers.dense({
        units: 128,
        activation: 'relu'
      }));
      
      model.add(tf.layers.dense({
        units: 10,
        activation: 'softmax'
      }));
      
      // Load weights
      const weights = await fetch('/models/mnist/group1-shard1of1.bin').then(r => r.arrayBuffer());
      const weightData = new Float32Array(weights);
      
      // Set weights manually
      const weightShapes = [
        [3, 3, 1, 32],  // conv2d kernel
        [32],           // conv2d bias
        [3, 3, 32, 64], // conv2d_1 kernel
        [64],           // conv2d_1 bias
        [1600, 128],    // dense kernel
        [128],          // dense bias
        [128, 10],      // dense_1 kernel
        [10]            // dense_1 bias
      ];
      
      let offset = 0;
      
      // Get only the layers that have weights (conv2d and dense)
      const layersWithWeights = model.layers.filter(layer => 
        layer.getClassName().toLowerCase().includes('conv2d') || 
        layer.getClassName().toLowerCase().includes('dense')
      );
      
      // Process each layer's weights
      for (let i = 0; i < weightShapes.length; i += 2) {
        const layer = layersWithWeights[i / 2];
        const kernelShape = weightShapes[i];
        const biasShape = weightShapes[i + 1];
        
        // Calculate sizes
        const kernelSize = kernelShape.reduce((a, b) => a * b, 1);
        const biasSize = biasShape.reduce((a, b) => a * b, 1);
        
        // Create tensors
        const kernelValues = weightData.slice(offset, offset + kernelSize);
        const biasValues = weightData.slice(offset + kernelSize, offset + kernelSize + biasSize);
        
        const kernelTensor = tf.tensor(kernelValues, kernelShape);
        const biasTensor = tf.tensor(biasValues, biasShape);
        
        // Set weights for the layer
        layer.setWeights([kernelTensor, biasTensor]);
        
        // Clean up tensors
        kernelTensor.dispose();
        biasTensor.dispose();
        
        offset += kernelSize + biasSize;
      }
      
      // Warm up the model with a dummy prediction
      const dummyInput = tf.zeros([1, 28, 28, 1]);
      const prediction = model.predict(dummyInput) as tf.Tensor;
      prediction.dispose();
      dummyInput.dispose();
      
      set({ model, isLoading: false });
    } catch (error) {
      console.error('Error initializing MNIST model:', error);
      set({ isLoading: false });
    }
  },
})); 