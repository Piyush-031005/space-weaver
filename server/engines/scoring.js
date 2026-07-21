/**
 * Scoring Engine (Placement Generator)
 * Applies layout rules based on the chosen vibe mode before validation.
 */

export function scorePlacement(room, fixedElements, furniture, vibe) {
  // Mock layout generator. In reality, this runs a constraint-satisfaction loop.
  const layout = [];
  
  // Example dummy logic: place items in a row
  let currentX = room.width / 2;
  let currentY = room.length / 2;
  
  for (const item of (furniture || [])) {
    let placement = { ...item };
    
    if (vibe === 'space_saver') {
      // Push against walls (dummy logic: set x or y to near 0)
      placement.x = item.width / 2 + 1; // 1 unit from left wall
      placement.y = currentY;
      placement.rotation = 0;
      currentY -= item.depth + 1; 
    } 
    else if (vibe === 'cozy') {
      // Pull into center (dummy logic: cluster around center)
      placement.x = currentX;
      placement.y = currentY;
      placement.rotation = Math.PI / 4; // slight rotation for "cozy" chaos
      currentX += 2;
      currentY -= 2;
    } 
    else if (vibe === 'aesthetic') {
      // Symmetrical (dummy logic: exact grid)
      placement.x = currentX;
      placement.y = currentY;
      placement.rotation = 0;
      currentX += item.width + 3; // lots of negative space
    }
    else {
      // Default
      placement.x = currentX;
      placement.y = currentY;
      placement.rotation = 0;
    }
    
    layout.push(placement);
  }

  return layout;
}
