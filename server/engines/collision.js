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
