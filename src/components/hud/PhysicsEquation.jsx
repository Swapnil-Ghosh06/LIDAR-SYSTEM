import React, { useRef, useEffect } from 'react';
import useSimStore from '../../store/useSimStore';

export default React.memo(function PhysicsEquation() {
  const scanFrequency = useSimStore((s) => s.scanFrequency);
  const pedestrianVelocity = useSimStore((s) => s.pedestrianVelocity);
  const dBlind = useSimStore((s) => s.dBlind);

  const isDanger = dBlind > 0.6;
  const humanWidth = 0.6; // metres
  const dangerFill = Math.min(100, (dBlind / humanWidth) * 100);
  const barColor = isDanger ? '#FF4444' : '#00E676';

  const dBlindRef = useRef(null);
  const prevRef = useRef(dBlind);

  useEffect(() => {
    if (!dBlindRef.current) return;
    const from = prevRef.current;
    const to = dBlind;
    const step = (to - from) / 20;
    let current = from;
    let frame;
    const animate = () => {
      current += step;
      const done = step > 0 ? current >= to : current <= to;
      if (dBlindRef.current) dBlindRef.current.textContent = (done ? to : current).toFixed(2) + ' m';
      if (!done) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    prevRef.current = to;
    return () => cancelAnimationFrame(frame);
  }, [dBlind]);

  return (
    <div style={{
      background: 'rgba(10,12,18,0.88)',
      border: `1px solid ${isDanger ? 'rgba(255,68,68,0.5)' : 'rgba(0,230,118,0.3)'}`,
      borderLeft: `3px solid ${isDanger ? '#FF4444' : '#00E676'}`,
      borderRadius: '6px',
      padding: '14px 16px',
      minWidth: '270px',
      maxWidth: '310px',
      backdropFilter: 'blur(14px)',
      fontFamily: "'JetBrains Mono', monospace",
      transition: 'border-color 0.4s ease',
    }}>
      {/* Header */}
      <div style={{ fontSize: '10px', letterSpacing: '0.15em', color: '#8090A8', marginBottom: '12px', textTransform: 'uppercase' }}>
        ⚡ LIDAR Blind Spot
      </div>

      {/* The core concept — plain English */}
      <div style={{ fontSize: '11px', color: '#90A0B8', lineHeight: 1.6, marginBottom: '14px' }}>
        Between two laser scans, the pedestrian travels a distance the AV <span style={{ color: '#FFB300', fontWeight: 'bold' }}>cannot see</span>.
        That gap is the <span style={{ color: isDanger ? '#FF4444' : '#00E676', fontWeight: 'bold' }}>blind spot</span>.
      </div>

      {/* Visual gap bar */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#5A6A80', marginBottom: '4px' }}>
          <span>Blind gap</span>
          <span>≈ body width (0.6 m)</span>
        </div>
        <div style={{ background: '#1A2030', borderRadius: '4px', height: '12px', overflow: 'hidden', position: 'relative' }}>
          <div style={{
            width: `${Math.min(dangerFill, 100)}%`,
            height: '100%',
            background: isDanger
              ? 'linear-gradient(90deg, #FF4444, #FF8800)'
              : 'linear-gradient(90deg, #00B050, #00E676)',
            borderRadius: '4px',
            transition: 'width 0.3s ease, background 0.4s',
            boxShadow: isDanger ? '0 0 8px rgba(255,68,68,0.5)' : '0 0 8px rgba(0,230,118,0.4)',
          }} />
          {/* Body width marker */}
          <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '2px', background: 'rgba(255,255,255,0.3)' }} />
        </div>
        {isDanger && (
          <div style={{ fontSize: '10px', color: '#FF4444', marginTop: '4px' }}>
            ▲ Gap exceeds human width — pedestrian CAN be missed!
          </div>
        )}
      </div>

      {/* Big value display */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        background: isDanger ? 'rgba(255,68,68,0.08)' : 'rgba(0,230,118,0.06)',
        border: `1px solid ${isDanger ? 'rgba(255,68,68,0.3)' : 'rgba(0,230,118,0.2)'}`,
        borderRadius: '6px',
        padding: '10px 14px',
        marginBottom: '12px',
      }}>
        <div style={{ fontSize: '28px', fontWeight: 700, color: isDanger ? '#FF6666' : '#00E676', lineHeight: 1 }} ref={dBlindRef}>
          {dBlind.toFixed(2)} m
        </div>
        <div style={{ fontSize: '10px', color: '#5A6A80', lineHeight: 1.4 }}>
          blind<br/>gap
        </div>
      </div>

      {/* Parameters */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
        <div style={{ background: '#10151F', borderRadius: '4px', padding: '8px 10px' }}>
          <div style={{ fontSize: '9px', color: '#5A6A80', marginBottom: '2px' }}>SCAN RATE</div>
          <div style={{ fontSize: '15px', color: '#00B4D8', fontWeight: 600 }}>{scanFrequency} Hz</div>
          <div style={{ fontSize: '9px', color: '#3A4A60' }}>scans per second</div>
        </div>
        <div style={{ background: '#10151F', borderRadius: '4px', padding: '8px 10px' }}>
          <div style={{ fontSize: '9px', color: '#5A6A80', marginBottom: '2px' }}>PED SPEED</div>
          <div style={{ fontSize: '15px', color: '#FFB300', fontWeight: 600 }}>{pedestrianVelocity.toFixed(1)} m/s</div>
          <div style={{ fontSize: '9px', color: '#3A4A60' }}>walking speed</div>
        </div>
      </div>

      {/* Formula — simplified */}
      <div style={{ fontSize: '10px', color: '#3A4A60', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '8px', textAlign: 'center' }}>
        gap = speed ÷ scan rate = {pedestrianVelocity.toFixed(1)} ÷ {scanFrequency} = <span style={{ color: isDanger ? '#FF6666' : '#00E676' }}>{dBlind.toFixed(3)} m</span>
      </div>

      {/* Status badge */}
      <div style={{
        marginTop: '10px',
        background: isDanger ? 'rgba(255,68,68,0.15)' : 'rgba(0,230,118,0.1)',
        border: `1px solid ${isDanger ? 'rgba(255,68,68,0.4)' : 'rgba(0,230,118,0.3)'}`,
        borderRadius: '4px',
        padding: '7px 12px',
        fontSize: '11px',
        fontWeight: 600,
        color: isDanger ? '#FF6666' : '#00E676',
        textAlign: 'center',
      }}>
        {isDanger ? '⚠ DANGER — pedestrian may be invisible!' : '✓ SAFE — AV can detect the pedestrian'}
      </div>
    </div>
  );
});
