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

## Competitive Deep-Dive (Live-Researched, Oct 2026)

> These are NOT based on the PDF alone. I researched each app's current website, reviews, and pricing.

---

### 1. Planner 5D — Closest Competitor, But Still Manual at Core

**What it actually does:**
- Has "Automated Furniture Arrangement (AFA)" using neural networks — **but it only suggests, you still drag and drop manually afterward**
- "Planner 5D Copilot" = natural language editor (e.g. "rearrange furniture") — proprietary LLM, not open
- Floor Plan Recognition: upload a photo/blueprint → editable 2D project
- Smart Wizard: guides you to pick a style → generates a starting layout

**Pricing (2025–2026):**
| Plan | Price | Key Limitation |
|------|-------|---------------|
| Free | $0 | Limited furniture catalog only |
| Premium | ~$60/year | AI tools unlocked, 8,000+ items |
| Professional | ~$400/year | 4K renders, CAD export |

**Critical Gap vs Space Weaver:**
- AI features are locked behind $60–$400/year paywall
- No fit warnings ("this sofa is too large for your walkway")
- No real product catalog with dimensions and pricing
- No scored layout comparison ("Minimalist scores 81 on walkway, Cinema scores 65")
- India pricing unclear — Western product catalog
- **Their "AI" still requires manual refinement. No one-click "generate best layout."**

---

### 2. IKEA Kreativ — Great for IKEA, Useless for Everyone Else

**What it actually does:**
- AR/LiDAR room scan on iPhone → 3D room replica
- "Erase" existing furniture from photo → virtual empty room
- Manually browse and place IKEA products in the 3D space
- Web "Room Builder" = manual dimension entry + manual furniture placement

**Critical Gap vs Space Weaver:**
- **Zero automatic layout generation** — confirmed directly from IKEA's support pages
- **100% IKEA-locked** — cannot place non-IKEA furniture
- No scoring, no fit warnings, no walkway analysis
- No shopping list with budget
- **If you want to buy a local sofa and a Pepperfry table, IKEA Kreativ is completely useless**

---

### 3. RoomSketcher — Floor Plan Drawing Tool, Not a Layout Optimizer

**What it actually does:**
- AI Convert: upload a blueprint image → digitized floor plan (walls, doors, windows only)
- AI Render: photorealistic rendering of manually-placed furniture
- FloorCapture: LiDAR iPhone scan → room shell
- Manual furniture placement from a library

**Pricing:** Freemium with paid subscription; credit-based rendering

**Critical Gap vs Space Weaver:**
- **No auto-furnish AI whatsoever** — confirmed from their own documentation
- "AI" = digitizing floor plans and making renders look good. NOT placing furniture.
- Users still manually drag every single item
- No scoring, no fit warnings, no shopping list
- **Designed for real estate agents and architects to draw plans, not for homeowners deciding what to buy**

---

### 4. Magicplan — Measurement Tool, Not a Design Tool

**What it actually does:**
- LiDAR/AR room scanning on iPhone → accurate floor plan with dimensions
- Bluetooth laser meter integration for professional accuracy
- Project documentation, estimating, Xactimate export
- Primary users: **contractors, restoration professionals, insurance adjusters**

**Critical Gap vs Space Weaver:**
- **Measures rooms, does not design them at all**
- No furniture catalog, no layout generation, no 3D visualization
- Built for B2B professionals, not homeowners
- **Completely different use case — but could be an upstream partner (scan → import to Space Weaver)**

---

### 5. Livspace India — Premium Full-Service, Funded $450M+

**What it actually does:**
- End-to-end home interior service: design → manufacture → install
- AI mood boards, 3D rendering, AI cut concept-to-visual time by 60%
- AI voice agents for lead nurturing, predictive supply chain
- FY25 revenue: ₹1,460 crore (+23% YoY) — but laid off 12% workforce (1,000 people) in 2026
- Funded: $450M+ from KKR, Khosla Ventures, Goldman Sachs

**Critical Gap vs Space Weaver:**
- **Not a self-serve tool** — requires booking a designer consultation
- **Minimum project size is large** (full-room or full-home renovation)
- Cannot help someone who wants to just check "will this sofa fit?"
- **Moving toward AI-native organization** — which means they're automating designers away, not building a public tool

---

### 6. HomeLane India — SpaceCraft 3D (Designer-Only Tool)

**What it actually does:**
- Proprietary 3D tool used ONLY by HomeLane's own designers — **not available to public**
- Real-time pricing engine in 3D: add/remove elements → cost updates live
- ThreeJS + WebGL stack (same as us!)
- AI cut first-design time from 3–4 hours → ~5 minutes

**Critical Gap vs Space Weaver:**
- **SpaceCraft is NOT a public product** — you cannot use it without booking HomeLane
- Sells complete renovation projects (modular kitchens, wardrobes, full interiors)
- Not useful for someone buying a single sofa or arranging an existing room
- IPO planned in 12–24 months — focused on scale and operational AI, not product democratization

---

## The Real Market Gap (Updated from Live Research)

After researching all apps, the picture is now very clear:

| What users need | What exists | What's missing |
|---|---|---|
| "Will this sofa fit in my room?" | Nothing that answers this precisely | Space Weaver fit warnings ✅ |
| "Show me 3–4 genuinely different layouts" | Planner 5D suggests 1 layout, manually | Our scored multi-layout engine ✅ |
| "I want non-IKEA products that fit my room" | IKEA Kreativ (IKEA only) | Multi-seller catalog with dimension filters ✅ |
| "Explain WHY this layout is better" | None of them explain | Our plain-English scoring explanations ✅ |
| "Free self-serve tool, no designer needed" | Planner 5D ($60+/yr), HomeLane (booking required) | Space Weaver free tier ✅ |
| "Indian furniture sellers + handmade items" | Livspace/HomeLane (premium projects only) | Local seller marketplace ✅ |



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
