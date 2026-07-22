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

  // Calculate area metrics (True Contiguous Free Space)
  const totalArea = room.width * room.length;
  let minX = room.width, maxX = 0, minY = room.length, maxY = 0;
  
  if (layout.length === 0) {
    minX = 0; maxX = 0; minY = 0; maxY = 0;
  } else {
    for (const item of layout) {
      const pW = (Math.abs(item.rotation) === Math.PI / 2) ? item.depth : item.width;
      const pD = (Math.abs(item.rotation) === Math.PI / 2) ? item.width : item.depth;
      
      minX = Math.min(minX, item.x - pW / 2);
      maxX = Math.max(maxX, item.x + pW / 2);
      minY = Math.min(minY, item.y - pD / 2);
      maxY = Math.max(maxY, item.y + pD / 2);
    }
  }

  // The cluster area represents the block taken up by the furniture arrangement
  const clusterWidth = Math.max(0, maxX - minX);
  const clusterDepth = Math.max(0, maxY - minY);
  const clusterArea = clusterWidth * clusterDepth;
  
  // The true contiguous free space is the room area minus the footprint of the cluster
  // (A tighter cluster yields a smaller clusterArea, resulting in higher free space!)
  const freeSpaceArea = totalArea - clusterArea;
  const spaceSavedPercentage = Math.round((freeSpaceArea / totalArea) * 100);

  return {
    walkingComfort: Math.max(0, walkingComfort),
    nightMovement: Math.max(0, nightMovement),
    cleaningAccess: Math.max(0, cleaningAccess),
    emergencyExit: Math.max(0, emergencyExit),
    totalArea,
    occupiedArea,
    freeSpaceArea,
    spaceSavedPercentage
  };
}
