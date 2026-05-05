import React, { useMemo, useEffect, useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import useSimStore from '../../store/useSimStore';

// Global traffic state for vehicles to read
export const trafficState = { signalNS: 'GREEN', signalEW: 'RED', timer: 0 };

// Traffic light controller — runs once at the top
let _signalPhase = 'NS_GREEN';
let _signalTimer = null;
function startSignalCycle() {
  if (_signalTimer) return;
  const cycle = () => {
    if (_signalPhase === 'NS_GREEN') {
      trafficState.signalNS = 'YELLOW';
      _signalPhase = 'NS_YELLOW';
      _signalTimer = setTimeout(cycle, 3000);
    } else if (_signalPhase === 'NS_YELLOW') {
      trafficState.signalNS = 'RED';
      trafficState.signalEW = 'RED';
      _signalPhase = 'ALL_RED_1';
      _signalTimer = setTimeout(cycle, 1500);
    } else if (_signalPhase === 'ALL_RED_1') {
      trafficState.signalEW = 'GREEN';
      _signalPhase = 'EW_GREEN';
      _signalTimer = setTimeout(cycle, 12000);
    } else if (_signalPhase === 'EW_GREEN') {
      trafficState.signalEW = 'YELLOW';
      _signalPhase = 'EW_YELLOW';
      _signalTimer = setTimeout(cycle, 3000);
    } else if (_signalPhase === 'EW_YELLOW') {
      trafficState.signalNS = 'RED';
      trafficState.signalEW = 'RED';
      _signalPhase = 'ALL_RED_2';
      _signalTimer = setTimeout(cycle, 1500);
    } else if (_signalPhase === 'ALL_RED_2') {
      trafficState.signalNS = 'GREEN';
      _signalPhase = 'NS_GREEN';
      _signalTimer = setTimeout(cycle, 12000);
    }
  };
  _signalTimer = setTimeout(cycle, 12000);
}
startSignalCycle();

function TrafficLight({ position, rotation, isNS }) {
  const redRef = useRef();
  const yellowRef = useRef();
  const greenRef = useRef();

  useFrame(() => {
    const state = isNS ? trafficState.signalNS : trafficState.signalEW;
    if (redRef.current && yellowRef.current && greenRef.current) {
      redRef.current.emissiveIntensity = state === 'RED' ? 2.0 : 0.05;
      yellowRef.current.emissiveIntensity = state === 'YELLOW' ? 2.0 : 0.05;
      greenRef.current.emissiveIntensity = state === 'GREEN' ? 2.0 : 0.05;
    }
  });

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Pole */}
      <mesh position={[0, 2.25, 0]} matrixAutoUpdate={false} onUpdate={m => m.updateMatrix()}>
        <cylinderGeometry args={[0.05, 0.07, 4.5, 8]} />
        <meshStandardMaterial color="#2A3540" wireframe={false} />
      </mesh>
      {/* Arm */}
      <mesh position={[0.5, 4.4, 0]} rotation={[0, 0, Math.PI / 2]} matrixAutoUpdate={false} onUpdate={m => m.updateMatrix()}>
        <cylinderGeometry args={[0.04, 0.04, 1.0, 8]} />
        <meshStandardMaterial color="#2A3540" wireframe={false} />
      </mesh>
      {/* Housing */}
      <mesh position={[1.0, 4.2, 0]} matrixAutoUpdate={false} onUpdate={m => m.updateMatrix()}>
        <boxGeometry args={[0.22, 0.65, 0.22]} />
        <meshStandardMaterial color="#111111" wireframe={false} />
      </mesh>
      {/* Lights */}
      <mesh position={[1.0, 4.5, 0.12]} matrixAutoUpdate={false} onUpdate={m => m.updateMatrix()}>
        <circleGeometry args={[0.07, 16]} />
        <meshStandardMaterial ref={redRef} color="#FF2020" emissive="#FF2020" emissiveIntensity={0.05} wireframe={false} />
      </mesh>
      <mesh position={[1.0, 4.22, 0.12]} matrixAutoUpdate={false} onUpdate={m => m.updateMatrix()}>
        <circleGeometry args={[0.07, 16]} />
        <meshStandardMaterial ref={yellowRef} color="#FFB300" emissive="#FFB300" emissiveIntensity={0.05} wireframe={false} />
      </mesh>
      <mesh position={[1.0, 3.94, 0.12]} matrixAutoUpdate={false} onUpdate={m => m.updateMatrix()}>
        <circleGeometry args={[0.07, 16]} />
        <meshStandardMaterial ref={greenRef} color="#00EE66" emissive="#00EE66" emissiveIntensity={0.05} wireframe={false} />
      </mesh>
    </group>
  );
}

