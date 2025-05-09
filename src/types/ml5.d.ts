declare module 'ml5' {
  interface Classifier {
    classify: (input: any, callback?: (error: any, result: any) => void) => Promise<any>;
  }

  interface ImageClassifier {
    new (model: string, callback?: () => void): Classifier;
  }

  export const imageClassifier: ImageClassifier;
} 