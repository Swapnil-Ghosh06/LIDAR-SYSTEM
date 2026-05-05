import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import useSimStore from '../../store/useSimStore';
import { scanState } from '../../hooks/useSimLoop';
import { pedestrianWorldPositions } from '../../state/worldState';

// ──────────────────────────────────────────
// Block-figure pedestrian (no cylinder limbs)
// ──────────────────────────────────────────
function PedestrianFigure({ shirtColor = '#4A6FA5', skinColor = '#E8B090', scale = 1 }) {
  return (
    <group scale={[scale, scale, scale]}>
      {/* Head */}
      <mesh position={[0, 1.65, 0]} castShadow>
        <boxGeometry args={[0.21, 0.23, 0.21]} />
        <meshStandardMaterial color={skinColor} wireframe={false} />
      </mesh>
      {/* Torso */}
      <mesh position={[0, 1.15, 0]} castShadow>
        <boxGeometry args={[0.32, 0.48, 0.19]} />
        <meshStandardMaterial color={shirtColor} wireframe={false} />
      </mesh>
      {/* Left leg */}
      <mesh position={[-0.1, 0.66, 0]} castShadow>
        <boxGeometry args={[0.12, 0.42, 0.14]} />
        <meshStandardMaterial color="#222233" wireframe={false} />
      </mesh>
      {/* Right leg */}
      <mesh position={[0.1, 0.66, 0]} castShadow>
        <boxGeometry args={[0.12, 0.42, 0.14]} />
        <meshStandardMaterial color="#222233" wireframe={false} />
      </mesh>
      {/* Left arm */}
      <mesh position={[-0.22, 1.15, 0]} castShadow>
        <boxGeometry args={[0.1, 0.38, 0.1]} />
        <meshStandardMaterial color={shirtColor} wireframe={false} />
      </mesh>
      {/* Right arm */}
      <mesh position={[0.22, 1.15, 0]} castShadow>
        <boxGeometry args={[0.1, 0.38, 0.1]} />
        <meshStandardMaterial color={shirtColor} wireframe={false} />
      </mesh>
    </group>
  );
}

