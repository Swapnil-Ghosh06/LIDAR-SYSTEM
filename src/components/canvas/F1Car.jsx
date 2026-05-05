import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const trackCurve = new THREE.CatmullRomCurve3([
  new THREE.Vector3(-12, 0.2, 0),
  new THREE.Vector3(-10, 0.2, -8),
  new THREE.Vector3(0, 0.2, -12),
  new THREE.Vector3(10, 0.2, -8),
  new THREE.Vector3(12, 0.2, 0),
  new THREE.Vector3(10, 0.2, 8),
  new THREE.Vector3(0, 0.2, 12),
  new THREE.Vector3(-10, 0.2, 8),
], true);

export const f1CarPosition = new THREE.Vector3(0, 0, 0);

export default function F1Car() {
  const lidarDiscRef = useRef(null);
  const carRef = useRef(null);
  const progressRef = useRef(0);
  const SPEED = 0.008;

  useFrame((state, delta) => {
    if (lidarDiscRef.current) {
      lidarDiscRef.current.rotation.y += delta * 10;
    }

    progressRef.current = (progressRef.current + SPEED * delta * 60) % 1;
    const pos = trackCurve.getPoint(progressRef.current);
    const tangent = trackCurve.getTangent(progressRef.current);

    if (carRef.current) {
      carRef.current.position.copy(pos);
      const angle = Math.atan2(tangent.x, tangent.z);
      carRef.current.rotation.y = angle;
      f1CarPosition.copy(pos);
    }
  });

  // Halo curve
  const haloCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.3, 0, 0.4),
    new THREE.Vector3(-0.2, 0.2, 0.1),
    new THREE.Vector3(0, 0.25, -0.2),
    new THREE.Vector3(0.2, 0.2, 0.1),
    new THREE.Vector3(0.3, 0, 0.4)
  ]);

  return (
    <group ref={carRef} position={[0, 0, 0]} castShadow>
      {/* Floor / Chassis */}
      <mesh position={[0, 0.075, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.9, 0.15, 3.2]} />
        <meshStandardMaterial color="#141414" wireframe={false} />
      </mesh>

      {/* Nose taper */}
      <mesh position={[0, 0.075, 1.8]} castShadow>
        <cylinderGeometry args={[0.2, 0.45, 0.4, 4]} rotation={[Math.PI/2, Math.PI/4, 0]} />
        <meshStandardMaterial color="#141414" wireframe={false} />
      </mesh>

      {/* Bodywork */}
      <mesh position={[0, 0.25, -0.2]} castShadow>
        <cylinderGeometry args={[0.3, 0.4, 2.0, 16]} rotation={[Math.PI/2, 0, 0]} />
        <meshStandardMaterial color="#1A1A1A" wireframe={false} />
      </mesh>

      {/* Front Wing */}
      <mesh position={[0, 0.03, 1.8]} castShadow>
        <boxGeometry args={[1.8, 0.06, 0.4]} />
        <meshStandardMaterial color="#0A0A0A" wireframe={false} />
      </mesh>
      {/* Front Wing Endplates */}
      <mesh position={[-0.9, 0.1, 1.8]} castShadow>
        <boxGeometry args={[0.04, 0.2, 0.4]} />
        <meshStandardMaterial color="#0A0A0A" wireframe={false} />
      </mesh>
      <mesh position={[0.9, 0.1, 1.8]} castShadow>
        <boxGeometry args={[0.04, 0.2, 0.4]} />
        <meshStandardMaterial color="#0A0A0A" wireframe={false} />
      </mesh>

      {/* Rear Wing Lower */}
      <mesh position={[0, 0.4, -1.5]} castShadow>
        <boxGeometry args={[1.2, 0.04, 0.3]} />
        <meshStandardMaterial color="#0A0A0A" wireframe={false} />
      </mesh>
      {/* Rear Wing Upper */}
      <mesh position={[0, 0.6, -1.6]} rotation={[-0.1, 0, 0]} castShadow>
        <boxGeometry args={[1.4, 0.04, 0.3]} />
        <meshStandardMaterial color="#0A0A0A" wireframe={false} />
      </mesh>
      {/* Rear Wing Endplates */}
      <mesh position={[-0.65, 0.5, -1.55]} castShadow>
        <boxGeometry args={[0.04, 0.4, 0.4]} />
        <meshStandardMaterial color="#0A0A0A" wireframe={false} />
      </mesh>
      <mesh position={[0.65, 0.5, -1.55]} castShadow>
        <boxGeometry args={[0.04, 0.4, 0.4]} />
        <meshStandardMaterial color="#0A0A0A" wireframe={false} />
      </mesh>

      {/* Sidepods */}
      <mesh position={[-0.5, 0.2, -0.2]} castShadow>
        <boxGeometry args={[0.3, 0.2, 1.2]} />
        <meshStandardMaterial color="#181818" wireframe={false} />
      </mesh>
      <mesh position={[0.5, 0.2, -0.2]} castShadow>
        <boxGeometry args={[0.3, 0.2, 1.2]} />
        <meshStandardMaterial color="#181818" wireframe={false} />
      </mesh>

      {/* Halo */}
      <mesh position={[0, 0.25, 0.1]} castShadow>
        <tubeGeometry args={[haloCurve, 20, 0.03, 8, false]} />
        <meshStandardMaterial color="#2A2A2A" wireframe={false} />
      </mesh>

      {/* Tyres */}
      {[
        [-0.7, 0.22, 1.2],
        [0.7, 0.22, 1.2],
        [-0.7, 0.22, -1.2],
        [0.7, 0.22, -1.2],
      ].map((pos, i) => (
        <group key={`tyre-${i}`} position={pos}>
          <mesh rotation={[0, Math.PI / 2, 0]} castShadow>
            <torusGeometry args={[0.16, 0.1, 16, 32]} />
            <meshStandardMaterial color="#111111" roughness={0.9} wireframe={false} />
          </mesh>
          {/* Wheel rim / hubcap */}
          <mesh rotation={[0, Math.PI / 2, 0]}>
            <cylinderGeometry args={[0.15, 0.15, 0.19, 16]} />
            <meshStandardMaterial color="#222222" wireframe={false} />
          </mesh>
        </group>
      ))}

      {/* LIDAR Sensor */}
      <group position={[0, 0.48, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.1, 0.1, 0.1, 16]} />
          <meshStandardMaterial color="#222" wireframe={false} />
        </mesh>
        <mesh ref={lidarDiscRef} position={[0, 0.07, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.04, 16]} />
          <meshStandardMaterial color="#00E5FF" emissive="#00E5FF" emissiveIntensity={0.8} wireframe={false} />
        </mesh>
      </group>

      {/* Team Color Accents */}
      <mesh position={[-0.45, 0.15, 0]}>
        <boxGeometry args={[0.02, 0.02, 2]} />
        <meshStandardMaterial color="#00E5FF" emissive="#00E5FF" emissiveIntensity={0.5} wireframe={false} />
      </mesh>
      <mesh position={[0.45, 0.15, 0]}>
        <boxGeometry args={[0.02, 0.02, 2]} />
        <meshStandardMaterial color="#00E5FF" emissive="#00E5FF" emissiveIntensity={0.5} wireframe={false} />
      </mesh>

      {/* Underglow */}
      <pointLight position={[0, 0.1, 0]} color="#00E5FF" intensity={1.0} distance={4} />
    </group>
  );
}
