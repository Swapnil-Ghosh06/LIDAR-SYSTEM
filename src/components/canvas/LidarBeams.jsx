import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import useSimStore from '../../store/useSimStore';
import { scanState } from '../../hooks/useSimLoop';
import { egoState } from '../../state/worldState';

const WEATHER_RANGE = { Clear: 1.0, LightRain: 0.82, HeavyRain: 0.55, Fog: 0.6, DenseFog: 0.28, Night: 0.72 };
const WEATHER_CONF  = { Clear: 1.0, LightRain: 0.85, HeavyRain: 0.6,  Fog: 0.65, DenseFog: 0.35, Night: 0.78 };
const MAX_POINTS    = 250;
const POINT_LIFE    = 320;

export default function LidarBeams() {
  const sweepRef     = useRef();
  const blindRef     = useRef();
  const pointsRef    = useRef();
  const linesRef     = useRef();
  const rangeRingRef = useRef();
  const cwHighRef    = useRef();
  const poolRef      = useRef([]);
  const angleRef     = useRef(0);
  const dirtyRef     = useRef(false);
  const dummy        = useMemo(() => new THREE.Object3D(), []);
  const tempColor    = useMemo(() => new THREE.Color(), []);

  const scanFrequency = useSimStore((s) => s.scanFrequency);
  const weather       = useSimStore((s) => s.weather);

  const outerR     = 18 * (WEATHER_RANGE[weather] || 1.0);
  const confidence = WEATHER_CONF[weather] || 1.0;

  // Generate LIDAR point cloud
  useEffect(() => {
    const interval = setInterval(() => {
      const now = performance.now();
      const ep  = egoState.position;
      const targets = [];

      // Main pedestrian
      if (scanState.pedestrianCrossing) {
        const dx = scanState.pedestrianX - ep.x;
        const dz = scanState.pedestrianZ - ep.z;
        const dist = Math.sqrt(dx*dx + dz*dz);
        if (dist < outerR) targets.push({ x: scanState.pedestrianX, z: scanState.pedestrianZ, type: 'pedestrian' });
      }

      targets.forEach(t => {
        const count = 10 + Math.floor(Math.random() * 8);
        for (let i = 0; i < count; i++) {
          poolRef.current.push({
            x: t.x + (Math.random() - 0.5) * 0.7,
            z: t.z + (Math.random() - 0.5) * 0.7,
            time: now, type: t.type,
          });
        }
      });

      // Background environment scatter
      for (let i = 0; i < 6; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = 3 + Math.random() * outerR;
        poolRef.current.push({
          x: ep.x + Math.cos(angle) * r,
          z: ep.z + Math.sin(angle) * r,
          time: now, type: 'env',
        });
      }

      if (poolRef.current.length > MAX_POINTS) poolRef.current = poolRef.current.slice(-MAX_POINTS);
      dirtyRef.current = true;
      useSimStore.getState().setPointsPerScan(targets.length * 12);
    }, 1000 / scanFrequency);
    return () => clearInterval(interval);
  }, [scanFrequency, outerR]);

  useFrame((_, delta) => {
    if (delta > 0.1) return;

    // Follow moving AV
    const ep = egoState.position;
    angleRef.current += 2 * Math.PI * scanFrequency * delta;

    if (sweepRef.current) {
      sweepRef.current.rotation.y = angleRef.current;
      sweepRef.current.position.set(ep.x, 0.55, ep.z);
    }
    if (blindRef.current) {
      blindRef.current.rotation.y = angleRef.current + Math.PI;
      blindRef.current.position.set(ep.x, 0.55, ep.z);
    }
    if (rangeRingRef.current) {
      rangeRingRef.current.position.set(ep.x, 0.015, ep.z);
    }
    if (cwHighRef.current) {
      // Crosswalk at z=5 — highlight when pedestrian crossing
      const s = useSimStore.getState();
      const target = s.isWalking ? 0.25 : 0;
      cwHighRef.current.material.opacity = THREE.MathUtils.lerp(cwHighRef.current.material.opacity, target, delta * 6);
    }

    if (pointsRef.current && linesRef.current && dirtyRef.current) {
      const now = performance.now();
      poolRef.current = poolRef.current.filter(p => now - p.time < POINT_LIFE);
      const active = poolRef.current;

      for (let i = 0; i < MAX_POINTS; i++) {
        if (i < active.length) {
          const p = active[i];
          const age = (now - p.time) / POINT_LIFE;
          const br  = Math.max(0, 1 - age) * confidence;

          dummy.position.set(p.x, 0.22, p.z);
          dummy.scale.setScalar(br);
          dummy.updateMatrix();
          pointsRef.current.setMatrixAt(i, dummy.matrix);

          dummy.position.set(p.x, 0.78, p.z);
          dummy.updateMatrix();
          linesRef.current.setMatrixAt(i, dummy.matrix);

          if (p.type === 'pedestrian') {
            tempColor.setRGB(1, 0.3, 0.1); // orange-red for pedestrian hits
          } else if (p.type === 'env') {
            tempColor.setRGB(0, br * 0.6, br * 0.7); // dimmer green for env
          } else {
            tempColor.setRGB(0, br * 0.9, br); // cyan-green for vehicles
          }
          pointsRef.current.setColorAt(i, tempColor);
          linesRef.current.setColorAt(i, tempColor);
        } else {
          dummy.position.set(0, -100, 0);
          dummy.scale.setScalar(0);
          dummy.updateMatrix();
          pointsRef.current.setMatrixAt(i, dummy.matrix);
          linesRef.current.setMatrixAt(i, dummy.matrix);
        }
      }

      pointsRef.current.instanceMatrix.needsUpdate = true;
      linesRef.current.instanceMatrix.needsUpdate = true;
      if (pointsRef.current.instanceColor)  { pointsRef.current.instanceColor.needsUpdate = true; }
      if (linesRef.current.instanceColor)   { linesRef.current.instanceColor.needsUpdate = true; }
      dirtyRef.current = false;
    }
  });

  return (
    <group>
      {/* Sweep cone — follows AV */}
      <group ref={sweepRef} position={[0, 0.55, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, outerR / 2]}>
          <coneGeometry args={[outerR * Math.tan(Math.PI / 8), outerR, 32, 1, true, 0, Math.PI]} />
          <meshBasicMaterial color="#00E5FF" transparent opacity={0.07} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      </group>

      {/* Range ring on ground — slightly higher to avoid Z-fight */}
      <mesh ref={rangeRingRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
        <ringGeometry args={[outerR - 0.15, outerR, 64]} />
        <meshBasicMaterial color="#00E5FF" transparent opacity={0.14} depthWrite={false} />
      </mesh>

      {/* Crosswalk highlight pulse — higher still */}
      <mesh ref={cwHighRef} position={[0, 0.06, 5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[9, 3]} />
        <meshBasicMaterial color="#00E5FF" transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Point cloud */}
      <instancedMesh ref={pointsRef} args={[null, null, MAX_POINTS]} frustumCulled={false}>
        <sphereGeometry args={[0.08, 6, 6]} />
        <meshBasicMaterial transparent opacity={1} vertexColors wireframe={false} />
      </instancedMesh>

      {/* Vertical beam lines */}
      <instancedMesh ref={linesRef} args={[null, null, MAX_POINTS]} frustumCulled={false}>
        <cylinderGeometry args={[0.012, 0.012, 1.5, 4]} />
        <meshBasicMaterial transparent opacity={0.4} vertexColors wireframe={false} />
      </instancedMesh>
    </group>
  );
}