// ──────────────────────────────────────────
// Main controlled pedestrian
// ──────────────────────────────────────────
function MainPedestrian() {
  const groupRef       = useRef();
  const missRingRef    = useRef();
  const successRingRef = useRef();
  const tweenRef       = useRef(null);
  const autoTweenRef   = useRef(null);
  const leftLegRef     = useRef();
  const rightLegRef    = useRef();
  const leftArmRef     = useRef();
  const rightArmRef    = useRef();

  useFrame((state) => {
    const isWalking = useSimStore.getState().isWalking;

    if (groupRef.current) {
      scanState.pedestrianX = groupRef.current.position.x;
      scanState.pedestrianZ = groupRef.current.position.z;
      scanState.pedestrianCrossing = isWalking;

      // Write to shared world state for EgoVehicle detection
      pedestrianWorldPositions[0] = isWalking ? groupRef.current.position.clone() : null;
    }

    // Walk cycle — X axis rotation (forward/back swing)
    if (isWalking) {
      const t = state.clock.getElapsedTime();
      const vel = useSimStore.getState().pedestrianVelocity;
      const swing = Math.sin(t * vel * 4.5) * 0.38;
      if (leftLegRef.current)  leftLegRef.current.rotation.x  =  swing;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -swing;
      if (leftArmRef.current)  leftArmRef.current.rotation.x  = -swing * 0.4;
      if (rightArmRef.current) rightArmRef.current.rotation.x  =  swing * 0.4;
    } else {
      [leftLegRef, rightLegRef, leftArmRef, rightArmRef].forEach(r => {
        if (r.current) r.current.rotation.x = THREE.MathUtils.lerp(r.current.rotation.x, 0, 0.12);
      });
    }

    // Rings
    if (missRingRef.current) {
      const s = missRingRef.current.scale.x;
      if (s > 0.01 && s < 5) { missRingRef.current.scale.addScalar(0.07); missRingRef.current.material.opacity = Math.max(0, missRingRef.current.material.opacity - 0.022); }
    }
    if (successRingRef.current) {
      const s = successRingRef.current.scale.x;
      if (s > 0.01 && s < 3) { successRingRef.current.scale.addScalar(0.05); successRingRef.current.material.opacity = Math.max(0, successRingRef.current.material.opacity - 0.04); }
    }
  });

  useEffect(() => {
    const unsub = useSimStore.subscribe(
      (s) => s.isWalking,
      (isWalking) => {
        if (isWalking && groupRef.current) {
          const vel = useSimStore.getState().pedestrianVelocity;
          if (tweenRef.current) tweenRef.current.kill();
          tweenRef.current = gsap.to(groupRef.current.position, {
            x: 6, duration: 12 / vel, ease: 'none',
            onComplete: () => {
              useSimStore.getState().stopWalk();
              pedestrianWorldPositions[0] = null;
              gsap.set(groupRef.current.position, { x: -6 });
            },
          });
        } else {
          if (tweenRef.current) tweenRef.current.kill();
        }
      }
    );
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = useSimStore.subscribe(
      (s) => s.autoMode,
      (auto) => { if (auto) runAutoLoop(); else if (autoTweenRef.current) autoTweenRef.current.kill(); }
    );
    return () => unsub();
  }, []);

  function runAutoLoop() {
    if (!groupRef.current) return;
    const store = useSimStore.getState();
    if (!store.autoMode) return;
    store.triggerWalk();
    const vel = store.pedestrianVelocity;
    if (autoTweenRef.current) autoTweenRef.current.kill();
    autoTweenRef.current = gsap.to(groupRef.current.position, {
      x: 6, duration: 12 / vel, ease: 'none',
      onComplete: () => {
        store.stopWalk();
        pedestrianWorldPositions[0] = null;
        gsap.delayedCall(1.5, () => {
          if (useSimStore.getState().autoMode) {
            gsap.set(groupRef.current.position, { x: -6 });
            runAutoLoop();
          }
        });
      }
    });
  }

  useEffect(() => {
    const unsub = useSimStore.subscribe(
      (s) => s.missedDetectionEvent,
      (missed) => {
        if (missed && missRingRef.current) { missRingRef.current.scale.set(0.3,0.3,0.3); missRingRef.current.material.opacity = 0.9; }
      }
    );
    return () => unsub();
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      const s = useSimStore.getState();
      if (s.isWalking && !s.missedDetectionEvent && successRingRef.current) {
        if (s.pedestrianVelocity / s.scanFrequency <= 0.6) { successRingRef.current.scale.set(0.3,0.3,0.3); successRingRef.current.material.opacity = 0.6; }
      }
    }, 500);
    return () => clearInterval(id);
  }, []);

  return (
    <group ref={groupRef} position={[-6, 0.05, 6.5]} rotation={[0, Math.PI / 2, 0]}>
      {/* Head */}
      <mesh position={[0, 1.45, 0]} castShadow>
        <boxGeometry args={[0.22, 0.22, 0.22]} />
        <meshStandardMaterial color="#E8B090" wireframe={false} />
      </mesh>
      {/* Torso */}
      <mesh position={[0, 1.05, 0]} castShadow>
        <boxGeometry args={[0.34, 0.55, 0.2]} />
        <meshStandardMaterial color="#4A6FA5" wireframe={false} />
      </mesh>
      {/* Left leg */}
      <group ref={leftLegRef} position={[-0.1, 0.78, 0]}>
        <mesh position={[0, -0.38, 0]} castShadow>
          <boxGeometry args={[0.13, 0.78, 0.15]} />
          <meshStandardMaterial color="#222233" wireframe={false} />
        </mesh>
      </group>
      {/* Right leg */}
      <group ref={rightLegRef} position={[0.1, 0.78, 0]}>
        <mesh position={[0, -0.38, 0]} castShadow>
          <boxGeometry args={[0.13, 0.78, 0.15]} />
          <meshStandardMaterial color="#222233" wireframe={false} />
        </mesh>
      </group>
      {/* Left arm */}
      <group ref={leftArmRef} position={[-0.24, 1.25, 0]}>
        <mesh position={[0, -0.2, 0]} castShadow>
          <boxGeometry args={[0.1, 0.42, 0.1]} />
          <meshStandardMaterial color="#4A6FA5" wireframe={false} />
        </mesh>
      </group>
      {/* Right arm */}
      <group ref={rightArmRef} position={[0.24, 1.25, 0]}>
        <mesh position={[0, -0.2, 0]} castShadow>
          <boxGeometry args={[0.1, 0.42, 0.1]} />
          <meshStandardMaterial color="#4A6FA5" wireframe={false} />
        </mesh>
      </group>

      <mesh ref={missRingRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]} scale={[0, 0, 0]}>
        <ringGeometry args={[0.9, 1.1, 32]} />
        <meshBasicMaterial color="#FF3D3D" transparent opacity={0} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh ref={successRingRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]} scale={[0, 0, 0]}>
        <ringGeometry args={[0.6, 0.75, 32]} />
        <meshBasicMaterial color="#00E676" transparent opacity={0} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      {/* Shadow Blob */}
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[0.35, 16]} />
        <meshBasicMaterial color="black" transparent opacity={0.3} depthWrite={false} />
      </mesh>
    </group>
  );
}

