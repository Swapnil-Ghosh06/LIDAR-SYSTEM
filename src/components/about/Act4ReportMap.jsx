import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const sectionStyle = {
  padding: '100px 40px',
  maxWidth: '1000px',
  margin: '0 auto',
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  position: 'relative',
};

const titleStyle = {
  fontFamily: "'Syne', sans-serif",
  fontSize: '40px',
  fontWeight: 700,
  color: 'var(--text-primary)',
  textAlign: 'center',
  marginBottom: '16px',
};

const subtitleStyle = {
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '16px',
  color: 'var(--text-secondary)',
  textAlign: 'center',
  marginBottom: '80px',
};

const columnsStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  position: 'relative',
  zIndex: 2,
};

const columnStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '60px',
  width: '40%',
};

const featureItemStyle = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: '13px',
  color: 'var(--accent-cyan)',
  background: 'rgba(0,229,255,0.05)',
  border: '1px solid rgba(0,229,255,0.2)',
  padding: '16px 20px',
  borderRadius: '4px',
  position: 'relative',
  transition: 'border-color 0.3s ease',
};

const reportItemStyle = {
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '16px',
  color: 'var(--text-primary)',
  background: '#ffffff05',
  borderLeft: '4px solid #ffffff20',
  padding: '16px 20px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  position: 'relative',
};

const markStyle = {
  fontFamily: "'Syne', sans-serif",
  fontWeight: 700,
  fontSize: '18px',
  color: 'var(--accent-amber)',
};

const svgOverlayStyle = {
  position: 'absolute',
  top: 0,
  left: '40%',
  width: '20%',
  height: '100%',
  pointerEvents: 'none',
  zIndex: 1,
};

const footerStyle = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: '10px',
  color: 'var(--text-muted)',
  textAlign: 'center',
  marginTop: '100px',
  lineHeight: 1.8,
};

const FEATURES = [
  "[1] Telemetry panel live numbers",
  "[2] Weather degradation system",
  "[3] d_blind equation panel",
  "[4] Lesson Mode guided steps",
  "[5] Act 1 cost counter ($4,000)"
];

const REPORTS = [
  { name: "Observations & Results", marks: "20" },
  { name: "Theoretical Background", marks: "10" },
  { name: "Problem Statement", marks: "10" },
  { name: "Procedure", marks: "15" },
  { name: "Introduction", marks: "5" }
];

export default function Act4ReportMap() {
  const sectionRef = useRef(null);
  const pathsRef = useRef([]);
  const featuresRef = useRef([]);
  const marksRef = useRef([]);

  useEffect(() => {
    // Setup paths
    pathsRef.current.forEach((path, i) => {
      if (!path) return;
      const length = path.getTotalLength();
      gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });

      gsap.to(path, {
        strokeDashoffset: 0,
        duration: 1,
        ease: 'power2.inOut',
        scrollTrigger: {
          trigger: path,
          start: 'top 75%',
        },
        onComplete: () => {
          // Highlight feature border
          if (featuresRef.current[i]) {
            gsap.to(featuresRef.current[i], {
              borderColor: 'rgba(255,179,0,0.8)',
              boxShadow: '0 0 12px rgba(255,179,0,0.3)',
              yoyo: true,
              repeat: 1,
              duration: 0.4
            });
          }
          // Pulse mark
          if (marksRef.current[i]) {
            gsap.to(marksRef.current[i], {
              scale: 1.2,
              color: '#FFD54F',
              yoyo: true,
              repeat: 1,
              duration: 0.3
            });
          }
        }
      });
    });

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <section ref={sectionRef} style={sectionStyle}>
      <h2 style={titleStyle}>Every Mark Has a Feature</h2>
      <div style={subtitleStyle}>
        This simulation was built against the Jain University Experiential Learning report rubric.
      </div>

      <div style={columnsStyle}>
        {/* SVG Connector Lines Overlay */}
        <svg style={svgOverlayStyle} preserveAspectRatio="none" viewBox="0 0 100 500">
          {[0, 1, 2, 3, 4].map(i => {
            // Rough y calculations based on gap spacing (60px gap + ~50px height)
            // We just use 0-100 x coordinates and approximate y coordinates for a viewBox
            const yOffset = 50 + (i * 100); 
            return (
              <path
                key={i}
                ref={el => pathsRef.current[i] = el}
                d={`M 0 ${yOffset} C 30 ${yOffset}, 70 ${yOffset}, 100 ${yOffset}`}
                fill="none"
                stroke="rgba(255,179,0,0.5)"
                strokeWidth="1.5"
                vectorEffect="non-scaling-stroke"
              />
            );
          })}
        </svg>

        <div style={columnStyle}>
          {FEATURES.map((feat, i) => (
            <div key={i} ref={el => featuresRef.current[i] = el} style={featureItemStyle}>
              {feat}
            </div>
          ))}
        </div>

        <div style={columnStyle}>
          {REPORTS.map((rep, i) => (
            <div key={i} style={reportItemStyle}>
              <span>{rep.name}</span>
              <span ref={el => marksRef.current[i] = el} style={markStyle}>{rep.marks} pts</span>
            </div>
          ))}
        </div>
      </div>

      <div style={footerStyle}>
        <div>Built with React + Three.js + GSAP</div>
        <div>B.Tech CSE (AI & ML) · Jain (Deemed-to-be) University · 2025</div>
      </div>
    </section>
  );
}
