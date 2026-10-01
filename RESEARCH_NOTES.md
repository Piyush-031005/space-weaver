# Space Weaver — Research & Market Survey Notes
> Summarized from the formal research PDF (1 Oct 2026).  
> Use this as the reference when pitching, building, or deciding what to build next.

---

## What the Research Confirms About Our Approach

### ✅ Our Generate→Score→Pick engine is the correct direction
The literature classifies layout engines into 4 generations:

| Generation | Description | Our Status |
|---|---|---|
| **Gen 1: Rule/Heuristic** | Fixed zones, hand-written rules | **Where we WERE** (old `philosophyEngine.js`) |
| **Gen 2: Cost-function + Search** | Score layouts, search with SA/GA | **Where we ARE NOW** (new `candidateGenerator.js`) |
| Gen 3: Learned generative (ATISS, DiffuScene) | Transformer/diffusion on 3D datasets | Future — needs our own data first |
| Gen 4: LLM + Solver | LLM interprets, solver places | Week 6 plan (hybrid) |

> **Key quote from research:** *"Your current engine is closer to the older rule/template family. That is why the 12 layouts look alike: fixed zones with small parameter changes, not a search over many candidate layouts."*

Our `candidateGenerator.js` (just committed) is the correct fix.

---

### ✅ Hybrid LLM approach is research-validated
The research says: *"the strongest recent direction is a hybrid: LLM interprets the request, a solver/optimizer places objects."*

This is exactly Week 6 of our plan. The LLM for Week 6 is for **intent interpretation only** — it will never compute coordinates.

> **Correct pitch language:** "The geometry is deterministic. AI is used for understanding users and learning preferences."  
> ❌ **Do NOT say:** "No AI/LLM used at all." (We use Claude for roast text today, and will use LLM for intent in Week 6.)

---

### ⚠️ Research Warning: Don't Over-Claim on Collisions
> *"Do not claim '100% guaranteed zero overlap in all cases' unless tested across many rooms. Say 'collision-checked' and show your test results."*

**Action:** Remove "0% overlap guarantee" from any marketing copy. Say **"collision-checked"** instead.

---

## Market Opportunity (Hard Numbers)

| Data Point | Source |
|---|---|
| India interior design market → **~$81.2B by 2030** (from ~$40B in 2024) | P&S Intelligence via Reuters, June 2026 |
| Parking optimization → **~25% more stalls** than manually designed lots | Stephan & Weidinger, Transportation Science 2021, study of 177 real lots |
| Autonomous valet parking → **36–59% more spaces** vs traditional layout | Zhang et al., Journal of Advanced Transportation 2025 |
| Hospital GA redesign → **5.84% patient travel reduction** (general) | China outpatient case study, 64,315 records |
| Hospital graph-theoretic → **18.5% and 45% layout score gains** in 2 hospitals | 2026 case study |
| HomeLane: AI cut first-design time from **3–4 hours → ~5 minutes** | Company statement, Feb 2026 |

---

## Competitive Landscape (What Exists)

| Product | What it does well | What it can't do |
|---|---|---|
| IKEA Kreativ | Room scanning, IKEA product placement | Locked to IKEA; manual placement |
| Planner 5D | Easy 2D/3D plans | Manual drag-and-drop; paid catalog |
| RoomSketcher | Accurate floor plan drawing | Not auto-optimized layout |
| Magicplan | Phone AR room scanning | Measures rooms, doesn't design them |
| Homestyler | Good 3D renders | Visualization-led, not planning-led |
| Livspace (India) | Full design-to-installation | Premium project-based; not self-serve |
| HomeLane (India) | SpaceCraft 3D + real-time pricing | Same: sells projects, not free planner |

> **The Gap:** No existing product combines (1) auto-scored diverse layouts + (2) fit warnings with real dimensions + (3) multi-seller catalog + (4) explainability. That is Space Weaver's exact positioning.

---

## B2B Verticals with Research-Backed Evidence

These are validated by actual papers — safe to cite in pitches:

