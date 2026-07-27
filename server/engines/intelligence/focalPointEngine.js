/**
 * Focal Point Engine (HSRE Module)
 * Detects the primary room hero (TV, fireplace, window, or architectural center)
 * and evaluates viewing angles (e.g. 30° ergonomic TV viewing cone).
 */

export function detectFocalPoint(room, fixedElements = [], furniture = []) {
  // 0. Priority 0: Manually Assigned TV Wall / Entertainment Hub in Structural Elements
  const tvFixed = fixedElements.find(e => ['tv', 'tv_wall', 'focal_wall', 'entertainment'].includes((e.type || '').toLowerCase()));
  if (tvFixed) {
    let x = tvFixed.x !== undefined ? tvFixed.x : (tvFixed.position || room.width / 2);
    let y = tvFixed.y !== undefined ? tvFixed.y : 1;
    return {
      type: "tv",
      id: tvFixed.id || "tv-wall-focal",
      position: { x, y },
      wall: tvFixed.wall || "top",
      preferredDistance: { min: 6, max: 10 },
      viewingConeDeg: 30,
      description: "Primary Television & Entertainment Wall Hub (Manually Assigned)"
    };
  }

  // 1. Priority 1: TV (Entertainment Focal Point from furniture inventory)
  const tvItem = furniture.find(f => (f.type || '').toLowerCase() === 'tv');
  if (tvItem) {
    // Determine wall or location of TV
    // Default TV to top wall if not placed yet
    return {
      type: "tv",
      id: tvItem.id || "tv-1",
      position: { x: room.width / 2, y: 1 }, // along top wall
      wall: "top",
      preferredDistance: { min: 6, max: 10 }, // 6 to 10 feet
      viewingConeDeg: 30,
      description: "Primary Television & Entertainment Hub"
    };
  }

  // 2. Priority 2: Large Window (Natural Light & Scenic Focal Point)
  const windowEl = fixedElements.find(e => e.type === 'window');
  if (windowEl) {
    let x = room.width / 2;
    let y = room.length / 2;
    if (windowEl.wall === 'top') { x = windowEl.position; y = 0; }
    else if (windowEl.wall === 'bottom') { x = windowEl.position; y = room.length; }
    else if (windowEl.wall === 'left') { x = 0; y = windowEl.position; }
    else if (windowEl.wall === 'right') { x = room.width; y = windowEl.position; }

    return {
      type: "window",
      id: "window-focal",
      position: { x, y },
      wall: windowEl.wall,
      preferredDistance: { min: 4, max: 12 },
      viewingConeDeg: 45,
      description: "Natural Daylight & Scenic Architectural Window"
    };
  }

  // 3. Default: Room Center / Conversation Hub
  return {
    type: "center",
    id: "room-center",
    position: { x: room.width / 2, y: room.length / 2 },
    wall: "none",
    preferredDistance: { min: 3, max: 8 },
    viewingConeDeg: 60,
    description: "Central Conversational Gathering Hub"
  };
}

/**
 * Calculates how well a seated furniture item (sofa/chair) faces the focal point.
 * Returns a score from 0 (facing away) to 100 (directly aligned within ergonomic viewing cone).
 */
export function evaluateFocalOrientation(item, placement, focalPoint) {
  if (!['sofa', 'chair'].includes((item.type || '').toLowerCase())) {
    return 100; // Non-seating doesn't need to face focal point
  }

  const dx = focalPoint.position.x - placement.x;
  const dy = focalPoint.position.y - placement.y;
  const angleToFocal = Math.atan2(dy, dx); // Radians from item to focal point
  
  // In our coordinate system, rotation = 0 faces down (+Y), PI/2 faces right (+X), PI faces up (-Y), -PI/2 faces left (-X)
  // Convert placement rotation to facing vector angle
  let facingAngle = placement.rotation || 0;
  // Let's normalize difference between facing angle and angleToFocal
  let diff = Math.abs(angleToFocal - facingAngle);
  while (diff > Math.PI) diff = Math.abs(diff - 2 * Math.PI);

  const diffDeg = (diff * 180) / Math.PI;
  if (diffDeg <= focalPoint.viewingConeDeg) {
    return 100; // Perfect ergonomic alignment
  } else if (diffDeg <= 90) {
    return Math.round(100 - ((diffDeg - focalPoint.viewingConeDeg) / (90 - focalPoint.viewingConeDeg)) * 50);
  }
  return 20; // Facing away or severe strain
}
