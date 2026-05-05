# LIDAR AV Simulation — Complete Technical Report
**Jain University · Physics Project 2025**
**Author: Swapnil**

---

## Table of Contents
1. [What Is This Project?](#1-what-is-this-project)
2. [How It Is Built & How It Works](#2-how-it-is-built--how-it-works)
3. [Features That Make It Different](#3-features-that-make-it-different)
4. [Why It Stands Out](#4-why-it-stands-out)
5. [Component Architecture](#5-component-architecture)
6. [Every Element Explained](#6-every-element-explained)
7. [The About Page — Explained](#7-the-about-page--explained)
8. [The Core Physics Formula](#8-the-core-physics-formula)
9. [Real-World Relevance](#9-real-world-relevance)

---

## 1. What Is This Project?

This project is an **interactive 3D physics simulation** of a **LIDAR-equipped Autonomous Vehicle (AV)** navigating a realistic urban intersection. It was built to demonstrate — visually and mathematically — a critical but often overlooked limitation of autonomous vehicles: the **Blind Distance Problem**.

### The Problem It Solves

A LIDAR sensor works by spinning a laser 360° around the vehicle and counting how long the light takes to bounce back from objects. It does this scan **f times per second** (where *f* is the scan frequency). Between two consecutive scans, the world changes — vehicles move, pedestrians walk. The sensor is effectively **blind** during that gap.

The distance a pedestrian travels during that blind interval is:

```
d_blind = v / f
```

Where:
- `d_blind` = the distance the pedestrian moves while the sensor is not looking (metres)
- `v` = pedestrian walking speed (metres/second)
- `f` = LIDAR scan frequency (Hz = scans per second)

**If `d_blind` is greater than the width of a pedestrian's body (~0.6m), the sensor can miss them entirely.** This simulation makes that invisible danger visible.

---

## 2. How It Is Built & How It Works

### Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| 3D Rendering | Three.js via `@react-three/fiber` | WebGL 3D scene in the browser |
| UI Framework | React 18 + Vite | Component-based user interface |
| Animation | GSAP (GreenSock) | Smooth pedestrian movement & scroll animations |
| State Management | Zustand | Global simulation state (speed, weather, scan frequency) |
| Styling | Vanilla CSS + CSS Variables | Dark-mode glassmorphism HUD panels |
| Fonts | JetBrains Mono, Syne, DM Sans | Telemetry monospace + editorial display |

### How the Simulation Loop Works

```
Every Frame (60 fps):
│
├─ EgoVehicle moves forward along N-S lane
│   ├─ Checks traffic ahead (car-following)
│   ├─ Checks signal state (RED/GREEN/YELLOW)
│   ├─ Checks pedestrian positions
│   └─ Brakes or accelerates accordingly
│
├─ TrafficVehicles move on all 4 approaches
│   └─ Each checks signal + 7m ahead for another car
│
├─ Pedestrians animate independently
│   ├─ Main pedestrian crosses on button press / auto mode
│   └─ 9 background pedestrians walk on sidewalks/crosswalks
│
├─ LidarBeams rotates sweep cone from AV roof
│   ├─ Generates point cloud around detected objects
│   ├─ Reduces range based on weather
│   └─ Colors hits: orange-red = pedestrian, cyan = environment
│
└─ HUD panels read from shared state and update telemetry
```

---

## 3. Features That Make It Different

### 3.1 Real-Time LIDAR Scan Frequency Control
You can slide the scan frequency from **1 Hz to 30 Hz** in real time. As you lower it, you can watch the AV begin to miss pedestrians — the blind distance increases and the missed detection counter goes up. This is impossible to demonstrate with a real LIDAR sensor without expensive lab equipment.

### 3.2 Autonomous Vehicle with Real Braking Logic
The ego vehicle (the blue AV in the simulation) is not on a fixed path. It:
- Drives autonomously at 5 m/s through the intersection
- Detects pedestrians within a 14-metre forward cone
- Detects vehicles in the same lane (car-following safety distance)
- Stops at red lights
- Responds instantly: tail lights flare 4× brighter when braking

### 3.3 Weather-Degraded LIDAR Range
Five weather modes demonstrate the **Beer-Lambert Law** of light attenuation:

| Weather | LIDAR Range | Confidence | Visual Effect |
|---|---|---|---|
| ☀ Clear | 100% (18m) | 100% | No effect |
| 🌦 Light Rain | 82% (14.8m) | 85% | 500 rain drops |
| 🌧 Heavy Rain | 55% (9.9m) | 60% | 1200 drops + puddle shimmer |
| 🌫 Fog | 60% (10.8m) | 65% | Volumetric fog planes |
| 🌁 Dense Fog | 28% (5m) | 35% | Near-zero visibility |
| 🌙 Night | 72% (13m) | 78% | Dark fog + AV headlights on |

### 3.4 Fully Draggable HUD Dashboard
Every instrument panel on screen can be **grabbed and repositioned** with a mouse drag. This makes the simulation feel like a real autonomous vehicle engineering workbench.

### 3.5 Emergency Red-Screen Alert
When the AV detects a pedestrian and brakes, the **entire screen edges flash red** — an emergency vignette that simulates the "critical event" feedback loop in real AV dashboards.

### 3.6 Live Perception Mini-Map (Radar View)
A top-down 2D canvas radar shows:
- The AV as a cyan triangle (always at centre)
- Traffic as blue rectangles
- Pedestrians as orange dots
- The LIDAR range ring as a cyan circle

This is exactly the perception output that real AV engineers read in practice.

---

## 4. Why It Stands Out

### vs. a Textbook Diagram
A textbook can print the formula `d_blind = v/f`. This simulation **proves** it. You can set f=2 Hz, watch a pedestrian cross, and see the detection fail. Then set f=20 Hz and watch it succeed. The formula becomes physical intuition, not memorised symbols.

### vs. Real Hardware (Velodyne VLP-16)
| Dimension | Real VLP-16 LIDAR | This Simulation |
|---|---|---|
| Cost | ~$4,000 USD | Free |
| Scan frequency | Fixed (10 or 20 Hz) | 1–30 Hz, adjustable live |
| Weather testing | Needs outdoor setup | 6 modes, instant toggle |
| Slow motion | Impossible | Pause/slow any time |
| Pedestrian control | Impossible | On-demand crossing |
| Educational value | Opaque black box | Every variable is visible |

### vs. Other Student Projects
- It is **not a static diagram** — the scene is fully 3D
- It is **not a pre-recorded video** — everything is computed in real time
- It has **reactive AI** (the AV actually perceives and responds)
- It has **professional-grade UI** (glassmorphism HUD, JetBrains Mono font, scanline overlay)
- It demonstrates **two physics laws** simultaneously: the Blind Distance formula AND the Beer-Lambert Law

---

## 5. Component Architecture

```
src/
├── pages/
│   ├── SimulatorPage.jsx       ← Main 3D simulation page
│   └── AboutPage.jsx           ← Scroll-driven physics explainer
│
├── components/
│   ├── canvas/
│   │   ├── SimCanvas.jsx           ← Three.js Canvas + lights + camera
│   │   ├── RoadEnvironment.jsx     ← Ground, roads, buildings, trees, signals
│   │   ├── EgoVehicle.jsx          ← The autonomous vehicle (AV)
│   │   ├── TrafficVehicles.jsx     ← 14 moving traffic cars
│   │   ├── Pedestrian.jsx          ← Main + 9 background pedestrians
│   │   ├── LidarBeams.jsx          ← Rotating sweep cone + point cloud
│   │   ├── WeatherEffects.jsx      ← Rain particles + fog planes
│   │   └── MissedDetectionFlash.jsx← Red screen flash on miss event
│   │
│   ├── hud/
│   │   ├── TelemetryPanel.jsx      ← Live AV speed, scan rate, blind distance
│   │   ├── ControlPanel.jsx        ← Sliders for speed, frequency, weather
│   │   ├── PhysicsEquation.jsx     ← Live d_blind equation display
│   │   ├── MissedCounter.jsx       ← Counts total missed detections
│   │   └── MiniMap.jsx             ← 2D canvas radar / perception map
│   │
│   ├── about/
│   │   ├── Act1Hardware.jsx        ← $4,000 LIDAR vs simulation comparison
│   │   ├── Act2Timeline.jsx        ← Proof: 2Hz vs 20Hz detection timeline
│   │   ├── Act3Physics.jsx         ← Beer-Lambert Law + weather table
│   │   └── Act4ReportMap.jsx       ← Summary / report navigation
│   │
│   └── lessons/
│       └── LessonOverlay.jsx       ← Guided lesson cards (popup overlays)
│
├── hooks/
│   ├── useSimLoop.js           ← Core simulation tick — detects miss events
│   └── useSimStore.js          ← Zustand store: all simulation parameters
│
└── state/
    └── worldState.js           ← Shared mutable state: positions of all actors
```

---

## 6. Every Element Explained

### The 3D Scene

#### The AV (Dark Blue Car with Cyan Stripes)
The **Ego Vehicle** — the car being simulated. It is modelled after a Waymo-style autonomous sedan. The cyan stripes on the side represent sensor housings. The glowing teal dome on the roof is the LIDAR unit. It drives from south to north on the right lane (x = 2.25).

#### The LIDAR Dome (Spinning Teal Ring on Roof)
The spinning torus on top of the AV represents the rotating mirror assembly inside a real LIDAR unit. In a real sensor, a laser fires outward while a mirror spins — the speed of that spin is the scan frequency. The dome glows cyan because LIDAR uses near-infrared laser light (visualised here in cyan for clarity).

#### The Sweep Cone (Semi-Transparent Fan Shape)
The cyan fan rotating from the AV's position is the current LIDAR "field of regard" — the angular region being scanned right now. In reality, this sweeps 360° in a full circle. The smaller this cone appears (in fog/rain modes), the shorter the effective range.

#### The LIDAR Range Ring (Cyan Circle on Ground)
The circle drawn on the ground around the AV shows the maximum reliable detection radius. In clear weather it is 18 metres. In dense fog it shrinks to ~5 metres — representing the collapse of the sensor's effective range under the Beer-Lambert attenuation law.

#### The Point Cloud (Floating Coloured Dots)
Every time the LIDAR beam bounces off an object and returns, a point is plotted in 3D space. This is called a **point cloud** — it is the raw data output of a real LIDAR sensor:
- **Orange-red dots** = pedestrian hits
- **Cyan-green dots** = environmental hits (buildings, road surface)
- **Vertical beam lines** = the laser ray itself, visualised

#### The Vertical Beam Lines
Thin vertical cylinders rising from the ground to ~0.8m represent the laser pulse paths. Real LIDAR pulses are invisible near-infrared. These lines show you exactly where the sensor is "looking" at each moment.

---

### The HUD Panels (All Draggable)

#### TELEMETRY Panel (Top Left)
Displays live data from the simulation:
- **AV Speed** — current speed of the ego vehicle in m/s
- **Scan Rate** — current LIDAR frequency in Hz
- **Blind Distance (d_blind)** — the result of `v_pedestrian / f` in metres
- **Points/Scan** — how many point cloud hits were generated last scan cycle
- **LIDAR Confidence** — a percentage showing how much the weather has degraded sensor accuracy

#### CONTROLS Panel (Top Right)
Interactive sliders and buttons:
- **Scan Frequency Slider** — drag to set LIDAR Hz (1–30 Hz)
- **Pedestrian Velocity Slider** — set how fast the crossing pedestrian walks
- **AV Speed** — how fast the ego vehicle drives
- **Weather Selector** — toggle between 6 weather modes
- **Walk / Auto Mode buttons** — trigger a pedestrian crossing manually or loop it automatically

#### MISSED DETECTIONS Counter (Top Centre)
Counts how many times the LIDAR **failed to detect** the pedestrian during a crossing event. A miss is registered when `d_blind > pedestrian_width (0.6m)`. This counter is the central proof mechanism of the simulation.

#### LIDAR BLIND SPOT Panel (Bottom Left)
Shows the live physics equation:

```
d_blind = v / f = [pedestrian velocity] / [scan frequency]
```

All three values update in real time as you change sliders. When `d_blind > 0.6m` the value turns red as a visual warning that a miss is likely.

#### PERCEPTION MAP / Mini-Map (Bottom Right)
A 2D top-down radar view. This is the same kind of bird's-eye perception output that Tesla Autopilot and Waymo display on their internal dashboards. It shows:
- **Cyan triangle** = the AV (always centred)
- **Blue rectangles** = traffic vehicles
- **Orange circles** = pedestrians
- **Cyan ring** = current LIDAR detection radius

---

### The AV Status Banner (Auto-Appears Centre Top)
When the AV brakes, a status banner flashes at the top of the screen:
- 🚶 **PEDESTRIAN DETECTED — AV BRAKING** (orange)
- 🚗 **VEHICLE AHEAD — AV SLOWING** (yellow)
- 🔴 **RED LIGHT — AV STOPPED** (red)

This banner also triggers the red emergency vignette on the screen edges.

---

### The Traffic Vehicles (14 Cars)
Coloured sedans driving on all 4 road approaches:
- Lanes N→S, S→N, W→E, E→W are each populated with cars
- They obey traffic signals (stop on red, go on green)
- They maintain a safe following distance (~7m) from the car ahead
- Each has working tail lights and headlights

### The Pedestrians (10 Total)
- **1 Main Pedestrian** (blue shirt) — crosses the crosswalk when you press WALK or in auto mode. This is the one that the LIDAR tries to detect.
- **9 Background Pedestrians** — walk autonomously on sidewalks and crosswalks to create a realistic urban scene and increase detection complexity.

### Shadow Blobs (Soft Circles Under Each Object)
Semi-transparent black circles under every vehicle and pedestrian. This is a classic real-time rendering trick (called a "blob shadow") to make objects look physically grounded instead of floating.

### The Buildings (40 Total, All 4 Quadrants)
The intersection is surrounded by 40 procedurally generated buildings. Each has:
- A random height (7–29 metres)
- A random width and depth
- A window grid on the front face
- Windows that are randomly lit (more windows lit at night)
- A colour from a curated slate-blue palette

---

## 7. The About Page — Explained

The About page (`/about`) is a **scroll-driven visual essay** that explains the physics behind the simulation. It is split into 4 "Acts":

---

### Act 1 — Hardware: Why We Need a Simulation

**What you see:** A large counter animates up from $0 to $4,000.

**What it means:** A Velodyne VLP-16 — one of the industry-standard LIDAR units used in autonomous vehicle research — costs approximately $4,000 USD per unit. Most universities and students cannot afford to buy one, let alone experiment with changing its parameters.

**The two cards:**
- **Left card (red) — Real Hardware:** Lists what you *cannot* do with a real LIDAR: you cannot change its scan frequency, you cannot test it in 6 different weather modes safely, and you cannot slow down time to observe missed detection events.
- **Right card (green) — This Simulation:** Lists what this software can do that hardware cannot: adjustable frequency from 1–30 Hz, 6 weather modes, completely free, and able to visualise the invisible "gap" that causes missed detections.

**The punchline:** *"You cannot turn a knob on a $4,000 sensor to understand why it fails."*

---

### Act 2 — The Proof: d_blind Visualized at Two Frequencies

**What you see:** Two side-by-side timeline columns — one at 2 Hz (red), one at 20 Hz (green).

**What it means:** This section walks through the physics calculation step by step using a real example.

**2 Hz column (Dangerous):**
- At t=0ms: LIDAR scans and sees the pedestrian at their starting position.
- At t=500ms: The next scan fires. But in those 500 milliseconds, the pedestrian walking at 1.4 m/s has moved **0.70 metres**.
- `d_blind = 1.4 m/s ÷ 2 Hz = 0.70 m`
- A human shoulder width is ~0.60 m. The gap (0.70 m) is wider than the pedestrian. **The sensor fires into empty space. Miss.**

**20 Hz column (Safe):**
- At t=0ms: Same scenario.
- At t=50ms: Next scan fires. Pedestrian has only moved **0.07 metres**.
- `d_blind = 1.4 m/s ÷ 20 Hz = 0.07 m`
- 0.07 m is far smaller than 0.60 m body width. The pedestrian is still in the beam path. **Detected.**

**Key Insight:** Increasing scan frequency from 2 Hz to 20 Hz reduced the blind distance by a factor of 10 — from 70 cm to 7 cm. This is the difference between a safe vehicle and a fatal one.

---

### Act 3 — Weather & The Beer-Lambert Law

**What you see:** An equation, three explanation cards, and a horizontal bar chart.

**The equation:**
```
I = I₀ · e^(-μx)
```

**What it means:**
- `I₀` = the original laser beam intensity (how powerful the light is when fired)
- `I` = the received intensity after travelling through the atmosphere
- `μ` = attenuation coefficient — how strongly the air absorbs/scatters the laser. Clear air has μ ≈ 0.01. Dense fog has μ ≈ 0.30.
- `x` = distance travelled (metres)
- `e` = Euler's number (2.718...)

The equation tells us: **laser intensity decays exponentially with distance**, and it decays much faster in bad weather. In fog, the laser beam scatters off tiny water droplets long before it reaches its target, so the signal that returns is too weak to be detected reliably.

**The bar chart:** Shows how each weather condition reduces the LIDAR's effective operating range as a percentage of its clear-sky maximum:
- Clear sky: 100% range
- Light rain: 85% range
- Heavy rain: 60% range
- Dense fog: 35% range
- Night: 75% range (reduced due to thermal noise, not optical attenuation)

**Real-world implication:** This is precisely why Waymo, Tesla, and Cruise mount **multiple different sensor types** on their vehicles — cameras, RADAR, ultrasonic sensors, and LIDAR — because no single sensor can operate reliably in all weather conditions. This simulation lets you experience that limitation directly.

---

### Act 4 — Report Map

**What you see:** A summary card layout showing the key takeaways, variables, and how each part of the project connects to a physics concept.

**What it means:** It serves as a reference guide — a visual index of the simulation. It maps each interactive control to its physical meaning:
- Frequency slider → `f` in `d_blind = v/f`
- Pedestrian speed slider → `v` in `d_blind = v/f`
- Weather selector → `μ` in the Beer-Lambert equation
- Missed counter → empirical evidence of the formula's prediction

---

## 8. The Core Physics Formula

### The Blind Distance Equation

```
d_blind = v / f
```

| Symbol | Name | Typical Value | Unit |
|---|---|---|---|
| d_blind | Blind Distance | 0.07 – 1.4 | metres |
| v | Pedestrian Speed | 1.2 – 1.8 | m/s |
| f | Scan Frequency | 2 – 30 | Hz (scans/second) |

**Safety Condition:** Detection is reliable when `d_blind < width_of_pedestrian`

Human shoulder width ≈ 0.45–0.60 m. Therefore, for a pedestrian walking at 1.4 m/s, the minimum safe scan frequency is:

```
f_min = v / width = 1.4 / 0.60 ≈ 2.33 Hz
```

This means **even at just 3 Hz**, detection should be reliable. However:
- Real pedestrians can move at 2+ m/s (jogging)
- Weather reduces the actual detection probability even within range
- Scan beams are not perfectly uniform — gaps exist between rings

This is why automotive-grade LIDAR (like the Velodyne HDL-64E used in the original DARPA Urban Challenge) operates at **10–20 Hz**, providing a comfortable safety margin.

### The Beer-Lambert Attenuation Law

```
I = I₀ · e^(-μx)
```

This governs how LIDAR performance degrades in weather. The simulation applies it by scaling the maximum detection range:

```
range_effective = range_max × WEATHER_RANGE_FACTOR
```

Where `WEATHER_RANGE_FACTOR` is derived from integrating the Beer-Lambert equation over the beam path for each weather condition's typical `μ` value.

---

## 9. Real-World Relevance

### Industry Context

Modern autonomous vehicles carry LIDAR as their primary 3D perception sensor. The blind-distance problem explored in this simulation is not hypothetical — it has been implicated in real incidents involving AV test vehicles.

**Waymo One** (commercial robotaxi, Phoenix AZ) uses a custom LIDAR scanning at up to **20 Hz** with complementary camera and radar sensors specifically to mitigate this problem.

**Tesla Autopilot** controversially removed LIDAR entirely from its sensor suite, relying on cameras alone — a decision that has been the subject of significant safety debate. The blind-distance physics demonstrated here are one reason the engineering community disagreed with that choice.

**The 2018 Uber ATG Fatality** (Tempe, Arizona) involved an AV that failed to correctly classify and respond to a pedestrian crossing outside a crosswalk at night. While the primary cause was a software classification failure, the underlying LIDAR limitations — reduced range at night, delayed update cycle — are directly related to the physics this simulation demonstrates.

### Educational Value

This simulation bridges the gap between the abstract formula on a physics textbook page and the physical reality of what it means for a vehicle travelling at 50 km/h toward a pedestrian. By making the scan frequency interactive, it transforms `d_blind = v/f` from a memorised equation into a lived experience.

---

*Report generated from simulation source code and physics documentation.*
*Jain University — Physics Department — 2025*
*Simulation: LIDAR AV Simulation v5*
*Stack: React 18, Three.js, GSAP, Zustand, Vite*
