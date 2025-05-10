declare module 'ml5' {
  interface Classifier {
    classify: (input: any, callback?: (error: any, result: any) => void) => Promise<any>;
  }

  interface ImageClassifier {
    new (model: string, callback?: () => void): Classifier;
  }

  interface NeuralNetworkOptions {
    task: string;
    debug?: boolean;
    layers: Array<{
      type: string;
      filters?: number;
      kernelSize?: number;
      activation?: string;
      inputShape?: [number, number, number];
      poolSize?: number;
      units?: number;
    }>;
  }

  interface NeuralNetwork {
    load: (path: string) => Promise<void>;
    classify: (input: any, callback?: (error: any, result: any) => void) => Promise<any>;
  }

  export const imageClassifier: ImageClassifier;
  export const neuralNetwork: (options: NeuralNetworkOptions) => Promise<NeuralNetwork>;
} 