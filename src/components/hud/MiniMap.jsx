import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { egoState, trafficWorldPositions, pedestrianWorldPositions } from '../../state/worldState';

export default function MiniMap() {
  const canvasRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const size = 180;
    const scale = 2.5; // pixels per metre

    const draw = () => {
      ctx.clearRect(0, 0, size, size);
      const cx = size / 2;
      const cy = size / 2;

      // Draw grid
      ctx.strokeStyle = 'rgba(255,255,255,0.05)';
      ctx.lineWidth = 1;
      for (let i = -100; i <= 100; i += 10) {
        ctx.beginPath();
        ctx.moveTo(0, cy + i * scale); ctx.lineTo(size, cy + i * scale);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + i * scale, 0); ctx.lineTo(cx + i * scale, size);
        ctx.stroke();
      }

      // Center on Ego
      const ex = egoState.position.x;
      const ez = egoState.position.z;

      // Draw Roads (simplification)
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.fillRect(cx + (-4.5 - ex) * scale, 0, 9 * scale, size);
      ctx.fillRect(0, cy + (-4.5 - ez) * scale, size, 9 * scale);

      // Draw Traffic
      trafficWorldPositions.forEach(p => {
        if (!p) return;
        const tx = cx + (p.x - ex) * scale;
        const tz = cy + (p.z - ez) * scale;
        if (tx < 0 || tx > size || tz < 0 || tz > size) return;
        ctx.fillStyle = '#4A90E2';
        ctx.fillRect(tx - 2, tz - 3, 4, 6);
      });

      // Draw Pedestrians
      pedestrianWorldPositions.forEach(p => {
        if (!p) return;
        const px = cx + (p.x - ex) * scale;
        const pz = cy + (p.z - ez) * scale;
        if (px < 0 || px > size || pz < 0 || pz > size) return;
        ctx.fillStyle = '#FF6B35';
        ctx.beginPath();
        ctx.arc(px, pz, 3, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw Ego (always center, point up)
      ctx.fillStyle = '#00E5FF';
      ctx.beginPath();
      ctx.moveTo(cx, cy - 6);
      ctx.lineTo(cx - 4, cy + 4);
      ctx.lineTo(cx + 4, cy + 4);
      ctx.closePath();
      ctx.fill();

      // Ego LIDAR range ring
      ctx.strokeStyle = 'rgba(0,229,255,0.3)';
      ctx.beginPath();
      ctx.arc(cx, cy, 18 * scale, 0, Math.PI * 2);
      ctx.stroke();

      requestAnimationFrame(draw);
    };

    const animId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div style={{
      width: '180px', height: '180px',
      background: 'rgba(10,12,18,0.85)',
      borderRadius: '4px',
      border: '1px solid rgba(255,255,255,0.1)',
      overflow: 'hidden',
      backdropFilter: 'blur(8px)'
    }}>
      <canvas ref={canvasRef} width={180} height={180} />
      <div style={{
        position: 'absolute', bottom: '8px', right: '8px',
        fontFamily: "'JetBrains Mono', monospace", fontSize: '8px',
        color: 'rgba(255,255,255,0.4)', pointerEvents: 'none'
      }}>
        RADAR_v2.0
      </div>
    </div>
  );
}
