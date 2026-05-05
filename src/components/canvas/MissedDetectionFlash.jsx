import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import useSimStore from '../../store/useSimStore';

export default function MissedDetectionFlash({ wrapperRef }) {
  const vignetteRef = useRef(null);
  const bannerRef = useRef(null);

  useEffect(() => {
    const unsub = useSimStore.subscribe(
      (state) => state.missedDetectionEvent,
      (fired) => {
        if (!fired) return;
        if (!vignetteRef.current || !bannerRef.current) return;

        const dBlind = useSimStore.getState().dBlind;

        // Update banner text
        if (bannerRef.current.querySelector('.dblind-val')) {
          bannerRef.current.querySelector('.dblind-val').textContent =
            `d_blind = ${dBlind.toFixed(2)}m  >  0.6m body width`;
        }

        const tl = gsap.timeline();

        tl.to(vignetteRef.current, { opacity: 0.45, duration: 0.08 });

        if (wrapperRef?.current) {
          tl.to(wrapperRef.current, { x: -8, duration: 0.04 })
            .to(wrapperRef.current, { x: 8, duration: 0.04 })
            .to(wrapperRef.current, { x: -5, duration: 0.04 })
            .to(wrapperRef.current, { x: 0, duration: 0.04 });
        }

        tl.to(bannerRef.current, { opacity: 1, y: 0, duration: 0.2 }, '-=0.1')
          .to(vignetteRef.current, { opacity: 0, duration: 0.4 }, '+=0.3')
          .to(bannerRef.current, { opacity: 0, y: -10, duration: 0.3 }, '-=0.2');
      }
    );

    return () => unsub();
  }, [wrapperRef]);

  return (
    <>
      {/* Red vignette */}
      <div
        ref={vignetteRef}
        style={{
          position: 'fixed',
          inset: 0,
          background:
            'radial-gradient(ellipse at center, transparent 40%, rgba(255,61,61,0.35) 100%)',
          opacity: 0,
          pointerEvents: 'none',
          zIndex: 50,
        }}
      />

      {/* Banner */}
      <div
        ref={bannerRef}
        style={{
          position: 'fixed',
          top: '2rem',
          left: '50%',
          transform: 'translateX(-50%) translateY(-20px)',
          opacity: 0,
          fontFamily: 'JetBrains Mono',
          color: '#FF3D3D',
          background: 'rgba(10,11,13,0.9)',
          border: '1px solid #FF3D3D',
          padding: '12px 24px',
          borderRadius: '4px',
          zIndex: 51,
          pointerEvents: 'none',
          textAlign: 'center',
          whiteSpace: 'nowrap',
        }}
      >
        <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '4px' }}>
          PEDESTRIAN NOT DETECTED
        </div>
        <div className="dblind-val" style={{ fontSize: '11px', opacity: 0.8 }}>
          d_blind = 0.00m &gt; 0.6m body width
        </div>
      </div>
    </>
  );
}
