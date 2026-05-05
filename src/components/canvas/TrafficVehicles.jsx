import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { trafficState } from './RoadEnvironment';
import { trafficWorldPositions } from '../../state/worldState';

const BASE_SPEED = 4.5;

// 14 vehicles — dense traffic on all 4 approaches, both lanes
const VEHICLES = [
  // N→S right lane x=+2.25, dir +z
  { id: 'NS1', sp: [2.25,0,-52], dir:[0,0,1], ax:'z', ns:true, rot:0,          color:'#4A6A9A', spd:4.2 },
  { id: 'NS2', sp: [2.25,0,-28], dir:[0,0,1], ax:'z', ns:true, rot:0,          color:'#8A3A2A', spd:3.8 },
  { id: 'NS3', sp: [2.25,0,-8],  dir:[0,0,1], ax:'z', ns:true, rot:0,          color:'#4A7A5A', spd:4.6 },
  // S→N left lane  x=-2.25, dir -z
  { id: 'SN1', sp:[-2.25,0,50],  dir:[0,0,-1], ax:'z', ns:true, rot:Math.PI,   color:'#7A7A3A', spd:4.0 },
  { id: 'SN2', sp:[-2.25,0,25],  dir:[0,0,-1], ax:'z', ns:true, rot:Math.PI,   color:'#5A4A7A', spd:3.6 },
  { id: 'SN3', sp:[-2.25,0,5],   dir:[0,0,-1], ax:'z', ns:true, rot:Math.PI,   color:'#2A5A6A', spd:4.2 },
  // W→E right lane z=+2.25
  { id: 'WE1', sp:[-52,0,2.25],  dir:[1,0,0], ax:'x', ns:false, rot:Math.PI/2, color:'#9A4A3A', spd:4.1 },
  { id: 'WE2', sp:[-30,0,2.25],  dir:[1,0,0], ax:'x', ns:false, rot:Math.PI/2, color:'#6A8A4A', spd:3.7 },
  { id: 'WE3', sp:[-10,0,2.25],  dir:[1,0,0], ax:'x', ns:false, rot:Math.PI/2, color:'#3A5A8A', spd:4.4 },
  // E→W left lane  z=-2.25
  { id: 'EW1', sp:[52,0,-2.25],  dir:[-1,0,0], ax:'x', ns:false, rot:-Math.PI/2, color:'#8A5A2A', spd:3.9 },
  { id: 'EW2', sp:[28,0,-2.25],  dir:[-1,0,0], ax:'x', ns:false, rot:-Math.PI/2, color:'#4A8A7A', spd:4.3 },
  { id: 'EW3', sp:[10,0,-2.25],  dir:[-1,0,0], ax:'x', ns:false, rot:-Math.PI/2, color:'#7A4A8A', spd:3.5 },
  // Bonus — slower vehicles for realism
  { id: 'NS4', sp: [2.25,0,40],  dir:[0,0,1], ax:'z', ns:true, rot:0,          color:'#AAAAAA', spd:3.2 },
  { id: 'EW4', sp:[-40,0,-2.25], dir:[-1,0,0], ax:'x', ns:false, rot:-Math.PI/2, color:'#C0A060', spd:3.4 },
];

