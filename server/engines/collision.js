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
  const iterations = 40;
  const buffer = 0.75; // 9+ inches extra breathing space to prevent 3D mesh overlap

  for (let iter = 0; iter < iterations; iter++) {
    let hasOverlap = false;

    for (let i = 0; i < resolved.length; i++) {
      for (let j = i + 1; j < resolved.length; j++) {
        const a = resolved[i];
        const b = resolved[j];

        // Check orientation rotation to swap width and depth if rotated ~90 or ~270 deg
        const aRotated = Math.abs(Math.sin(a.rotation || 0)) > 0.5;
        const bRotated = Math.abs(Math.sin(b.rotation || 0)) > 0.5;
        const aEffW = aRotated ? a.depth : a.width;
        const aEffD = aRotated ? a.width : a.depth;
        const bEffW = bRotated ? b.depth : b.width;
        const bEffD = bRotated ? b.width : b.depth;

        const aHalfW = (aEffW / 2) + (buffer / 2);
        const aHalfD = (aEffD / 2) + (buffer / 2);
        const bHalfW = (bEffW / 2) + (buffer / 2);
        const bHalfD = (bEffD / 2) + (buffer / 2);

        const dx = b.x - a.x;
        const dy = b.y - a.y;

        const overlapX = (aHalfW + bHalfW) - Math.abs(dx);
        const overlapY = (aHalfD + bHalfD) - Math.abs(dy);

        if (overlapX > 0 && overlapY > 0) {
          hasOverlap = true;
          // Separate along axis of least penetration
          if (overlapX < overlapY) {
            const shift = overlapX / 2 + 0.1;
            const sign = dx < 0 ? 1 : -1;
            if (a.type !== 'tv') a.x += sign * shift;
            if (b.type !== 'tv') b.x -= sign * shift;
          } else {
            const shift = overlapY / 2 + 0.1;
            const sign = dy < 0 ? 1 : -1;
            if (a.type !== 'tv') a.y += sign * shift;
            if (b.type !== 'tv') b.y -= sign * shift;
          }
        }

        // Special protection: never allow a chair inside or overlapping a sofa bounding zone
        const aType = (a.type || '').toLowerCase();
        const bType = (b.type || '').toLowerCase();
        if (((aType === 'chair' && bType === 'sofa') || (aType === 'sofa' && bType === 'chair'))) {
          const chair = aType === 'chair' ? a : b;
          const sofa = aType === 'sofa' ? a : b;
          const dist = Math.sqrt((chair.x - sofa.x)**2 + (chair.y - sofa.y)**2);
          if (dist < 4.8) {
            hasOverlap = true;
            const pushDirX = chair.x - sofa.x || (Math.random() - 0.5);
            const pushDirY = chair.y - sofa.y || (Math.random() - 0.5);
            const len = Math.sqrt(pushDirX**2 + pushDirY**2) || 1;
            chair.x = sofa.x + (pushDirX / len) * 5.2;
            chair.y = sofa.y + (pushDirY / len) * 5.2;
          }
        }
      }

      // Enforce room wall boundary clamping
      const item = resolved[i];
      const itemRotated = Math.abs(Math.sin(item.rotation || 0)) > 0.5;
      const halfW = (itemRotated ? item.depth : item.width) / 2;
      const halfD = (itemRotated ? item.width : item.depth) / 2;
      const minMargin = 0.8;
      item.x = Math.max(halfW + minMargin, Math.min(roomW - halfW - minMargin, item.x));
      item.y = Math.max(halfD + minMargin, Math.min(roomL - halfD - minMargin, item.y));
    }

    if (!hasOverlap) break;
  }

  return resolved;
}
