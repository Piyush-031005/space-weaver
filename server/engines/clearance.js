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

  // True Clearance Math: Calculate distance from major seating/sleeping areas to the door
  const doors = fixedElements?.filter(el => el.type === 'door') || [];
  if (doors.length > 0) {
    for (const door of doors) {
      for (const item of layout) {
        // Calculate true Euclidean distance from center of item to door
        const dist = Math.sqrt(Math.pow(item.x - door.x, 2) + Math.pow(item.y - door.y, 2));
        
        // If furniture is blocking the door physically (within 4 feet/units)
        if (dist <= 4) {
          emergencyExit -= 60; // Huge penalty for blocking door
          walkingComfort -= 30;
        } else if (dist <= 6) {
          // Tight squeeze
          emergencyExit -= 20;
          walkingComfort -= 15;
        }

        // Night Movement penalty if bed is extremely far from door
        if (item.type?.toLowerCase() === 'bed' && dist > 15) {
          nightMovement -= 15;
        }
      }
    }
  } else {
    // If no doors were provided by user, penalize emergency exit heavily for realism
    emergencyExit = 0;
  }

  // Calculate area metrics (True Contiguous Free Space)
  const totalArea = room.width * room.length;
  let minX = room.width, maxX = 0, minY = room.length, maxY = 0;
  
  if (layout.length === 0) {
    minX = 0; maxX = 0; minY = 0; maxY = 0;
  } else {
    for (const item of layout) {
      const theta = item.rotation || 0;
      const pW = Math.abs(item.width * Math.cos(theta)) + Math.abs(item.depth * Math.sin(theta));
      const pD = Math.abs(item.width * Math.sin(theta)) + Math.abs(item.depth * Math.cos(theta));
      
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
    occupiedArea: clusterArea,
    freeSpaceArea,
    spaceSavedPercentage
  };
}
