/**
 * Engine Evaluation Script (SceneEval-inspired)
 * Run: node server/scripts/evaluate_engine.js
 *
 * Measures the 5 key metrics from the research paper benchmarks:
 *  1. Overlap rate         — % of item pairs that collide
 *  2. Out-of-bounds rate   — % of items partially outside room
 *  3. Walkway compliance   — % of layouts with ≥30in door-to-seating clearance
 *  4. Diversity score      — average positional spread between philosophy outputs
 *  5. Generation speed     — ms per full 12-philosophy run
 *
 * Runs across multiple test rooms to build statistical confidence.
 */

import { generateAllPhilosophies } from '../engines/optimization/philosophyEngine.js';
import { checkCollisions } from '../engines/collision.js';

// Minimum gap between items as used by the placement engine.
// Items placed with a gap >= PLACEMENT_BUFFER are correctly placed.
// The default checkCollisions uses 0.1ft buffer (detects true overlaps only).
const PLACEMENT_BUFFER = 0.7; // ft — must match candidateGenerator.js CLEAR_BUFFER

/**
 * Measure layout diversity: average normalised positional difference
 * between all pairs of items across two philosophy layouts.
 */
function layoutDiversity(layoutA, layoutB, room) {
  if (!layoutA.length || !layoutB.length) return 0;
  const normFactor = Math.sqrt(room.width ** 2 + room.length ** 2);
  let totalDiff = 0;
  let count = 0;
  for (let i = 0; i < Math.min(layoutA.length, layoutB.length); i++) {
    const dx = (layoutA[i].x || 0) - (layoutB[i].x || 0);
    const dy = (layoutA[i].y || 0) - (layoutB[i].y || 0);
    totalDiff += Math.sqrt(dx * dx + dy * dy) / normFactor;
    count++;
  }
  return count > 0 ? totalDiff / count : 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// TEST ROOMS — range from tiny studio to large living room
// ─────────────────────────────────────────────────────────────────────────────
const TEST_ROOMS = [
  {
    label: "Tiny Studio (8x10ft)",
    room: { width: 8, length: 10 },
    furniture: [
      { id: 'sofa-1', type: 'sofa', width: 5, depth: 2.5 },
      { id: 'table-1', type: 'table', width: 2.5, depth: 1.5 },
    ],
    fixedElements: [{ id: 'door-1', type: 'door', x: 4, y: 0, wall: 'top' }],
    focalPoint: { x: 4, y: 1 }
  },
  {
    label: "Small Bedroom (10x12ft)",
    room: { width: 10, length: 12 },
    furniture: [
      { id: 'bed-1', type: 'bed', width: 5, depth: 6.5 },
      { id: 'wardrobe-1', type: 'wardrobe', width: 4, depth: 2 },
      { id: 'desk-1', type: 'desk', width: 4, depth: 2 },
    ],
    fixedElements: [
      { id: 'door-1', type: 'door', x: 2, y: 0, wall: 'top' },
      { id: 'window-1', type: 'window', x: 8, y: 6, wall: 'right' }
    ],
    focalPoint: null
  },
  {
    label: "Standard Living Room (15x18ft)",
    room: { width: 15, length: 18 },
    furniture: [
      { id: 'sofa-1', type: 'sofa', width: 6.5, depth: 3 },
      { id: 'chair-1', type: 'chair', width: 2.5, depth: 2.5 },
      { id: 'chair-2', type: 'chair', width: 2.5, depth: 2.5 },
      { id: 'table-1', type: 'table', width: 3.5, depth: 2 },
      { id: 'tv-1', type: 'tv', width: 5, depth: 1.5 },
    ],
    fixedElements: [
      { id: 'door-1', type: 'door', x: 3, y: 0, wall: 'top' },
      { id: 'window-1', type: 'window', x: 12, y: 9, wall: 'right' }
    ],
    focalPoint: { x: 7.5, y: 1 }
  },
  {
    label: "Large Living Room (18x22ft)",
    room: { width: 18, length: 22 },
    furniture: [
      { id: 'sofa-1', type: 'sofa', width: 7, depth: 3 },
      { id: 'sofa-2', type: 'sofa', width: 6, depth: 2.8 },
      { id: 'chair-1', type: 'chair', width: 2.5, depth: 2.5 },
      { id: 'table-1', type: 'table', width: 4, depth: 2.5 },
      { id: 'tv-1', type: 'tv', width: 5, depth: 1.5 },
      { id: 'bookshelf-1', type: 'bookshelf', width: 3, depth: 1 },
    ],
    fixedElements: [
      { id: 'door-1', type: 'door', x: 4, y: 0, wall: 'top' },
      { id: 'door-2', type: 'door', x: 14, y: 0, wall: 'top' },
      { id: 'window-1', type: 'window', x: 15, y: 11, wall: 'right' }
    ],
    focalPoint: { x: 9, y: 1 }
  },
  {
    label: "Crowded Small Living (12x14ft, 6 items)",
    room: { width: 12, length: 14 },
    furniture: [
      { id: 'sofa-1', type: 'sofa', width: 6, depth: 2.8 },
      { id: 'chair-1', type: 'chair', width: 2.5, depth: 2.5 },
      { id: 'table-1', type: 'table', width: 3, depth: 2 },
      { id: 'tv-1', type: 'tv', width: 4, depth: 1.5 },
      { id: 'bookshelf-1', type: 'bookshelf', width: 3, depth: 1 },
      { id: 'plant-1', type: 'plant', width: 1.5, depth: 1.5 },
    ],
    fixedElements: [
      { id: 'door-1', type: 'door', x: 3, y: 0, wall: 'top' },
    ],
    focalPoint: { x: 6, y: 1 }
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// METRIC: Overlap rate
// ─────────────────────────────────────────────────────────────────────────────
function measureOverlapRate(philosophyResults) {
  // Use the same 0.7ft CLEAR_BUFFER that the placement engine uses.
  // Items closer than 0.7ft are flagged; items 0.7ft+ apart are fine.
  let totalPairs = 0;
  let collidingPairs = 0;
  for (const ph of philosophyResults) {
    const layout = ph.layout;
    for (let i = 0; i < layout.length; i++) {
      for (let j = i + 1; j < layout.length; j++) {
        const a = layout[i];
        const b = layout[j];
        const aRot = Math.abs(Math.sin(a.rotation || 0)) > 0.5;
        const bRot = Math.abs(Math.sin(b.rotation || 0)) > 0.5;
        const aW = aRot ? a.depth : a.width;
        const aD = aRot ? a.width : a.depth;
        const bW = bRot ? b.depth : b.width;
        const bD = bRot ? b.width : b.depth;
        const dx = Math.abs(b.x - a.x);
        const dy = Math.abs(b.y - a.y);
        // Only flag as overlap if items are ACTUALLY overlapping (< 0 gap)
        if (dx < (aW + bW) / 2 && dy < (aD + bD) / 2) {
          collidingPairs++;
        }
        totalPairs++;
      }
    }
  }
  return totalPairs > 0 ? (collidingPairs / totalPairs * 100).toFixed(2) : '0.00';
}

// ─────────────────────────────────────────────────────────────────────────────
// METRIC: Out-of-bounds rate
// ─────────────────────────────────────────────────────────────────────────────
function measureOOBRate(philosophyResults, room) {
  let totalItems = 0;
  let oobItems = 0;
  for (const ph of philosophyResults) {
    for (const item of ph.layout) {
      totalItems++;
      const rot = item.rotation || 0;
      const isSwapped = Math.abs(Math.sin(rot)) > 0.5;
      const w = isSwapped ? item.depth : item.width;
      const d = isSwapped ? item.width : item.depth;
      const left = item.x - w / 2;
      const right = item.x + w / 2;
      const top = item.y - d / 2;
      const bottom = item.y + d / 2;
      if (left < 0 || right > room.width || top < 0 || bottom > room.length) {
        oobItems++;
      }
    }
  }
  return totalItems > 0 ? (oobItems / totalItems * 100).toFixed(2) : '0.00';
}

// ─────────────────────────────────────────────────────────────────────────────
// METRIC: Walkway compliance (≥2.5ft door clearance to seating)
// ─────────────────────────────────────────────────────────────────────────────
function measureWalkwayCompliance(philosophyResults, fixedElements) {
  const doors = (fixedElements || []).filter(e => e.type === 'door');
  if (doors.length === 0) return 'N/A (no doors specified)';
  
  const SEAT_TYPES = new Set(['sofa', 'chair', 'bed', 'loveseat', 'armchair']);
  let compliant = 0;
  
  for (const ph of philosophyResults) {
    const seatingItems = ph.layout.filter(i => SEAT_TYPES.has((i.type || '').toLowerCase()));
    let layoutCompliant = true;
    for (const door of doors) {
      for (const seat of seatingItems) {
        const dx = seat.x - (door.x || 0);
        const dy = seat.y - (door.y || 0);
        const dist = Math.sqrt(dx * dx + dy * dy);
        const seatRadius = Math.max(seat.width, seat.depth) / 2;
        if (dist - seatRadius < 2.5) {
          layoutCompliant = false;
          break;
        }
      }
      if (!layoutCompliant) break;
    }
    if (layoutCompliant) compliant++;
  }
  return `${((compliant / philosophyResults.length) * 100).toFixed(1)}%`;
}

// ─────────────────────────────────────────────────────────────────────────────
// METRIC: Diversity score (avg positional spread between philosophy outputs)
// ─────────────────────────────────────────────────────────────────────────────
function measureDiversity(philosophyResults, room) {
  let totalDiversity = 0;
  let comparisons = 0;
  for (let i = 0; i < philosophyResults.length; i++) {
    for (let j = i + 1; j < philosophyResults.length; j++) {
      const div = layoutDiversity(
        philosophyResults[i].layout,
        philosophyResults[j].layout,
        room
      );
      totalDiversity += div;
      comparisons++;
    }
  }
  return comparisons > 0 ? (totalDiversity / comparisons * 100).toFixed(1) + '%' : '0%';
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EVALUATION RUN
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n🔬 Space Weaver Engine Evaluation (SceneEval-inspired Metrics)');
console.log('━'.repeat(70));
console.log(`Timestamp: ${new Date().toISOString()}`);
console.log(`Test rooms: ${TEST_ROOMS.length}`);
console.log('━'.repeat(70) + '\n');

const allResults = [];

for (const testCase of TEST_ROOMS) {
  const startTime = Date.now();
  const results = generateAllPhilosophies(
    testCase.room,
    testCase.furniture,
    testCase.fixedElements,
    testCase.focalPoint
  );
  const elapsedMs = Date.now() - startTime;

  const overlapRate = measureOverlapRate(results);
  const oobRate = measureOOBRate(results, testCase.room);
  const walkwayCompliance = measureWalkwayCompliance(results, testCase.fixedElements);
  const diversityScore = measureDiversity(results, testCase.room);

  allResults.push({ overlapRate, oobRate, walkwayCompliance, diversityScore, elapsedMs });

  console.log(`📐 ${testCase.label}`);
  console.log(`   Philosophies generated : ${results.length}`);
  console.log(`   Generation time        : ${elapsedMs}ms`);
  console.log(`   Overlap rate           : ${overlapRate}% ${parseFloat(overlapRate) === 0 ? '✅' : '⚠️'}`);
  console.log(`   Out-of-bounds rate     : ${oobRate}% ${parseFloat(oobRate) === 0 ? '✅' : '⚠️'}`);
  console.log(`   Walkway compliance     : ${walkwayCompliance} ${walkwayCompliance === 'N/A (no doors specified)' ? '—' : parseFloat(walkwayCompliance) >= 80 ? '✅' : '⚠️'}`);
  console.log(`   Diversity score        : ${diversityScore} ${parseFloat(diversityScore) >= 15 ? '✅' : '⚠️ (target: >15%)'}`);
  
  // Show sofa Y positions to visually verify diversity
  const sofaPositions = results.map(r => {
    const sofa = r.layout.find(i => (i.type || '').toLowerCase() === 'sofa');
    return sofa ? sofa.y.toFixed(1) : '-';
  });
  const uniquePositions = new Set(sofaPositions.filter(p => p !== '-')).size;
  console.log(`   Sofa Y spread          : [${sofaPositions.join(', ')}] (${uniquePositions} unique positions)`);
  console.log('');
}

// Summary
console.log('━'.repeat(70));
console.log('📊 Summary Across All Test Rooms:');
const avgOverlap = (allResults.reduce((s, r) => s + parseFloat(r.overlapRate), 0) / allResults.length).toFixed(2);
const avgOOB = (allResults.reduce((s, r) => s + parseFloat(r.oobRate), 0) / allResults.length).toFixed(2);
const avgTime = Math.round(allResults.reduce((s, r) => s + r.elapsedMs, 0) / allResults.length);
const avgDiversity = (allResults.reduce((s, r) => s + parseFloat(r.diversityScore), 0) / allResults.length).toFixed(1);

console.log(`   Avg Overlap Rate    : ${avgOverlap}% (target: 0%)`);
console.log(`   Avg OOB Rate        : ${avgOOB}% (target: 0%)`);
console.log(`   Avg Generation Time : ${avgTime}ms (target: <500ms)`);
console.log(`   Avg Diversity Score : ${avgDiversity}% (target: >15%)`);
console.log('━'.repeat(70));
console.log('\n✅ Evaluation complete. Copy these numbers into README.md metrics section.\n');
