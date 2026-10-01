# Space Weaver — Honest 12-Week Rebuild Roadmap

> **Read this before anything else.**  
> This document is based on a deep read of the actual code, not marketing copy.  
> It is blunt. It is the fastest path to something real.

---

## The Real Problem (What the Code Actually Does Right Now)

After reading every engine file, here is the truth:

### Problem 1: All 12 Philosophies Are One Layout

In [`server/engines/intelligence/relationshipGraph.js`](server/engines/intelligence/relationshipGraph.js), every single philosophy calls `resolveRelationshipLayout()` and the primary sofa always gets placed at:

```js
let primarySofaY = roomL * 0.70;  // 70% down the room — EVERY SINGLE TIME
```

The only differences are tiny tweaks:
- `MINIMAL_FLOAT` → `roomL * 0.65` (5% shift)
- `CINEMA_VIEWING_V` → `roomL * 0.60` (10% shift)

That is 2 pixels of visible difference in most rooms. **The critique is correct: it is one layout with 12 name-tags.**

### Problem 2: Spiral = Collision-Free but Not Design-Smart

The `findCleanPosition` spiral guarantees no overlap, but it doesn't know:
- Where the door is (it will happily push a chair in front of it)
- Where windows are (it cannot prefer natural light)
- What "walkway clear" means (it just avoids item bounding boxes)

### Problem 3: Only Living Room, Only 3 Items

The engine only handles sofa + chair + table. No bed, wardrobe, desk, rug, lamp. The entire concept of "bedroom" or "studio flat" is missing.

---

## The Fix: Generate → Score → Pick

Instead of computing one position per item per philosophy, we:
1. **Generate** hundreds of random-but-valid candidate positions for each item
2. **Score** each complete layout on real metrics (walkway, door clearance, focal alignment, balance, wall adjacency)
3. **Pick** the top 4 layouts that score highest *and are visibly different from each other*
4. **Each philosophy = a different scoring weight vector**, so they genuinely diverge

This approach keeps the existing collision/clearance code as the **hard constraint** layer, and adds a **soft quality layer** on top.

---

## 12-Week Sprint Plan

### 🔴 MONTH 1 — Fix the Engine (Weeks 1–4)

#### Week 1–2: Candidate Generator + Scorer ✅ DONE

> **Research backing:** Make It Home (SIGGRAPH 2011), Merrell et al. (SIGGRAPH 2011) — cost-function + search is proven superior to rule/template systems.

**What was built:**  
`server/engines/optimization/candidateGenerator.js` — zone-biased candidate pool + 6-metric weighted scorer.  
`server/engines/optimization/philosophyEngine.js` — rewritten to use Generate→Score→Pick.

**Next upgrade (research-recommended):** Add **Simulated Annealing** refinement pass on top of the random candidate pool. SA (used in Make It Home) escapes local optima that pure random restarts miss. Add as `refineCandidateWithSA()` in `candidateGenerator.js`.

**How it works:**
```
for each philosophy (weight vector):
  generate 400 random valid candidate layouts
  score each layout on:
    - walkway_score    (min walking clearance to door and between items)
    - focal_score      (primary sofa faces TV/focal point)
    - light_score      (seating near windows, not blocking them)
    - balance_score    (furniture weight distributed across room)
    - wall_adjacency   (wall-type furniture against walls)
    - door_clearance   (nothing within 3ft of door swing arc)
  total_score = weighted sum using philosophy weights
  pick top 4 layouts that differ from each other by ≥ 20% position spread
```

**Philosophy weight examples (these make them genuinely different):**