// ──────────────────────────────────────────
// Background pedestrian (autonomous, sidewalk)
// ──────────────────────────────────────────
function BgPed({ startX, startZ, endX, endZ, duration, shirtColor, skinColor = '#D09070', delay = 0, pedIndex }) {
  const groupRef = useRef();
  const leg1Ref = useRef();
  const leg2Ref = useRef();

  useEffect(() => {
    if (!groupRef.current) return;
    const loop = () => {
      gsap.set(groupRef.current.position, { x: startX, z: startZ });
      gsap.to(groupRef.current.position, {
        x: endX, z: endZ, duration, ease: 'none', delay,
        onComplete: () => {
          gsap.to(groupRef.current.position, {
            x: startX, z: startZ, duration, ease: 'none',
            onComplete: loop
          });
        }
      });
    };
    loop();
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const s = Math.sin(t * 4.0 + pedIndex) * 0.32;
    if (leg1Ref.current) leg1Ref.current.rotation.x = s;
    if (leg2Ref.current) leg2Ref.current.rotation.x = -s;

    // Write position to shared state
    if (groupRef.current) pedestrianWorldPositions[pedIndex + 1] = groupRef.current.position.clone();
  });

  const dx = endX - startX;
  const dz = endZ - startZ;
  const rot = Math.atan2(dx, dz);

  return (
    <group ref={groupRef} position={[startX, 0.05, startZ]} rotation={[0, rot, 0]}>
      <mesh position={[0, 1.4, 0]} castShadow>
        <boxGeometry args={[0.2, 0.2, 0.2]} />
        <meshStandardMaterial color={skinColor} wireframe={false} />
      </mesh>
      <mesh position={[0, 1.0, 0]} castShadow>
        <boxGeometry args={[0.3, 0.45, 0.18]} />
        <meshStandardMaterial color={shirtColor} wireframe={false} />
      </mesh>
      <group ref={leg1Ref} position={[-0.1, 0.75, 0]}>
        <mesh position={[0, -0.36, 0]} castShadow>
          <boxGeometry args={[0.12, 0.72, 0.13]} />
          <meshStandardMaterial color="#1A1A2A" wireframe={false} />
        </mesh>
      </group>
      <group ref={leg2Ref} position={[0.1, 0.75, 0]}>
        <mesh position={[0, -0.36, 0]} castShadow>
          <boxGeometry args={[0.12, 0.72, 0.13]} />
          <meshStandardMaterial color="#1A1A2A" wireframe={false} />
        </mesh>
      </group>
      {/* Shadow Blob */}
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[0.3, 12]} />
        <meshBasicMaterial color="black" transparent opacity={0.25} depthWrite={false} />
      </mesh>
    </group>
  );
}

const BG_PEDS = [
  { startX: -22, startZ: 6.8, endX: 22, endZ: 6.8, duration: 20, shirtColor: '#8B2020', delay: 0 },
  { startX: 20,  startZ: 7.4, endX: -20, endZ: 7.4, duration: 18, shirtColor: '#2040A0', delay: 3 },
  { startX: -18, startZ: -7.0, endX: 20, endZ: -7.0, duration: 22, shirtColor: '#205020', delay: 1 },
  { startX: 6.8, startZ: -22, endX: 6.8, endZ: 20,  duration: 21, shirtColor: '#702060', delay: 2 },
  { startX: 7.4, startZ: 22,  endX: 7.4, endZ: -22, duration: 19, shirtColor: '#804010', delay: 5 },
  { startX: -7.2, startZ: -20, endX: -7.2, endZ: 22, duration: 24, shirtColor: '#207070', delay: 7 },
  // Crosswalks
  { startX: -6, startZ: -6.5, endX: 6, endZ: -6.5, duration: 11, shirtColor: '#AA6622', delay: 4 },
  { startX: 6.5, startZ: 6, endX: 6.5, endZ: -6, duration: 9, shirtColor: '#449944', delay: 8 },
  { startX: -6.5, startZ: -6, endX: -6.5, endZ: 6, duration: 10, shirtColor: '#CC3344', delay: 12 },
];

export default function Pedestrian() {
  return (
    <>
      <MainPedestrian />
      {BG_PEDS.map((p, i) => (
        <BgPed key={i} pedIndex={i} {...p} />
      ))}
    </>
  );
}