### 🅱️ Exam Hall / Classroom Seating
- **Effort estimate (our analysis):** 3–4 weeks
- **Revenue model:** Per-institution annual fee
- **Why it works:** Rule-driven and well-defined. Every school needs it. Same geometry engine, different constraint set (aisle widths, exit clearance, sightlines, desk spacing norms).
- **Note:** Verify Indian exam hall regulations (spacing norms from CBSE/UGC) before pitching compliance.

### 🅱️ Parking Lot Layout
- **Effort estimate (our analysis):** 6–10 weeks
- **Revenue model:** Per-project fee (builders, malls, housing societies)
- **Evidence:** 177 real parking lots — optimized layouts had ~25% more capacity than manual.
- **Note:** Needs irregular shape handling and local municipal building codes.

### 🅱️ Clinic / Ward Layout
- **Effort estimate (our analysis):** Longer — needs domain experts + local regulations
- **Evidence:** GA-based outpatient redesign reduced waiting and cycle times.
- **Note:** Indian hospital regulations (NABH norms) must be verified.

### 🅱️ Shop / Restaurant Floor Planner
- **Effort estimate (our analysis):** 4–6 weeks
- **Revenue model:** Subscription
- **Metric to show:** Covers per square metre / revenue per sq ft optimization.

---

## Technical Upgrades Suggested by Research

### 1. Add Simulated Annealing (Upgrade from Pure Random)
The **Make It Home (SIGGRAPH 2011)** paper and **SA+GA method** both show simulated annealing outperforms pure random restarts. SA explores the search space more intelligently — it can accept slightly-worse moves to escape local optima.

**For our engine:** In `candidateGenerator.js`, upgrade the candidate search from pure random to SA for the top-scoring refinement pass.

### 2. Add Evaluation Metrics (Research Shows What to Measure)
The **SceneEval benchmark** and papers track:
- Overlap rate (% of placed items that collide)
- Out-of-bounds rate (% of items partially outside room)
- Walkway compliance (% of layouts with ≥30in clearance to door)
- Diversity score (average positional difference between philosophy layouts)
- User preference (which of N layouts did the user pick)

**Action:** Build a `/api/evaluate-layout` endpoint that returns these numbers. Run it on every test room. Show the scores in the README.

### 3. Start Data Logging Immediately (Not Week 8!)
> *"Log layouts shown, choices and ratings from day one. After enough data, train a learned scorer or a small layout model."*

This is our training data for a future Gen 3 model. Every week without logging is data we can never recover.

**Action:** Add logging to `POST /api/generate-layout` response — log which layouts were returned. Add a `POST /api/log-choice` endpoint — called when a user clicks a layout card.

---

## Evaluation Checklist (from SceneEval benchmark)
Use these to measure and report our engine quality:

- [ ] Overlap rate: % of item pairs that intersect
- [ ] Out-of-bounds rate: % of items not fully inside room
- [ ] Walkway compliance: % of layouts with ≥30in (2.5ft) door-to-seating clearance
- [ ] Diversity: average positional spread (ft) between the 12 philosophy outputs
- [ ] User preference: which layout users click most (requires logging)

---

## References (Key Papers)
1. Make It Home — Yu et al., SIGGRAPH 2011: https://web.cs.ucla.edu/~dt/papers/siggraph11/siggraph11.pdf
2. LayoutGPT — Feng et al., NeurIPS 2023: https://arxiv.org/pdf/2305.15393
3. ATISS — Paschalidou et al., NeurIPS 2021: https://deepai.org/publication/atiss
4. DiffuScene — Tang et al. 2023: https://arxiv.org/pdf/2303.14207
5. Chat2Layout 2024: https://arxiv.org/pdf/2407.21333
6. OptiScene 2025: https://arxiv.org/html/2506.07570v2
7. SceneEval 2025: https://arxiv.org/pdf/2503.14756
8. Parking optimization — Stephan & Weidinger, Transportation Science 2021: https://ideas.repec.org/a/inm/ortrsc/v55y2021i4p930-945.html
9. Hospital layout GA — China outpatient case: https://scholar.hit.edu.cn/en/publications/computer-aided-hospital-layout-optimization-based-on-patient-flow/
10. DecoMind (image-based, not measured): https://arxiv.org/pdf/2508.16696
