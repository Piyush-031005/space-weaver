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
    const theta = placement.rotation || 0;
    const pWidth = Math.abs(item.width * Math.cos(theta)) + Math.abs(item.depth * Math.sin(theta));
    const pDepth = Math.abs(item.width * Math.sin(theta)) + Math.abs(item.depth * Math.cos(theta));

    placement.x = Math.max(pWidth / 2, Math.min(placement.x, room.width - pWidth / 2));
    placement.y = Math.max(pDepth / 2, Math.min(placement.y, room.length - pDepth / 2));
    
    // Collision Resolution Loop
    const checkOverlap = (p1, p2) => {
      const buffer = 0.5;
      
      const getAABB = (p) => {
        const theta = p.rotation || 0;
        const w = Math.abs(p.width * Math.cos(theta)) + Math.abs(p.depth * Math.sin(theta));
        const d = Math.abs(p.width * Math.sin(theta)) + Math.abs(p.depth * Math.cos(theta));
        return { w, d };
      };

      const p1Bounds = getAABB(p1);
      const p2Bounds = getAABB(p2);

      const p1W = p1Bounds.w;
      const p1D = p1Bounds.d;
      
      const p2W = p2Bounds.w;
      const p2D = p2Bounds.d;

      const p1Left = p1.x - p1W / 2 - buffer;
      const p1Right = p1.x + p1W / 2 + buffer;
      const p1Top = p1.y - p1D / 2 - buffer;
      const p1Bottom = p1.y + p1D / 2 + buffer;
      
      const p2Left = p2.x - p2W / 2;
      const p2Right = p2.x + p2W / 2;
      const p2Top = p2.y - p2D / 2;
      const p2Bottom = p2.y + p2D / 2;
      
      return !(p1Right <= p2Left || p1Left >= p2Right || p1Bottom <= p2Top || p1Top >= p2Bottom);
    };

    let hasOverlap = true;
    let attempts = 0;
    const maxAttempts = 100; // Allow more attempts for spiral search
    
    let radius = 0;
    let angle = 0;
    const startX = placement.x;
    const startY = placement.y;

    while (hasOverlap && attempts < maxAttempts) {
      hasOverlap = false;
      for (const existing of layout) {
        if (checkOverlap(placement, existing)) {
          hasOverlap = true;
          
          // Spiral outward search
          radius += 0.2;
          angle += Math.PI / 4;
          placement.x = startX + Math.cos(angle) * radius;
          placement.y = startY + Math.sin(angle) * radius;
          
          // Re-constrain to bounds after nudging
          placement.x = Math.max(pWidth / 2, Math.min(placement.x, room.width - pWidth / 2));
          placement.y = Math.max(pDepth / 2, Math.min(placement.y, room.length - pDepth / 2));
          
          break; // break inner loop, recheck all existing
        }
      }
      
      attempts++;
    }

    // If we exhausted attempts, the room is too small for this item without overlapping.
    // We will cull (drop) this item to preserve physics rather than force an overlap.
    if (hasOverlap) {
      continue;
    }

    layout.push(placement);
  }

  return layout;
}
