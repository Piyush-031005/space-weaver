/**
 * Living Path Engine (Clearance)
 * Calculates the real-world livability of the space.
 * Checks door swing radius, drawer opening space, and walking paths.
 */

export function calculateClearance(room, fixedElements, layout) {
  // In v1 scaffold, we return mock scores based on a simple heuristic
  // In future passes, this will build a grid and run BFS for pathfinding
  
  // Dummy math: assume a perfectly open room gives 100
  let walkingComfort = 95;
  let nightMovement = 90;
  let cleaningAccess = 85;
  let emergencyExit = 100;

  // Penalize scores based on amount of furniture
  if (layout.length > 5) {
    walkingComfort -= 15;
    nightMovement -= 20;
    cleaningAccess -= 10;
  }

  // Check if any item blocks the door explicitly (mock logic)
  const doors = fixedElements?.filter(el => el.type === 'door') || [];
  for (const door of doors) {
    for (const item of layout) {
      // Very basic mock check: if an item is within 1 meter (or 3 feet) of the door
      const dist = Math.sqrt(Math.pow(item.x - door.x, 2) + Math.pow(item.y - door.y, 2));
      if (dist < 3) {
        emergencyExit -= 40;
        walkingComfort -= 20;
      }
    }
  }

  return {
    walkingComfort: Math.max(0, walkingComfort),
    nightMovement: Math.max(0, nightMovement),
    cleaningAccess: Math.max(0, cleaningAccess),
    emergencyExit: Math.max(0, emergencyExit)
  };
}