// Simple sedan mesh (reused for all vehicles)
function VehicleMesh({ color }) {
  const cabin = useMemo(() => {
    const c = new THREE.Color(color); c.offsetHSL(0, 0, 0.14); return '#' + c.getHexString();
  }, [color]);
  return (
    <>
      <mesh position={[0, 0.17, 0]} castShadow matrixAutoUpdate={false} onUpdate={m => m.updateMatrix()}>
        <boxGeometry args={[0.9, 0.28, 2.0]} />
        <meshStandardMaterial color={color} wireframe={false} />
      </mesh>
      <mesh position={[0, 0.37, -0.1]} castShadow matrixAutoUpdate={false} onUpdate={m => m.updateMatrix()}>
        <boxGeometry args={[0.74, 0.2, 0.92]} />
        <meshStandardMaterial color={cabin} wireframe={false} />
      </mesh>
      <mesh position={[0, 0.37, 0.38]} rotation={[-0.42, 0, 0]} matrixAutoUpdate={false} onUpdate={m => m.updateMatrix()}>
        <planeGeometry args={[0.66, 0.24]} />
        <meshStandardMaterial color="#0A1520" transparent opacity={0.85} wireframe={false} />
      </mesh>
      {[[-0.48,0.13,0.65],[0.48,0.13,0.65],[-0.48,0.13,-0.65],[0.48,0.13,-0.65]].map((p,i) => (
        <mesh key={i} position={p} rotation={[0,0,Math.PI/2]} castShadow matrixAutoUpdate={false} onUpdate={m => m.updateMatrix()}>
          <cylinderGeometry args={[0.13,0.13,0.18,12]} />
          <meshStandardMaterial color="#111111" roughness={1} wireframe={false} />
        </mesh>
      ))}
      {[[-0.28,0.17,1.01],[0.28,0.17,1.01]].map((p,i) => (
        <mesh key={i} position={p} matrixAutoUpdate={false} onUpdate={m => m.updateMatrix()}>
          <planeGeometry args={[0.17,0.09]} />
          <meshStandardMaterial color="#FFFDE7" emissive="#FFFDE7" emissiveIntensity={1.2} wireframe={false} />
        </mesh>
      ))}
      {[[-0.28,0.17,-1.01],[0.28,0.17,-1.01]].map((p,i) => (
        <mesh key={i} position={p} rotation={[0,Math.PI,0]} matrixAutoUpdate={false} onUpdate={m => m.updateMatrix()}>
          <planeGeometry args={[0.17,0.09]} />
          <meshStandardMaterial color="#FF3D3D" emissive="#FF3D3D" emissiveIntensity={1.2} wireframe={false} />
        </mesh>
      ))}
      {/* Shadow Blob */}
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, 0.02, 0]}>
        <planeGeometry args={[1.2, 2.3]} />
        <meshBasicMaterial color="black" transparent opacity={0.22} depthWrite={false} />
      </mesh>
    </>
  );
}

function TrafficVehicle({ data, index }) {
  const groupRef = useRef();
  const speedRef = useRef(data.spd);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    const signal = data.ns ? trafficState.signalNS : trafficState.signalEW;
    const pos    = groupRef.current.position[data.ax];
    const sign   = data.ax === 'z' ? data.dir[2] : data.dir[0];

    // Brake approaching intersection on non-green
    const nearIntersection = Math.abs(pos) < 14 && Math.abs(pos) > 4.5;
    const stopForLight = nearIntersection && signal !== 'GREEN';

    // Simple car-following: stop if a car ahead in same lane is close
    let stopForCar = false;
    for (let i = 0; i < trafficWorldPositions.length; i++) {
      if (i === index) continue;
      const vp = trafficWorldPositions[i];
      if (!vp) continue;
      if (data.ax === 'z') {
        const dx = Math.abs(vp.x - groupRef.current.position.x);
        const dz = (vp.z - groupRef.current.position.z) * sign;
        if (dx < 1.5 && dz > 0.3 && dz < 7) { stopForCar = true; break; }
      } else {
        const dz = Math.abs(vp.z - groupRef.current.position.z);
        const dx = (vp.x - groupRef.current.position.x) * sign;
        if (dz < 1.5 && dx > 0.3 && dx < 7) { stopForCar = true; break; }
      }
    }

    const target = (stopForLight || stopForCar) ? 0 : data.spd;
    speedRef.current = THREE.MathUtils.lerp(speedRef.current, target, delta * 5);
    if (speedRef.current < 0.06) speedRef.current = 0;

    groupRef.current.position.x += data.dir[0] * speedRef.current * delta;
    groupRef.current.position.z += data.dir[2] * speedRef.current * delta;

    // Loop
    if (sign > 0 && pos > 62) groupRef.current.position[data.ax] = -62;
    else if (sign < 0 && pos < -62) groupRef.current.position[data.ax] = 62;

    // Update shared world positions
    trafficWorldPositions[index] = groupRef.current.position.clone();
  });

  return (
    <group ref={groupRef} position={[...data.sp]} rotation={[0, data.rot, 0]}>
      <VehicleMesh color={data.color} />
    </group>
  );
}

export default function TrafficVehicles() {
  return (
    <group>
      {VEHICLES.map((v, i) => <TrafficVehicle key={v.id} data={v} index={i} />)}
    </group>
  );
}
