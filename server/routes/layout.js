import express from 'express';
import { scorePlacement } from '../engines/scoring.js';
import { checkCollisions } from '../engines/collision.js';
import { calculateClearance } from '../engines/clearance.js';
import { generateGenome } from '../engines/genome.js';
import { generateRoast } from '../engines/critic.js';

const router = express.Router();

router.post('/generate-layout', async (req, res) => {
  try {
    const { room, structuralElements, furniture, vibe } = req.body;

    const fixedElements = (structuralElements || []).map(el => {
      // Map wall position to actual x, y coordinates
      let x = 0;
      let y = 0;
      let depth = 0.5; // doors/windows have minimal depth intrusion
      let width = el.width;
      let rotation = 0;

      if (el.wall === 'top') {
        x = el.position;
        y = 0;
        rotation = 0;
      } else if (el.wall === 'bottom') {
        x = el.position;
        y = room.length;
        rotation = 0;
      } else if (el.wall === 'left') {
        x = 0;
        y = el.position;
        rotation = Math.PI / 2;
      } else if (el.wall === 'right') {
        x = room.width;
        y = el.position;
        rotation = Math.PI / 2;
      }

      return {
        ...el,
        x, y, width, depth, rotation
      };
    });

    const vibeDefinitions = {
      space_saver: { id: 'space_saver', name: 'Efficiency (Space Saver)', baseDesc: 'Maximizes open floor space in the center.' },
      cozy: { id: 'cozy', name: 'Intimacy (Cozy & Comfy)', baseDesc: 'Pulls seating together for conversation.' },
      aesthetic: { id: 'aesthetic', name: 'Gallery (Aesthetic)', baseDesc: 'Symmetrical alignment with breathing room.' }
    };

    const activeVibe = vibeDefinitions[vibe] || vibeDefinitions['space_saver'];
    const options = [];

    for (let i = 1; i <= 9; i++) {
      // 1. Scoring Engine: Generate initial placement based on vibe mode AND variation
      const { layout, droppedItems } = scorePlacement(room, fixedElements, furniture, activeVibe.id, i);

      // 2. Collision Engine: Validate overlaps
      const collisions = checkCollisions(layout);

      // 3. Living Path Engine: Calculate walking clearances and access
      const clearanceScores = calculateClearance(room, fixedElements, layout);

      // 4. Space Genome Engine: Generate archetype and metrics
      const genome = generateGenome(clearanceScores);
      
      // 5. Critic Engine: Call Claude API to generate witty roast lines based on metrics
      const roast = await generateRoast(clearanceScores, genome, collisions);

      options.push({
        id: `${activeVibe.id}_var${i}`,
        name: `${activeVibe.name} - Var ${i}`,
        desc: `${activeVibe.baseDesc} (Configuration ${i})`,
        layout,
        droppedItems,
        clearanceScores,
        genome,
        roast,
        collisions
      });
    }

    // Sort options by spaceSavedPercentage descending
    options.sort((a, b) => b.clearanceScores.spaceSavedPercentage - a.clearanceScores.spaceSavedPercentage);

    // Reassign names to match the sorted order
    options.forEach((opt, idx) => {
      opt.name = `${activeVibe.name} - Var ${idx + 1}`;
      opt.desc = `${activeVibe.baseDesc} (Configuration ${idx + 1})`;
    });

    res.json({
      options // Return the array of 6 generated variations
    });
  } catch (error) {
    console.error("Layout generation error:", error);
    res.status(500).json({ error: "Failed to generate layout", stack: error.stack });
  }
});

export default router;