// A building with proper window grid
function Building({ pos, width, height, depth, color, isNight }) {
  const windows = useMemo(() => {
    const wins = [];
    const cols = Math.max(2, Math.floor(width / 1.5));
    const rows = Math.max(3, Math.floor(height / 2.2));
    const ww = (width * 0.55) / cols;
    const wh = (height * 0.65) / rows;
    const startX = -(width * 0.55) / 2 + ww / 2;
    const startY = -height / 2 + height * 0.18;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const lit = Math.random() > (isNight ? 0.3 : 0.75);
        wins.push({
          x: startX + c * (width * 0.55 / cols),
          y: startY + r * (height * 0.65 / rows),
          lit,
          id: `${r}-${c}`
        });
      }
    }
    return wins;
  }, [width, height, isNight]);

  return (
    <group position={pos}>
      {/* Main block */}
      <mesh castShadow receiveShadow matrixAutoUpdate={false} onUpdate={m => m.updateMatrix()}>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color={color} wireframe={false} />
      </mesh>
      {/* Window grid — front face */}
      {windows.map((w) => (
        <mesh key={w.id} position={[w.x, w.y, depth / 2 + 0.02]} matrixAutoUpdate={false} onUpdate={m => m.updateMatrix()}>
          <planeGeometry args={[width * 0.55 / Math.max(2, Math.floor(width / 1.5)) * 0.75, 0.55]} />
          <meshStandardMaterial
            color={w.lit ? '#E8F4FF' : '#1A2530'}
            emissive={w.lit ? '#E8F4FF' : '#000000'}
            emissiveIntensity={w.lit ? (isNight ? 2.0 : 0.6) : 0}
            wireframe={false}
          />
        </mesh>
      ))}
    </group>
  );
}

