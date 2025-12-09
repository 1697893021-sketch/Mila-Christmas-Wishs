import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { AppState } from '../types';

interface TopStarProps {
  appState: AppState;
}

const TopStar: React.FC<TopStarProps> = ({ appState }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  // Generate Star Geometry (Extruded Shape)
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    const outerRadius = 1.5;
    const innerRadius = 0.7;
    const points = 5;

    // Start at top point
    for (let i = 0; i < points * 2; i++) {
      const angle = (i * Math.PI) / points - Math.PI / 2; // -PI/2 to start pointing up
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius; // In 2D shape, Y is up
      if (i === 0) shape.moveTo(x, -y); // Flip Y so it points up in 3D Y-up if we rotate correctly, or just adjust logic
      else shape.lineTo(x, -y);
    }
    shape.closePath();

    const extrudeSettings = {
      depth: 0.5,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.15,
      bevelThickness: 0.15,
    };

    const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geom.center(); // Center geometry for easier rotation
    return geom;
  }, []);

  // Material: Bright Gold with Strong Emissive glow
  const material = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#FFD700',
    emissive: '#FFD700',
    emissiveIntensity: 2.0, // Much brighter self-glow
    metalness: 1.0,
    roughness: 0.1,
    clearcoat: 1.0,
    clearcoatRoughness: 0.0,
  }), []);

  // Pre-calculated positions
  const scatterPos = useMemo(() => new THREE.Vector3(0, 15, 0), []); // Start high up
  const treePos = useMemo(() => new THREE.Vector3(0, 8.5, 0), []); // Top of the tree (tree is ~ -7 to +7)

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const isTree = appState === AppState.TREE_SHAPE;
    const time = state.clock.getElapsedTime();

    // 1. Position Interpolation
    // In scattered mode, let it float around a bit more chaotically high up
    const targetBase = isTree ? treePos : scatterPos;
    
    // Add floating motion
    const floatY = Math.sin(time * 2) * 0.3;
    const floatX = isTree ? 0 : Math.sin(time * 0.5) * 5; // Wander in X when scattered
    const floatZ = isTree ? 0 : Math.cos(time * 0.5) * 5; // Wander in Z when scattered

    const targetX = targetBase.x + floatX;
    const targetY = targetBase.y + floatY;
    const targetZ = targetBase.z + floatZ;

    meshRef.current.position.x = THREE.MathUtils.damp(meshRef.current.position.x, targetX, 2, delta);
    meshRef.current.position.y = THREE.MathUtils.damp(meshRef.current.position.y, targetY, 2, delta);
    meshRef.current.position.z = THREE.MathUtils.damp(meshRef.current.position.z, targetZ, 2, delta);

    // 2. Rotation
    // Always spin slowly
    meshRef.current.rotation.y += delta * 0.5;
    
    // In scatter mode, maybe tumble a bit
    if (!isTree) {
        meshRef.current.rotation.x += delta * 0.2;
        meshRef.current.rotation.z += delta * 0.1;
    } else {
        // Return to upright-ish (though continuous spinning Y is desired)
        meshRef.current.rotation.x = THREE.MathUtils.damp(meshRef.current.rotation.x, 0, 2, delta);
        meshRef.current.rotation.z = THREE.MathUtils.damp(meshRef.current.rotation.z, 0, 2, delta);
    }
  });

  return (
    <mesh ref={meshRef} geometry={geometry} material={material} castShadow receiveShadow>
       {/* High intensity light for the star source */}
       <pointLight intensity={3} distance={20} color="#FFD700" decay={2} />
    </mesh>
  );
};

export default TopStar;