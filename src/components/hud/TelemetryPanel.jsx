import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import useSimStore from '../../store/useSimStore';

const WEATHER_RANGE = { Clear: 1.0, LightRain: 0.85, HeavyRain: 0.6, DenseFog: 0.35, Night: 0.75 };
const WEATHER_CONF = { Clear: 1.0, LightRain: 0.88, HeavyRain: 0.65, DenseFog: 0.4, Night: 0.8 };

const panelStyle = {
  background: 'rgba(17,19,24,0.75)',
  border: '1px solid rgba(255,255,255,0.06)',
  borderLeft: '3px solid var(--accent-cyan)',
  borderRadius: '6px',
  padding: '16px',
  minWidth: '220px',
  backdropFilter: 'blur(12px)',
  fontFamily: "'JetBrains Mono', monospace",
};

const headerStyle = {
  fontSize: '10px',
  letterSpacing: '0.15em',
  color: 'var(--text-muted)',
  borderBottom: '1px solid var(--border)',
  paddingBottom: '8px',
  marginBottom: '12px',
  textTransform: 'uppercase',
};

const rowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '4px 6px',
  borderRadius: '3px',
  marginBottom: '2px',
};

const labelStyle = { color: 'var(--text-muted)', fontSize: '10px' };
const valueStyle = { fontWeight: 500, color: 'var(--text-primary)', fontSize: '13px' };

function useAnimatedValue(storeValue, ref, decimals = 2) {
  const prevRef = useRef(storeValue);
  useEffect(() => {
    if (!ref.current) return;
    const obj = { val: prevRef.current };
    gsap.to(obj, {
      val: storeValue,
      duration: 0.3,
      ease: 'power1.out',
      onUpdate: () => {
        if (ref.current) ref.current.textContent = obj.val.toFixed(decimals);
      },
    });
    prevRef.current = storeValue;
  }, [storeValue, ref, decimals]);
}

export default React.memo(function TelemetryPanel() {
  const scanFrequency = useSimStore((s) => s.scanFrequency);
  const pointsPerScan = useSimStore((s) => s.pointsPerScan);
  const missedCount = useSimStore((s) => s.missedCount);
  const dBlind = useSimStore((s) => s.dBlind);
  const weather = useSimStore((s) => s.weather);

  const scanCycleMs = 1000 / scanFrequency;
  const effectiveRange = 100 * (WEATHER_RANGE[weather] || 1.0);
  const detectionConfidence = 100 * (WEATHER_CONF[weather] || 1.0);

  const freqRef = useRef(null);
  const ptsRef = useRef(null);
  const confRef = useRef(null);
  const missedRef = useRef(null);
  const dBlindRef = useRef(null);
  const cycleRef = useRef(null);
  const rangeRef = useRef(null);

  useAnimatedValue(scanFrequency, freqRef, 0);
  useAnimatedValue(pointsPerScan, ptsRef, 0);
  useAnimatedValue(detectionConfidence, confRef, 0);
  useAnimatedValue(missedCount, missedRef, 0);
  useAnimatedValue(dBlind, dBlindRef, 2);
  useAnimatedValue(scanCycleMs, cycleRef, 1);
  useAnimatedValue(effectiveRange, rangeRef, 0);

  const isDanger = dBlind > 0.6;

  return (
    <div style={panelStyle}>
      <div style={headerStyle}>TELEMETRY</div>

      <Row label="SCAN FREQ" valRef={freqRef} init={scanFrequency} suffix=" Hz" />
      <Row label="PTS / SCAN" valRef={ptsRef} init={pointsPerScan} suffix="" decimals={0} />
      <Row
        label="CONFIDENCE"
        valRef={confRef}
        init={detectionConfidence}
        suffix="%"
        decimals={0}
      />
      <Row
        label="MISSED"
        valRef={missedRef}
        init={missedCount}
        suffix=""
        decimals={0}
        valueColor={missedCount > 0 ? 'var(--accent-red)' : 'var(--accent-green)'}
      />
      <Row
        label="d_blind"
        valRef={dBlindRef}
        init={dBlind}
        suffix=" m"
        valueColor={isDanger ? 'var(--accent-red)' : 'var(--accent-green)'}
        rowBg={
          isDanger
            ? 'rgba(255,61,61,0.08)'
            : 'rgba(0,230,118,0.06)'
        }
      />
      <Row label="CYCLE TIME" valRef={cycleRef} init={scanCycleMs} suffix=" ms" />
      <div style={rowStyle}>
        <span style={labelStyle}>WEATHER</span>
        <span style={valueStyle}>{weather}</span>
      </div>
      <Row label="RANGE" valRef={rangeRef} init={effectiveRange} suffix=" m" decimals={0} />
    </div>
  );
});

function Row({ label, valRef, init, suffix = '', decimals = 2, valueColor, rowBg }) {
  return (
    <div style={{ ...rowStyle, background: rowBg || 'transparent' }}>
      <span style={labelStyle}>{label}</span>
      <span style={{ ...valueStyle, color: valueColor || 'var(--text-primary)' }}>
        <span ref={valRef}>
          {typeof init === 'number' ? init.toFixed(decimals) : init}
        </span>
        {suffix}
      </span>
    </div>
  );
}