export default function RoadEnvironment() {
  const weather = useSimStore((s) => s.weather);
  const isNight = weather === 'Night';

  // Seed-based building data so it's stable
  const sceneData = useMemo(() => {
    const seed = (n) => Math.abs(Math.sin(n * 9301 + 49297) * 233280) % 1;

    const buildings = [];
    const parkedCars = [];
    const trees = [];
    const streetLights = [];
    const trafficSignals = [];

    const quadrants = [
      { qx: 1, qz: 1 }, { qx: -1, qz: 1 }, { qx: 1, qz: -1 }, { qx: -1, qz: -1 }
    ];
    const bColors = ['#A8B8C8', '#B4C4D4', '#8AAABF', '#9BBCD0', '#C4D0DC', '#7A9EB8'];

    quadrants.forEach((q, qi) => {
      // 10 buildings per quadrant — close to road AND far back
      const bLayouts = [
        // Close to road edge (highly visible)
        [9,  9],  [9, 18], [9,  30], [9,  42],
        // Mid-block
        [18, 9],  [18, 20],[18, 34],
        // Far back (skyline fillers)
        [28, 14], [28, 28],[38, 20],
      ];
      bLayouts.forEach((bp, bi) => {
        const s  = seed(qi * 20 + bi);
        const s2 = seed(qi * 20 + bi + 100);
        const h  = 7 + s * 22;
        const w  = 4.5 + s2 * 4;
        const d  = 4.5 + seed(qi * 20 + bi + 200) * 4;
        buildings.push({
          pos: [q.qx * bp[0], h / 2, q.qz * bp[1]],
          width: w, height: h, depth: d,
          color: bColors[Math.floor(s * bColors.length)]
        });
      });


      // Parked cars — on road shoulders
      [18, 26, 35, 43].forEach((offset, pi) => {
        const s2 = seed(qi * 20 + pi);
        const carColors = ['#D0D8E0', '#4A5A6A', '#8A2020', '#2A4A6A', '#FFFFFF', '#3A4A3A'];
        // Along Z axis (N-S road shoulders)
        parkedCars.push({ pos: [q.qx * 5.5, 0, q.qz * offset], rot: [0, 0, 0], color: carColors[Math.floor(s2 * 6)] });
        // Along X axis (E-W road shoulders)
        parkedCars.push({ pos: [q.qx * offset, 0, q.qz * 5.5], rot: [0, Math.PI / 2, 0], color: carColors[Math.floor(seed(qi * 20 + pi + 0.3) * 6)] });
      });

      // Trees — sidewalk
      [9, 16, 25, 36].forEach((offset, ti) => {
        trees.push({ pos: [q.qx * 7, 0, q.qz * offset] });
        trees.push({ pos: [q.qx * offset, 0, q.qz * 7] });
      });

      // Street lights
      [8, 20, 34].forEach((offset, li) => {
        streetLights.push({ pos: [q.qx * 5.8, 0, q.qz * offset] });
        streetLights.push({ pos: [q.qx * offset, 0, q.qz * 5.8] });
      });

      // Traffic signals — one per approach corner
      trafficSignals.push({ pos: [q.qx * 5.5, 0, q.qz * 5.5], rot: q.qx > 0 ? Math.PI : 0, isNS: q.qz > 0 });
    });

    // Crosswalk stripes
    const crosswalks = [];
    const cwStripes = [-3.5, -2.5, -1.5, -0.5, 0.5, 1.5, 2.5, 3.5];
    cwStripes.forEach(x => {
      crosswalks.push({ pos: [x, 0.022, -6.5] });
      crosswalks.push({ pos: [x, 0.022, 6.5] });
      crosswalks.push({ pos: [-6.5, 0.022, x] });
      crosswalks.push({ pos: [6.5, 0.022, x] });
    });

    return { buildings, parkedCars, trees, streetLights, trafficSignals, crosswalks };
  }, []);

  return (
    <group>
      {/* ===== GROUND ===== */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow matrixAutoUpdate={false} onUpdate={m => m.updateMatrix()}>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#8EA090" wireframe={false} />
      </mesh>

      {/* ===== SIDEWALK BLOCKS ===== */}
      {[
        [30, 30], [-30, 30], [30, -30], [-30, -30]
      ].map((pos, i) => (
        <mesh key={`sw-${i}`} position={[pos[0], 0.01, pos[1]]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow matrixAutoUpdate={false} onUpdate={m => m.updateMatrix()}>
          <planeGeometry args={[50, 50]} />
          <meshStandardMaterial color="#B0B8C0" wireframe={false} />
        </mesh>
      ))}

      {/* ===== ROADS — long enough to loop visually ===== */}
      {/* N-S road */}
      <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow matrixAutoUpdate={false} onUpdate={m => m.updateMatrix()}>
        <planeGeometry args={[9, 200]} />
        <meshStandardMaterial color="#2E2E2E" wireframe={false} />
      </mesh>
      {/* E-W road */}
      <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow matrixAutoUpdate={false} onUpdate={m => m.updateMatrix()}>
        <planeGeometry args={[200, 9]} />
        <meshStandardMaterial color="#2E2E2E" wireframe={false} />
      </mesh>

      {/* ===== CENTER LINES (dashed yellow) ===== */}
      {Array.from({ length: 48 }, (_, i) => i - 24).filter(i => Math.abs(i * 2.5) > 5).map(i => (
        <React.Fragment key={`cl-${i}`}>
          <mesh position={[0, 0.025, i * 2.5]} rotation={[-Math.PI / 2, 0, 0]} matrixAutoUpdate={false} onUpdate={m => m.updateMatrix()}>
            <planeGeometry args={[0.12, 1.4]} />
            <meshStandardMaterial color="#F5C518" wireframe={false} />
          </mesh>
          <mesh position={[i * 2.5, 0.025, 0]} rotation={[-Math.PI / 2, 0, 0]} matrixAutoUpdate={false} onUpdate={m => m.updateMatrix()}>
            <planeGeometry args={[1.4, 0.12]} />
            <meshStandardMaterial color="#F5C518" wireframe={false} />
          </mesh>
        </React.Fragment>
      ))}

      {/* ===== EDGE/CURB LINES ===== */}
      {[4.5, -4.5].map(x => (
        <React.Fragment key={`edge-x-${x}`}>
          <mesh position={[x, 0.025, 0]} rotation={[-Math.PI / 2, 0, 0]} matrixAutoUpdate={false} onUpdate={m => m.updateMatrix()}>
            <planeGeometry args={[0.08, 200]} />
            <meshStandardMaterial color="#FFFFFF" wireframe={false} />
          </mesh>
          <mesh position={[0, 0.025, x]} rotation={[-Math.PI / 2, 0, 0]} matrixAutoUpdate={false} onUpdate={m => m.updateMatrix()}>
            <planeGeometry args={[200, 0.08]} />
            <meshStandardMaterial color="#FFFFFF" wireframe={false} />
          </mesh>
        </React.Fragment>
      ))}

      {/* ===== CROSSWALKS ===== */}
      {sceneData.crosswalks.map((c, i) => (
        <mesh key={`cw-${i}`} position={c.pos} rotation={[-Math.PI / 2, 0, 0]} matrixAutoUpdate={false} onUpdate={m => m.updateMatrix()}>
          <planeGeometry args={[0.7, 3]} />
          <meshStandardMaterial color="#E8E8E8" wireframe={false} />
        </mesh>
      ))}

      {/* ===== BUILDINGS ===== */}
      {sceneData.buildings.map((b, i) => (
        <Building key={`bldg-${i}`} pos={b.pos} width={b.width} height={b.height} depth={b.depth} color={b.color} isNight={isNight} />
      ))}

      {/* ===== STREET LIGHTS ===== */}
      {sceneData.streetLights.map((sl, i) => (
        <group key={`slt-${i}`} position={sl.pos}>
          <mesh position={[0, 2.5, 0]} matrixAutoUpdate={false} onUpdate={m => m.updateMatrix()}>
            <cylinderGeometry args={[0.04, 0.06, 5.0, 6]} />
            <meshStandardMaterial color="#607080" wireframe={false} />
          </mesh>
          <mesh position={[0, 5.0, 0.6]} matrixAutoUpdate={false} onUpdate={m => m.updateMatrix()}>
            <boxGeometry args={[0.1, 0.1, 1.2]} />
            <meshStandardMaterial color="#607080" wireframe={false} />
          </mesh>
          <mesh position={[0, 5.0, 1.2]} matrixAutoUpdate={false} onUpdate={m => m.updateMatrix()}>
            <boxGeometry args={[0.3, 0.1, 0.25]} />
            <meshStandardMaterial color="#FFF5D0" emissive="#FFF5D0" emissiveIntensity={isNight ? 3.0 : 0.7} wireframe={false} />
          </mesh>
          {isNight && <pointLight position={[0, 4.8, 1.2]} color="#FFF5D0" intensity={3.0} distance={9} decay={2} />}
        </group>
      ))}

      {/* ===== TRAFFIC SIGNALS ===== */}
      {sceneData.trafficSignals.map((ts, i) => (
        <TrafficLight key={`ts-${i}`} position={ts.pos} rotation={ts.rot} isNS={ts.isNS} />
      ))}

      {/* ===== TREES ===== */}
      {sceneData.trees.map((t, i) => (
        <group key={`tree-${i}`} position={t.pos}>
          <mesh position={[0, 0.5, 0]} matrixAutoUpdate={false} onUpdate={m => m.updateMatrix()}>
            <cylinderGeometry args={[0.1, 0.15, 1.0, 6]} />
            <meshStandardMaterial color="#6B4B2A" wireframe={false} />
          </mesh>
          <mesh position={[0, 1.8, 0]} matrixAutoUpdate={false} onUpdate={m => m.updateMatrix()}>
            <sphereGeometry args={[1.1, 8, 6]} />
            <meshStandardMaterial color="#2D7A30" flatShading wireframe={false} />
          </mesh>
        </group>
      ))}

      {/* ===== PARKED CARS ===== */}
      {sceneData.parkedCars.map((pc, i) => (
        <group key={`pcar-${i}`} position={pc.pos} rotation={pc.rot}>
          <mesh position={[0, 0.16, 0]} castShadow matrixAutoUpdate={false} onUpdate={m => m.updateMatrix()}>
            <boxGeometry args={[0.85, 0.28, 1.85]} />
            <meshStandardMaterial color={pc.color} wireframe={false} />
          </mesh>
          <mesh position={[0, 0.36, -0.1]} castShadow matrixAutoUpdate={false} onUpdate={m => m.updateMatrix()}>
            <boxGeometry args={[0.7, 0.2, 0.9]} />
            <meshStandardMaterial color={pc.color} wireframe={false} />
          </mesh>
          {/* Wheels */}
          {[[-0.45, 0.12, 0.6], [0.45, 0.12, 0.6], [-0.45, 0.12, -0.6], [0.45, 0.12, -0.6]].map((wp, wi) => (
            <mesh key={wi} position={wp} rotation={[0, 0, Math.PI / 2]} matrixAutoUpdate={false} onUpdate={m => m.updateMatrix()}>
              <cylinderGeometry args={[0.13, 0.13, 0.18, 12]} />
              <meshStandardMaterial color="#111111" wireframe={false} />
            </mesh>
          ))}
          {/* Taillights */}
          <mesh position={[-0.3, 0.17, -0.94]} rotation={[-Math.PI / 2, 0, 0]} matrixAutoUpdate={false} onUpdate={m => m.updateMatrix()}>
            <planeGeometry args={[0.18, 0.08]} />
            <meshStandardMaterial color="#FF4444" emissive="#FF4444" emissiveIntensity={0.8} wireframe={false} />
          </mesh>
          <mesh position={[0.3, 0.17, -0.94]} rotation={[-Math.PI / 2, 0, 0]} matrixAutoUpdate={false} onUpdate={m => m.updateMatrix()}>
            <planeGeometry args={[0.18, 0.08]} />
            <meshStandardMaterial color="#FF4444" emissive="#FF4444" emissiveIntensity={0.8} wireframe={false} />
          </mesh>
        </group>
      ))}

      {/* ===== ROAD END CURVES (visual loop — raised roundabouts at distance) ===== */}
      {[
        [0, 0.02, 95], [0, 0.02, -95], [95, 0.02, 0], [-95, 0.02, 0]
      ].map((pos, i) => (
        <mesh key={`cap-${i}`} position={pos} rotation={[-Math.PI / 2, 0, 0]} matrixAutoUpdate={false} onUpdate={m => m.updateMatrix()}>
          <circleGeometry args={[4.5, 32]} />
          <meshStandardMaterial color="#2E2E2E" wireframe={false} />
        </mesh>
      ))}
      {/* Circular connecting roads between ends */}
      {[
        { pos: [95, 0.015, 95], rot: [0, Math.PI / 4, 0] },
        { pos: [-95, 0.015, 95], rot: [0, -Math.PI / 4, 0] },
        { pos: [95, 0.015, -95], rot: [0, -Math.PI / 4, 0] },
        { pos: [-95, 0.015, -95], rot: [0, Math.PI / 4, 0] },
      ].map((r, i) => (
        <mesh key={`corner-${i}`} position={r.pos} rotation={[-Math.PI / 2, 0, 0]} matrixAutoUpdate={false} onUpdate={m => m.updateMatrix()}>
          <ringGeometry args={[90.5, 99.5, 32, 1, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#2E2E2E" wireframe={false} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}
