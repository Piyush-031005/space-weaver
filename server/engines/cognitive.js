/**
 * Cognitive Load Engine
 * Evaluates the psychological impact of the room layout.
 * Focuses on Visual Clutter Index and spatial harmony.
 */

export function calculateCognitiveLoad(room, layout) {
  // Simple heuristic for visual clutter: 
  // High number of items in a small space = high cognitive load.
  const totalArea = room.width * room.length;
  const numItems = layout.length;
  
  // Baseline clutter based on item density
  let clutterIndex = (numItems / totalArea) * 1000;
  
  // Penalize small items scattered around (like lamps, chairs)
  const smallItems = layout.filter(i => (i.width * i.depth) < 4).length;
  clutterIndex += (smallItems * 5);
  
  // Normalize to a 0-100 scale, where 100 is extremely cluttered
  const normalizedClutter = Math.min(100, Math.max(0, Math.round(clutterIndex)));
  
  let category = 'Minimal';
  if (normalizedClutter > 70) category = 'Overwhelming';
  else if (normalizedClutter > 40) category = 'Busy';
  
  return {
    visualClutterIndex: normalizedClutter,
    category,
    message: category === 'Overwhelming' 
      ? 'High cognitive load detected. Consider removing smaller items to reduce visual stress.'
      : 'Visual balance is optimal for focus and relaxation.'
  };
}
