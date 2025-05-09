import { useRef, useState, useEffect } from 'react';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../store/store';
import { MNISTData, loadMNISTData } from '../utils/mnist';
import React from 'react';

interface DigitPoint {
  position: [number, number, number];
  digit: number;
  confidence: number;
  latentVector: number[];
  imageUrl: string;
}

function DigitBillboard({ position, texture, onClick }: { position: [number, number, number]; texture: THREE.Texture; onClick: () => void }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { camera } = useThree();
  const [hovered, setHovered] = useState(false);
  const [scale, setScale] = useState(1);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.lookAt(camera.position);
      // Smooth scale animation
      meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);
    }
  });

  return (
    <mesh 
      ref={meshRef} 
      position={position} 
      onClick={onClick}
      onPointerOver={() => {
        setHovered(true);
        setScale(1.2);
      }}
      onPointerOut={() => {
        setHovered(false);
        setScale(1);
      }}
    >
      <planeGeometry args={[1.5, 1.5]} />
      <meshBasicMaterial 
        map={texture} 
        transparent 
        opacity={hovered ? 1 : 0.8}
        color={hovered ? '#ffffff' : '#cccccc'}
      />
    </mesh>
  );
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
        <DigitBillboard
          key={index}
          position={data.latentVector as [number, number, number]}
          texture={textures[index]}
          onClick={() => handlePointClick({
            position: data.latentVector as [number, number, number],
            digit: data.label,
            confidence: 0.95,
            latentVector: data.latentVector,
            imageUrl: data.imageUrl
          })}
        />
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
