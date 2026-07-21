/**
 * Scoring Engine (Placement Generator)
 * Applies layout rules based on the chosen vibe mode before validation.
 */

export function scorePlacement(room, fixedElements, furniture, vibe, variationIndex = 1) {
  const layout = [];
  
  // Use variation index to slightly offset starting positions and logic
  let currentX = (room.width / 2) + (variationIndex * 0.5) % 2;
  let currentY = (room.length / 2) + (variationIndex * 0.5) % 2;
  
  for (const item of (furniture || [])) {
    let placement = { ...item };
    
    // Safety bounds
    const maxW = room.width - item.width;
    const maxL = room.length - item.depth;
    
    if (vibe === 'space_saver') {
      // Variations of space saver: push against different walls
      if (variationIndex <= 2) {
        placement.x = Math.min(item.width / 2 + 1, maxW);
        placement.y = Math.min(Math.max(currentY, item.depth / 2), maxL);
      } else if (variationIndex <= 4) {
        placement.x = Math.min(Math.max(currentX, item.width / 2), maxW);
        placement.y = Math.min(item.depth / 2 + 1, maxL);
      } else {
        placement.x = Math.min(room.width - item.width / 2 - 1, maxW);
        placement.y = Math.min(Math.max(currentY, item.depth / 2), maxL);
      }
      placement.rotation = (variationIndex % 2 === 0) ? Math.PI / 2 : 0;
      currentY -= item.depth + 1.5;
      currentX += item.width + 1;
    } 
    else if (vibe === 'cozy') {
      placement.x = Math.min(Math.max(currentX, item.width / 2), maxW);
      placement.y = Math.min(Math.max(currentY, item.depth / 2), maxL);
      placement.rotation = (Math.PI / 4) * (variationIndex % 3);
      currentX += (variationIndex % 2 === 0) ? -2 : 2;
      currentY -= 2;
    } 
    else if (vibe === 'aesthetic') {
      placement.x = Math.min(Math.max(currentX, item.width / 2), maxW);
      placement.y = Math.min(Math.max(currentY, item.depth / 2), maxL);
      placement.rotation = 0;
      currentX += item.width + (2 * variationIndex); 
    }
    else {
      placement.x = Math.min(Math.max(currentX, item.width / 2), maxW);
      placement.y = Math.min(Math.max(currentY, item.depth / 2), maxL);
      placement.rotation = 0;
    }
    
    // Bounds check to absolutely prevent out of bounds initially
    placement.x = Math.max(item.width / 2, Math.min(placement.x, room.width - item.width / 2));
    placement.y = Math.max(item.depth / 2, Math.min(placement.y, room.length - item.depth / 2));
    
    // Collision Resolution Loop
    const checkOverlap = (p1, p2) => {
      // Very simple AABB check (treating all as non-rotated AABB for simplicity in v1)
      const buffer = 0.5; // half foot buffer between items
      const p1Left = p1.x - p1.width / 2 - buffer;
      const p1Right = p1.x + p1.width / 2 + buffer;
      const p1Top = p1.y - p1.depth / 2 - buffer;
      const p1Bottom = p1.y + p1.depth / 2 + buffer;
      
      const p2Left = p2.x - p2.width / 2;
      const p2Right = p2.x + p2.width / 2;
      const p2Top = p2.y - p2.depth / 2;
      const p2Bottom = p2.y + p2.depth / 2;
      
      return !(p1Right <= p2Left || p1Left >= p2Right || p1Bottom <= p2Top || p1Top >= p2Bottom);
    };

    let hasOverlap = true;
    let attempts = 0;
    const maxAttempts = 50; // Prevent infinite loops
    
    while (hasOverlap && attempts < maxAttempts) {
      hasOverlap = false;
      for (const existing of layout) {
        if (checkOverlap(placement, existing)) {
          hasOverlap = true;
          // Nudge item
          if (vibe === 'space_saver') {
             // Nudge along the wall
             if (variationIndex <= 2) placement.y += 1;
             else if (variationIndex <= 4) placement.x += 1;
             else placement.y += 1;
          } else {
             // Nudge diagonally outward from center
             placement.x += (placement.x > room.width / 2 ? 1 : -1);
             placement.y += (placement.y > room.length / 2 ? 1 : -1);
          }
          break; // break inner loop, recheck all existing
        }
      }
      
      // Re-constrain to bounds after nudging
      placement.x = Math.max(item.width / 2, Math.min(placement.x, room.width - item.width / 2));
      placement.y = Math.max(item.depth / 2, Math.min(placement.y, room.length - item.depth / 2));
      
      attempts++;
    }

    layout.push(placement);
  }

  return layout;
}
