import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const sectionStyle = {
  padding: '100px 40px',
  maxWidth: '900px',
  margin: '0 auto',
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
};

const titleStyle = {
  fontFamily: "'Syne', sans-serif",
  fontSize: '40px',
  fontWeight: 700,
  color: 'var(--text-primary)',
  textAlign: 'center',
  marginBottom: '40px',
};

const equationContainerStyle = {
  textAlign: 'center',
  marginBottom: '60px',
};

const equationStyle = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: '28px',
  color: 'var(--accent-cyan)',
  marginBottom: '12px',
};

const equationDescStyle = {
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '15px',
  color: 'var(--text-secondary)',
};

const cardsGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: '24px',
  marginBottom: '60px',
};

const cardStyle = {
  background: 'var(--bg-elevated)',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  padding: '24px',
};

const cardTitleStyle = {
  fontFamily: "'Syne', sans-serif",
  fontSize: '18px',
  fontWeight: 600,
  color: 'var(--text-primary)',
  marginBottom: '16px',
};

const cardBodyStyle = {
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '14px',
  color: 'var(--text-secondary)',
  lineHeight: 1.6,
};

const tableStyle = {
  width: '100%',
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: '12px',
  borderCollapse: 'collapse',
};

const thStyle = {
  borderBottom: '1px solid rgba(255,255,255,0.1)',
  padding: '8px 4px',
  textAlign: 'left',
  color: 'var(--text-primary)',
};

const tdStyle = {
  borderBottom: '1px solid rgba(255,255,255,0.05)',
  padding: '8px 4px',
  color: 'var(--text-secondary)',
};

const chartContainerStyle = {
  marginTop: '20px',
};

const barRowStyle = {
  display: 'flex',
  alignItems: 'center',
  marginBottom: '16px',
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: '11px',
};

const barLabelStyle = {
  width: '100px',
  color: 'var(--text-secondary)',
};

const barTrackStyle = {
  flex: 1,
  height: '8px',
  background: 'rgba(255,255,255,0.05)',
  borderRadius: '4px',
  overflow: 'hidden',
  position: 'relative',
};

const barValueStyle = {
  width: '50px',
  textAlign: 'right',
  color: 'var(--text-primary)',
};

const WEATHER_DATA = [
  { name: 'Clear', pct: 100, color: '#00E676' },
  { name: 'LightRain', pct: 85, color: '#8BC34A' },
  { name: 'HeavyRain', pct: 60, color: '#FFB300' }, // Approximation from prompt mapping
  { name: 'DenseFog', pct: 35, color: '#FF3D3D' },
  { name: 'Night', pct: 75, color: '#888888' },
];

export default function Act3Physics() {
  const cardsRef = useRef([]);
  const barsRef = useRef([]);
  const sectionRef = useRef(null);

  useEffect(() => {
    // Cards Stagger Animation
    gsap.fromTo(cardsRef.current,
      { y: 30, opacity: 0 },
      {
        y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: 'power2.out',
        scrollTrigger: {
          trigger: cardsRef.current[0],
          start: 'top 80%',
        }
      }
    );

    // Bar Chart Animation
    barsRef.current.forEach(bar => {
      if (bar) {
        gsap.fromTo(bar,
          { scaleX: 0 },
          {
            scaleX: 1, duration: 1.2, ease: 'power2.out',
            transformOrigin: 'left center',
            scrollTrigger: {
              trigger: bar,
              start: 'top 85%',
            }
          }
        );
      }
    });

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <section ref={sectionRef} style={sectionStyle}>
      <h2 style={titleStyle}>Weather & The Beer-Lambert Law</h2>

      <div style={equationContainerStyle}>
        <div style={equationStyle}>I = I₀ · e^(-μx)</div>
        <div style={equationDescStyle}>Beam intensity decays exponentially with distance through atmosphere</div>
      </div>

      <div style={cardsGridStyle}>
        <div ref={el => cardsRef.current.push(el)} style={cardStyle}>
          <div style={cardTitleStyle}>The Law</div>
          <div style={cardBodyStyle}>
            μ = attenuation coefficient (varies by medium)<br/><br/>
            As μ increases, range collapses rapidly.<br/><br/>
            This is why fog (μ≈0.3) is catastrophic for LIDAR.
          </div>
        </div>

        <div ref={el => cardsRef.current.push(el)} style={cardStyle}>
          <div style={cardTitleStyle}>Impact Table</div>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Weather</th>
                <th style={thStyle}>μ (approx)</th>
                <th style={thStyle}>Range</th>
              </tr>
            </thead>
            <tbody>
              <tr><td style={tdStyle}>Clear</td><td style={tdStyle}>0.01</td><td style={tdStyle}>100%</td></tr>
              <tr><td style={tdStyle}>Rain</td><td style={tdStyle}>0.08</td><td style={tdStyle}>85%</td></tr>
              <tr><td style={tdStyle}>Fog</td><td style={tdStyle}>0.30</td><td style={tdStyle}>35%</td></tr>
              <tr><td style={tdStyle}>Night</td><td style={tdStyle}>0.05</td><td style={tdStyle}>75%</td></tr>
            </tbody>
          </table>
        </div>

        <div ref={el => cardsRef.current.push(el)} style={cardStyle}>
          <div style={cardTitleStyle}>Why This Matters</div>
          <div style={cardBodyStyle}>
            Real LIDAR systems (Waymo, Tesla) carry redundant sensors precisely because no single LIDAR unit can guarantee detection in adverse weather.<br/><br/>
            This simulation lets you observe the degradation in real time — something no textbook diagram can provide.
          </div>
        </div>
      </div>

      <div style={chartContainerStyle}>
        {WEATHER_DATA.map((w, i) => (
          <div key={w.name} style={barRowStyle}>
            <div style={barLabelStyle}>{w.name}</div>
            <div style={barTrackStyle}>
              <div 
                ref={el => barsRef.current.push(el)}
                style={{
                  position: 'absolute',
                  left: 0, top: 0, bottom: 0,
                  width: `${w.pct}%`,
                  background: w.color,
                }}
              />
            </div>
            <div style={barValueStyle}>{w.pct}%</div>
          </div>
        ))}
      </div>
    </section>
  );
}
