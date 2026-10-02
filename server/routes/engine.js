import express from 'express';
import { checkCollisions, resolveCollisions } from '../engines/collision.js';
import { calculateClearance } from '../engines/clearance.js';
import { generateGenome } from '../engines/genome.js';
import { PHILOSOPHY_WEIGHTS } from '../engines/optimization/candidateGenerator.js';
import { generateRoast } from '../engines/critic.js';
import { calculateCognitiveLoad } from '../engines/cognitive.js';

// HSRE Imports
import { detectFocalPoint } from '../engines/intelligence/focalPointEngine.js';
import { buildRelationshipGraph } from '../engines/intelligence/relationshipGraph.js';
import { evaluateAffordanceClearances } from '../engines/intelligence/affordanceEngine.js';
import { calculateCirculationPaths } from '../engines/geometry/circulation.js';
import { generateAllPhilosophies } from '../engines/optimization/philosophyEngine.js';
import { generateLayoutReasoning } from '../engines/explainability/reasoning.js';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure data directory exists for logging
const DATA_DIR = path.join(__dirname, '../data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
const LOG_FILE = path.join(DATA_DIR, 'layout_log.jsonl');

/** Append one JSON line to the layout log (non-blocking) */
function logLayoutEvent(event) {
  try {
    fs.appendFileSync(LOG_FILE, JSON.stringify(event) + '\n');
  } catch (e) {
    // Logging must never crash the server
  }
}

const router = express.Router();

router.post('/analyze-space', (req, res) => {
  const { room, structuralElements } = req.body;
  res.json({ status: 'analyzed', area: room.width * room.length });
});

router.post('/generate-layout', async (req, res) => {
  try {
    const { room, structuralElements, furniture, vibe } = req.body;
    const fixedElements = (structuralElements || []).map(el => {
      let x = el.x !== undefined ? el.x : 0;
      let y = el.y !== undefined ? el.y : 0;
      let rotation = el.rotation !== undefined ? el.rotation : 0;
      let depth = el.depth !== undefined ? el.depth : (el.type === 'pillar' || el.type === 'column' ? 2 : 0.5);
      if (el.wall === 'top' && el.y === undefined) { x = el.position || 0; y = 0; }
      else if (el.wall === 'bottom' && el.y === undefined) { x = el.position || 0; y = room.length; }
      else if (el.wall === 'left' && el.x === undefined) { x = 0; y = el.position || 0; rotation = Math.PI/2; }
      else if (el.wall === 'right' && el.x === undefined) { x = room.width; y = el.position || 0; rotation = Math.PI/2; }
      else if (el.wall === 'interior' || el.wall === 'center') { x = el.x || el.position || room.width/2; y = el.y || room.length/2; }
      return { ...el, x, y, width: el.width || (el.type === 'pillar' || el.type === 'column' ? 2 : 3), depth, rotation };
    });

    // 1. Detect Primary Focal Point
    const focalPoint = detectFocalPoint(room, fixedElements, furniture);
    
    // 2. Build Relationship Graph
    const graphResult = buildRelationshipGraph(furniture, focalPoint);

    // 3. Generate 12 Expert Interior Design Configurations
    const philosophyLayouts = generateAllPhilosophies(room, furniture, fixedElements, focalPoint);
    const options = await Promise.all(philosophyLayouts.map(async (ph) => {
      // v2: layout is already collision-free from Generate->Score->Pick engine
      // Run a final resolveCollisions pass as a safety net only
      ph.layout = resolveCollisions(ph.layout, room, fixedElements);
      const collisions = checkCollisions(ph.layout);
      const clearanceScores = calculateClearance(room, fixedElements, ph.layout);
      const genome = generateGenome(clearanceScores);
      const cognitiveLoad = calculateCognitiveLoad(room, ph.layout);
      const roast = await generateRoast(clearanceScores, genome, collisions);
      
      // Evaluate HSRE clearances and walking circulation
      const affordanceResult = evaluateAffordanceClearances(ph.layout, room, fixedElements);
      const circulationResult = calculateCirculationPaths(room, fixedElements, ph.layout);
      
      // Generate Explainability and Confidence
      const reasoningResult = generateLayoutReasoning(
        ph.layout, 
        room, 
        focalPoint, 
        ph.id, 
        affordanceResult, 
        circulationResult
      );

      // Get scoring weights for this philosophy (for UI display)
      const weights = PHILOSOPHY_WEIGHTS[ph.id] || {};

      return {
        id: ph.id,
        name: ph.name || ph.title,
        desc: ph.desc || ph.tagline,
        viralBadge: ph.viralBadge,
        bestFor: ph.bestFor,
        philosophyDescription: ph.philosophyDescription,
        layout: ph.layout,
        droppedItems: [],
        clearanceScores,
        genome,
        cognitiveLoad,
        roast,
        collisions,
        confidence: reasoningResult.confidence,
        why: reasoningResult.overallWhy,
        itemReasons: reasoningResult.itemReasons,
        affordances: affordanceResult,
        circulation: circulationResult,
        focalPoint,
        // v2 additions: score breakdown, plain-English explanation, fit warnings
        scoreTotal: ph.scoreTotal || 0,
        scoreBreakdown: ph.scoreBreakdown || {},
        explanation: ph.explanation || '',
        fitWarnings: ph.fitWarnings || [],
        philosophyWeights: weights,
      };
    }));

    // Sort options intelligently based on selected vibe to ensure variety and relevance
    if (vibe === 'cozy') {
      const cozyOrder = ['philosophy-cozy', 'philosophy-family', 'philosophy-humanist', 'philosophy-sunset'];
      options.sort((a, b) => {
        const aIndex = cozyOrder.indexOf(a.id);
        const bIndex = cozyOrder.indexOf(b.id);
        if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
        if (aIndex !== -1) return -1;
        if (bIndex !== -1) return 1;
        return 0;
      });
    } else if (vibe === 'space_saver') {
      const spaceOrder = ['philosophy-architect', 'philosophy-minimalist', 'philosophy-executive', 'philosophy-cinema'];
      options.sort((a, b) => {
        const aIndex = spaceOrder.indexOf(a.id);
        const bIndex = spaceOrder.indexOf(b.id);
        if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
        if (aIndex !== -1) return -1;
        if (bIndex !== -1) return 1;
        return 0;
      });
    } else if (vibe === 'aesthetic') {
      const aestheticOrder = ['philosophy-curator', 'philosophy-grand', 'philosophy-fengshui', 'philosophy-entertainer'];
      options.sort((a, b) => {
        const aIndex = aestheticOrder.indexOf(a.id);
        const bIndex = aestheticOrder.indexOf(b.id);
        if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
        if (aIndex !== -1) return -1;
        if (bIndex !== -1) return 1;
        return 0;
      });
    }

    // Log the generation event for future ML training data
    logLayoutEvent({
      event: 'layout_generated',
      timestamp: new Date().toISOString(),
      sessionId: req.headers['x-session-id'] || 'anonymous',
      room,
      furnitureCount: (furniture || []).length,
      furnitureTypes: (furniture || []).map(f => f.type),
      fixedElementCount: (fixedElements || []).length,
      vibe,
      philosophiesReturned: options.map(o => ({ id: o.id, scoreTotal: o.scoreTotal })),
    });

    res.json({ options, focalPoint, relationshipGraph: graphResult });
  } catch (error) {
    console.error("HSRE Layout Generation Error:", error);
    res.status(500).json({ error: "Failed to generate layout", stack: error.stack });
  }
});

/**
 * POST /api/log-choice
 * Called by the frontend when a user clicks on a layout card.
 * This is our user preference signal — critical for future scoring model training.
 */
router.post('/log-choice', (req, res) => {
  const { sessionId, selectedPhilosophyId, roomWidth, roomLength } = req.body;
  logLayoutEvent({
    event: 'layout_chosen',
    timestamp: new Date().toISOString(),
    sessionId: sessionId || 'anonymous',
    selectedPhilosophyId,
    roomWidth,
    roomLength,
  });
  res.json({ logged: true });
});

/**
 * GET /api/catalog
 * Returns the full furniture catalog with dimensions and prices.
 * Used by the frontend to populate the furniture picker and shopping list.
 */
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

router.get('/catalog', (req, res) => {
  try {
    const catalogPath = path.join(__dirname, '../data/furniture_catalog.json');
    const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));
    const { category, type } = req.query;
    let items = catalog.items;
    if (category) items = items.filter(i => i.category === category);
    if (type) items = items.filter(i => i.type === type);
    res.json({ items, total: items.length, version: catalog.version });
  } catch (e) {
    res.status(500).json({ error: 'Could not load catalog', detail: e.message });
  }
});/**
 * POST /api/shopping-list
 * Body: { furniture: [{id, type, width, depth, name?}], room: {width, length} }
 *
 * Returns per item:
 *  - Best-matching catalog item by TYPE + closest DIMENSIONS (not just first match)
 *  - Fit check with exact gap measurements ("1.5ft gap on width side — too tight")
 *  - Up to 3 alternative catalog matches so the user can choose
 *  - Total budget estimate
 */
