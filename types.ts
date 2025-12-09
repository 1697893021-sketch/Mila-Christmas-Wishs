import * as THREE from 'three';

export enum AppState {
  SCATTERED = 'SCATTERED',
  TREE_SHAPE = 'TREE_SHAPE'
}

export interface ParticleData {
  // The random position in space
  scatterPos: THREE.Vector3;
  scatterRot: THREE.Euler;
  
  // The organized position on the tree
  treePos: THREE.Vector3;
  treeRot: THREE.Euler;
  
  // Visual properties
  color: THREE.Color;
  scale: number;
  
  // Animation offset for floating effect
  phaseOffset: number;
  rotationSpeed: number;
}

export interface OrnamentConfig {
  count: number;
  colorPalette: string[];
}