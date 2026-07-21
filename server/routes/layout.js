import express from 'express';
import { scorePlacement } from '../engines/scoring.js';
import { checkCollisions } from '../engines/collision.js';
import { calculateClearance } from '../engines/clearance.js';
import { generateGenome } from '../engines/genome.js';
import { generateRoast } from '../engines/critic.js';

const router = express.Router();

router.post('/generate-layout', async (req, res) => {
  try {
    const { room, fixedElements, furniture, vibe } = req.body;

    // 1. Scoring Engine: Generate initial placement based on vibe mode
    const layout = scorePlacement(room, fixedElements, furniture, vibe);

    // 2. Collision Engine: Validate overlaps (and theoretically nudge, but for v1 just flag)
    const collisions = checkCollisions(layout);

    // 3. Living Path Engine: Calculate walking clearances and access
    const clearanceScores = calculateClearance(room, fixedElements, layout);

    // 4. Space Genome Engine: Generate archetype and metrics
    const genome = generateGenome(clearanceScores);

    // 5. Critic Engine: Call Claude API to generate witty roast lines based on metrics
    const roast = await generateRoast(clearanceScores, genome, collisions);

    res.json({
      layout,
      clearanceScores,
      genome,
      roast,
      collisions
    });
  } catch (error) {
    console.error("Layout generation error:", error);
    res.status(500).json({ error: "Failed to generate layout" });
  }
});

export default router;
