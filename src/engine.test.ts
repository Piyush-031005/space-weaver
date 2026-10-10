import { describe, it, expect, vi } from 'vitest';
import { generateCandidates, scoreLayout, PHILOSOPHY_WEIGHTS } from '../server/engines/optimization/candidateGenerator.js';
import { parseIntent, LLM_METRICS } from '../server/engines/intent/intentParser.js';

describe('Spatial Engine Regression Tests', () => {
  it('should not throw NaN in getAABB when fixed elements lack width/depth (Issue #41)', () => {
    const room = { width: 10, length: 12 };
    const furniture = [
      { id: 'f1', type: 'sofa', width: 6, depth: 3 }
    ];
    const fixedElements = [
      { id: 'door-1', type: 'door', x: 2, y: 0, wall: 'top' } // Missing width/depth
    ];

    // Before the fix, this would either loop forever or return overlap=true for everything
    // causing validCandidates to remain 0 and candidates.length = 0.
    const candidates = generateCandidates(room, furniture, fixedElements, null, 10);
    
    // We expect it to generate candidates properly without NaN math failure
    expect(candidates.length).toBeGreaterThan(0);
    
    // Check that the item actually got placed
    expect(candidates[0][0].x).toBeDefined();
    expect(candidates[0][0].y).toBeDefined();
    expect(Number.isNaN(candidates[0][0].x)).toBe(false);
  });

  it('scoring should be completely deterministic (same layout + weights = exact same score)', () => {
    const room = { width: 15, length: 18 };
    const layout = [
      { id: 'sofa-1', type: 'sofa', width: 6, depth: 3, x: 7.5, y: 9, rotation: 0 },
      { id: 'tv-1', type: 'tv', width: 4, depth: 1, x: 7.5, y: 1.5, rotation: 0 }
    ];
    const fixedElements = [{ id: 'door-1', type: 'door', x: 3, y: 0, wall: 'top', width: 3, depth: 0 }];
    const focalPoint = { x: 7.5, y: 1.5 };
    const weights = PHILOSOPHY_WEIGHTS['philosophy-executive'];

    const score1 = scoreLayout(layout, room, fixedElements, focalPoint, weights);
    const score2 = scoreLayout(layout, room, fixedElements, focalPoint, weights);

    expect(score1.total).toEqual(score2.total);
    expect(score1.breakdown).toEqual(score2.breakdown);
  });
});

describe('Intent Engine LLM Hardening', () => {
  it('should fallback to rule-based parser on timeout or invalid schema', async () => {
    // Mock the env var so it attempts LLM
    process.env.GEMINI_API_KEY = 'fake_key';

    const result = await parseIntent('small room cozy vibes', 'cozy');

    // Since the key is fake, it will fail to call the API, catch the error, and fallback
    expect(result.philosophyId).toBe('philosophy-cozy');
    expect(result.signals).toContain('size:small');
    expect(LLM_METRICS.fallbackCount).toBeGreaterThan(0);
    
    delete process.env.GEMINI_API_KEY;
  });
});
