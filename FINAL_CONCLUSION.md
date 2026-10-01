# Space Weaver — Final Conclusion & Build Decision
> Written: 1 Oct 2026  
> Based on: Research PDF (all 6 pages + references), live competitor research, full codebase audit.  
> This document answers: **"What exactly are we building and in what order?"**

---

## 1. What Space Weaver Actually Is (The One-Line Definition)

> **Space Weaver is a Spatial Intelligence Engine — a generate-score-pick optimizer that takes any space + objects + goals and produces the best possible arrangements, explained in plain English, linked to real purchasable products.**

It is NOT a furniture app. It is NOT a 3D visualizer. It is NOT an IKEA clone.  
The furniture app is the **first vertical**. The engine is the real product.

---

## 2. What Every Competitor Gets Wrong (The Confirmed Gap)

After reading the research paper AND doing live research on every app:

| Product | What they claim | What they actually do | The gap |
|---|---|---|---|
| Planner 5D | "AI furniture arrangement" | Neural net suggests 1 layout, you drag manually after. $60/yr locked. | No scored comparison, no fit warnings, no Indian catalog |
| IKEA Kreativ | "Design your room" | Manual placement of IKEA products only. Zero auto-layout (confirmed). | Locked to IKEA. Useless for local/Indian purchases |
| RoomSketcher | "AI-powered design" | AI = scanning blueprints + photorealistic renders. NOT placing furniture. | Targets architects, not homeowners |
| Magicplan | "Floor plan from phone" | Measures rooms for contractors. No design at all. | Completely different use case |
| Livspace | "AI interior design" | Premium full-home renovation. Requires booking. ₹1460cr revenue. | Not self-serve. Min project = entire room renovation |
| HomeLane | "SpaceCraft 3D design" | Proprietary tool for internal designers only. ThreeJS+WebGL (same as us!). | Not public. IPO in 12–24 months. |

**The confirmed empty space:** No product today gives you (for free, without booking a designer):
1. Multiple *genuinely different* auto-scored layouts
2. Fit warnings with real measurements ("24 inches to wall — below 30in minimum")
3. Plain-English explanation of WHY each layout scores the way it does
4. Products from non-IKEA / local / Indian sellers that fit your specific room

---

## 3. What We Have Already Built ✅

| Component | Status | File |
|---|---|---|
| Generate→Score→Pick engine (HSRE v2) | ✅ DONE | `server/engines/optimization/candidateGenerator.js` |
| 12 philosophy weight vectors (genuinely diverge) | ✅ DONE | `philosophyEngine.js` |
| Fit warnings per item | ✅ DONE | `candidateGenerator.js → generateFitWarnings()` |
| Plain-English layout explanation | ✅ DONE | `candidateGenerator.js → generateExplanation()` |
| 6-metric score breakdown per layout | ✅ DONE | Exposed in API response |
| Data logging from Day 1 | ✅ DONE | `server/data/layout_log.jsonl` |
| User choice logging endpoint | ✅ DONE | `POST /api/log-choice` |
| 3D WebGL visualization | ✅ DONE | Three.js / R3F |
| Frontend + backend unified on port 5000 | ✅ DONE | `server/index.js` + Vite proxy |

---

## 4. The 10 Things We Can Build (Prioritized)

From Section 7 of the research paper + our analysis:

### 🟢 MUST BUILD — Next 12 Weeks

**#1: Space Weaver Home (Core Web App)**
- What: Room dimensions + furniture → 3–4 scored layouts → fit warnings → shopping list
- Revenue: Marketplace commission from linked product sales
- Effort: Core already 70% built. Remaining: SA upgrade, furniture catalog, shopping list, 2D polish
- Why first: This is the product that proves the engine works for real users

**#2: "Will It Fit?" Widget for Sellers**  
- What: Embed on any furniture seller's product page. Customer types room size → sees "your 6ft sofa fits with 2.5ft walkway ✓"
- Revenue: Monthly SaaS fee per seller (₹1,000–5,000/month)
- Effort: 2–3 weeks AFTER core is done. Reuses entire engine.
- Why this: Fastest B2B revenue. Every furniture seller in India needs this.

### 🟡 BUILD IN MONTHS 2–4

**#3: Handmade & Local Marketplace (India Differentiator)**
- What: 20–30 products from local artisans/curtain sellers with exact dimensions. "Fits your room" badge.
- Revenue: Commission on sales
- Effort: 4–6 weeks (seed manually)
- Why: This is the feature that Livspace, HomeLane, and IKEA Kreativ ALL can't do — multi-brand, local, Indian

**#4: Exam Hall & Classroom Seating (First B2B Pilot)**
- What: Upload hall dimensions + student count → optimal seating with aisle/exit/spacing rules → print-ready PDF
- Revenue: Per-institution annual fee (₹10,000–50,000/institution)
- Effort: 3–4 weeks (research confirms simple rules, well-defined problem)
- Why: Every school, coaching centre, and university exam cell needs this. Same engine, different rules.
- Proof: Research paper explicitly lists this with 3–4 week estimate

### 🔵 BUILD IN MONTHS 4–6

**#5: Shop / Restaurant Floor Planner**
- What: Table and shelf arrangement for max capacity + customer flow. Shows "covers per sq metre"
- Revenue: Subscription
- Effort: 4–6 weeks

**#6: Designer / Builder Dashboard**
- What: Multiple client projects, PDF/CAD export, branded share link
- Revenue: Subscription (₹2,000–5,000/month)
- Effort: 4–6 weeks

