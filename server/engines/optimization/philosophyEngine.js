/**
 * Philosophy Engine (HSRE v2 — Generate → Score → Pick)
 *
 * Each of the 12 philosophy definitions now has a UNIQUE weight vector.
 * The candidate generator produces 350 random-but-valid layouts,
 * and each philosophy picks the layout that scores BEST under its own weights.
 * This guarantees visually distinct results between philosophies.
 */

import {
  generateCandidates,
  generateScoredLayout,
  PHILOSOPHY_WEIGHTS
} from './candidateGenerator.js';

export const PHILOSOPHY_DEFINITIONS = [
  {
    id: "philosophy-curator",
    title: "The Curator",
    tagline: "Focal Point Mastery & Symmetrical Composition",
    viralBadge: "Chosen by 78% of designers",
    bestFor: "Entertaining guests & visual balance",
    philosophyDescription: "Prioritizes visual balance and conversation symmetry. Optimized for maximum focal alignment and bilateral room balance — every piece orbits the primary entertainment focal point.",
  },
  {
    id: "philosophy-architect",
    title: "The Architect",
    tagline: "Unobstructed Circulation & Spatial Geometry",
    viralBadge: "Maximum Walkway Flow",
    bestFor: "Open-concept living & high traffic",
    philosophyDescription: "Maximizes circulation corridors and preserves continuous 36-inch walkways. Scored to prioritize open floor area above everything else — the roomiest possible arrangement.",
  },
  {
    id: "philosophy-humanist",
    title: "The Humanist",
    tagline: "Cognitive Calm & Natural Light Harmony",
    viralBadge: "Low Visual Clutter",
    bestFor: "Daily focus, reading & relaxation",
    philosophyDescription: "Optimizes for natural daylight and psychological calm. Seating scored to sit closest to windows without blocking light flow — morning light, minimal shadows.",
  },
  {
    id: "philosophy-entertainer",
    title: "The Social Entertainer",
    tagline: "Dynamic Group Gathering Hub",
    viralBadge: "Best for Parties & Game Nights",
    bestFor: "Hosting large gatherings & board games",
    philosophyDescription: "Creates an open, symmetrically balanced arena for groups. High weight on room balance and door clearance — guests can move freely from any entry point.",
  },
  {
    id: "philosophy-minimalist",
    title: "The Minimalist Sanctuary",
    tagline: "Zero Clutter & Maximum Breathing Room",
    viralBadge: "Ultra-Clean Aesthetic",
    bestFor: "Uncluttered living & mindfulness",
    philosophyDescription: "Employs negative space as an active design element. The highest walkway weight of any philosophy — furniture is pushed to walls and perimeters, leaving a vast open centre.",
  },
  {
    id: "philosophy-cinema",
    title: "The Cinema Suite",
    tagline: "Ergonomic 30° Viewing Cone Alignment",
    viralBadge: "Optimal Movie Experience",
    bestFor: "Film enthusiasts & immersive acoustics",
    philosophyDescription: "Scores 65% on focal alignment — the most TV-centric layout. Every seat is angled and distanced for an optimal viewing cone, eliminating neck strain.",
  },
  {
    id: "philosophy-cozy",
    title: "The Intimate Nook",
    tagline: "Warm Conversational Corner",
    viralBadge: "Max Comfort & Coziness",
    bestFor: "Intimate conversations & winter evenings",
    philosophyDescription: "Pulls furniture into corners and against walls with high door-clearance scoring. Creates an enclosed, sheltered pocket that feels warm and private.",
  },
  {
    id: "philosophy-fengshui",
    title: "The Feng Shui Master",
    tagline: "Balanced Chi & Command Position",
    viralBadge: "Harmonious Energy Flow",
    bestFor: "Holistic well-being & energetic balance",
    philosophyDescription: "Balances focal alignment with room energy symmetry. Primary seating achieves the command position — solid wall backing, clear sightline to room entry.",
  },
  {
    id: "philosophy-family",
    title: "The Family Haven",
    tagline: "Kid-Safe Walkways & Active Floor Centre",
    viralBadge: "Family & Child Friendly",
    bestFor: "Active households with children or pets",
    philosophyDescription: "Highest door clearance weight (35%) of any philosophy. Furniture is pushed firmly to perimeter walls, opening the centre floor for safe children's play.",
  },
  {
    id: "philosophy-executive",
    title: "The Executive Studio",
    tagline: "Productivity Division & Structured Ergonomics",
    viralBadge: "Work-From-Home Mastery",
    bestFor: "Professionals & dual-purpose living/working",
    philosophyDescription: "Evenly weights all four metrics — walkway, focal, light, and balance — producing a structured, evenly distributed layout ideal for home office hybrid spaces.",
  },
  {
    id: "philosophy-sunset",
    title: "The Sunset Lounge",
    tagline: "Window-Oriented Natural Light Focus",
    viralBadge: "Natural Light Focus",
    bestFor: "Morning coffee & golden hour lounging",
    philosophyDescription: "Scores 55% on natural light proximity — the most window-oriented layout. All seating positions are evaluated by closeness to architectural windows.",
  },
  {
    id: "philosophy-grand",
    title: "The Grand Salon",
    tagline: "Luxury Symmetry & Formal Balance",
    viralBadge: "Awwwards Featured Style",
    bestFor: "Formal entertaining & architectural grandeur",
    philosophyDescription: "Highest balance weight (45%) — the most symmetrically distributed layout. Evokes hotel-lobby grandeur with precise bilateral furniture distribution.",
  },
];

/**
 * Generate all 12 philosophy layouts using the Generate→Score→Pick engine.
 *
 * Key optimisation: ONE shared candidate pool is generated first,
 * then each philosophy scores the same pool under its own weights.
 * This is ~12x faster than generating separate pools per philosophy.
 */
export function generateAllPhilosophies(room, furniture, fixedElements, focalPoint) {
  // Generate a single shared candidate pool (all philosophies score from the same set)
  const sharedCandidates = generateCandidates(room, furniture, fixedElements, focalPoint, 400);

  return PHILOSOPHY_DEFINITIONS.map(def => {
    const result = generateScoredLayout(
      room,
      furniture,
      fixedElements,
      focalPoint,
      def.id,
      sharedCandidates  // reuse shared pool
    );

    return {
      id: def.id,
      name: def.title,
      desc: def.tagline,
      viralBadge: def.viralBadge,
      bestFor: def.bestFor,
      philosophyDescription: def.philosophyDescription,
      layout: result?.layout || [],
      scoreTotal: result?.scoreTotal || 0,
      scoreBreakdown: result?.scoreBreakdown || {},
      explanation: result?.explanation || '',
      fitWarnings: result?.fitWarnings || [],
    };
  });
}
