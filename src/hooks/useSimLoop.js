import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import useSimStore from '../store/useSimStore';

// Shared non-reactive state for cross-component communication
export const scanState = {
  progress: 0,
  pedestrianX: 8,
  pedestrianCrossing: false,
};

export default function useSimLoop() {
  const callbacksRef = useRef([]);

  const onScanFire = (cb) => {
    callbacksRef.current.push(cb);
    return () => {
      callbacksRef.current = callbacksRef.current.filter((fn) => fn !== cb);
    };
  };

  useEffect(() => {
    let timeSinceLastScan = 0;

    const tick = (time, deltaTime) => {
      const delta = deltaTime / 1000;
      if (delta > 0.1) return; // skip large jumps

      const store = useSimStore.getState();
      const scanPeriod = 1 / store.scanFrequency;

      timeSinceLastScan += delta;
      scanState.progress = Math.min(timeSinceLastScan / scanPeriod, 1);

      if (timeSinceLastScan >= scanPeriod) {
        timeSinceLastScan = 0;
        scanState.progress = 0;

        // Fire all scan callbacks
        callbacksRef.current.forEach((cb) => cb());

        // Missed detection check
        const dBlind = store.pedestrianVelocity / store.scanFrequency;
        const pedX = scanState.pedestrianX;
        const pedDist = Math.sqrt(pedX * pedX + 16); // z = -4 fixed
        const weatherRange = getWeatherRange(store.weather);

        if (store.isWalking && pedDist < weatherRange && Math.abs(pedX) < 9) {
          if (dBlind > 0.6) {
            store.triggerMissedEvent();
            store.incrementMissed();
          } else {
            store.triggerSuccessEvent();
          }
        }
      }
    };

    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, []);

  return { onScanFire };
}

function getWeatherRange(weather) {
  const multipliers = {
    Clear: 1.0,
    LightRain: 0.85,
    HeavyRain: 0.6,
    DenseFog: 0.35,
    Night: 0.75,
  };
  return 18 * (multipliers[weather] || 1.0);
}
