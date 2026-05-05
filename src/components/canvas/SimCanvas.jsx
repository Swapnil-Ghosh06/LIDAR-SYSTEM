import { useEffect, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls } from '@react-three/drei';
import gsap from 'gsap';
import RoadEnvironment from './RoadEnvironment';
import TrafficVehicles from './TrafficVehicles';
import EgoVehicle from './EgoVehicle';
import LidarBeams from './LidarBeams';
import Pedestrian from './Pedestrian';
import WeatherEffects from './WeatherEffects';
import useSimStore from '../../store/useSimStore';
import * as THREE from 'three';

function CleanupHook() {
  const { gl } = useThree();
  useEffect(() => {
    return () => gl.dispose();
  }, [gl]);
  return null;
}
function CameraController() {
  const { camera, controls } = useThree();

  useEffect(() => {
    const handleSetCamera = (e) => {
      const preset = e.detail;
      let targetPos;
      
      if (preset === 'OVERVIEW') targetPos = [20, 20, 20];
      else if (preset === 'SENSOR') targetPos = [0, 12, 8];
      else if (preset === 'STREET') targetPos = [0, 3, 18];
      
      if (targetPos) {
        gsap.to(camera.position, {
          x: targetPos[0],
          y: targetPos[1],
          z: targetPos[2],
          duration: 1.5,
          ease: "power2.inOut",
          onUpdate: () => controls?.update()
        });
        
        if (controls && controls.target) {
          gsap.to(controls.target, {
            x: 0, y: 0, z: 0,
            duration: 1.5,
            ease: "power2.inOut"
          });
        }
      }
    };

    const handleReset = () => {
      gsap.to(camera.position, {
        x: 20, y: 20, z: 20,
        duration: 1.5,
        ease: "power2.inOut",
        onUpdate: () => controls?.update()
      });
      if (controls && controls.target) {
        gsap.to(controls.target, {
          x: 0, y: 0, z: 0,
          duration: 1.5,
          ease: "power2.inOut"
        });
      }
    };

    window.addEventListener('setCamera', handleSetCamera);
    window.addEventListener('resetCamera', handleReset);
    return () => {
      window.removeEventListener('setCamera', handleSetCamera);
      window.removeEventListener('resetCamera', handleReset);
    };
  }, [camera, controls]);

  return null;
}

function Lighting() {
  const weather = useSimStore((s) => s.weather);
  const isNight = weather === 'Night';
  const { scene } = useThree();

  useEffect(() => {
    scene.background = new THREE.Color(isNight ? '#040812' : '#0A0B0D');
  }, [isNight, scene]);

  return (
    <>
      <ambientLight intensity={isNight ? 0.05 : 0.6} color="#B8C4D4" />
      <hemisphereLight skyColor="#6A8FC0" groundColor="#3A5A3A" intensity={isNight ? 0.05 : 0.4} />
      
      {!isNight && (
        <directionalLight 
          position={[15, 20, 10]} 
          intensity={1.2} 
          color="#FFF5E6" 
          castShadow 
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-near={0.1}
          shadow-camera-far={60}
          shadow-camera-left={-25}
          shadow-camera-right={25}
          shadow-camera-top={25}
          shadow-camera-bottom={-25}
          shadow-bias={-0.001}
        />
      )}
    </>
  );
}

export default function SimCanvas() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas
        shadows={false}
        dpr={[1, 1.5]}
        performance={{ min: 0.5 }}
        gl={{ antialias: false, powerPreference: 'high-performance' }}
        frameloop="always"
        onCreated={({ gl, scene }) => {
          gl.setClearColor('#0A0B0D');
          gl.shadowMap.enabled = false;
        }}
      >
        <PerspectiveCamera
          makeDefault
          position={[20, 20, 20]}
          fov={45}
          onUpdate={(c) => c.lookAt(0, 0, 0)}
        />
        <OrbitControls
          enableZoom={true}
          enableRotate={true}
          enablePan={true}
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 2.1}
          minDistance={8}
          maxDistance={60}
          dampingFactor={0.08}
          enableDamping={true}
          zoomSpeed={1.2}
          rotateSpeed={0.6}
          panSpeed={0.8}
        />
        <Lighting />
        <WeatherEffects />

        <RoadEnvironment />
        <TrafficVehicles />
        <EgoVehicle />
        <LidarBeams />
        <Pedestrian />
        
        <CameraController />
        <CleanupHook />
      </Canvas>
    </div>
  );
}