| Philosophy       | Walkway | Focal | Light | Balance | Door Clear |
|-----------------|---------|-------|-------|---------|------------|
| Minimalist      | 0.4     | 0.2   | 0.1   | 0.2     | 0.1        |
| Cinema Suite    | 0.1     | 0.6   | 0.1   | 0.1     | 0.1        |
| Family Haven    | 0.3     | 0.1   | 0.1   | 0.1     | 0.4        |
| Sunset Lounge   | 0.1     | 0.1   | 0.5   | 0.2     | 0.1        |
| Grand Salon     | 0.1     | 0.2   | 0.2   | 0.4     | 0.1        |

These weights force the engine to find genuinely different rooms.

**New file to create:** `server/engines/optimization/candidateGenerator.js`  
**File to rewrite:** `server/engines/optimization/philosophyEngine.js`

---

#### Week 1–2 also: Start Data Logging NOW

> **Research says:** *"Log layouts shown, choices and ratings from day one. After enough data, train a learned scorer or small layout model."*  
> Every week without logging = data you can never recover. The future Gen 3 model (ATISS-style) needs this.

**What to add to `server/routes/engine.js`:**
- Append a JSON line to `server/data/layout_log.jsonl` on every `/api/generate-layout` call: `{ timestamp, room, furniture, philosophiesReturned, sessionId }`
- New route `POST /api/log-choice` — called by frontend when user clicks a layout card: `{ sessionId, selectedPhilosophyId }`

---

#### Week 3: Real Structural Constraints

**What to build:**
- Door swing arc: a door at position (x, y) blocks a 3ft semicircle. No furniture inside this arc.
- Window light zone: a 4ft band along any wall with a window gets a light-score bonus.
- Room boundary buffer: enforce a strict 3ft clearance from every wall edge for walkable paths.

These are already partially handled in `StructuralVerificationModal.tsx` on the frontend — the user CAN add doors and windows. We just need the backend scorer to actually read them.

**File to update:** `server/engines/clearance.js` — add `getDoorSwingZone()` and `getWindowLightZone()`

---

#### Week 4: Real Furniture Catalog + Fit Warnings

**What to build:**
- A furniture catalog JSON: 30 common items with real dimensions (in feet and cm)
- Fit warning system: after scoring, check each item: "this sofa leaves only 18 inches on the left wall"
- Plain-English layout explanation: "Sofa faces TV at 9ft distance. Clear walkway of 3.5ft to the door."

```
dist/
  furniture_catalog.json   ← 30 items with real dimensions
```

**Milestone Check (End of Month 1):**  
> Show the 4 generated layouts to a friend WITHOUT labels. Ask: "Can you tell these are different rooms?"  
> If yes → proceed. If no → the scoring weights need tuning.

---

### 🟡 MONTH 2 — Make It Useful + Add AI (Weeks 5–8)

#### Week 5: Shopping List + Shareable Output

**What to build:**
- After generating a layout, show a "Shopping List":
  - Item name, real dimensions, estimated price range
  - "This sofa (6ft × 3ft) fits with 2.5ft clearance on each side ✓"
  - "Warning: this wardrobe (6ft) blocks the window — consider a 4ft version"
- One-click export as a PNG image (for WhatsApp/Instagram sharing)
- Use `html2canvas` (already installed in your `package.json`) for this

**Files to update:** `src/pages/DesignResults.tsx` — add shopping list panel and export button

---

#### Week 6: LLM Natural Language Input

**What to build:**  
A text box: *"Describe your room and lifestyle..."*

Example input: `"Small bedroom, I study at night, my mom visits on weekends, want it cozy"`

The LLM (Anthropic Claude via the existing `ANTHROPIC_API_KEY` in your `.env`) converts this into:
```json
{
  "vibe": "cozy",
  "scoring_overrides": {
    "light_score": 0.3,
    "focal_score": 0.1
  },
  "furniture_suggestions": ["desk", "single bed", "bookshelf"],
  "constraints": ["keep center floor clear"]
}
```

**This is the RIGHT use of AI** — it translates human language into engine parameters. The geometry engine still does the math.

**New file:** `server/engines/nlpInterpreter.js`  
**New route:** `POST /api/interpret-brief`

