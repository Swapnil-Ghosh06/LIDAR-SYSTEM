# 🚗 LIDAR AV Simulation
### A Real-Time 3D Autonomous Vehicle Safety Simulator

> **Built for Jain University Hackathon 2025** — Demonstrating the physics of LIDAR blind spots in autonomous vehicles.

---

## 🎯 What Is This?

An interactive **3D physics simulation** that proves why scan frequency is a matter of life and death in autonomous vehicles.

The core physics formula this simulation is built around:

```
d_blind = v / f
```

| Symbol | Meaning |
|--------|---------|
| `d_blind` | Distance a pedestrian moves while the LIDAR is "blind" between scans |
| `v` | Pedestrian walking speed (m/s) |
| `f` | LIDAR scan frequency (Hz) |

**If `d_blind > 0.6m` (shoulder width), the pedestrian disappears between two scans. The AV never saw them.**

---

## ✨ Features

- 🔄 **Live LIDAR Frequency Control** — Drag slider from 1 Hz to 30 Hz and watch detections fail in real time
- 🌦 **6 Weather Modes** — Clear, Light Rain, Heavy Rain, Fog, Dense Fog, Night (Beer-Lambert Law applied)
- 🤖 **Autonomous Braking AI** — AV detects pedestrians, vehicles, and red lights and brakes accordingly
- 🚨 **Emergency Vignette** — Screen edges pulse red on pedestrian detection events
- 🗺 **Live Perception Mini-Map** — Real-time 2D radar showing AV, traffic, and pedestrians
- 📊 **Draggable HUD Panels** — Telemetry, Controls, Missed Detections, Blind Spot Equation
- 🏙 **High-Fidelity City Scene** — 40 buildings, 14 traffic vehicles, 10 pedestrians, traffic signals
- 🌙 **Night Mode Headlights** — AV activates dynamic point lights in Night weather
- 💀 **Missed Detection Counter** — Counts every time the LIDAR fails to detect the crossing pedestrian

---

## 🖥 Tech Stack

| Technology | Role |
|---|---|
| **React 18 + Vite** | UI framework and build tool |
| **Three.js / @react-three/fiber** | WebGL 3D rendering |
| **GSAP** | Pedestrian animations and scroll effects |
| **Zustand** | Global simulation state management |
| **Vanilla CSS** | Glassmorphism HUD styling |

---

## 🚀 Run Locally

```bash
# Clone the repo
git clone https://github.com/Swapnil-Ghosh06/LIDAR-SYSTEM.git

# Navigate into it
cd LIDAR-SYSTEM

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Then open **http://localhost:5173** in your browser.

---

## 🎮 How to Use the Simulation

1. **Press WALK** — Send a pedestrian across the crosswalk
2. **Lower the scan frequency** to 2-3 Hz — Watch the car miss the pedestrian
3. **Raise it to 20+ Hz** — Watch the car successfully brake
4. **Switch weather to Dense Fog** — Watch LIDAR range collapse (Beer-Lambert Law)
5. **Drag any HUD panel** to reposition it on screen

---

## 📐 The Physics

### Blind Distance Formula
```
d_blind = v / f
```
A pedestrian walking at **1.4 m/s** with a LIDAR scanning at **2 Hz** will move **0.70 m** between scans. Since a human shoulder is ~0.60 m wide, the sensor fires into the gap and registers nothing. **Miss.**

At **20 Hz**, that gap shrinks to **0.07 m** — far less than body width. **Detected.**

### Beer-Lambert Attenuation (Weather)
```
I = I₀ · e^(-μx)
```
Laser beam intensity decays exponentially through the atmosphere. Fog has an attenuation coefficient **30× higher** than clear air, collapsing LIDAR range from 18m down to ~5m.

| Weather | μ (approx) | Effective Range |
|---|---|---|
| Clear | 0.01 | 100% |
| Light Rain | 0.08 | 85% |
| Heavy Rain | 0.20 | 60% |
| Fog | 0.30 | 35% |
| Night | 0.05 | 72% |

---

## 📁 Project Structure

```
src/
├── pages/
│   ├── SimulatorPage.jsx     ← Main simulation + HUD
│   └── AboutPage.jsx         ← Scroll-driven physics explainer
├── components/
│   ├── canvas/               ← 3D scene components
│   │   ├── EgoVehicle.jsx    ← The AV with braking logic
│   │   ├── TrafficVehicles.jsx
│   │   ├── Pedestrian.jsx
│   │   ├── LidarBeams.jsx    ← Point cloud + sweep cone
│   │   └── RoadEnvironment.jsx
│   ├── hud/                  ← Dashboard panels
│   │   ├── TelemetryPanel.jsx
│   │   ├── ControlPanel.jsx
│   │   ├── PhysicsEquation.jsx
│   │   ├── MissedCounter.jsx
│   │   └── MiniMap.jsx
│   └── about/                ← About page acts
├── store/
│   └── useSimStore.js        ← Zustand state
└── state/
    └── worldState.js         ← Shared actor positions
```

---

## 📖 Full Documentation

For the complete physics report (formulas, real-world context, Beer-Lambert derivation, Waymo/Tesla comparison), see:

**[`LIDAR_SIMULATION_REPORT.md`](./LIDAR_SIMULATION_REPORT.md)**

---

## 👨‍💻 Author

**Swapnil Ghosh** — Jain University, 2025

---

*"You cannot turn a knob on a $4,000 sensor to understand why it fails. This simulation can."*
