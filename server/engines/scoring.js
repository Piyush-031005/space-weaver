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
    
    // Bounds check to absolutely prevent out of bounds
    placement.x = Math.max(item.width / 2, Math.min(placement.x, room.width - item.width / 2));
    placement.y = Math.max(item.depth / 2, Math.min(placement.y, room.length - item.depth / 2));
    
    layout.push(placement);
  }

  return layout;
}
