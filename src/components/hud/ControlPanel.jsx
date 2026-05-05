import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import useSimStore from '../../store/useSimStore';

const panelStyle = {
  background: 'rgba(17,19,24,0.75)',
  border: '1px solid rgba(255,255,255,0.06)',
  borderLeft: '3px solid var(--accent-amber)',
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

const sliderLabelRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '4px',
};

const sliderLabel = { color: 'var(--text-muted)', fontSize: '10px' };
const sliderValue = { color: 'var(--text-primary)', fontSize: '13px', fontWeight: 500 };

const sectionGap = { marginBottom: '14px' };

const btnBase = {
  padding: '8px 16px',
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: '12px',
  cursor: 'pointer',
  borderRadius: '4px',
  background: 'transparent',
  flex: 1,
};

const sliderCSS = `
  .hud-slider {
    -webkit-appearance: none;
    width: 100%;
    height: 3px;
    background: var(--bg-elevated);
    border-radius: 2px;
    outline: none;
    margin: 6px 0 2px;
  }
  .hud-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: var(--accent-cyan);
    border: none;
    cursor: pointer;
    box-shadow: 0 0 6px rgba(0,229,255,0.4);
  }
  .hud-slider::-moz-range-thumb {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: var(--accent-cyan);
    border: none;
    cursor: pointer;
  }
  .hud-slider::-webkit-slider-runnable-track {
    background: linear-gradient(
      to right,
      var(--accent-cyan) 0%,
      var(--accent-cyan) var(--val, 50%),
      var(--bg-elevated) var(--val, 50%)
    );
  }
  .hud-select {
    background: var(--bg-elevated);
    border: 1px solid var(--border);
    color: var(--text-primary);
    padding: 6px 10px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    border-radius: 4px;
    width: 100%;
    outline: none;
    cursor: pointer;
  }
  .hud-select:focus {
    border-color: var(--accent-cyan);
  }
  .hud-btn {
    transition: all 0.15s ease;
  }
  .hud-btn:hover:not(:disabled) {
    transform: translateY(-1px);
    background: var(--btn-hover-bg) !important;
  }
  .hud-btn:active:not(:disabled) {
    transform: translateY(0);
  }
`;

