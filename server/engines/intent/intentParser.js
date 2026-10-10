/**
 * intentParser.js — Natural Language → Philosophy Weight Overrides
 *
 * This is Space Weaver's "AI intent layer". It takes a freeform user prompt
 * ("small room, I study at night, want cozy vibes") and maps it to:
 *   1. A recommended philosophy ID (which weight vector to use as base)
 *   2. Weight overrides that tune the base vector
 *   3. A structured intent object (room signals, use-case, lifestyle)
 *
 * ARCHITECTURE DECISION (Oct 2026):
 *   Right now: Rule-based keyword matching (fast, no API cost, interpretable).
 *   Week 8: Swap parseIntent() to call an LLM with a structured prompt, 
 *   keeping the same output shape. The rest of the engine is unchanged.
 *   The log entry format already captures rawPrompt for future fine-tuning.
 *
 * NO EXTERNAL API CALLS. This runs in <1ms on-device.
 */

import { GoogleGenAI } from '@google/genai';

// ─────────────────────────────────────────────────────────────────────────────
// KEYWORD → SIGNAL MAPS
// ─────────────────────────────────────────────────────────────────────────────

const ROOM_SIZE_SIGNALS = {
  tiny:    ['tiny', 'very small', 'compact', 'cramped', 'micro', 'small flat', 'studio', 'bhk'],
  small:   ['small', '1 bhk', 'one bhk', 'modest', 'limited', 'tight', 'narrow'],
  medium:  ['medium', '2 bhk', 'two bhk', 'normal', 'average', 'standard'],
  large:   ['large', 'big', 'spacious', 'open', '3 bhk', 'three bhk', 'duplex', 'villa'],
};

const USAGE_SIGNALS = {
  work:       ['work', 'study', 'office', 'desk', 'laptop', 'focus', 'wfh', 'productive', 'meetings', 'zoom'],
  social:     ['entertain', 'party', 'guests', 'friends', 'gathering', 'hosting', 'social', 'family get', 'diwali'],
  sleep:      ['sleep', 'rest', 'relax', 'bedroom', 'nap', 'quiet', 'calm'],
  cinema:     ['movie', 'cinema', 'tv', 'netflix', 'watch', 'screen', 'binge', 'home theater'],
  family:     ['family', 'kids', 'children', 'elderly', 'parents', 'grandparents', 'toddler', 'baby'],
  meditation: ['meditate', 'yoga', 'spiritual', 'pooja', 'prayer', 'zen', 'mindful'],
};

const VIBE_SIGNALS = {
  cozy:       ['cozy', 'warm', 'snug', 'hygge', 'comfort', 'homely', 'inviting', 'comfortable'],
  minimal:    ['minimal', 'clean', 'simple', 'clutter', 'less is more', 'sparse', 'open space', 'breathe'],
  grand:      ['grand', 'luxury', 'premium', 'royal', 'opulent', 'bold', 'statement', 'wow'],
  modern:     ['modern', 'contemporary', 'sleek', 'sharp', 'architect', 'geometric'],
  natural:    ['natural', 'light', 'bright', 'window', 'sunlight', 'airy', 'ventilation', 'fresh'],
  fengshui:   ['feng shui', 'vastu', 'energy', 'flow', 'harmony', 'balance', 'chi'],
};

const TIME_SIGNALS = {
  night:  ['night', 'evening', 'dark', 'lamp', 'mood lighting', 'after sunset'],
  day:    ['day', 'morning', 'afternoon', 'sunlight', 'daytime', 'daylight'],
};

// ─────────────────────────────────────────────────────────────────────────────
// SIGNAL → PHILOSOPHY MAPPING
// Maps detected signals to the best philosophy base + weight adjustments
// ─────────────────────────────────────────────────────────────────────────────

