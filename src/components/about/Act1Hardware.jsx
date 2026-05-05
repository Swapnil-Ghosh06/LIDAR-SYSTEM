import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const containerStyle = {
  maxWidth: '900px',
  margin: '0 auto',
  padding: '120px 40px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  minHeight: '100vh',
  justifyContent: 'center',
};

const counterStyle = {
  fontFamily: "'Syne', sans-serif",
  fontSize: 'clamp(64px, 8vw, 96px)',
  fontWeight: 700,
  color: 'var(--accent-cyan)',
  lineHeight: 1,
};

const sublineStyle = {
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '16px',
  color: 'var(--text-secondary)',
  marginTop: '12px',
};

const keyLineStyle = {
  fontFamily: "'Syne', sans-serif",
  fontSize: 'clamp(22px, 3vw, 32px)',
  fontWeight: 600,
  color: 'var(--text-primary)',
  textAlign: 'center',
  maxWidth: '700px',
  margin: '60px auto 80px',
  opacity: 0,
};

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: '32px',
  width: '100%',
};

const cardStyle = {
  background: 'var(--bg-elevated)',
  borderRadius: '8px',
  padding: '32px 24px',
};

const leftCardStyle = {
  ...cardStyle,
  border: '1px solid rgba(255,61,61,0.2)',
};

const rightCardStyle = {
  ...cardStyle,
  border: '1px solid rgba(0,230,118,0.2)',
};

const cardLabelStyle = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: '12px',
  letterSpacing: '0.15em',
  color: 'var(--text-muted)',
  marginBottom: '16px',
  textTransform: 'uppercase',
};

const cardTitleStyle = {
  fontFamily: "'Syne', sans-serif",
  fontSize: '24px',
  fontWeight: 600,
  color: 'var(--text-primary)',
  marginBottom: '24px',
};

const listItemStyle = {
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '15px',
  lineHeight: 2,
  color: 'var(--text-secondary)',
  display: 'flex',
  alignItems: 'flex-start',
  gap: '12px',
  marginBottom: '8px',
};

export default function Act1Hardware() {
  const counterRef = useRef(null);
  const keyLineRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    // Counter Animation
    const countObj = { value: 0 };
    const tl = gsap.timeline();

    tl.to(countObj, {
      value: 4000,
      duration: 2.5,
      ease: 'power2.out',
      onUpdate: () => {
        if (counterRef.current) {
          counterRef.current.textContent = '$' + Math.round(countObj.value).toLocaleString();
        }
      },
    })
    .to(keyLineRef.current, {
      y: 0,
      opacity: 1,
      duration: 1,
      ease: 'power3.out',
    }, "-=0.5");

    // Cards Scroll Animation
    gsap.fromTo(cardsRef.current, 
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: cardsRef.current[0],
          start: 'top 80%',
        }
      }
    );

    return () => {
      tl.kill();
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <section style={containerStyle}>
      <div ref={counterRef} style={counterStyle}>$0</div>
      <div style={sublineStyle}>Price of one Velodyne VLP-16 LIDAR unit</div>

      <div ref={keyLineRef} style={{ ...keyLineStyle, transform: 'translateY(30px)' }}>
        You cannot turn a knob on a $4,000 sensor to understand why it fails.
      </div>

      <div style={gridStyle}>
        {/* Left Card */}
        <div ref={el => cardsRef.current[0] = el} style={leftCardStyle}>
          <div style={cardLabelStyle}>Real Hardware</div>
          <div style={cardTitleStyle}>Velodyne VLP-16</div>
          <div style={listItemStyle}><span style={{color: 'var(--accent-red)'}}>×</span> Fixed scan frequency — no parameter control</div>
          <div style={listItemStyle}><span style={{color: 'var(--accent-red)'}}>×</span> One physical environment only</div>
          <div style={listItemStyle}><span style={{color: 'var(--accent-red)'}}>×</span> $4,000 — inaccessible to students</div>
          <div style={listItemStyle}><span style={{color: 'var(--accent-red)'}}>×</span> Weather damage risk</div>
          <div style={listItemStyle}><span style={{color: 'var(--accent-red)'}}>×</span> Cannot slow down time to observe gaps</div>
        </div>

        {/* Right Card */}
        <div ref={el => cardsRef.current[1] = el} style={rightCardStyle}>
          <div style={cardLabelStyle}>This Simulation</div>
          <div style={cardTitleStyle}>Software-Defined LIDAR</div>
          <div style={listItemStyle}><span style={{color: 'var(--accent-green)'}}>✓</span> Adjustable 1-30 Hz in real time</div>
          <div style={listItemStyle}><span style={{color: 'var(--accent-green)'}}>✓</span> 5 weather conditions including dense fog</div>
          <div style={listItemStyle}><span style={{color: 'var(--accent-green)'}}>✓</span> Free — zero hardware cost</div>
          <div style={listItemStyle}><span style={{color: 'var(--accent-green)'}}>✓</span> Pause, replay, adjust any variable</div>
          <div style={listItemStyle}><span style={{color: 'var(--accent-green)'}}>✓</span> Visualizes the gap that hardware hides</div>
        </div>
      </div>
    </section>
  );
}