---

#### Week 7: Seed the Marketplace (20–30 Products)

**What to build:**  
Not a full marketplace. Just a JSON file of 20–30 real products (handmade, local, or Flipkart/Amazon links) with:
- Name, price, dimensions, image URL, category
- A "fits your room?" flag computed by comparing item dimensions to the generated layout clearances

**Philosophy:** Start by hand-picking products from 3–5 local furniture sellers you know. Email them. "Your sofa will be shown to people with 6ft+ rooms." This is your first seller relationship.

**New file:** `server/data/marketplace.json`  
**New route:** `GET /api/marketplace?category=sofa&max_width=72`

---

#### Week 8: 2D Visual Polish + Data Logging

**What to build:**
- Polish the 2D blueprint view — it's currently accurate but not beautiful
  - Add room walls, door arcs drawn as dashed semicircles, window markers
  - Color code items (seating = warm tone, tables = neutral, storage = cool)
  - Show walkway corridors as subtle highlighted paths
- Start logging to a simple JSON log file (or SQLite):
  - Every layout generated
  - Which layout the user chose (click)
  - Every item in the shopping list they hovered or clicked
  - Every "Share" click

> This logging data is **your future training dataset**. You have none right now. Start collecting it.

---

### 🟢 MONTH 3 — Real Users + First B2B Pilot (Weeks 9–12)

> **Research-backed B2B:** Exam hall seating is estimated at 3–4 weeks effort, has clear paying customers (schools, coaching centres, exam cells), and the geometry constraints are well-defined. This is the safest first B2B vertical. [Research survey, Section 7]

#### Week 9: Launch to 20 Real Home Users + Start Exam Hall Pilot

**Who:** Friends, family, PG/hostel residents, anyone moving into a new flat.  
**How:** Send the link + say "I built this, can you try it and tell me where you got confused?"

**Watch for:**
- Where do they drop off? (Room Configurator? After results?)
- Do they understand the layout cards?
- Do they click "3D View"? Does it work for them?
- Does the shopping list feel relevant?

---

#### Week 10: Fix the Top 5 Problems

From your 20 user sessions, you will likely find the same 5 problems. Fix them. Nothing else this week.

Common expected issues:
- "I don't know my room size in feet" → add a size guide with common room types (10×12 small bedroom, 15×20 living room)
- "The furniture list is confusing" → add icons and pictures to item selection
- "3D takes too long to load" → show a 2D preview while 3D loads
- "I wanted to add a rug/lamp" → add basic decorative items to the catalog

---

#### Week 11: Growth — Reels + Seller Outreach

**Content:**
- 5–10 "before & after" layout transformation videos/images
- Show: blank room sketch → Space Weaver input → 3 beautiful layout options → 3D view
- Post on Instagram Reels, YouTube Shorts

**Seller Outreach:**
- Contact 3–5 local furniture / curtain / rug sellers
- Offer: "I'll link your products to people with the right room size, for free to start"
- This gives you real inventory and your first revenue model (affiliate / commission)

---

#### Week 12: Measure → Decide

**Measure:**
- How many users finished a full layout?
- How many shared it?
- How many clicked a marketplace product?
- What's the drop-off point?

**Decide:**
- Is the home bedroom/living room wedge working?
- OR did B2B interest show up? (Someone from a school, clinic, or office asked?)
- The data tells you whether to go deeper on home or pivot to B2B

---

## The Big Vision (Don't Build Yet — But Design For It)

The engine you are building is not a furniture app. It is a **Spatial Intelligence Engine**:

```
Given: a space + objects + people + rules + goals
Output: optimal arrangement + explanation + actionable output
```

