# LIDAR Simulation — Project Rules
**Applied Physics | Jain (Deemed-to-be) University | B.Tech CSE Sem I**

---

## The one rule that overrides everything else

> This simulation has one job: prove, visually and irrefutably, that scan frequency directly causes pedestrian missed detections.

Every design decision, every feature, every animation exists to set up, demonstrate, or explain that moment. If a feature does not serve that proof, cut it.

---

## Identity rules

| Rule | Reason |
|------|--------|
| The simulation must look like AV software, not a student project | The aesthetic signals seriousness to the professor |
| Dark theme only — background `#06060f` | AV perception software is always dark |
| All text in the HUD uses monospace font | Matches real telemetry dashboards |
| No rounded pastel UI elements | Those signal a tutorial app, not a tool |
| The top bar must always show `LIDAR·PERCEPTION·SIM` | Establishes identity on first glance |

---

## Code rules

### Rendering — non-negotiable
- **Four canvas layers only.** `cvBg` (static), `cvCars` (vehicles), `cvLidar` (beams), `cvHud` (overlays)
- `cvBg` is drawn **once on load**. It is never cleared or redrawn under any circumstance
- All animation uses `requestAnimationFrame` only — no `setInterval` or `setTimeout` in the render path
- FPS is capped at 60: `if (timestamp - lastTime < 16.67) return`
- All movement uses delta time: `position += speed * dt` where `dt = (now - last) / 1000`
- All DOM writes happen in a **separate** `setInterval(updatePanel, 100)` — never inside the rAF loop
- All DOM element references are cached on load into a `const refs = {}` object — zero `querySelector` calls inside rAF

### Drawing — non-negotiable
- **Zero rectangles for vehicle bodies.** All cars and the F1 chassis use `bezierCurveTo` / `quadraticCurveTo` only
- Pedestrians are drawn as figures (head circle + torso ellipse + leg lines) — never as filled circles
- The F1 LIDAR dome must pulse using `Math.sin(Date.now() * 0.005)`
- All beam hit dots are coloured by distance using `hsl((1-t)*120, 100%, 60%)` — green near, red far
- The sweep wedge uses `ctx.createRadialGradient` — never a solid fill

### Physics — must be accurate
- Beam dropout uses Beer-Lambert coefficient `α` per weather condition (see values below)
- The LIDAR range equation `R_max = √[P_t·A_r·ρ·η / (π·SNR·N_e·α)]` must be displayed live in the right panel
- The blind zone formula `d_blind = v_pedestrian / f_scan` must update live when the frequency slider moves
- Detection requires `hitCount >= 3` per scan cycle — not just any single beam return

### Weather coefficient table
| Condition | Dropout | Range multiplier | α |
|-----------|---------|-----------------|---|
| Clear | 0.00 | 1.00 | 0.00 |
| Light rain | 0.12 | 0.82 | 0.18 |
| Heavy rain | 0.38 | 0.58 | 0.42 |
| Fog | 0.62 | 0.42 | 0.58 |
| Dense fog | 0.80 | 0.28 | 0.72 |
| Dust storm | 0.52 | 0.50 | 0.50 |

---

## Feature rules

### The missed detection alert — must trigger correctly
When a pedestrian's `hitCount` is 0 after a full scan cycle:
1. Flash a red banner at the top of the scene: `"⚠ MISSED DETECTION — pedestrian not seen this scan cycle"`
2. Draw a dashed red circle at the pedestrian's last position labelled `"BLIND ZONE"`
3. Show the cause in the right panel with the relevant formula values highlighted
4. Increment `missedTotal` — the counter must never silently fail to update

### The guided lesson mode — must auto-configure correctly
- Each lesson sets **all** parameters programmatically before unlocking its one control
- The student cannot break a lesson by having wrong settings from a previous session
- Lesson 3 (the core lesson) must be reachable in under 3 clicks from page load
- The `WALK` button in Lesson 3 must spawn a pedestrian every time it is pressed, not toggle one

### The About overlay
- Must auto-play its four acts in sequence — the student should not have to click through them manually
- Act 2 timeline diagram is mandatory — it is the core academic argument in visual form
- The `[Start Guided Lesson →]` button must close the overlay AND activate Mode B AND start Lesson 1 in one click

---

## Things that are forbidden

- No `alert()`, `confirm()`, or `prompt()` calls anywhere
- No external library imports — not even a CDN link
- No `position: fixed` elements (breaks the canvas layout)
- No gradient backgrounds on the outer page container — transparent only
- No coloured rectangles as vehicle bodies
- No filled circles as pedestrians
- No placeholder text like "coming soon" or "TODO" in the final file
- No console errors on load in Chrome, Firefox, or Edge

---

## Output rules

- Single `.html` file, all JS and CSS inline
- Opens by double-click with no server
- Under 600KB total file size
- Starts with the project header comment block (see Section 9 of the master prompt)
- Zero console errors on load

---

## Viva rules (what you must be able to answer)

| Question | The answer this simulation must make demonstrable |
|----------|--------------------------------------------------|
| How is this different from real LIDAR? | Hardware is optimised to work. This is optimised to teach. You cannot isolate scan frequency on a Velodyne and watch pedestrians get missed. |
| What did you prove? | Below 15Hz, a pedestrian at walking pace has a 40%+ miss rate. Formula: `d_blind = v/f`. The graph is the proof. |
| What physics does this demonstrate? | Beer-Lambert attenuation (weather), LIDAR range equation (right panel, live), angular resolution as function of beam count, temporal aliasing at low scan frequencies |
| What did you learn that a textbook cannot teach? | That the relationship between scan frequency and detection reliability is non-linear. Below 15Hz it collapses. Moving the slider made that real. Reading about it did not. |

---

*Last updated: v4 final — for Applied Physics Experiential Learning submission*
