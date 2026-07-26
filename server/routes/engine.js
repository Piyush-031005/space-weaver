import express from 'express';
import { checkCollisions } from '../engines/collision.js';
import { calculateClearance } from '../engines/clearance.js';
import { generateGenome } from '../engines/genome.js';
import { generateRoast } from '../engines/critic.js';
import { calculateCognitiveLoad } from '../engines/cognitive.js';

// HSRE Imports
import { detectFocalPoint } from '../engines/intelligence/focalPointEngine.js';
import { buildRelationshipGraph } from '../engines/intelligence/relationshipGraph.js';
import { evaluateAffordanceClearances } from '../engines/intelligence/affordanceEngine.js';
import { calculateCirculationPaths } from '../engines/geometry/circulation.js';
import { generateAllPhilosophies } from '../engines/optimization/philosophyEngine.js';
import { generateLayoutReasoning } from '../engines/explainability/reasoning.js';

const router = express.Router();

router.post('/analyze-space', (req, res) => {
  const { room, structuralElements } = req.body;
  res.json({ status: 'analyzed', area: room.width * room.length });
});

router.post('/generate-layout', async (req, res) => {
  try {
    const { room, structuralElements, furniture, vibe } = req.body;
    const fixedElements = (structuralElements || []).map(el => {
      let x = 0, y = 0, rotation = 0;
      if (el.wall === 'top') { x = el.position; y = 0; }
      else if (el.wall === 'bottom') { x = el.position; y = room.length; }
      else if (el.wall === 'left') { x = 0; y = el.position; rotation = Math.PI/2; }
      else if (el.wall === 'right') { x = room.width; y = el.position; rotation = Math.PI/2; }
      return { ...el, x, y, width: el.width, depth: 0.5, rotation };
    });

    // 1. Detect Primary Focal Point
    const focalPoint = detectFocalPoint(room, fixedElements, furniture);
    
    // 2. Build Relationship Graph
    const graphResult = buildRelationshipGraph(furniture, focalPoint);

    // 3. Generate 3 Cinematic Expert Philosophies (Curator, Architect, Humanist)
    const philosophyLayouts = generateAllPhilosophies(room, furniture, fixedElements, focalPoint);
    const options = [];

    for (const ph of philosophyLayouts) {
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
        ph.id.replace('philosophy-', 'the_'), 
        affordanceResult, 
        circulationResult
      );

      options.push({
        id: ph.id,
        name: ph.title,
        desc: ph.tagline,
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
        focalPoint
      });
    }

    res.json({ options, focalPoint, relationshipGraph: graphResult });
  } catch (error) {
    console.error("HSRE Layout Generation Error:", error);
    res.status(500).json({ error: "Failed to generate layout", stack: error.stack });
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
