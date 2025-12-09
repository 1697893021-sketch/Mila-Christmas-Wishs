import React from 'react';
import { PerspectiveCamera, OrbitControls, Environment, ContactShadows, Stars, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import Ornaments from './Ornaments';
import TopStar from './TopStar';
import { AppState } from '../types';

interface SceneProps {
  appState: AppState;
}

const Scene: React.FC<SceneProps> = ({ appState }) => {
  return (
    <>
      {/* --- Camera & Controls --- */}
      <PerspectiveCamera makeDefault position={[0, 0, 24]} fov={45} />
      <OrbitControls 
        enablePan={false} 
        minPolarAngle={Math.PI / 4} 
        maxPolarAngle={Math.PI / 1.8}
        minDistance={10}
        maxDistance={40}
        autoRotate={true}
        autoRotateSpeed={0.5}
      />

      {/* --- Environment & Lighting --- */}
      <color attach="background" args={['#050805']} />
      <fog attach="fog" args={['#050805', 10, 50]} />
      
      {/* HDRI for expensive reflections - City preset gives good sharp reflections for gold */}
      <Environment preset="city" background={false} /> 
      
      {/* Dramatic & Bright Lighting */}
      <ambientLight intensity={0.5} color="#004225" /> {/* Brighter ambient */}
      
      {/* Main Gold Spotlight */}
      <spotLight 
        position={[10, 20, 10]} 
        angle={0.3} 
        penumbra={1} 
        intensity={5} // Brighter
        color="#FFD700" 
        castShadow 
        shadow-bias={-0.0001}
      />
      
      {/* Rim/Fill Light (Warm) */}
      <pointLight position={[-10, 5, -10]} intensity={3} color="#FCE6C9" />
      
      {/* Cool Fill from bottom */}
      <pointLight position={[0, -10, 5]} intensity={1} color="#ffffff" />

      {/* Background Ambience */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      {/* Magical Floating Sparkles */}
      <Sparkles 
        count={300} 
        scale={20} 
        size={4} 
        speed={0.4} 
        opacity={0.6}
        color="#FFD700"
        position={[0, 0, 0]}
      />

      {/* --- The Content --- */}
      {/* Group moved down y=-2 to ensure text doesn't overlap the star/tree top */}
      <group position={[0, -2, 0]}>
        <TopStar appState={appState} />
        <Ornaments appState={appState} />
      </group>

      {/* Floor Reflections */}
      <ContactShadows 
        opacity={0.7} 
        scale={40} 
        blur={2.5} 
        far={10} 
        resolution={512} 
        color="#000000" 
        position={[0, -9, 0]} 
      />

      {/* --- Post Processing --- */}
      <EffectComposer enableNormalPass={false}>
        {/* Stronger Glow for "Dreamy" look */}
        <Bloom 
          luminanceThreshold={0.6} // Lower threshold to catch more gold reflection
          mipmapBlur 
          intensity={1.5} 
          radius={0.5}
        />
        {/* Film Grain for texture */}
        <Noise opacity={0.02} />
        {/* Cinematic darkened corners */}
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>
    </>
  );
};

export default Scene;