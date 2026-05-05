import { create } from 'zustand';

const useSimStore = create((set, get) => ({
  // Simulation parameters
  scanFrequency: 10,
  pedestrianVelocity: 1.4,
  beamCount: 32,
  weather: 'Clear',

  // Telemetry
  missedCount: 0,
  detectionConfidence: 100,
  pointsPerScan: 0,
  scanCycleMs: 100,
  effectiveRange: 100,

  // Core physics: d_blind = v / f
  dBlind: 0.14,

  // State flags
  isWalking: false,
  autoMode: false,
  lessonStep: null,
  missedDetectionEvent: false,
  successDetectionEvent: false,
  orbitEnabled: false,

  // Actions
  setScanFrequency: (val) =>
    set((state) => ({
      scanFrequency: val,
      scanCycleMs: 1000 / val,
      dBlind: state.pedestrianVelocity / val,
    })),

  setPedestrianVelocity: (val) =>
    set((state) => ({
      pedestrianVelocity: val,
      dBlind: val / state.scanFrequency,
    })),

  setBeamCount: (val) => set({ beamCount: val }),

  setWeather: (val) => set({ weather: val }),

  incrementMissed: () =>
    set((state) => ({ missedCount: state.missedCount + 1 })),

  setPointsPerScan: (val) => set({ pointsPerScan: val }),

  triggerWalk: () => set({ isWalking: true }),

  stopWalk: () => set({ isWalking: false }),

  setAutoMode: (bool) => set({ autoMode: bool }),

  setLessonStep: (step) => set({ lessonStep: step }),

  triggerMissedEvent: () => {
    set({ missedDetectionEvent: true });
    setTimeout(() => set({ missedDetectionEvent: false }), 800);
  },

  triggerSuccessEvent: () => {
    set({ successDetectionEvent: true });
    setTimeout(() => set({ successDetectionEvent: false }), 600);
  },

  setOrbitEnabled: (bool) => set({ orbitEnabled: bool }),

  resetMissedCount: () => set({ missedCount: 0 }),
}));

export default useSimStore;
