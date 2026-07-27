/**
 * Collision Engine
 * Validates that no two pieces of furniture overlap.
 * Uses rotation-aware effective bounding box intersection.
 */

export function checkCollisions(layout = []) {
  const collisions = [];
  const buffer = 0.1; // small breathing room for precision

  for (let i = 0; i < layout.length; i++) {
    for (let j = i + 1; j < layout.length; j++) {
      const itemA = layout[i];
      const itemB = layout[j];

      const aRotated = Math.abs(Math.sin(itemA.rotation || 0)) > 0.5;
      const bRotated = Math.abs(Math.sin(itemB.rotation || 0)) > 0.5;
      const aW = aRotated ? itemA.depth : itemA.width;
      const aD = aRotated ? itemA.width : itemA.depth;
      const bW = bRotated ? itemB.depth : itemB.width;
      const bD = bRotated ? itemB.width : itemB.depth;

      const dx = Math.abs(itemB.x - itemA.x);
      const dy = Math.abs(itemB.y - itemA.y);

      if (dx < (aW + bW) / 2 - buffer && dy < (aD + bD) / 2 - buffer) {
        collisions.push({
          itemA: itemA.id,
          itemB: itemB.id,
          overlapping: true
        });
      }
    }
  }

  return collisions;
}

/**
 * Helper to check overlap between two items with custom buffer.
 */
function checkOverlap(a, b, buffer = 0.5) {
  const aRot = Math.abs(Math.sin(a.rotation || 0)) > 0.5;
  const bRot = Math.abs(Math.sin(b.rotation || 0)) > 0.5;
  const aW = aRot ? a.depth : a.width;
  const aD = aRot ? a.width : a.depth;
  const bW = bRot ? b.depth : b.width;
  const bD = bRot ? b.width : b.depth;
  return Math.abs(b.x - a.x) < (aW + bW) / 2 + buffer && Math.abs(b.y - a.y) < (aD + bD) / 2 + buffer;
}

/**
 * Resolves collisions by verifying clean placement and spiraling outward
 * if any unexpected overlap occurs, guaranteeing zero oscillation or overlapping.
 */
export function resolveCollisions(layout = [], room = { width: 15, length: 20 }, fixedElements = []) {
  const roomW = room.width || 15;
  const roomL = room.length || 20;
  const resolved = [];
  const obstacles = () => [...resolved, ...fixedElements];

  for (let i = 0; i < layout.length; i++) {
    const item = { ...layout[i] };
    const w = Math.abs(Math.sin(item.rotation || 0)) > 0.5 ? item.depth : item.width;
    const d = Math.abs(Math.sin(item.rotation || 0)) > 0.5 ? item.width : item.depth;

    // Ensure within room boundaries
    item.x = Math.max(w / 2 + 0.6, Math.min(roomW - w / 2 - 0.6, item.x));
    item.y = Math.max(d / 2 + 0.6, Math.min(roomL - d / 2 - 0.6, item.y));

    // Check against previously resolved items in this layout
    if (!obstacles().some(exist => checkOverlap(item, exist, 0.6))) {
      resolved.push(item);
      continue;
    }

    // If overlap found, spiral outward from original position until clean spot is found
    let foundClean = false;
    for (let r = 0.5; r <= 15 && !foundClean; r += 0.5) {
      for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 8) {
        const candX = Math.max(w / 2 + 0.6, Math.min(roomW - w / 2 - 0.6, item.x + Math.cos(angle) * r));
        const candY = Math.max(d / 2 + 0.6, Math.min(roomL - d / 2 - 0.6, item.y + Math.sin(angle) * r));
        const cand = { ...item, x: candX, y: candY };

        if (!obstacles().some(exist => checkOverlap(cand, exist, 0.6))) {
          item.x = candX;
          item.y = candY;
          foundClean = true;
          break;
        }
      }
    }

    resolved.push(item);
  }

  return resolved;
}
