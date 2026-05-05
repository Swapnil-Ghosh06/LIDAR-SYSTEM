import { useRef, useEffect, useState, useCallback } from 'react';
import gsap from 'gsap';
import { Link } from 'react-router-dom';
import SimCanvas from '../components/canvas/SimCanvas';
import MissedDetectionFlash from '../components/canvas/MissedDetectionFlash';
import TelemetryPanel from '../components/hud/TelemetryPanel';
import ControlPanel from '../components/hud/ControlPanel';
import PhysicsEquation from '../components/hud/PhysicsEquation';
import MissedCounter from '../components/hud/MissedCounter';
import MiniMap from '../components/hud/MiniMap';
import LessonOverlay from '../components/lessons/LessonOverlay';
import useSimLoop from '../hooks/useSimLoop';
import useSimStore from '../store/useSimStore';
import { egoState } from '../state/worldState';

// ── Draggable wrapper ──────────────────────────────────────────────────────
function Draggable({ children, initialX, initialY, title, accentColor = '#00E5FF' }) {
  const [pos, setPos] = useState({ x: initialX, y: initialY });
  const isDragging = useRef(false);
  const startPos   = useRef({ x: 0, y: 0 });
  const startMouse = useRef({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);

  const onMouseDown = useCallback((e) => {
    isDragging.current = true;
    startPos.current   = { ...pos };
    startMouse.current = { x: e.clientX, y: e.clientY };
    e.preventDefault();
    e.stopPropagation();
  }, [pos]);

  useEffect(() => {
    const onMove = (e) => {
      if (!isDragging.current) return;
      const dx = e.clientX - startMouse.current.x;
      const dy = e.clientY - startMouse.current.y;
      setPos({ x: startPos.current.x + dx, y: startPos.current.y + dy });
    };
    const onUp = () => { isDragging.current = false; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  return (
    <div
      style={{
        position: 'absolute',
        left: pos.x,
        top:  pos.y,
        pointerEvents: 'all',
        userSelect: 'none',
        zIndex: 20,
        filter: isDragging.current ? 'drop-shadow(0 0 12px rgba(0,229,255,0.3))' : 'none',
      }}
    >
      {/* Drag handle */}
      <div
        onMouseDown={onMouseDown}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: `rgba(10,12,18,0.85)`,
          borderTop: `2px solid ${accentColor}`,
          borderLeft: `2px solid ${accentColor}`,
          borderRight: `2px solid ${accentColor}`,
          borderRadius: '6px 6px 0 0',
          padding: '4px 12px',
          cursor: 'grab',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '8px',
          letterSpacing: '0.12em',
          color: hovered ? accentColor : 'rgba(255,255,255,0.3)',
          transition: 'color 0.2s',
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        <span style={{ fontSize: '10px', marginRight: 2 }}>⠿</span>
        {title}
        <span style={{ marginLeft: 'auto', opacity: 0.4 }}>DRAG</span>
      </div>
      {/* Content */}
      <div style={{ position: 'relative' }}>
        {children}
      </div>
    </div>
  );
}

// ── AV Status Banner ────────────────────────────────────────────────────────
function AVStatusBanner() {
  const [status, setStatus] = useState({ braking: false, reason: '' });
  const frameRef = useRef();

  useEffect(() => {
    const update = () => {
      setStatus({ braking: egoState.isBraking, reason: egoState.brakeReason });
      frameRef.current = requestAnimationFrame(update);
    };
    frameRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  if (!status.braking) return null;

  const msgs = {
    pedestrian: { icon: '🚶', text: 'PEDESTRIAN DETECTED — AV BRAKING', color: '#FF6B35' },
    vehicle:    { icon: '🚗', text: 'VEHICLE AHEAD — AV SLOWING',         color: '#FFB300' },
    red_light:  { icon: '🔴', text: 'RED LIGHT — AV STOPPED',              color: '#FF4444' },
  };
  const m = msgs[status.reason] || { icon: '⚠', text: 'OBSTACLE — AV BRAKING', color: '#FF4444' };

  return (
    <div
      style={{
        position: 'absolute',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: `rgba(10,12,18,0.9)`,
        border: `1px solid ${m.color}`,
        borderTop: `3px solid ${m.color}`,
        borderRadius: '6px',
        padding: '10px 24px',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '12px',
        fontWeight: 700,
        color: m.color,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        pointerEvents: 'none',
        zIndex: 30,
        letterSpacing: '0.08em',
        boxShadow: `0 0 20px ${m.color}44`,
        animation: 'avBannerPulse 0.6s ease-in-out infinite alternate',
      }}
    >
      <span style={{ fontSize: '18px' }}>{m.icon}</span>
      {m.text}
    </div>
  );
}

function EmergencyVignette() {
  const [active, setActive] = useState(false);
  useEffect(() => {
    const update = () => {
      setActive(egoState.isBraking && egoState.brakeReason === 'pedestrian');
      requestAnimationFrame(update);
    };
    const id = requestAnimationFrame(update);
    return () => cancelAnimationFrame(id);
  }, []);

  if (!active) return null;

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 12, pointerEvents: 'none',
      boxShadow: 'inset 0 0 150px rgba(255, 0, 0, 0.4)',
      animation: 'vignettePulse 0.4s infinite alternate',
    }} />
  );
}

export default function SimulatorPage() {
  const wrapperRef = useRef(null);
  const topBarRef  = useRef(null);

  const orbitEnabled    = useSimStore((s) => s.orbitEnabled);
  const setOrbitEnabled = useSimStore((s) => s.setOrbitEnabled);

  useSimLoop();

  // Inject pulse animation
  useEffect(() => {
    if (!document.getElementById('av-anim-css')) {
      const s = document.createElement('style');
      s.id = 'av-anim-css';
      s.textContent = `
        @keyframes avBannerPulse {
          from { box-shadow: 0 0 10px rgba(255,68,68,0.3); }
          to   { box-shadow: 0 0 24px rgba(255,68,68,0.7); }
        }
        @keyframes vignettePulse {
          from { opacity: 0.4; }
          to   { opacity: 1.0; }
        }
      `;
      document.head.appendChild(s);
    }
  }, []);

  useEffect(() => {
    if (topBarRef.current) {
      gsap.to(topBarRef.current, { opacity: 0.3, yoyo: true, repeat: -1, duration: 2 });
    }
  }, []);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* Emergency Vignette */}
      <EmergencyVignette />

      {/* Scanline overlay */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10,
        background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.025) 2px, rgba(0,0,0,0.025) 4px)'
      }} />

      {/* Top bar pulse */}
      <div ref={topBarRef} style={{
        position: 'absolute', top: 0, width: '100%', height: '2px',
        background: 'linear-gradient(90deg, transparent, var(--accent-cyan), transparent)',
        zIndex: 11
      }} />

      {/* 3D Canvas */}
      <div ref={wrapperRef} style={{ position: 'absolute', inset: 0 }}>
        <SimCanvas />
      </div>

      {/* AV Status Banner — center top, auto-shows on brake */}
      <AVStatusBanner />

      {/* HUD overlay */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 20 }}>

        {/* ABOUT link */}
        <Link
          to="/about"
          style={{
            position: 'absolute', top: '20px', right: '20px',
            fontFamily: "'JetBrains Mono', monospace", fontSize: '10px',
            color: 'var(--text-muted)', border: '1px solid var(--border)',
            padding: '4px 10px', borderRadius: '4px', background: 'transparent',
            textDecoration: 'none', pointerEvents: 'all', transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => { e.target.style.color = 'var(--accent-cyan)'; e.target.style.borderColor = 'rgba(0,229,255,0.4)'; e.target.style.background = 'rgba(0,229,255,0.1)'; }}
          onMouseLeave={(e) => { e.target.style.color = 'var(--text-muted)'; e.target.style.borderColor = 'var(--border)'; e.target.style.background = 'transparent'; }}
        >
          ABOUT ↗
        </Link>

        {/* ── DRAGGABLE PANELS ── */}

        {/* Telemetry — top left */}
        <Draggable initialX={20} initialY={20} title="TELEMETRY" accentColor="#00E5FF">
          <TelemetryPanel />
        </Draggable>

        {/* Controls — top right (account for ABOUT link) */}
        <Draggable initialX={window.innerWidth - 270} initialY={20} title="CONTROLS" accentColor="#FFB300">
          <ControlPanel />
        </Draggable>

        {/* Missed Counter — center top */}
        <Draggable initialX={Math.max(0, window.innerWidth / 2 - 100)} initialY={20} title="MISSED DETECTIONS" accentColor="#FF4444">
          <MissedCounter />
        </Draggable>

        {/* Physics / Blind Spot — bottom left */}
        <Draggable initialX={20} initialY={window.innerHeight - 420} title="LIDAR BLIND SPOT" accentColor="#00E676">
          <PhysicsEquation />
        </Draggable>

        {/* MiniMap — bottom right */}
        <Draggable initialX={window.innerWidth - 200} initialY={window.innerHeight - 250} title="PERCEPTION MAP" accentColor="#00E5FF">
          <MiniMap />
        </Draggable>

        {/* Camera Presets — bottom center */}
        <div style={{
          position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
          display: 'flex', gap: '10px', pointerEvents: 'all',
        }}>
          {[
            { label: '⊞ OVERVIEW',      event: 'OVERVIEW' },
            { label: '⦿ SENSOR VIEW',  event: 'SENSOR' },
            { label: '⚯ STREET VIEW',  event: 'STREET' },
          ].map(p => (
            <button key={p.label}
              onClick={() => window.dispatchEvent(new CustomEvent('setCamera', { detail: p.event }))}
              style={{
                background: 'rgba(10,14,20,0.85)', border: '1px solid rgba(255,255,255,0.12)',
                padding: '7px 16px', borderRadius: '4px', color: 'rgba(255,255,255,0.55)',
                fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', cursor: 'pointer',
                transition: 'all 0.15s ease', backdropFilter: 'blur(8px)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,229,255,0.15)'; e.currentTarget.style.color = '#00E5FF'; e.currentTarget.style.borderColor = 'rgba(0,229,255,0.4)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(10,14,20,0.85)'; e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Bottom right: Reset + Orbit */}
        <div style={{
          position: 'absolute', bottom: '20px', right: '20px',
          display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px',
          pointerEvents: 'all',
        }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => window.dispatchEvent(new Event('resetCamera'))}
              style={{ background: 'rgba(10,14,20,0.85)', border: '1px solid rgba(255,255,255,0.12)', padding: '6px 12px', borderRadius: '4px', color: 'rgba(255,255,255,0.5)', fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', cursor: 'pointer', transition: 'all 0.15s ease' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >⤢ RESET</button>
            <button
              onClick={() => setOrbitEnabled(!orbitEnabled)}
              style={{ background: orbitEnabled ? 'rgba(0,229,255,0.18)' : 'rgba(10,14,20,0.85)', border: `1px solid ${orbitEnabled ? 'rgba(0,229,255,0.5)' : 'rgba(255,255,255,0.12)'}`, padding: '6px 12px', borderRadius: '4px', color: orbitEnabled ? '#00E5FF' : 'rgba(255,255,255,0.5)', fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', cursor: 'pointer', transition: 'all 0.15s ease' }}
            >⟳ ORBIT</button>
          </div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', color: 'rgba(255,255,255,0.2)', pointerEvents: 'none' }}>
            LIDAR SIM v5 · JAIN UNIV 2025
          </div>
        </div>
      </div>

      {/* Missed Detection Flash */}
      <MissedDetectionFlash wrapperRef={wrapperRef} />

      {/* Lesson System */}
      <LessonOverlay />
    </div>
  );
}
