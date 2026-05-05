import { Link } from 'react-router-dom';
import Act1Hardware from '../components/about/Act1Hardware';
import Act2Timeline from '../components/about/Act2Timeline';
import Act3Physics from '../components/about/Act3Physics';
import Act4ReportMap from '../components/about/Act4ReportMap';

const pageStyle = {
  background: 'var(--bg-primary)',
  minHeight: '100vh',
  overflowY: 'auto',
  overflowX: 'hidden',
  color: 'var(--text-primary)',
};

const navBarStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  background: 'rgba(10,11,13,0.9)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  borderBottom: '1px solid var(--border)',
  padding: '14px 32px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  zIndex: 1000,
};

const linkStyle = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: '11px',
  color: 'var(--text-muted)',
  letterSpacing: '0.15em',
  textDecoration: 'none',
  transition: 'color 0.2s',
  cursor: 'pointer',
};

const rightNavStyle = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: '10px',
  color: 'var(--text-muted)',
};

export default function AboutPage() {
  return (
    <div style={pageStyle}>
      <nav style={navBarStyle}>
        <Link 
          to="/" 
          style={linkStyle}
          onMouseEnter={(e) => e.target.style.color = 'var(--accent-cyan)'}
          onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}
        >
          ← SIMULATION
        </Link>
        <div style={rightNavStyle}>LIDAR AV SIM · JAIN UNIVERSITY 2025</div>
      </nav>

      <Act1Hardware />
      <Act2Timeline />
      <Act3Physics />
      <Act4ReportMap />
    </div>
  );
}
