import { generateAllPhilosophies } from '../server/engines/optimization/philosophyEngine.js';
import { checkCollisions, resolveCollisions } from '../server/engines/collision.js';
import { calculateClearance } from '../server/engines/clearance.js';
import { generateGenome } from '../server/engines/genome.js';
import { PHILOSOPHY_WEIGHTS } from '../server/engines/optimization/candidateGenerator.js';
import { generateRoast } from '../server/engines/critic.js';
import { calculateCognitiveLoad } from '../server/engines/cognitive.js';
import { detectFocalPoint } from '../server/engines/intelligence/focalPointEngine.js';
import { buildRelationshipGraph } from '../server/engines/intelligence/relationshipGraph.js';
import { evaluateAffordanceClearances } from '../server/engines/intelligence/affordanceEngine.js';
import { calculateCirculationPaths } from '../server/engines/geometry/circulation.js';
import { generateLayoutReasoning } from '../server/engines/explainability/reasoning.js';
import { parseIntent } from '../server/engines/intent/intentParser.js';

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { room, structuralElements, furniture, vibe, prompt } = req.body;

    const intent = prompt ? await parseIntent(prompt, vibe || 'cozy') : null;

    const fixedElements = (structuralElements || []).map(el => {
      let x = el.x !== undefined ? el.x : 0;
      let y = el.y !== undefined ? el.y : 0;
      let rotation = el.rotation !== undefined ? el.rotation : 0;
      let depth = el.depth !== undefined ? el.depth : (el.type === 'pillar' || el.type === 'column' ? 2 : 0.5);
      if (el.wall === 'top' && el.y === undefined) { x = el.position || 0; y = 0; }
      else if (el.wall === 'bottom' && el.y === undefined) { x = el.position || 0; y = room.length; }
      else if (el.wall === 'left' && el.x === undefined) { x = 0; y = el.position || 0; rotation = Math.PI / 2; }
      else if (el.wall === 'right' && el.x === undefined) { x = room.width; y = el.position || 0; rotation = Math.PI / 2; }
      else if (el.wall === 'interior' || el.wall === 'center') { x = el.x || el.position || room.width / 2; y = el.y || room.length / 2; }
      return { ...el, x, y, width: el.width || (el.type === 'pillar' || el.type === 'column' ? 2 : 3), depth, rotation };
    });

    const focalPoint = detectFocalPoint(room, fixedElements, furniture);
    const graphResult = buildRelationshipGraph(furniture, focalPoint);
    const philosophyLayouts = generateAllPhilosophies(room, furniture, fixedElements, focalPoint);

    const options = await Promise.all(philosophyLayouts.map(async (ph) => {
      ph.layout = resolveCollisions(ph.layout, room, fixedElements);
      const collisions = checkCollisions(ph.layout);
      const clearanceScores = calculateClearance(room, fixedElements, ph.layout);
      const genome = generateGenome(clearanceScores);
      const cognitiveLoad = calculateCognitiveLoad(room, ph.layout);
      const roast = await generateRoast(clearanceScores, genome, collisions);
      const affordanceResult = evaluateAffordanceClearances(ph.layout, room, fixedElements);
      const circulationResult = calculateCirculationPaths(room, fixedElements, ph.layout);
      const reasoningResult = generateLayoutReasoning(ph.layout, room, focalPoint, ph.id, affordanceResult, circulationResult);
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
        scoreTotal: ph.scoreTotal || 0,
        scoreBreakdown: ph.scoreBreakdown || {},
        explanation: ph.explanation || '',
        fitWarnings: ph.fitWarnings || [],
        philosophyWeights: weights,
      };
    }));

    // Sort by vibe preference
    if (vibe === 'cozy') {
      const order = ['philosophy-cozy', 'philosophy-family', 'philosophy-humanist', 'philosophy-sunset'];
      options.sort((a, b) => { const ai = order.indexOf(a.id), bi = order.indexOf(b.id); if (ai !== -1 && bi !== -1) return ai - bi; if (ai !== -1) return -1; if (bi !== -1) return 1; return 0; });
    } else if (vibe === 'space_saver') {
      const order = ['philosophy-architect', 'philosophy-minimalist', 'philosophy-executive', 'philosophy-cinema'];
      options.sort((a, b) => { const ai = order.indexOf(a.id), bi = order.indexOf(b.id); if (ai !== -1 && bi !== -1) return ai - bi; if (ai !== -1) return -1; if (bi !== -1) return 1; return 0; });
    } else if (vibe === 'aesthetic') {
      const order = ['philosophy-curator', 'philosophy-grand', 'philosophy-fengshui', 'philosophy-entertainer'];
      options.sort((a, b) => { const ai = order.indexOf(a.id), bi = order.indexOf(b.id); if (ai !== -1 && bi !== -1) return ai - bi; if (ai !== -1) return -1; if (bi !== -1) return 1; return 0; });
    }

    res.json({ options, focalPoint, relationshipGraph: graphResult, intent });
  } catch (error) {
    console.error('generate-layout error:', error);
    res.status(500).json({ error: 'Failed to generate layout', message: error.message, stack: error.stack });
  }
}