const SIGNAL_TO_PHILOSOPHY = {
  // Usage signals
  'usage:work':       { philosophy: 'philosophy-executive',  overrides: { walkway: +0.05, focal: -0.05 } },
  'usage:social':     { philosophy: 'philosophy-entertainer', overrides: { balance: +0.05, doorClear: +0.05 } },
  'usage:cinema':     { philosophy: 'philosophy-cinema',     overrides: { focal: +0.10 } },
  'usage:family':     { philosophy: 'philosophy-family',     overrides: { doorClear: +0.05, walkway: +0.05 } },
  'usage:meditation': { philosophy: 'philosophy-fengshui',   overrides: { balance: +0.10 } },
  'usage:sleep':      { philosophy: 'philosophy-cozy',       overrides: { wallAdj: +0.05 } },

  // Vibe signals
  'vibe:cozy':      { philosophy: 'philosophy-cozy',       overrides: { walkway: -0.05, wallAdj: +0.05 } },
  'vibe:minimal':   { philosophy: 'philosophy-minimalist', overrides: { walkway: +0.10 } },
  'vibe:grand':     { philosophy: 'philosophy-grand',      overrides: { balance: +0.05 } },
  'vibe:modern':    { philosophy: 'philosophy-architect',  overrides: { walkway: +0.05 } },
  'vibe:natural':   { philosophy: 'philosophy-sunset',     overrides: { light: +0.10 } },
  'vibe:fengshui':  { philosophy: 'philosophy-fengshui',   overrides: { balance: +0.05, doorClear: +0.05 } },

  // Room size modifiers (applied on top of philosophy)
  'size:tiny':   { philosophy: null, overrides: { walkway: +0.10, doorClear: +0.05 } },
  'size:small':  { philosophy: null, overrides: { walkway: +0.05 } },
  'size:large':  { philosophy: null, overrides: { balance: +0.05, focal: +0.05 } },

  // Time of use
  'time:night':  { philosophy: null, overrides: { light: -0.05 } }, // less window-chasing at night
  'time:day':    { philosophy: null, overrides: { light: +0.10 } },
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN: parseIntentRuleBased(prompt) → { philosophyId, weightOverrides, signals, explanation }
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Parse a freeform user prompt into structured intent using fast rules.
 *
 * @param {string} prompt — e.g. "small room, I study at night, want cozy vibes"
 * @param {string} baseVibe — vibe already selected in the UI (fallback if no vibe detected)
 * @returns {{ philosophyId: string, weightOverrides: object, signals: string[], explanation: string }}
 */
export function parseIntentRuleBased(prompt = '', baseVibe = 'cozy') {
  const lower = prompt.toLowerCase().trim();
  const detectedSignals = new Set();

  // ── Detect signals ──────────────────────────────────────────────────────
  for (const [size, keywords] of Object.entries(ROOM_SIZE_SIGNALS)) {
    if (keywords.some(k => lower.includes(k))) {
      detectedSignals.add(`size:${size}`);
      break;
    }
  }
  for (const [usage, keywords] of Object.entries(USAGE_SIGNALS)) {
    if (keywords.some(k => lower.includes(k))) detectedSignals.add(`usage:${usage}`);
  }
  for (const [vibe, keywords] of Object.entries(VIBE_SIGNALS)) {
    if (keywords.some(k => lower.includes(k))) detectedSignals.add(`vibe:${vibe}`);
  }
  for (const [time, keywords] of Object.entries(TIME_SIGNALS)) {
    if (keywords.some(k => lower.includes(k))) detectedSignals.add(`time:${time}`);
  }

  // ── Map signals to philosophy ───────────────────────────────────────────
  // Priority: usage > vibe > size > default
  const signals = [...detectedSignals];
  let philosophyId = `philosophy-${baseVibe}`; // fallback
  const weightOverrides = {};

  const orderedPriority = [
    signals.find(s => s.startsWith('usage:')),
    signals.find(s => s.startsWith('vibe:')),
    signals.find(s => s.startsWith('size:')),
    signals.find(s => s.startsWith('time:')),
  ].filter(Boolean);

  for (const signal of orderedPriority) {
    const mapping = SIGNAL_TO_PHILOSOPHY[signal];
    if (!mapping) continue;

    // First philosophy-providing signal wins
    if (mapping.philosophy && philosophyId === `philosophy-${baseVibe}`) {
      philosophyId = mapping.philosophy;
    }

    // Accumulate weight overrides (additive)
    for (const [key, delta] of Object.entries(mapping.overrides || {})) {
      weightOverrides[key] = (weightOverrides[key] || 0) + delta;
    }
  }

  // ── Generate explanation ────────────────────────────────────────────────
  const parts = [];
  if (signals.some(s => s.startsWith('size:'))) {
    const size = signals.find(s => s.startsWith('size:')).split(':')[1];
    if (size === 'tiny' || size === 'small') parts.push('prioritising walkway clearance for a compact room');
    if (size === 'large') parts.push('using the extra space for balance and focal alignment');
  }
  if (signals.some(s => s.startsWith('usage:'))) {
    const usage = signals.find(s => s.startsWith('usage:')).split(':')[1];
    const usageText = {
      work: 'optimising for desk accessibility and focus zones',
      social: 'maximising open space and door clearance for guests',
      cinema: 'pulling seating toward the focal TV wall',
      family: 'keeping walkways wide for kids and elderly',
      meditation: 'applying Vastu/Feng Shui balance principles',
      sleep: 'keeping seating close to walls for a restful atmosphere',
    }[usage];
    if (usageText) parts.push(usageText);
  }
  if (signals.some(s => s.startsWith('time:'))) {
    const time = signals.find(s => s.startsWith('time:')).split(':')[1];
    if (time === 'night') parts.push('reducing window-proximity weighting for evening use');
    if (time === 'day') parts.push('boosting natural light scoring for daytime living');
  }

  const explanation = parts.length > 0
    ? `Based on your description: ${parts.join(', ')}.`
    : 'Using default layout weights based on your selected style.';

  return {
    philosophyId,
    weightOverrides,
    signals,
    explanation,
    rawPrompt: prompt,
  };
}

/**
 * Validates the LLM JSON output against our expected intent schema.
 */
function validateIntentSchema(parsed) {
  if (typeof parsed !== 'object' || parsed === null) return false;
  if (typeof parsed.philosophyId !== 'string') return false;
  if (typeof parsed.weightOverrides !== 'object' || parsed.weightOverrides === null) return false;
  if (!Array.isArray(parsed.signals)) return false;
  if (typeof parsed.explanation !== 'string') return false;
  return true;
}

// Global metrics for LLM performance
export const LLM_METRICS = {
  successCount: 0,
  fallbackCount: 0,
  avgLatencyMs: 0
};

/**
 * Parse intent using Gemini LLM if API key is available, else fallback to rules.
 * Hardened with Timeout, Schema Validation, and Latency Logging.
 */
export async function parseIntent(prompt = '', baseVibe = 'cozy') {
  if (!process.env.GEMINI_API_KEY) {
    console.log("No GEMINI_API_KEY found. Falling back to rule-based intent parsing.");
    return parseIntentRuleBased(prompt, baseVibe);
  }

  const startTime = Date.now();
  let usedFallback = false;

  try {
    const ai = new GoogleGenAI();
    const systemPrompt = `You are the AI Intent Engine for Space Weaver.
The user provides a description of their room, lifestyle, and needs.
Map their intent to spatial layout weight overrides.

Available philosophies (fallback to philosophy-\${baseVibe}):
philosophy-cozy, philosophy-minimalist, philosophy-grand, philosophy-architect, philosophy-sunset, philosophy-fengshui, philosophy-executive, philosophy-entertainer, philosophy-cinema, philosophy-family

Weights to adjust (-0.2 to +0.2 max):
walkway, focal, light, balance, wallAdj, doorClear

Output EXACTLY JSON matching this schema:
{
  "philosophyId": "philosophy-id",
  "weightOverrides": { "walkway": 0.05, "focal": -0.05 },
  "signals": ["size:small", "usage:work", "vibe:cozy", "time:night"],
  "explanation": "Based on your description: prioritising desk focus and evening lighting."
}`;

    // 1. Timeout implementation using Promise.race (3000ms max for intent)
    const generatePromise = ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
      }
    });

    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("LLM Request Timed Out (>3000ms)")), 3000)
    );

    const response = await Promise.race([generatePromise, timeoutPromise]);
    
    // 2. Parse & Schema Validation
    let parsed;
    try {
      parsed = JSON.parse(response.text());
    } catch(e) {
      throw new Error("Invalid JSON returned by LLM");
    }

    if (!validateIntentSchema(parsed)) {
      throw new Error("LLM output failed schema validation");
    }

    parsed.rawPrompt = prompt;
    
    // 3. Latency Logging & Success Metrics
    const latency = Date.now() - startTime;
    LLM_METRICS.successCount++;
    LLM_METRICS.avgLatencyMs = ((LLM_METRICS.avgLatencyMs * (LLM_METRICS.successCount - 1)) + latency) / LLM_METRICS.successCount;
    
    console.log(`[LLM Intent] Success | Latency: ${latency}ms | Model: Gemini 2.5 Flash`);
    
    return parsed;

  } catch (error) {
    usedFallback = true;
    LLM_METRICS.fallbackCount++;
    const latency = Date.now() - startTime;
    console.error(`[LLM Intent] Failed (${error.message}). Falling back to rules. | Latency: ${latency}ms`);
    return parseIntentRuleBased(prompt, baseVibe);
  }
}

/**
 * Apply parsed weight overrides on top of a base weight vector.
 * Ensures all weights remain >= 0 and renormalises to sum = 1.0.
 *
 * @param {object} baseWeights — weight vector from PHILOSOPHY_WEIGHTS
 * @param {object} overrides   — delta overrides from parseIntent()
 * @returns {object} adjusted + renormalised weight vector
 */
export function applyWeightOverrides(baseWeights, overrides = {}) {
  if (!overrides || Object.keys(overrides).length === 0) return baseWeights;

  const adjusted = { ...baseWeights };
  for (const [key, delta] of Object.entries(overrides)) {
    if (key in adjusted) {
      adjusted[key] = Math.max(0, adjusted[key] + delta);
    }
  }

  // Renormalise so weights still sum to 1.0
  const SCORED_KEYS = ['walkway', 'focal', 'light', 'balance', 'wallAdj', 'doorClear'];
  const total = SCORED_KEYS.reduce((sum, k) => sum + (adjusted[k] || 0), 0);
  if (total > 0) {
    SCORED_KEYS.forEach(k => { adjusted[k] = (adjusted[k] || 0) / total; });
  }

  return adjusted;
}
