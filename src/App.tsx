import { useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { VisualizationScene } from './components/VisualizationScene';
import { DigitDetail } from './components/DigitDetail';
import { LoadingScreen } from './components/LoadingScreen';
import { useStore } from './store/store';

// Add type declarations for JSX elements
declare global {
  namespace JSX {
    interface IntrinsicElements {
      mesh: any;
      boxGeometry: any;
      meshStandardMaterial: any;
      ambientLight: any;
      pointLight: any;
    }
  }
}

function App() {
  const { initializeModel } = useStore();

  useEffect(() => {
    initializeModel();
  }, [initializeModel]);

  return (
    <div className="relative w-screen h-screen">
      {/* 3D Scene */}
      <div className="absolute inset-0">
        <Canvas
          camera={{ position: [0, 0, 40], fov: 60 }}
          shadows
          className="w-full h-full bg-gray-900"
        >
          <VisualizationScene />
          <OrbitControls enableDamping dampingFactor={0.05} />
        </Canvas>
      </div>

      {/* UI Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <LoadingScreen />
        <DigitDetail />
      </div>
    </div>
  );
}

export default App;
