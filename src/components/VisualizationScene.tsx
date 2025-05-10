import { useRef, useState, useEffect } from 'react';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../store/store';
import { MNISTData, loadMNISTData } from '../utils/mnist';
import * as tf from '@tensorflow/tfjs';

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
      <planeGeometry args={[0.8, 0.8]} />
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
  const { setDigits, model, setSelectedDigit, isLoading } = useStore();
  const [mnistData, setMnistData] = useState<MNISTData[]>([]);
  const { camera, raycaster, mouse } = useThree();
  const [error, setError] = useState<string | null>(null);
  const [planeRef, setPlaneRef] = useState<THREE.Mesh | null>(null);

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

  const handleSceneClick = async (event: any) => {
    console.log('Scene click detected');
    
    // Prevent default behavior
    if (event) event.stopPropagation();
    
    // Update the raycaster with the mouse position
    raycaster.setFromCamera(mouse, camera);
    console.log('Raycaster position:', raycaster.ray.origin, 'direction:', raycaster.ray.direction);

    // Only check intersections with digit billboards (first mnistData.length children)
    const digitObjects = pointsRef.current?.children.slice(0, mnistData.length) || [];
    const intersects = raycaster.intersectObjects(digitObjects);
    console.log('Intersects with digits:', intersects.length);
    if (intersects.length > 0) {
      console.log('Click was on an existing digit');
      console.log('Intersection details:', {
        distance: intersects[0].distance,
        point: intersects[0].point,
        object: intersects[0].object
      });
      return; // Click was on an existing digit, let handlePointClick handle it
    }

    // Check if model is loaded and ready
    if (isLoading) {
      console.log('Model is still loading');
      setError("Model is still loading. Please wait...");
      return;
    }

    if (!model) {
      console.log('Model is not loaded');
      setError("Model failed to load. Please refresh the page.");
      return;
    }

    try {
      // Create a virtual plane to get the 3D intersection point
      const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1));
      const point = new THREE.Vector3();
      const didIntersect = raycaster.ray.intersectPlane(plane, point);
      console.log('Plane intersection:', didIntersect, 'point:', point);
      
      if (!didIntersect) {
        console.log('No intersection with plane');
        return;
      }

      // Get the coordinates in the latent space
      const latentX = point.x;
      const latentY = point.y;
      const latentZ = 0; // Keep Z at 0 for 2D latent space visualization
      
      // Create a latent vector for this position (simplified approach)
      // In a real application, you would need to map from the 2D/3D space back to the actual latent space
      // This is a simplified approach that assumes the visualization is directly showing the latent space
      const latentVector = [latentX, latentY, latentZ];
      
      // Now, generate an image from this latent vector using the model
      // For a real VAE/GAN, you would use a decoder/generator here
      // This is a simplified approach that uses the existing MNIST classifier in reverse
      
      // Create a canvas to draw the prediction
      const canvas = document.createElement('canvas');
      canvas.width = 28;
      canvas.height = 28;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setError("Failed to create canvas context");
        return;
      }

      // Generate synthetic data based on the latent position
      // This is a simple approximation - in a real application, you would use a proper generator/decoder
      const normalizedX = (latentX / 20) + 0.5; // Scale to [0,1] range
      const normalizedY = (latentY / 20) + 0.5; // Scale to [0,1] range
      
      // Fill with white background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, 28, 28);
      
      // Draw a simple digit-like shape based on the position
      ctx.fillStyle = 'black';
      
      // Different patterns based on different areas of latent space
      const regionX = Math.floor(normalizedX * 3);
      const regionY = Math.floor(normalizedY * 3);
      const region = regionX + regionY * 3;
      
      switch (region % 10) {
        case 0: // Circle (like 0)
          ctx.beginPath();
          ctx.arc(14, 14, 10, 0, Math.PI * 2);
          ctx.fill();
          break;
        case 1: // Vertical line (like 1)
          ctx.fillRect(14, 4, 4, 20);
          break;
        case 2: // Curved shape (like 2)
          ctx.beginPath();
          ctx.moveTo(6, 8);
          ctx.quadraticCurveTo(14, 0, 22, 8);
          ctx.lineTo(22, 14);
          ctx.lineTo(6, 14);
          ctx.quadraticCurveTo(14, 28, 22, 20);
          ctx.fill();
          break;
        case 3: // Two connected circles (like 8)
          ctx.beginPath();
          ctx.arc(14, 10, 8, 0, Math.PI * 2);
          ctx.arc(14, 18, 8, 0, Math.PI * 2);
          ctx.fill();
          break;
        case 4: // Square with corner missing (like 4)
          ctx.fillRect(8, 8, 16, 16);
          ctx.clearRect(8, 8, 8, 8);
          break;
        case 5: // Curve with line (like 5)
          ctx.beginPath();
          ctx.moveTo(8, 8);
          ctx.lineTo(20, 8);
          ctx.lineTo(20, 14);
          ctx.quadraticCurveTo(8, 14, 8, 20);
          ctx.quadraticCurveTo(8, 26, 20, 26);
          ctx.fill();
          break;
        case 6: // Circle with tail (like 6 or 9)
          ctx.beginPath();
          ctx.arc(14, 14, 10, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillRect(14, 0, 4, 14);
          break;
        case 7: // Diagonal line (like 7)
          ctx.beginPath();
          ctx.moveTo(8, 8);
          ctx.lineTo(20, 8);
          ctx.lineTo(14, 20);
          ctx.fill();
          break;
        case 8: // Complex shape
          ctx.beginPath();
          ctx.moveTo(8, 8);
          ctx.lineTo(20, 8);
          ctx.lineTo(20, 20);
          ctx.lineTo(8, 20);
          ctx.closePath();
          ctx.fill();
          ctx.clearRect(12, 12, 4, 4);
          break;
        case 9: // Curved line (like 9)
          ctx.beginPath();
          ctx.arc(14, 10, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillRect(14, 10, 4, 14);
          break;
      }

      // Convert canvas to image data
      const imageData = ctx.getImageData(0, 0, 28, 28);
      const pixels = Array.from(imageData.data)
        .filter((_, i) => i % 4 === 0) // Only take the red channel
        .map(p => (255 - p) / 255); // Invert and normalize to [0, 1]

      // Prepare input tensor
      const inputTensor = tf.tensor(pixels).reshape([1, 28, 28, 1]);

      // Make prediction
      const predictions = await model.predict(inputTensor) as tf.Tensor;
      const probabilities = await predictions.data();
      const predictedDigit = probabilities.indexOf(Math.max(...probabilities));
      const confidence = probabilities[predictedDigit];

      // Create a new digit point with the prediction
      const newDigit: DigitPoint = {
        position: [latentX, latentY, latentZ], // Use the actual 3D position
        digit: predictedDigit,
        confidence: confidence,
        latentVector: latentVector,
        imageUrl: canvas.toDataURL()
      };

      // Update the selected digit
      setSelectedDigit(newDigit);
      setError(null); // Clear any previous errors

      // Clean up tensors
      inputTensor.dispose();
      predictions.dispose();
    } catch (err) {
      console.error('Error in handleSceneClick:', err);
      setError("An unexpected error occurred. Please try again.");
    }
  };

  // If only one texture is loaded (fallback), don't render points
  if (textures.length === 1 && mnistData.length > 1) return null;

  return (
    <>
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

        {/* Add invisible plane to capture clicks in empty space */}
        <mesh 
          ref={setPlaneRef}
          visible={false}
          position={[0, 0, -5]}
          onClick={(e: THREE.Event & { stopPropagation: () => void }) => {
            e.stopPropagation();
            handleSceneClick(e);
          }}
        >
          <planeGeometry args={[100, 100]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>

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

      {/* Error message overlay */}
      {error && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          {error}
        </div>
      )}
    </>
  );
}
