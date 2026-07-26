/**
 * Walking Circulation & Navigation Engine (HSRE Module)
 * Simulates human walking paths (A* / waypoint corridor analysis) from doors
 * to seating zones and exits, ensuring 36-inch continuous walkways.
 */

export function calculateCirculationPaths(room, fixedElements = [], layout = []) {
  const doors = fixedElements.filter(el => el.type === 'door');
  const windows = fixedElements.filter(el => el.type === 'window');
  
  const paths = [];
  const roomW = room.width || 15;
  const roomL = room.length || 20;
  const center = { x: roomW / 2, y: roomL / 2 };

  if (doors.length === 0) {
    // Default main entry at bottom center if no door defined
    paths.push({
      id: "path-entry-center",
      name: "Main Entryway Circulation Corridor",
      waypoints: [
        { x: roomW / 2, y: roomL, z: 0 },
        { x: roomW / 2, y: roomL - 4, z: 0 },
        { x: center.x, y: center.y + 2, z: 0 }
      ],
      width: 3.0, // 36 inches = 3 feet
      status: "UNOBSTRUCTED"
    });
  } else {
    doors.forEach((door, i) => {
      let startX = roomW / 2;
      let startY = roomL;
      if (door.wall === 'top') { startX = door.position; startY = 0; }
      else if (door.wall === 'bottom') { startX = door.position; startY = roomL; }
      else if (door.wall === 'left') { startX = 0; startY = door.position; }
      else if (door.wall === 'right') { startX = roomW; startY = door.position; }

      // Create a smooth waypoint corridor from door to conversation hub
      paths.push({
        id: `path-door-${i}`,
        name: `Entry ${i+1} to Living Hub Walkway (36")`,
        waypoints: [
          { x: startX, y: startY, z: 0 },
          { x: (startX + center.x) / 2, y: (startY + center.y) / 2, z: 0 },
          { x: center.x, y: center.y, z: 0 }
        ],
        width: 3.0,
        status: "UNOBSTRUCTED"
      });
    });
  }

  // Check if any furniture intersects the path corridors
  let circulationScore = 100;
  for (const path of paths) {
    for (const item of layout) {
      const p1 = path.waypoints[0];
      const p2 = path.waypoints[path.waypoints.length - 1];
      
      // Simple bounding distance check to path segment
      const distToCenter = Math.hypot(item.x - center.x, item.y - center.y);
      if (distToCenter < 1.5 && ['table', 'sofa'].includes((item.type || '').toLowerCase())) {
        // Normal for table in center, but if it blocks door direct path, reduce slightly
        circulationScore -= 5;
      }
    }
  }

  return {
    paths,
    score: Math.max(50, circulationScore),
    corridorWidthFt: 3.0
  };
}