export default React.memo(function ControlPanel() {
  const scanFrequency = useSimStore((s) => s.scanFrequency);
  const pedestrianVelocity = useSimStore((s) => s.pedestrianVelocity);
  const beamCount = useSimStore((s) => s.beamCount);
  const weather = useSimStore((s) => s.weather);
  const isWalking = useSimStore((s) => s.isWalking);
  const autoMode = useSimStore((s) => s.autoMode);

  const setScanFrequency = useSimStore((s) => s.setScanFrequency);
  const setPedestrianVelocity = useSimStore((s) => s.setPedestrianVelocity);
  const setBeamCount = useSimStore((s) => s.setBeamCount);
  const setWeather = useSimStore((s) => s.setWeather);
  const triggerWalk = useSimStore((s) => s.triggerWalk);
  const setAutoMode = useSimStore((s) => s.setAutoMode);
  const setLessonStep = useSimStore((s) => s.setLessonStep);
  const resetMissedCount = useSimStore((s) => s.resetMissedCount);

  const panelRef = useRef(null);

  useEffect(() => {
    // Inject slider CSS once
    if (!document.getElementById('hud-slider-css')) {
      const style = document.createElement('style');
      style.id = 'hud-slider-css';
      style.textContent = sliderCSS;
      document.head.appendChild(style);
    }
  }, []);

  return (
    <div ref={panelRef} style={panelStyle}>
      <div style={headerStyle}>CONTROLS</div>

      {/* Scan Frequency */}
      <div style={sectionGap}>
        <div style={sliderLabelRow}>
          <span style={sliderLabel}>SCAN FREQ</span>
          <span style={sliderValue}>{scanFrequency} Hz</span>
        </div>
        <input
          className="hud-slider"
          style={{ '--val': `${((scanFrequency - 1) / (30 - 1)) * 100}%` }}
          type="range"
          min={1}
          max={30}
          step={1}
          value={scanFrequency}
          onChange={(e) => setScanFrequency(Number(e.target.value))}
        />
      </div>

      {/* Pedestrian Velocity */}
      <div style={sectionGap}>
        <div style={sliderLabelRow}>
          <span style={sliderLabel}>PEDESTRIAN VEL</span>
          <span style={sliderValue}>{pedestrianVelocity.toFixed(1)} m/s</span>
        </div>
        <input
          className="hud-slider"
          style={{ '--val': `${((pedestrianVelocity - 0.5) / (3.0 - 0.5)) * 100}%` }}
          type="range"
          min={0.5}
          max={3.0}
          step={0.1}
          value={pedestrianVelocity}
          onChange={(e) => setPedestrianVelocity(Number(e.target.value))}
        />
      </div>

      {/* Beam Count */}
      <div style={sectionGap}>
        <div style={sliderLabelRow}>
          <span style={sliderLabel}>BEAM COUNT</span>
          <span style={sliderValue}>{beamCount}</span>
        </div>
        <input
          className="hud-slider"
          style={{ '--val': `${((beamCount - 8) / (64 - 8)) * 100}%` }}
          type="range"
          min={8}
          max={64}
          step={4}
          value={beamCount}
          onChange={(e) => setBeamCount(Number(e.target.value))}
        />
      </div>

      {/* Weather Dropdown */}
      <div style={sectionGap}>
        <div style={{ ...sliderLabel, marginBottom: '4px' }}>WEATHER</div>
        <select
          className="hud-select"
          value={weather}
          onChange={(e) => setWeather(e.target.value)}
        >
          <option value="Clear">☀ Clear</option>
          <option value="LightRain">🌦 Light Rain</option>
          <option value="HeavyRain">🌧 Heavy Rain</option>
          <option value="Fog">🌫 Fog</option>
          <option value="DenseFog">🌁 Dense Fog</option>
          <option value="Night">🌙 Night</option>
        </select>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
        <button
          className="hud-btn"
          style={{
            ...btnBase,
            border: '1px solid var(--accent-cyan)',
            color: 'var(--accent-cyan)',
            opacity: isWalking ? 0.4 : 1,
            cursor: isWalking ? 'not-allowed' : 'pointer',
            '--btn-hover-bg': 'rgba(0,229,255,0.15)',
          }}
          disabled={isWalking}
          onClick={triggerWalk}
        >
          WALK
        </button>

        <button
          className="hud-btn"
          style={{
            ...btnBase,
            border: `1px solid ${autoMode ? 'var(--accent-green)' : 'var(--text-muted)'}`,
            color: autoMode ? 'var(--accent-green)' : 'var(--text-muted)',
            '--btn-hover-bg': autoMode ? 'rgba(0,230,118,0.15)' : 'rgba(255,255,255,0.15)',
          }}
          onClick={() => setAutoMode(!autoMode)}
        >
          AUTO: {autoMode ? 'ON' : 'OFF'}
        </button>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <button
          className="hud-btn"
          style={{
            ...btnBase,
            border: '1px solid var(--accent-amber)',
            color: 'var(--accent-amber)',
            width: '100%',
            '--btn-hover-bg': 'rgba(255,179,0,0.15)',
          }}
          onClick={() => setLessonStep(0)}
        >
          LESSON MODE
        </button>
      </div>

      {/* Reset */}
      <button
        onClick={resetMissedCount}
        style={{
          color: 'var(--text-muted)',
          fontSize: '10px',
          border: 'none',
          background: 'none',
          textDecoration: 'underline',
          cursor: 'pointer',
          fontFamily: "'JetBrains Mono', monospace",
          padding: 0,
        }}
      >
        RESET MISSED
      </button>
    </div>
  );
});
