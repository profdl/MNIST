import { useRef, useState, useEffect } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../store/store';
import { MNISTData, loadMNISTData } from '../utils/mnist';

interface DigitPoint {
  position: [number, number, number];
  digit: number;
  confidence: number;
  latentVector: number[];
  imageUrl: string;
}

export function VisualizationScene() {
  const pointsRef = useRef<THREE.Group>(null);
  const { setDigits } = useStore();
  const [mnistData, setMnistData] = useState<MNISTData[]>([]);

  useEffect(() => {
    // Load MNIST data when component mounts
    loadMNISTData().then((data: MNISTData[]) => {
      setMnistData(data);
      // Convert MNIST data to 3D points
      const points: DigitPoint[] = data.map((item: MNISTData) => ({
        position: item.latentVector as [number, number, number],
        digit: item.label,
        confidence: 0.95, // Mock confidence
        latentVector: item.latentVector,
        imageUrl: item.imageUrl
      }));
      setDigits(points);
    });
  }, [setDigits]);

  useFrame(() => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.001;
    }
  });

  // Preload all textures once mnistData is loaded
  const imageUrls = mnistData.map(d => d.imageUrl);
  const textures = useLoader(THREE.TextureLoader, imageUrls.length > 0 ? imageUrls : ["/mnist-sample/0.png"]);

  const handlePointClick = (digit: DigitPoint) => {
    useStore.getState().setSelectedDigit(digit);
  };

  // If only one texture is loaded (fallback), don't render points
  if (textures.length === 1 && mnistData.length > 1) return null;

  return (
    <group ref={pointsRef}>
      {/* Render MNIST points as images */}
      {mnistData.map((data, index) => (
        <mesh
          key={index}
          position={data.latentVector as [number, number, number]}
          onClick={() => handlePointClick({
            position: data.latentVector as [number, number, number],
            digit: data.label,
            confidence: 0.95,
            latentVector: data.latentVector,
            imageUrl: data.imageUrl
          })}
        >
          <planeGeometry args={[0.25, 0.25]} />
          <meshBasicMaterial map={textures[index]} transparent />
        </mesh>
      ))}

      {/* Grid helper */}
      <gridHelper args={[20, 20]} />

      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <spotLight
        position={[0, 5, 0]}
        angle={0.3}
        penumbra={1}
        intensity={1}
        castShadow
      />
    </group>
  );
}
