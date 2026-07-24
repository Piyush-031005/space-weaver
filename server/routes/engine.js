import express from 'express';
import { scorePlacement } from '../engines/scoring.js';
import { checkCollisions } from '../engines/collision.js';
import { calculateClearance } from '../engines/clearance.js';
import { generateGenome } from '../engines/genome.js';
import { generateRoast } from '../engines/critic.js';
import { calculateCognitiveLoad } from '../engines/cognitive.js';

const router = express.Router();

router.post('/analyze-space', (req, res) => {
  // Geometry & Constraints
  const { room, structuralElements } = req.body;
  res.json({ status: 'analyzed', area: room.width * room.length });
});

router.post('/generate-layout', async (req, res) => {
  // Legacy / monolithic generator, to be deprecated, or wrap other engines
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

    const activeVibe = vibe || 'space_saver';
    const options = [];

    for (let i = 1; i <= 3; i++) {
      const { layout, droppedItems } = scorePlacement(room, fixedElements, furniture, activeVibe, i);
      const collisions = checkCollisions(layout);
      const clearanceScores = calculateClearance(room, fixedElements, layout);
      const genome = generateGenome(clearanceScores);
      const cognitiveLoad = calculateCognitiveLoad(room, layout);
      
      options.push({
        id: `${activeVibe}_var${i}`,
        name: `Configuration ${i}`,
        desc: `Layout Variation ${i}`,
        layout,
        droppedItems,
        clearanceScores,
        genome,
        cognitiveLoad,
        collisions
      });
    }

    res.json({ options });
  } catch (error) {
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