This same engine handles:
- 🏠 Home rooms (what you're building now)
- 🏫 Exam hall seating (most desks, clear sightlines, evacuation paths)
- 🏥 Hospital wards (bed spacing, patient flow, equipment access)
- 🚗 Parking lots (bay capacity, turning radius)
- 🏪 Shops (table count, customer flow, revenue per sq ft)

The weight-based scoring system you build in Month 1 is already designed to support this — each domain is just a different weight vector and constraint set.

**Design the engine modularly now. Don't hardcode "sofa" or "chair" logic anywhere.**

---

## What NOT To Build in 3 Months

- ❌ Custom-trained ML model (no data yet — must log first, train later)
- ❌ Hospital / parking features (need domain experts + local Indian regulations — NABH norms, municipal codes)
- ❌ User accounts and saved layouts (nice-to-have, not critical)
- ❌ Drag-and-drop in 3D
- ❌ Full e-commerce marketplace with payments
- ❌ Mobile app
- ❌ Non-rectangular rooms
- ❌ Image-generation style previews (DecoMind approach — looks good but ignores real dimensions; useless for 'will it fit?' decisions per research)

## Corrected Pitch Language (Research-Accurate)

| ❌ Don't say | ✅ Say instead | Why |
|---|---|---|
| "Zero overlap guaranteed" | "Collision-checked with spiral resolution" | Research warns against absolute claims before broad testing |
| "No AI or LLM used" | "Geometry is deterministic; AI is used for understanding users and learning preferences" | We use Claude for roast text today; LLM for intent in Week 6 |
| "12 unique AI designs" | "12 scored layouts with different spatial priorities" | Research shows Gen 1 systems produce near-identical results; our Gen 2 engine now diverges by metric |

## Engine Evaluation Metrics (from SceneEval benchmark)
Run these on every test room and publish results in README:

| Metric | Target | How to measure |
|---|---|---|
| Overlap rate | 0% | `checkCollisions()` — count pairs with intersection |
| Out-of-bounds rate | 0% | Check all items fully inside room boundary |
| Walkway compliance | >90% of layouts | Door-to-seating path ≥ 2.5ft |
| Diversity score | >15% avg positional spread | `layoutDiversity()` between philosophy outputs |
| User preference | Track via `POST /api/log-choice` | Which philosophy users click most |

---

## Starting Point: The First Code Change

The single highest-leverage code change is this:

In `server/engines/optimization/philosophyEngine.js`, replace:
```js
let primarySofaY = roomL * 0.70;
```

With a scored candidate search that uses different weight vectors per philosophy.

**This one change makes 12 philosophies actually look different.**  
Everything else builds on this foundation.

---

## Summary Checklist

| Week | Deliverable | Done? |
|------|-------------|-------|
| 1–2  | Candidate Generator + Scorer (philosophies diverge visually) | ✅ |
| 1–2  | Data logging: layout_log.jsonl + /api/log-choice endpoint | ⬜ |
| 3    | Door swing arcs + window zones as real constraints | ⬜ |
| 3    | SA refinement pass on top of random candidate pool | ⬜ |
| 4    | Furniture catalog (30 items w/ real dimensions) + fit warnings | ⬜ |
| 4    | Evaluation metrics script (overlap, OOB, walkway, diversity) | ⬜ |
| 5    | Shopping list panel + PNG/WhatsApp export | ⬜ |
| 6    | LLM intent layer: text brief → scoring weight overrides | ⬜ |
| 7    | Seed marketplace: 20–30 real products by hand | ⬜ |
| 8    | 2D visual polish (door arcs, window markers, walkway highlights) | ⬜ |
| 9    | Launch to 20 real home users; start exam hall pilot conversations | ⬜ |
| 10   | Fix top 5 user problems; build exam hall constraint module | ⬜ |
| 11   | 5 reels/posts + 3–5 seller outreach emails | ⬜ |
| 12   | Measure all 5 engine metrics; decide: home deeper or B2B first | ⬜ |

---
> 📄 See [RESEARCH_NOTES.md](RESEARCH_NOTES.md) for full literature summary, market numbers, and paper references.
