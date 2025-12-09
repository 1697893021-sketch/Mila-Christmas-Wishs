import React, { useMemo, useRef, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { AppState, ParticleData } from '../types';

// Palette: Updated for a "Gilded Dream" look
// Champagne, Bright Gold, Deep Emerald, Platinum, Rose Gold
const COLORS = [
  '#FFD700', // Standard Gold
  '#FCE6C9', // Champagne / Pearl
  '#004225', // Deep Emerald (Keep for contrast)
  '#D4AF37', // Metallic Gold
  '#E5E4E2', // Platinum
  '#B76E79', // Rose Gold hint
];

// Reuse geometry and material for performance
const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
const sphereGeometry = new THREE.SphereGeometry(0.6, 32, 32); // Smoother spheres
const diamondGeometry = new THREE.OctahedronGeometry(0.7);

// Updated Material for High Fidelity "Gilded" look
const material = new THREE.MeshPhysicalMaterial({
  metalness: 1.0,       // Fully metallic
  roughness: 0.15,      // Very smooth but not perfect mirror
  clearcoat: 1.0,       // Lacquered finish
  clearcoatRoughness: 0.1,
  envMapIntensity: 3.0, // Significantly boost reflections for "brightness"
  emissive: '#FFD700',
  emissiveIntensity: 0.1, // Subtle inner glow
});

interface OrnamentsProps {
  appState: AppState;
}

const Ornaments: React.FC<OrnamentsProps> = ({ appState }) => {
  const boxesRef = useRef<THREE.InstancedMesh>(null);
  const spheresRef = useRef<THREE.InstancedMesh>(null);
  const diamondsRef = useRef<THREE.InstancedMesh>(null);

  // Configuration
  const counts = { boxes: 300, spheres: 250, diamonds: 200 };
  const totalItems = counts.boxes + counts.spheres + counts.diamonds;

  // Temp variables for animation loop to avoid GC
  const tempObj = useMemo(() => new THREE.Object3D(), []);
  const tempPos = useMemo(() => new THREE.Vector3(), []);
  const tempRot = useMemo(() => new THREE.Euler(), []);
  const tempQuat = useMemo(() => new THREE.Quaternion(), []);
  const targetPos = useMemo(() => new THREE.Vector3(), []);
  
  // --- Data Generation ---
  // We generate data for all items combined, then slice them for specific meshes
  const data = useMemo(() => {
    const items: ParticleData[] = [];
    const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // ~2.3999 rad

    // Create an array of indices [0...totalItems-1] and shuffle them.
    const structuralIndices = Array.from({ length: totalItems }, (_, i) => i);
    // Fisher-Yates shuffle
    for (let i = structuralIndices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [structuralIndices[i], structuralIndices[j]] = [structuralIndices[j], structuralIndices[i]];
    }

    for (let i = 0; i < totalItems; i++) {
      // 1. Scatter Position (Random Sphere)
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      const scatterRadius = 15 + Math.random() * 15; // 15 to 30 units out
      const scatterX = scatterRadius * Math.sin(phi) * Math.cos(theta);
      const scatterY = scatterRadius * Math.sin(phi) * Math.sin(theta);
      const scatterZ = scatterRadius * Math.cos(phi);

      // 2. Tree Position (Spiral Cone) with Staggered Offset
      const sIdx = structuralIndices[i];
      
      // Normalized height 'y' from 0 (bottom) to 1 (top) based on structural index
      const yNorm = sIdx / totalItems; 
      
      // Cone height range: -6 to +6 (Total height 14)
      const treeH = 14; 
      
      // Stagger Effect: Add random jitter to height so they aren't perfectly aligned
      const yJitter = (Math.random() - 0.5) * 1.5; 
      const treeY = (yNorm * treeH) - (treeH / 2) + yJitter;
      
      // Radius decreases as we go up. Base 5.5, Top 0.2
      // Stagger Effect: Add random jitter to radius for depth/volume
      const rJitter = (Math.random() - 0.5) * 2.0; 
      const coneRadius = Math.max(0.1, (1 - yNorm) * 5.5 + 0.2 + rJitter);
      
      const angle = sIdx * goldenAngle;
      
      const treeX = Math.cos(angle) * coneRadius;
      const treeZ = Math.sin(angle) * coneRadius;

      // 3. Visuals
      const scale = 0.3 + Math.random() * 0.5;
      const color = new THREE.Color(COLORS[Math.floor(Math.random() * COLORS.length)]);
      
      items.push({
        scatterPos: new THREE.Vector3(scatterX, scatterY, scatterZ),
        scatterRot: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, 0),
        treePos: new THREE.Vector3(treeX, treeY, treeZ),
        treeRot: new THREE.Euler(0, -angle, 0), // Face outward slightly
        color,
        scale,
        phaseOffset: Math.random() * 100,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
      });
    }
    return items;
  }, [totalItems]);

  // --- Initialization ---
  useLayoutEffect(() => {
    // Helper to init a specific mesh ref with a slice of data
    const initMesh = (ref: React.RefObject<THREE.InstancedMesh>, startIdx: number, count: number) => {
      if (!ref.current) return;
      
      for (let i = 0; i < count; i++) {
        const d = data[startIdx + i];
        tempObj.position.copy(d.scatterPos);
        tempObj.rotation.copy(d.scatterRot);
        tempObj.scale.setScalar(d.scale);
        tempObj.updateMatrix();
        
        ref.current.setMatrixAt(i, tempObj.matrix);
        ref.current.setColorAt(i, d.color);
      }
      ref.current.instanceMatrix.needsUpdate = true;
      ref.current.instanceColor!.needsUpdate = true;
    };

    initMesh(boxesRef, 0, counts.boxes);
    initMesh(spheresRef, counts.boxes, counts.spheres);
    initMesh(diamondsRef, counts.boxes + counts.spheres, counts.diamonds);
  }, [data, counts]);

  // --- Animation Loop ---
  useFrame((state, delta) => {
    const isTree = appState === AppState.TREE_SHAPE;
    
    // We want the transition to be relatively quick but heavy.
    const time = state.clock.getElapsedTime();

    const animateMesh = (ref: React.RefObject<THREE.InstancedMesh>, startIdx: number, count: number) => {
      if (!ref.current) return;
      
      for (let i = 0; i < count; i++) {
        const d = data[startIdx + i];
        
        // Retrieve current instance matrix
        ref.current.getMatrixAt(i, tempObj.matrix);
        tempObj.matrix.decompose(tempPos, tempQuat, tempObj.scale); // Decompose to get current pos/rot
        tempRot.setFromQuaternion(tempQuat);

        // Determine target position based on state
        // Add a floating sine wave to both states for "aliveness"
        const floatY = Math.sin(time * 1.5 + d.phaseOffset) * 0.2;
        
        const targetBase = isTree ? d.treePos : d.scatterPos;

        targetPos.set(
          targetBase.x,
          targetBase.y + (isTree ? floatY * 0.5 : floatY), // Less float in tree mode
          targetBase.z
        );

        // Smoothly interpolate current -> target
        tempPos.x = THREE.MathUtils.damp(tempPos.x, targetPos.x, 3, delta);
        tempPos.y = THREE.MathUtils.damp(tempPos.y, targetPos.y, 3, delta);
        tempPos.z = THREE.MathUtils.damp(tempPos.z, targetPos.z, 3, delta);

        // Rotate meshes slowly
        const rotX = tempRot.x + d.rotationSpeed;
        const rotY = tempRot.y + d.rotationSpeed;
        const rotZ = tempRot.z + d.rotationSpeed;

        // Interpolate rotation towards organized alignment if tree
        if (isTree) {
             // Slowly orient to tree rotation, but keep spinning slightly
             tempObj.rotation.set(
                THREE.MathUtils.damp(rotX, d.treeRot.x, 2, delta),
                THREE.MathUtils.damp(rotY, d.treeRot.y + time * 0.2, 2, delta), // Spin around Y in tree mode
                THREE.MathUtils.damp(rotZ, d.treeRot.z, 2, delta)
             );
        } else {
             tempObj.rotation.set(rotX, rotY, rotZ);
        }
        
        tempObj.position.copy(tempPos);
        tempObj.updateMatrix();
        ref.current.setMatrixAt(i, tempObj.matrix);
      }
      ref.current.instanceMatrix.needsUpdate = true;
    };

    animateMesh(boxesRef, 0, counts.boxes);
    animateMesh(spheresRef, counts.boxes, counts.spheres);
    animateMesh(diamondsRef, counts.boxes + counts.spheres, counts.diamonds);
  });

  return (
    <group>
      {/* Gift Boxes */}
      <instancedMesh ref={boxesRef} args={[boxGeometry, material, counts.boxes]} castShadow receiveShadow />
      
      {/* Ornaments (Spheres) */}
      <instancedMesh ref={spheresRef} args={[sphereGeometry, material, counts.spheres]} castShadow receiveShadow />
      
      {/* Diamonds/Bells (Octahedron) */}
      <instancedMesh ref={diamondsRef} args={[diamondGeometry, material, counts.diamonds]} castShadow receiveShadow />
    </group>
  );
};

export default Ornaments;