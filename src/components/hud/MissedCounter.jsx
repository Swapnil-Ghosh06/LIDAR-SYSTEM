import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import useSimStore from '../../store/useSimStore';

export default React.memo(function MissedCounter() {
  const missedCount = useSimStore((s) => s.missedCount);
  const counterRef = useRef(null);
  const wrapRef = useRef(null);
  const prevRef = useRef(missedCount);

  useEffect(() => {
    if (missedCount > prevRef.current && counterRef.current) {
      gsap.timeline()
        .to(counterRef.current, { scale: 1.5, color: '#FF6B6B', duration: 0.15 })
        .to(counterRef.current, { scale: 1, color: '#FF3D3D', duration: 0.25 });
    }
    prevRef.current = missedCount;
  }, [missedCount]);

  return (
    <div
      ref={wrapRef}
      style={{
        background: 'rgba(255,61,61,0.08)',
        border: '1px solid rgba(255,61,61,0.2)',
        borderLeft: '3px solid var(--accent-red)',
        backdropFilter: 'blur(12px)',
        borderRadius: '6px',
        padding: '10px 20px',
        fontFamily: "'JetBrains Mono', monospace",
        textAlign: 'center',
        opacity: missedCount > 0 ? 1 : 0,
        transition: 'opacity 0.3s ease',
        pointerEvents: missedCount > 0 ? 'all' : 'none',
      }}
    >
      <div
        ref={counterRef}
        style={{
          fontSize: '32px',
          fontWeight: 500,
          color: 'var(--accent-red)',
          lineHeight: 1,
          display: 'inline-block',
        }}
      >
        {missedCount}
      </div>
      <div
        style={{
          fontSize: '9px',
          letterSpacing: '0.2em',
          color: 'var(--text-muted)',
          marginTop: '4px',
          textTransform: 'uppercase',
        }}
      >
        MISSED DETECTIONS
      </div>
    </div>
  );
});
