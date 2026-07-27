/**
 * Collision Engine
 * Validates that no two pieces of furniture overlap.
 * Uses simple Axis-Aligned Bounding Box (AABB) intersection for v1.
 */

export function checkCollisions(layout) {
  const collisions = [];

  for (let i = 0; i < layout.length; i++) {
    for (let j = i + 1; j < layout.length; j++) {
      const itemA = layout[i];
      const itemB = layout[j];

      // Assuming x, y is the center of the bounding box
      const aMinX = itemA.x - itemA.width / 2;
      const aMaxX = itemA.x + itemA.width / 2;
      const aMinY = itemA.y - itemA.depth / 2;
      const aMaxY = itemA.y + itemA.depth / 2;

      const bMinX = itemB.x - itemB.width / 2;
      const bMaxX = itemB.x + itemB.width / 2;
      const bMinY = itemB.y - itemB.depth / 2;
      const bMaxY = itemB.y + itemB.depth / 2;

      // Check overlap
      const overlapX = aMinX < bMaxX && aMaxX > bMinX;
      const overlapY = aMinY < bMaxY && aMaxY > bMinY;

      if (overlapX && overlapY) {
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
 * Resolves collisions by iteratively separating overlapping furniture items
 * and enforcing room boundary clearance.
 */
export function resolveCollisions(layout = [], room = { width: 15, length: 20 }) {
  const resolved = layout.map(item => ({ ...item }));
  const roomW = room.width || 15;
  const roomL = room.length || 20;
  const iterations = 15;
  const buffer = 0.35; // 4+ inches extra breathing space

  for (let iter = 0; iter < iterations; iter++) {
    let hasOverlap = false;

    for (let i = 0; i < resolved.length; i++) {
      for (let j = i + 1; j < resolved.length; j++) {
        const a = resolved[i];
        const b = resolved[j];

        const aHalfW = (a.width / 2) + (buffer / 2);
        const aHalfD = (a.depth / 2) + (buffer / 2);
        const bHalfW = (b.width / 2) + (buffer / 2);
        const bHalfD = (b.depth / 2) + (buffer / 2);

        const dx = b.x - a.x;
        const dy = b.y - a.y;

        const overlapX = (aHalfW + bHalfW) - Math.abs(dx);
        const overlapY = (aHalfD + bHalfD) - Math.abs(dy);

        if (overlapX > 0 && overlapY > 0) {
          hasOverlap = true;
          // Separate along axis of least penetration
          if (overlapX < overlapY) {
            const shift = overlapX / 2 + 0.05;
            const sign = dx < 0 ? 1 : -1;
            // Push apart along X
            if (a.type !== 'tv') a.x += sign * shift;
            if (b.type !== 'tv') b.x -= sign * shift;
          } else {
            const shift = overlapY / 2 + 0.05;
            const sign = dy < 0 ? 1 : -1;
            // Push apart along Y
            if (a.type !== 'tv') a.y += sign * shift;
            if (b.type !== 'tv') b.y -= sign * shift;
          }
        }
      }

      // Enforce room wall boundary clamping
      const item = resolved[i];
      const halfW = item.width / 2;
      const halfD = item.depth / 2;
      const minMargin = 0.6;
      item.x = Math.max(halfW + minMargin, Math.min(roomW - halfW - minMargin, item.x));
      item.y = Math.max(halfD + minMargin, Math.min(roomL - halfD - minMargin, item.y));
    }

    if (!hasOverlap) break;
  }

  return resolved;
}