router.post('/shopping-list', (req, res) => {
  try {
    const { furniture = [], room } = req.body;
    const catalogPath = path.join(__dirname, '../data/furniture_catalog.json');
    const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));

    const MIN_WALKWAY_FT = 2.5;
    const roomW = room?.width || 0;
    const roomL = room?.length || 0;

    /**
     * Size-distance score between a placed item (width, depth in ft)
     * and a catalog item. Returns 0 (perfect) to Infinity (very different).
     * Normalised so a 1ft difference in width = distance of 1.0.
     */
    function sizeDistance(itemW, itemD, catalogItem) {
      const dw = Math.abs(itemW - catalogItem.widthFt);
      const dd = Math.abs(itemD - catalogItem.depthFt);
      return dw + dd; // Manhattan distance in ft
    }

    const shoppingList = furniture.map(item => {
      const itemW = item.width || 0;
      const itemD = item.depth || 0;

      // 1. Get all same-type catalog items
      const byType = catalog.items.filter(c => c.type === item.type);

      // 2. Sort by dimensional closeness (closest first)
      const ranked = [...byType].sort(
        (a, b) => sizeDistance(itemW, itemD, a) - sizeDistance(itemW, itemD, b)
      );

      const best   = ranked[0] || null;
      const alts   = ranked.slice(1, 3);   // up to 2 alternatives

      // 3. Use placed dimensions for fit check (most accurate)
      const useW = itemW || (best ? best.widthFt : 0);
      const useD = itemD || (best ? best.depthFt : 0);

      // 4. Gap calculations
      const gapW = roomW - useW;
      const gapD = roomL - useD;
      const fitsW = gapW >= MIN_WALKWAY_FT * 2;
      const fitsD = gapD >= MIN_WALKWAY_FT * 2;
      const fits  = fitsW && fitsD;

      const warnings = [];
      if (!fitsW) warnings.push(
        `Width: ${gapW.toFixed(1)}ft gap remaining — need ${(MIN_WALKWAY_FT * 2).toFixed(0)}ft (2×walkway)`
      );
      if (!fitsD) warnings.push(
        `Depth: ${gapD.toFixed(1)}ft gap remaining — need ${(MIN_WALKWAY_FT * 2).toFixed(0)}ft (2×walkway)`
      );

      // 5. Size match quality (how close is the best catalog item to what they placed?)
      const sizeDiff = best ? sizeDistance(useW, useD, best) : null;
      const matchQuality = sizeDiff === null ? null
        : sizeDiff < 0.5 ? 'exact'
        : sizeDiff < 1.5 ? 'close'
        : 'approximate';

      const buildMatch = c => c ? {
        id:           c.id,
        name:         c.name,
        widthFt:      c.widthFt,
        depthFt:      c.depthFt,
        widthCm:      c.widthCm,
        depthCm:      c.depthCm,
        priceRangeINR: c.priceRangeINR,
        brands:       c.commonBrands,
        notes:        c.notes,
        wallAdjacent: c.wallAdjacent,
      } : null;

      return {
        itemId:         item.id,
        itemType:       item.type,
        itemName:       item.name || item.type,
        placedDims:     { widthFt: useW, depthFt: useD },
        catalogMatch:   buildMatch(best),
        alternatives:   alts.map(buildMatch),
        matchQuality,                     // 'exact' | 'close' | 'approximate'
        fitsRoom:       fits,
        gapWidth:       parseFloat(gapW.toFixed(2)),
        gapDepth:       parseFloat(gapD.toFixed(2)),
        minWalkway:     MIN_WALKWAY_FT,
        fitWarnings:    warnings,
      };
    });

    // Budget totals
    let budgetMin = 0, budgetMax = 0;
    shoppingList.forEach(({ catalogMatch }) => {
      if (!catalogMatch?.priceRangeINR) return;
      const parts = catalogMatch.priceRangeINR.split('-').map(Number);
      if (parts.length === 2) { budgetMin += parts[0]; budgetMax += parts[1]; }
    });

    res.json({ shoppingList, room, budgetMin, budgetMax });
  } catch (e) {
    res.status(500).json({ error: 'Shopping list generation failed', detail: e.message });
  }
});

router.post('/simulate-lifestyle', (req, res) => {
  res.json({ status: 'not-implemented' });
});

router.post('/score-room', (req, res) => {
  const { room, layout, fixedElements } = req.body;
  const clearanceScores = calculateClearance(room, fixedElements || [], layout);
  const cognitiveLoad = calculateCognitiveLoad(room, layout);
  res.json({ clearanceScores, cognitiveLoad });
});

router.post('/critic', async (req, res) => {
  const { clearanceScores, genome, collisions } = req.body;
  const roast = await generateRoast(clearanceScores, genome, collisions);
  res.json({ roast });
});

router.post('/generate-space-genome', (req, res) => {
  const { clearanceScores } = req.body;
  const genome = generateGenome(clearanceScores);
  res.json({ genome });
});

export default router;
