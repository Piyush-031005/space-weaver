import {
  generateCandidates,
  scoreLayout,
  PHILOSOPHY_WEIGHTS
} from '../engines/optimization/candidateGenerator.js';
import fs from 'fs';

// Helper to extract the SA refinement function (since it's not exported, we copy its logic here for benchmarking)
// Wait, SA is executed inside generateScoredLayout. We can just test it by copying the SA code, or just run generateScoredLayout and intercept before SA. 
// Actually, it's better to just write the benchmark logic here directly to get precise before/after.

import { generateScoredLayout } from '../engines/optimization/candidateGenerator.js';

// Test Rooms
const TEST_ROOMS = [
  { label: "Tiny Studio (8x10ft)", room: { width: 8, length: 10 }, furniture: [{ id: 'sofa-1', type: 'sofa', width: 5, depth: 2.5 }, { id: 'table-1', type: 'table', width: 2.5, depth: 1.5 }], fixedElements: [{ id: 'door-1', type: 'door', x: 4, y: 0, wall: 'top' }], focalPoint: { x: 4, y: 1 } },
  { label: "Small Bedroom (10x12ft)", room: { width: 10, length: 12 }, furniture: [{ id: 'bed-1', type: 'bed', width: 5, depth: 6.5 }, { id: 'wardrobe-1', type: 'wardrobe', width: 4, depth: 2 }, { id: 'desk-1', type: 'desk', width: 4, depth: 2 }], fixedElements: [{ id: 'door-1', type: 'door', x: 2, y: 0, wall: 'top' }], focalPoint: null },
  { label: "Standard Living (15x18ft)", room: { width: 15, length: 18 }, furniture: [{ id: 'sofa-1', type: 'sofa', width: 6.5, depth: 3 }, { id: 'chair-1', type: 'chair', width: 2.5, depth: 2.5 }, { id: 'table-1', type: 'table', width: 3.5, depth: 2 }, { id: 'tv-1', type: 'tv', width: 5, depth: 1.5 }], fixedElements: [{ id: 'door-1', type: 'door', x: 3, y: 0, wall: 'top' }], focalPoint: { x: 7.5, y: 1 } },
  { label: "Large Living (18x22ft)", room: { width: 18, length: 22 }, furniture: [{ id: 'sofa-1', type: 'sofa', width: 7, depth: 3 }, { id: 'sofa-2', type: 'sofa', width: 6, depth: 2.8 }, { id: 'table-1', type: 'table', width: 4, depth: 2.5 }, { id: 'tv-1', type: 'tv', width: 5, depth: 1.5 }, { id: 'bookshelf-1', type: 'bookshelf', width: 3, depth: 1 }], fixedElements: [{ id: 'door-1', type: 'door', x: 4, y: 0, wall: 'top' }], focalPoint: { x: 9, y: 1 } }
];

console.log("🚀 Benchmarking Simulated Annealing (SA) vs Pure Random Search...\n");

for (const testCase of TEST_ROOMS) {
  // We use philosophy-executive for a balanced weight vector
  const weights = PHILOSOPHY_WEIGHTS['philosophy-executive'];
  
  const startTime = Date.now();
  // 1. Generate candidate pool (200)
  const candidates = generateCandidates(testCase.room, testCase.furniture, testCase.fixedElements, testCase.focalPoint, 200);
  
  // 2. Score candidates
  const scored = candidates.map(layout => ({
    layout,
    scores: scoreLayout(layout, testCase.room, testCase.fixedElements, testCase.focalPoint, weights)
  }));
  scored.sort((a, b) => b.scores.total - a.scores.total);
  
  if (!scored[0]) continue;
  
  const bestRandomScore = scored[0].scores.total;
  
  // 3. Run generateScoredLayout which internally runs SA
  const result = generateScoredLayout(testCase.room, testCase.furniture, testCase.fixedElements, testCase.focalPoint, 'philosophy-executive', candidates);
  
  const finalSaScore = result.scoreTotal / 100; // It returns out of 100
  const improvement = ((finalSaScore - bestRandomScore) / bestRandomScore * 100).toFixed(2);
  const timeMs = Date.now() - startTime;

  console.log(`📐 ${testCase.label}`);
  console.log(`   Best Random Score : ${(bestRandomScore * 100).toFixed(1)}`);
  console.log(`   Score After SA    : ${(finalSaScore * 100).toFixed(1)}`);
  console.log(`   Improvement (Δ)   : +${improvement}%`);
  console.log(`   Time Taken        : ${timeMs}ms\n`);
}
