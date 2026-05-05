import { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import useSimStore from '../../store/useSimStore';

export default function WeatherEffects() {
  const weather = useSimStore((s) => s.weather);
  const { scene } = useThree();

  // Fog management
  useEffect(() => {
    if (weather === 'LightRain') {
      scene.fog = new THREE.Fog('#B0BEC5', 40, 120);
    } else if (weather === 'HeavyRain') {
      scene.fog = new THREE.Fog('#78909C', 15, 60);
    } else if (weather === 'Fog') {
      scene.fog = new THREE.FogExp2('#C8D4DC', 0.022);
    } else if (weather === 'DenseFog') {
      scene.fog = new THREE.FogExp2('#D0D8DC', 0.055);
    } else if (weather === 'Night') {
      scene.fog = new THREE.FogExp2('#070B18', 0.012);
    } else {
      scene.fog = null;
    }
    return () => { scene.fog = null; };
  }, [weather, scene]);

  const isLightRain = weather === 'LightRain';
  const isHeavyRain = weather === 'HeavyRain';
  const isAnyRain = isLightRain || isHeavyRain;
  const isFog = weather === 'Fog';
  const isDenseFog = weather === 'DenseFog';

  const RAIN_COUNT = isHeavyRain ? 1200 : 500;
  const rainRef = useRef();
  const splashRef = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 1200; i++) {
      arr.push({
        x: (Math.random() - 0.5) * 60,
        y: 3 + Math.random() * 22,
        z: (Math.random() - 0.5) * 60,
        speed: (isHeavyRain ? 18 : 10) + Math.random() * 8,
        windX: isHeavyRain ? -0.5 + Math.random() * 0.4 : 0,
      });
    }
    return arr;
  }, []);

  useFrame((_, delta) => {
    if (!isAnyRain || !rainRef.current) return;
    const count = RAIN_COUNT;
    for (let i = 0; i < count; i++) {
      const p = particles[i];
      p.y -= p.speed * delta;
      p.x += p.windX * delta;
      if (p.y < 0) {
        p.y = 22;
        p.x = (Math.random() - 0.5) * 60;
        p.z = (Math.random() - 0.5) * 60;
      }
      dummy.position.set(p.x, p.y, p.z);
      dummy.rotation.set(isHeavyRain ? 0.15 : 0.05, 0, 0);
      dummy.updateMatrix();
      rainRef.current.setMatrixAt(i, dummy.matrix);
    }
    rainRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      {/* ── RAIN DROPS ── */}
      {isAnyRain && (
        <instancedMesh ref={rainRef} args={[null, null, RAIN_COUNT]} frustumCulled={false}>
          <cylinderGeometry args={[0.005, 0.005, isHeavyRain ? 0.7 : 0.4, 3]} />
          <meshBasicMaterial
            color={isHeavyRain ? '#8AAFCC' : '#B0D0E8'}
            transparent
            opacity={isHeavyRain ? 0.65 : 0.45}
            wireframe={false}
          />
        </instancedMesh>
      )}

      {/* ── PUDDLE REFLECTIONS (ground-level mist plane for heavy rain) ── */}
      {isHeavyRain && (
        <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[120, 120]} />
          <meshBasicMaterial color="#3A4A5A" transparent opacity={0.25} depthWrite={false} />
        </mesh>
      )}

      {/* ── FOG VOLUME PLANES ── */}
      {(isFog || isDenseFog) && (
        <>
          <mesh position={[0, 2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[200, 200]} />
            <meshBasicMaterial
              color="#C8D4DC"
              transparent
              opacity={isDenseFog ? 0.55 : 0.25}
              depthWrite={false}
              depthTest={false}
            />
          </mesh>
          <mesh position={[0, 5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[200, 200]} />
            <meshBasicMaterial
              color="#C8D4DC"
              transparent
              opacity={isDenseFog ? 0.45 : 0.18}
              depthWrite={false}
              depthTest={false}
            />
          </mesh>
        </>
      )}
    </>
  );
}
