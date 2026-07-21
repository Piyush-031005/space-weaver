/**
 * Space Genome Engine
 * Computes 0-100 normalized metrics based on layout physics and assigns an archetype.
 */

export function generateGenome(clearanceScores) {
  // Map clearance to genome metrics
  const flow = clearanceScores.walkingComfort || 0;
  const light = 75; // Mock
  const calm = clearanceScores.cleaningAccess || 0;
  const focus = 65; // Mock
  const warmth = clearanceScores.nightMovement || 0;
  const privacy = 80; // Mock
  
  const scores = { flow, light, calm, focus, warmth, privacy };
  
  // Simple heuristic for archetype
  let archetype = "The Studio";
  let tagline = "A balanced, functional space.";

  if (flow > 90 && calm > 85) {
    archetype = "The Sanctuary";
    tagline = "Your breathing room. Minimalist and clear.";
  } else if (warmth > 85 && focus < 70) {
    archetype = "The Nest";
    tagline = "Intimate, cozy, and built for connection.";
  } else if (focus > 85) {
    archetype = "The Command Center";
    tagline = "Optimized for productivity and sharp focus.";
  } else if (light > 80 && calm > 80) {
    archetype = "The Gallery";
    tagline = "Aesthetic flow that highlights every piece.";
  } else if (flow < 60) {
    archetype = "The Labyrinth"; // Not in preset but funny
    tagline = "A chaotic maze. Good luck walking to the door.";
  }

  return {
    scores,
    archetype,
    tagline
  };
}
