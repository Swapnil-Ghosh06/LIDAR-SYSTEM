import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { trafficState } from './RoadEnvironment';
import useSimStore from '../../store/useSimStore';
import { egoState, trafficWorldPositions, pedestrianWorldPositions } from '../../state/worldState';

const NORMAL_SPEED = 5.0;   // m/s
const DETECT_RANGE = 14;    // metres ahead in lane
const BRAKE_SMOOTH = 4.0;   // lerp factor

// Brake indicator label (floats above car when braking)
function BrakeLabel({ visible, reason }) {
  if (!visible) return null;
  const msg = reason === 'pedestrian' ? '🚶 PED DETECTED — STOPPING'
    : reason === 'vehicle' ? '🚗 VEHICLE AHEAD — SLOWING'
    : reason === 'red_light' ? '🔴 RED LIGHT — STOPPED'
    : '⚠ OBSTACLE';
  return (
    <mesh position={[0, 1.4, 0]}>
      {/* Billboard — handled purely via JSX label in HTML overlay, this is a placeholder marker */}
      <sphereGeometry args={[0.06, 6, 6]} />
      <meshBasicMaterial color="#FF4444" />
    </mesh>
  );
}

export default function EgoVehicle() {
  const groupRef      = useRef();
  const lidarRingRef  = useRef();
  const brakeLRef     = useRef();
  const brakeRRef     = useRef();
  const speedRef      = useRef(0);
  const brakingRef    = useRef(false);
  const brakeReasonRef= useRef('');

  // hooks must be at top level
  const weather = useSimStore((s) => s.weather);
  egoState.isNight = (weather === 'Night');

  useFrame((_, delta) => {
    // Spin LIDAR dome
    if (lidarRingRef.current) lidarRingRef.current.rotation.y += delta * 8;
    if (!groupRef.current) return;

    const pos = groupRef.current.position;

    // ── DETECTION ──────────────────────────────────────────────────
    let shouldBrake = false;
    let reason = '';

    // 1. Red light – approaching intersection from south
    if (pos.z > -15 && pos.z < -4.5) {
      if (trafficState.signalNS !== 'GREEN') {
        shouldBrake = true;
        reason = 'red_light';
      }
    }

    // 2. Vehicle ahead in same lane (x ≈ 2.25, going +z)
    if (!shouldBrake) {
      for (const vp of trafficWorldPositions) {
        if (!vp) continue;
        const dx = Math.abs(vp.x - pos.x);
        const dz = vp.z - pos.z;
        if (dx < 1.6 && dz > 0.5 && dz < DETECT_RANGE) {
          shouldBrake = true;
          reason = 'vehicle';
          break;
        }
      }
    }

    // 3. Pedestrian in path ahead
    if (!shouldBrake) {
      for (const pp of pedestrianWorldPositions) {
        if (!pp) continue;
        const dz = pp.z - pos.z;
        const dx = Math.abs(pp.x - pos.x);
        if (dz > -1 && dz < DETECT_RANGE * 0.8 && dx < 3.0) {
          shouldBrake = true;
          reason = 'pedestrian';
          break;
        }
      }
    }

    brakingRef.current   = shouldBrake;
    brakeReasonRef.current = reason;
    egoState.isBraking   = shouldBrake;
    egoState.brakeReason = reason;

    // ── SPEED CONTROL ──────────────────────────────────────────────
    const target = shouldBrake ? 0 : NORMAL_SPEED;
    speedRef.current = THREE.MathUtils.lerp(speedRef.current, target, delta * BRAKE_SMOOTH);
    if (speedRef.current < 0.05) speedRef.current = 0;
    egoState.speed = speedRef.current;

    // ── MOVE ───────────────────────────────────────────────────────
    pos.z += speedRef.current * delta;
    if (pos.z > 58) pos.z = -58;    // loop back

    egoState.position.set(pos.x, pos.y, pos.z);

    // ── BRAKE LIGHTS ───────────────────────────────────────────────
    const bIntensity = shouldBrake ? 4.0 : 0.8;
    if (brakeLRef.current) brakeLRef.current.emissiveIntensity = bIntensity;
    if (brakeRRef.current) brakeRRef.current.emissiveIntensity = bIntensity;
  });

  return (
    <group ref={groupRef} position={[2.25, 0, -35]} rotation={[0, 0, 0]}>
      {/* ─── BODY ─── */}
      <mesh position={[0, 0.17, 0]} castShadow matrixAutoUpdate={false} onUpdate={m => m.updateMatrix()}>
        <boxGeometry args={[0.95, 0.28, 2.25]} />
        <meshStandardMaterial color="#0D1B2A" wireframe={false} />
      </mesh>

      {/* ─── CABIN ─── */}
      <mesh position={[0, 0.38, -0.1]} castShadow matrixAutoUpdate={false} onUpdate={m => m.updateMatrix()}>
        <boxGeometry args={[0.78, 0.22, 1.0]} />
        <meshStandardMaterial color="#152030" wireframe={false} />
      </mesh>

      {/* ─── ROOF RACK ─── */}
      <mesh position={[0, 0.51, -0.1]} matrixAutoUpdate={false} onUpdate={m => m.updateMatrix()}>
        <boxGeometry args={[0.68, 0.06, 0.82]} />
        <meshStandardMaterial color="#0A1520" wireframe={false} />
      </mesh>

      {/* ─── LIDAR DOME ─── */}
      <group position={[0, 0.54, -0.1]}>
        <mesh matrixAutoUpdate={false} onUpdate={m => m.updateMatrix()}>
          <sphereGeometry args={[0.14, 14, 14, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#00B4D8" emissive="#00B4D8" emissiveIntensity={1.0} wireframe={false} />
        </mesh>
        <mesh ref={lidarRingRef} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.17, 0.025, 8, 24]} />
          <meshStandardMaterial color="#00E5FF" emissive="#00E5FF" emissiveIntensity={1.5} wireframe={false} />
        </mesh>
      </group>

      {/* ─── SENSOR BOXES ─── */}
      {[[0.24, 0.51, 0.18], [-0.24, 0.51, 0.18], [0, 0.51, -0.42]].map((p, i) => (
        <mesh key={i} position={p} matrixAutoUpdate={false} onUpdate={m => m.updateMatrix()}>
          <boxGeometry args={[0.09, 0.09, 0.09]} />
          <meshStandardMaterial color="#203040" wireframe={false} />
        </mesh>
      ))}

      {/* ─── WAYMO CYAN STRIPES ─── */}
      {[0.49, -0.49].map((x, i) => (
        <mesh key={i} position={[x, 0.18, 0]} matrixAutoUpdate={false} onUpdate={m => m.updateMatrix()}>
          <boxGeometry args={[0.018, 0.04, 2.1]} />
          <meshStandardMaterial color="#00B4D8" emissive="#00B4D8" emissiveIntensity={0.7} wireframe={false} />
        </mesh>
      ))}

      {/* ─── WINDSCREENS ─── */}
      <mesh position={[0, 0.38, 0.42]} rotation={[-0.45, 0, 0]} matrixAutoUpdate={false} onUpdate={m => m.updateMatrix()}>
        <planeGeometry args={[0.68, 0.26]} />
        <meshStandardMaterial color="#081018" transparent opacity={0.85} wireframe={false} />
      </mesh>
      <mesh position={[0, 0.38, -0.62]} rotation={[0.45, Math.PI, 0]} matrixAutoUpdate={false} onUpdate={m => m.updateMatrix()}>
        <planeGeometry args={[0.68, 0.26]} />
        <meshStandardMaterial color="#081018" transparent opacity={0.85} wireframe={false} />
      </mesh>

      {/* ─── WHEELS ─── */}
      {[[-0.5, 0.13, 0.7], [0.5, 0.13, 0.7], [-0.5, 0.13, -0.7], [0.5, 0.13, -0.7]].map((p, i) => (
        <mesh key={i} position={p} rotation={[0, 0, Math.PI / 2]} castShadow matrixAutoUpdate={false} onUpdate={m => m.updateMatrix()}>
          <cylinderGeometry args={[0.14, 0.14, 0.2, 14]} />
          <meshStandardMaterial color="#111111" roughness={1} wireframe={false} />
        </mesh>
      ))}

      {/* ─── HEADLIGHTS ─── */}
      {[[-0.3, 0.16, 1.14], [0.3, 0.16, 1.14]].map((p, i) => (
        <mesh key={i} position={p} matrixAutoUpdate={false} onUpdate={m => m.updateMatrix()}>
          <planeGeometry args={[0.18, 0.1]} />
          <meshStandardMaterial color="#FFFDE7" emissive="#FFFDE7" emissiveIntensity={1.5} wireframe={false} />
        </mesh>
      ))}
      {/* Headlight beams at night */}
      {weather === 'Night' && (
        <pointLight position={[0, 0.5, 1.8]} intensity={6} distance={22} color="#FFFDE7" />
      )}

      {/* ─── BRAKE / TAIL LIGHTS ─── */}
      <mesh position={[-0.3, 0.16, -1.14]} rotation={[0, Math.PI, 0]} matrixAutoUpdate={false} onUpdate={m => m.updateMatrix()}>
        <planeGeometry args={[0.18, 0.1]} />
        <meshStandardMaterial ref={brakeLRef} color="#FF3D3D" emissive="#FF3D3D" emissiveIntensity={0.8} wireframe={false} />
      </mesh>
      <mesh position={[-0.3, 0.16, -1.14]} rotation={[0, Math.PI, 0]} matrixAutoUpdate={false} onUpdate={m => m.updateMatrix()}>
        <planeGeometry args={[0.18, 0.1]} />
        <meshStandardMaterial ref={brakeRRef} color="#FF3D3D" emissive="#FF3D3D" emissiveIntensity={0.8} wireframe={false} />
      </mesh>

      {/* Shadow Blob */}
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[0.35, 16]} />
        <meshBasicMaterial color="black" transparent opacity={0.3} depthWrite={false} />
      </mesh>
    </group>
  );
}
