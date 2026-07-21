import express from 'express';
import { scorePlacement } from '../engines/scoring.js';
import { checkCollisions } from '../engines/collision.js';
import { calculateClearance } from '../engines/clearance.js';
import { generateGenome } from '../engines/genome.js';
import { generateRoast } from '../engines/critic.js';

const router = express.Router();

router.post('/generate-layout', async (req, res) => {
  try {
    const vibes = [
      { id: 'space_saver', name: 'Efficiency (Space Saver)', desc: 'Maximizes open floor space in the center.' },
      { id: 'cozy', name: 'Intimacy (Cozy & Comfy)', desc: 'Pulls seating together for conversation.' },
      { id: 'aesthetic', name: 'Gallery (Aesthetic)', desc: 'Symmetrical alignment with breathing room.' }
    ];

    const options = [];

    for (const vibeOption of vibes) {
      // 1. Scoring Engine: Generate initial placement based on vibe mode
      const layout = scorePlacement(room, fixedElements, furniture, vibeOption.id);

      // 2. Collision Engine: Validate overlaps
      const collisions = checkCollisions(layout);

      // 3. Living Path Engine: Calculate walking clearances and access
      const clearanceScores = calculateClearance(room, fixedElements, layout);

      // 4. Space Genome Engine: Generate archetype and metrics
      const genome = generateGenome(clearanceScores);
      
      // 5. Critic Engine: Call Claude API to generate witty roast lines based on metrics
      // (Using await in loop is fine here as it's mock API currently)
      const roast = await generateRoast(clearanceScores, genome, collisions);

      options.push({
        id: vibeOption.id,
        name: vibeOption.name,
        desc: vibeOption.desc,
        layout,
        clearanceScores,
        genome,
        roast,
        collisions
      });
    }

    res.json({
      options // Return the array of 3 generated options
    });
  } catch (error) {
    console.error("Layout generation error:", error);
    res.status(500).json({ error: "Failed to generate layout" });
  }
});

export default router;