**#7: Photo-to-Room Helper (Add-On)**
- What: Upload phone photo → vision model estimates room size + detects doors/windows → user confirms
- Revenue: Feature of paid tier
- Effort: 2–4 weeks with a vision API

### 🔴 DO NOT BUILD IN 3 MONTHS

**#8: Parking Layout Planner** — 6–10 weeks, needs irregular shape handling + municipal codes (research confirms)  
**#9: Clinic / Ward Layout Assistant** — needs domain experts + NABH regulations  
**#10: Public API + CAD Export** — build after core is proven; 2–3 weeks when needed

---

## 5. The Technical Architecture (Final, Research-Validated)

```
User Input: Room dimensions, furniture list, lifestyle brief
     ↓
[INTENT LAYER - LLM (Week 6)]
  "small bedroom, I work from home, want it cozy"
  → scoring weight overrides + furniture suggestions
     ↓
[CANDIDATE GENERATOR - Already Built ✅]
  400 zone-biased random+valid placements
  Next: Add Simulated Annealing refinement pass (SIGGRAPH 2011 method)
     ↓
[HARD CONSTRAINTS - Already Built ✅]
  No overlap (spiral resolver)
  Within room boundaries
  Door swing clearance
  Minimum 2.5ft walkway
     ↓
[SCORER - Already Built ✅]
  6 metrics × philosophy weights = total score
  Walkway | Focal | Light | Balance | WallAdj | DoorClear
     ↓
[DIVERSITY PICKER - Already Built ✅]
  Zone-biased candidates ensure genuine visual divergence
     ↓
[EXPLAINER - Already Built ✅]
  Plain-English sentence per layout
  Fit warnings with exact inches
     ↓
[DATA FLYWHEEL - Already Built ✅]
  layout_log.jsonl → future ATISS-style model training
  /api/log-choice → user preference signal
```

---

## 6. What to Build Right Now (Next 2 Weeks)

In priority order:

### Week 3A: Simulated Annealing Upgrade
Replace pure random restarts with SA in `candidateGenerator.js`.  
SA from SIGGRAPH 2011 (Make It Home) — proven to escape local optima.  
**File:** `server/engines/optimization/candidateGenerator.js` → add `refineCandidateWithSA()`

### Week 3B: Furniture Catalog (30 Real Items with Dimensions)
```json
{
  "id": "sofa-standard",
  "name": "3-Seater Sofa",
  "category": "seating",
  "widthFt": 6.5,
  "depthFt": 3.0,
  "heightFt": 2.8,
  "widthCm": 198,
  "depthCm": 91,
  "priceRangeINR": "15000-45000",
  "commonBrands": ["Urban Ladder", "Pepperfry", "IKEA EKTORP"]
}
```
**File:** `server/data/furniture_catalog.json`

### Week 3C: Engine Evaluation Script
Test every layout against SceneEval metrics, publish results in README.  
**File:** `server/scripts/evaluate_engine.js`

### Week 4: 2D Visual Polish
- Draw door swing arcs as dashed semicircles on the floor plan
- Color-code items: seating=warm, tables=neutral, storage=cool
- Show walkway path highlighting between door and main seating
- **File:** `src/components/FloorPlanCanvas.tsx`

---

## 7. Revenue Model (Finalized)

| Stream | Model | When |
|---|---|---|
| Marketplace commission | 5–10% on linked product clicks/sales | Month 2 (seed 20–30 products) |
| "Will it fit?" widget | ₹1,000–5,000/month per seller | Month 2 (2-3 weeks after core) |
| Exam hall seating | ₹10,000–50,000/institution/year | Month 3 (B2B pilot) |
| Designer dashboard | ₹2,000–5,000/month | Month 4+ |

**Note:** Do NOT charge end users for the core layout tool. Keep it free. Revenue comes from sellers, institutions, and designers.

---

## 8. The Pitch in 3 Sentences

> Space Weaver is the only free tool that generates multiple genuinely different room layouts — scored, explained, and linked to real products you can actually buy.

> Every competitor either locks you to one brand (IKEA), requires you to drag furniture manually (Planner 5D, RoomSketcher), or makes you book a full renovation (Livspace, HomeLane).

> The same engine that arranges your living room can seat an exam hall, optimize a restaurant floor, or plan a parking lot — because spatial intelligence is a platform problem, not a furniture problem.

---

## 9. Risks (From Research Section 10 — Taken Seriously)

| Risk | What we do about it |
|---|---|
| "25% more stalls" / "5.84% travel reduction" are from ONE study each | Do not quote as general guarantees. Say "case study results." |
| Building codes differ by country | Check Indian standards before building clinic/hospital features. NABH norms for healthcare. Fire exit rules for exam halls. |
| Vendor blog rankings are biased | We tested/researched live. Still test the apps ourselves before pitching against them. |
| Planner 5D is moving toward auto-layout | Monitor quarterly. Our Indian catalog + free tier + explainability are our moat. |
| Livspace ($450M funded) could build a self-serve tool | Their DNA is project-based renovation. Self-serve is a pivot. Watch but don't panic. |

---

## 10. The Single Most Important Next Action

> **Get 5 real people — anyone moving to a new flat or rearranging a room — to use the app and watch them do it. Say nothing. Watch where they get stuck.**

All the engine work means nothing until a real person in a real situation finds it useful.  
The roadmap says Week 9 for this. That is too late if the engine still has issues.  
**Do this as soon as the shopping list (Week 5) is done.**
