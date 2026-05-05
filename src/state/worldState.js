import * as THREE from 'three';

// Shared world state — written by components, read by others
// EgoVehicle reads trafficWorldPositions and pedestrianWorldPositions to brake
// LidarBeams reads egoState to follow the moving AV

export const egoState = {
  position: new THREE.Vector3(2.25, 0.3, -35),
  speed: 0,
  isBraking: false,
  brakeReason: '', // 'pedestrian' | 'vehicle' | 'red_light' | ''
};

export const trafficWorldPositions = []; // Vector3[] — updated each frame by TrafficVehicles
export const pedestrianWorldPositions = []; // Vector3[] — updated each frame by Pedestrian
