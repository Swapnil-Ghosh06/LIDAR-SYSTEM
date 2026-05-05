import { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import useSimStore from '../../store/useSimStore';
import { LESSONS } from './lessons';

const overlayStyle = {
  position: 'fixed',
  bottom: '28px',
  left: '28px',
  width: '340px',
  background: 'var(--bg-elevated)',
  border: '1px solid rgba(255,179,0,0.3)',
  borderRadius: '8px',
  padding: '20px',
  zIndex: 100,
  boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
  fontFamily: "'DM Sans', sans-serif",
  pointerEvents: 'all',
};

const dotStyle = {
  width: '6px',
  height: '6px',
  borderRadius: '50%',
  background: 'var(--accent-amber)',
  marginRight: '8px',
};

const headerRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '4px',
};

const labelStyle = {
  display: 'flex',
  alignItems: 'center',
  fontSize: '10px',
  letterSpacing: '0.15em',
  color: 'var(--accent-amber)',
  textTransform: 'uppercase',
};

const skipStyle = {
  fontSize: '10px',
  color: 'var(--text-muted)',
  cursor: 'pointer',
  textDecoration: 'underline',
};

const titleStyle = {
  fontSize: '15px',
  fontWeight: 500,
  color: 'var(--text-primary)',
  margin: '12px 0 8px',
};

const bodyStyle = {
  fontSize: '13px',
  color: 'var(--text-secondary)',
  lineHeight: '1.6',
};

const actionBtnStyle = {
  background: 'rgba(0,229,255,0.1)',
  border: '1px solid var(--accent-cyan)',
  color: 'var(--accent-cyan)',
  padding: '8px 20px',
  width: '100%',
  marginTop: '12px',
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: '12px',
  borderRadius: '4px',
  cursor: 'pointer',
  transition: 'background 0.2s ease',
};

const navRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: '20px',
};

const progressDot = {
  width: '6px',
  height: '6px',
  borderRadius: '50%',
  marginRight: '6px',
  transition: 'all 0.3s ease',
};

const nextBtnStyle = {
  background: 'transparent',
  border: 'none',
  color: 'var(--text-secondary)',
  fontSize: '12px',
  cursor: 'pointer',
  transition: 'color 0.2s ease',
};

export default function LessonOverlay() {
  const lessonStep = useSimStore((s) => s.lessonStep);
  const setLessonStep = useSimStore((s) => s.setLessonStep);
  const setScanFrequency = useSimStore((s) => s.setScanFrequency);
  const triggerWalk = useSimStore((s) => s.triggerWalk);

  const panelRef = useRef(null);
  const contentRef = useRef(null);
  const [feedback, setFeedback] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);

  const lesson = LESSONS[lessonStep];

  // Panel entrance animation
  useEffect(() => {
    if (lessonStep !== null && panelRef.current) {
      gsap.fromTo(panelRef.current,
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.35, ease: 'power2.out' }
      );
    }
  }, [lessonStep]);

  // Content transition and highlights
  useEffect(() => {
    if (lessonStep === null || !lesson) return;

    // Fade content in
    gsap.fromTo(contentRef.current,
      { opacity: 0, y: 8 },
      { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
    );

    // Reset feedback
    setFeedback('');
    setShowFeedback(false);

    // Apply Highlight
    if (lesson.highlight && window.__highlightRefs && window.__highlightRefs[lesson.highlight]) {
      const target = window.__highlightRefs[lesson.highlight].current;
      if (target) {
        gsap.to(target, {
          boxShadow: '0 0 0 2px rgba(255,179,0,0.5)',
          yoyo: true,
          repeat: 3,
          duration: 0.5,
          clearProps: 'boxShadow'
        });
      }
    }
  }, [lessonStep, lesson]);

  // Outcome tracking
  useEffect(() => {
    if (lessonStep === null || !lesson) return;

    const unsub = useSimStore.subscribe((state) => {
      if (lesson.expectedOutcome === 'missDetect' && state.missedDetectionEvent) {
        setFeedback('✓ Miss confirmed — equation proved');
        setShowFeedback(true);
        setTimeout(() => setLessonStep(lessonStep + 1), 2000);
      }
      if (lesson.expectedOutcome === 'hitDetect' && state.successDetectionEvent) {
        setFeedback('✓ Detection confirmed at 20 Hz');
        setShowFeedback(true);
        setTimeout(() => setLessonStep(lessonStep + 1), 2000);
      }
    });

    return () => unsub();
  }, [lessonStep, lesson, setLessonStep]);

  if (lessonStep === null || !lesson) return null;

  const handleAction = () => {
    if (lesson.action === 'setFrequency2') {
      setScanFrequency(2);
      triggerWalk();
    } else if (lesson.action === 'setFrequency20') {
      setScanFrequency(20);
      triggerWalk();
    } else if (lesson.action === 'triggerWalk') {
      triggerWalk();
    }
  };

  const handleNext = () => {
    if (lessonStep === 4) {
      setLessonStep(null);
    } else {
      setLessonStep(lessonStep + 1);
    }
  };

  return (
    <div ref={panelRef} style={overlayStyle}>
      <div style={headerRow}>
        <div style={labelStyle}>
          <div style={dotStyle} />
          LESSON {lessonStep + 1} / 5
        </div>
        <div style={skipStyle} onClick={() => setLessonStep(null)}>
          SKIP ALL
        </div>
      </div>

      <div ref={contentRef}>
        <div style={titleStyle}>{lesson.title}</div>
        <div style={bodyStyle}>{lesson.body}</div>

        {lesson.action && (
          <button style={actionBtnStyle} onClick={handleAction}>
            {lesson.actionLabel}
          </button>
        )}

        {showFeedback && (
          <div style={{
            marginTop: '10px',
            fontSize: '11px',
            color: lesson.expectedOutcome === 'hitDetect' ? 'var(--accent-green)' : 'var(--accent-amber)',
            fontWeight: 500,
            opacity: 0,
            animation: 'fadeIn 0.3s forwards'
          }}>
            {feedback}
            <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
          </div>
        )}
      </div>

      <div style={navRow}>
        <div style={{ display: 'flex' }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              style={{
                ...progressDot,
                background: i <= lessonStep ? 'var(--accent-amber)' : 'transparent',
                border: i <= lessonStep ? 'none' : '1px solid var(--text-muted)',
              }}
            />
          ))}
        </div>
        <button
          style={nextBtnStyle}
          onClick={handleNext}
          onMouseEnter={(e) => e.target.style.color = 'var(--accent-cyan)'}
          onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
        >
          {lessonStep === 4 ? 'FINISH' : 'NEXT →'}
        </button>
      </div>
    </div>
  );
}
