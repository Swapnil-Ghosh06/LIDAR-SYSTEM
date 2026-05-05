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
  marginBottom: '60px',
};

const columnsStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '40px',
};

const headerStyle = (color) => ({
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: '13px',
  color: color,
  borderBottom: `2px solid ${color}80`, // adding 50% opacity in hex approx
  paddingBottom: '8px',
  marginBottom: '32px',
});

const timelineEventStyle = {
  position: 'relative',
  paddingLeft: '24px',
  marginBottom: '40px',
  borderLeft: '1px solid rgba(255,255,255,0.1)',
};

const timeLabelStyle = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: '11px',
  color: 'var(--accent-amber)',
  marginBottom: '8px',
  position: 'relative',
};

const timeDotStyle = {
  position: 'absolute',
  left: '-27.5px',
  top: '4px',
  width: '6px',
  height: '6px',
  borderRadius: '50%',
  background: 'var(--bg-elevated)',
  border: '1px solid var(--accent-amber)',
};

const eventDescStyle = {
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '14px',
  color: 'var(--text-secondary)',
  lineHeight: 1.6,
};

const arrowContainerStyle = {
  width: '100%',
  height: '2px',
  background: 'rgba(255,255,255,0.1)',
  marginTop: '12px',
  position: 'relative',
};

const conclusionBoxStyle = (color) => ({
  background: `${color}14`, // approx 8% opacity
  border: `1px solid ${color}4D`, // approx 30% opacity
  padding: '20px',
  borderRadius: '6px',
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: '12px',
  color: 'var(--text-primary)',
  lineHeight: 1.8,
  marginTop: '40px',
});

export default function Act2Timeline() {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const eventsRef = useRef([]);
  const arrowsRef = useRef([]);

  useEffect(() => {
    // Title fade in
    gsap.fromTo(titleRef.current,
      { y: 30, opacity: 0 },
      {
        y: 0, opacity: 1, duration: 1, ease: 'power2.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
        }
      }
    );

    // Timeline events stagger
    gsap.fromTo(eventsRef.current,
      { y: 20, opacity: 0 },
      {
        y: 0, opacity: 1, duration: 0.6, stagger: 0.15, ease: 'power2.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
        }
      }
    );

    // Arrows animation
    arrowsRef.current.forEach(arrow => {
      if (arrow) {
        gsap.fromTo(arrow,
          { scaleX: 0 },
          {
            scaleX: 1, duration: 1, ease: 'power2.out',
            transformOrigin: 'left center',
            scrollTrigger: {
              trigger: arrow,
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
      <div ref={titleRef}>
        <h2 style={titleStyle}>The Proof</h2>
        <div style={subtitleStyle}>d_blind = v/f — visualized at two frequencies</div>
      </div>

      <div style={columnsStyle}>
        {/* LEFT COLUMN - 2 Hz */}
        <div>
          <div style={headerStyle('var(--accent-red)')}>2 Hz scan · 500ms period</div>
          
          <div ref={el => eventsRef.current.push(el)} style={timelineEventStyle}>
            <div style={timeLabelStyle}><div style={timeDotStyle}/>t = 0ms</div>
            <div style={eventDescStyle}>Sweep passes pedestrian's starting position <span style={{color: 'var(--accent-cyan)'}}>(((</span></div>
          </div>

          <div ref={el => eventsRef.current.push(el)} style={timelineEventStyle}>
            <div style={timeLabelStyle}><div style={timeDotStyle}/>t = 500ms</div>
            <div style={eventDescStyle}>Pedestrian has moved → 0.70m</div>
            <div style={arrowContainerStyle}>
              <div ref={el => arrowsRef.current.push(el)} style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: '100%', background: 'var(--accent-red)'}} />
            </div>
          </div>

          <div ref={el => eventsRef.current.push(el)} style={timelineEventStyle}>
            <div style={timeLabelStyle}><div style={timeDotStyle}/>t = 500ms</div>
            <div style={eventDescStyle}>
              Next sweep fires. Pedestrian is at 0.70m.<br/>
              0.70m &gt; 0.60m body width — the beam already PASSED the gap.<br/>
              <span style={{color: 'var(--accent-red)', fontWeight: 'bold', marginTop: '8px', display: 'block'}}>× NOT DETECTED</span>
            </div>
          </div>

          <div ref={el => eventsRef.current.push(el)} style={conclusionBoxStyle('var(--accent-red)')}>
            <div>d_blind = 1.4 ÷ 2 = 0.70m</div>
            <div>0.70m &gt; 0.60m ← the gap is wider than the pedestrian.</div>
            <div style={{color: 'var(--text-secondary)', marginTop: '8px'}}>The gap is WHERE the pedestrian IS, not where they WERE.</div>
          </div>
        </div>

        {/* RIGHT COLUMN - 20 Hz */}
        <div>
          <div style={headerStyle('var(--accent-green)')}>20 Hz scan · 50ms period</div>
          
          <div ref={el => eventsRef.current.push(el)} style={timelineEventStyle}>
            <div style={timeLabelStyle}><div style={timeDotStyle}/>t = 0ms</div>
            <div style={eventDescStyle}>Sweep passes pedestrian start</div>
          </div>

          <div ref={el => eventsRef.current.push(el)} style={timelineEventStyle}>
            <div style={timeLabelStyle}><div style={timeDotStyle}/>t = 50ms</div>
            <div style={eventDescStyle}>Pedestrian has moved → 0.07m</div>
            <div style={arrowContainerStyle}>
              <div ref={el => arrowsRef.current.push(el)} style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: '12%', background: 'var(--accent-green)'}} />
            </div>
          </div>

          <div ref={el => eventsRef.current.push(el)} style={timelineEventStyle}>
            <div style={timeLabelStyle}><div style={timeDotStyle}/>t = 50ms</div>
            <div style={eventDescStyle}>
              Next sweep fires. Pedestrian still within body width.<br/>
              <span style={{color: 'var(--accent-green)', fontWeight: 'bold', marginTop: '8px', display: 'block'}}>✓ DETECTED</span>
            </div>
          </div>

          <div ref={el => eventsRef.current.push(el)} style={conclusionBoxStyle('var(--accent-green)')}>
            <div>d_blind = 1.4 ÷ 20 = 0.07m</div>
            <div>0.07m ≪ 0.60m — well within body width</div>
            <div style={{color: 'var(--text-secondary)', marginTop: '8px'}}>Sensor catches pedestrian on next sweep.</div>
          </div>
        </div>
      </div>
    </section>
  );
}
