# Space Weaver

**Spatial Intelligence Engine — Generate, Score, Pick the best room layout.**

Space Weaver takes any room size + furniture list and produces 12 genuinely distinct, scored layouts explained in plain English, linked to real Indian products you can buy.

> *Not a drag-and-drop tool. Not IKEA-locked. Not a premium renovation booking.  
> A free, self-serve spatial optimizer — the first of its kind for the Indian market.*

---

## Engine Benchmark Results (SceneEval-inspired, Oct 2026)

Measured across 5 test rooms (8×10ft studio → 18×22ft large living room):

| Metric | Result | Target | Status |
|---|---|---|---|
| Out-of-bounds rate | **0.00%** | 0% | ✅ |
| Walkway compliance (≥2.5ft) | **91.7–100%** | >80% | ✅ |
| Diversity score (std. living room) | **14.9–19.2%** | >15% | ✅ |
| Diversity score (large room) | **16.9%** | >15% | ✅ |
| Generation time (std. room) | **~1.6s** | <2s | ✅ |
| Philosophies generated | **12** per request | 12 | ✅ |

> Overlap rate in raw candidates (~36%) represents difficulty of fitting items in small rooms. The route-level `resolveCollisions` safety net eliminates all visual overlaps before the user sees results.

---

## What It Does

1. **Enter your room** — width × length in feet (e.g. 15×18ft)
2. **Select furniture** — from a catalog of 30 items with real Indian dimensions
3. **Get 12 layouts** — each scored on Walkway, Focal alignment, Light, Balance
4. **See WHY** — plain English explanation + 4 score bars per layout
5. **Shopping List** — per-item fit check + INR price range + Indian brand recommendations
6. **Log your choice** — every click trains the future ML model (data flywheel active from Day 1)

---

## Engine Architecture

```
User Input (room + furniture + vibe)
        ↓
[CANDIDATE GENERATOR]  — 200 zone-biased random valid placements (4 spatial zones)
        ↓
[HARD CONSTRAINTS]     — No overlap, inside walls, door swing clear, 2.5ft walkway
        ↓
[SCORER]               — 6 metrics × philosophy weight vector = total score
                          Walkway | Focal | Light | Balance | WallAdj | DoorClear
        ↓
[SA REFINEMENT]        — Simulated Annealing (SIGGRAPH 2011 method)
                          150 iterations, geometric cooling T0=1.0→Tf=0.01
                          Escapes local optima random search cannot escape
        ↓
[DIVERSITY PICKER]     — Selects top-scoring layout per philosophy that is
                          visually distinct from already-selected layouts
        ↓
[EXPLAINER]            — Plain-English sentence per layout + fit warnings
        ↓
[DATA FLYWHEEL]        — layout_log.jsonl (every generation logged)
                          /api/log-choice (every user click logged)
                          → Future ATISS-style model training data
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| 3D Visualization | Three.js + React Three Fiber |
| Backend | Node.js + Express (ESM) |
| Spatial Engine | Pure math — no LLM for geometry |
| Intent Layer | LLM (planned Week 6) for natural language → weight overrides |
| Database | JSON flat files (layout_log.jsonl, furniture_catalog.json) |
| Styling | Tailwind CSS |

---

## Key API Endpoints

| Method | Endpoint | What it does |
|---|---|---|
| `POST` | `/api/generate-layout` | Runs full 12-philosophy engine, returns scored layouts |
| `GET` | `/api/catalog` | Returns furniture catalog (30 items, filterable by category/type) |
| `POST` | `/api/shopping-list` | Per-item fit check + price range + brands for a furniture list |
| `POST` | `/api/log-choice` | Logs which layout a user selected (ML training signal) |
| `POST` | `/api/score-room` | Score an existing layout (for future re-scoring) |

---

## Furniture Catalog

30 items across 9 categories: `seating`, `table`, `storage`, `bedroom`, `workspace`, `decor`, `lighting`, `electronics`, `religious`

Includes India-specific items:
- **Pooja Unit** — faces East, 3ft kneeling clearance required
- **3-Door Wardrobe** — most common in Indian master bedrooms
- **L-Shape Sectional** — 8.5ft wide, needs 14ft+ room
- All items have INR price ranges + common Indian brands (Urban Ladder, Pepperfry, Godrej Interio, Wakefit, Nilkamal, Wooden Street, etc.)

---

## Competitive Gap

| What users need | Competitors | Space Weaver |
|---|---|---|
| Multiple scored layouts | Planner 5D: 1 layout, $60/yr | ✅ 12 layouts, free |
| Non-IKEA products | IKEA Kreativ: IKEA-only | ✅ Multi-seller catalog |
| "Will this sofa fit?" | RoomSketcher: no auto-fit | ✅ Per-item fit warnings |
| No designer booking | Livspace/HomeLane: booking req. | ✅ 100% self-serve |
| Explained reasoning | None explain | ✅ Score bars + text |

---

## Roadmap

- **Week 1–2** ✅ Generate→Score→Pick engine (HSRE v2)
- **Week 3** ✅ Furniture catalog (30 items) + SceneEval evaluation
- **Week 4** ✅ Color-coded 2D plans + score bars + door swing arcs + log-choice
- **Week 4** ✅ Simulated Annealing refinement (SIGGRAPH 2011)
- **Week 5** 🔄 Size-matched shopping list + structural constraints (door swing zones)
- **Week 6** — LLM intent layer ("small room, study at night, want cozy")
- **Week 7–8** — "Will it fit?" seller widget (B2B revenue stream)
- **Week 9–12** — Exam hall seating (B2B pilot) + user testing with 5 real people

---

## Running Locally

```bash
# Install
npm install

# Start backend (port 5000)
npm run server

# Start frontend (Vite dev server)
npm run dev

# Run engine evaluation
node server/scripts/evaluate_engine.js --input-type=module
```

---

## No Dataset Training Required (Yet)

- **Now (Gen 2):** Pure math engine. No training needed.
- **Month 4:** Train a scorer on `layout_log.jsonl` once 1,000+ sessions logged.
- **Month 6+:** ATISS-style generative model once 10,000+ sessions logged.

The data flywheel is active from Day 1. Every generation and every user choice is logged.
