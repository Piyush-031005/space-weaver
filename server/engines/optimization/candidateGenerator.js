/**
 * Candidate Generator + Multi-Metric Scorer (HSRE v2)
 *
 * Replaces the fixed zone-template system. Instead of hardcoding
 * `primarySofaY = roomL * 0.70`, this engine:
 *  1. Generates 400 random valid candidate layouts (no overlaps, no OOB)
 *  2. Scores each on real interior design metrics
 *  3. Each "philosophy" is a different weight vector → genuinely different results
 *  4. Picks the top layout per philosophy that is also diverse from others
 */

// ─────────────────────────────────────────────────────────────────────────────
// PHILOSOPHY WEIGHT VECTORS
// Each weight must sum to 1.0. Higher weight = engine prioritises that metric.
// ─────────────────────────────────────────────────────────────────────────────
export const PHILOSOPHY_WEIGHTS = {
  'philosophy-curator': {
    walkway: 0.10, focal: 0.30, light: 0.10, balance: 0.30, wallAdj: 0.10, doorClear: 0.10,
    preferWallSide: null, centerBias: 0.5
  },
  'philosophy-architect': {
    walkway: 0.40, focal: 0.15, light: 0.10, balance: 0.15, wallAdj: 0.10, doorClear: 0.10,
    preferWallSide: null, centerBias: 0.3
  },
  'philosophy-humanist': {
    walkway: 0.15, focal: 0.10, light: 0.40, balance: 0.15, wallAdj: 0.10, doorClear: 0.10,
    preferWallSide: null, centerBias: 0.4
  },
  'philosophy-entertainer': {
    walkway: 0.10, focal: 0.20, light: 0.10, balance: 0.35, wallAdj: 0.05, doorClear: 0.20,
    preferWallSide: null, centerBias: 0.7
  },
  'philosophy-minimalist': {
    walkway: 0.40, focal: 0.10, light: 0.15, balance: 0.15, wallAdj: 0.10, doorClear: 0.10,
    preferWallSide: 'walls', centerBias: 0.2
  },
  'philosophy-cinema': {
    walkway: 0.05, focal: 0.65, light: 0.05, balance: 0.10, wallAdj: 0.05, doorClear: 0.10,
    preferWallSide: null, centerBias: 0.6
  },
  'philosophy-cozy': {
    walkway: 0.10, focal: 0.15, light: 0.15, balance: 0.10, wallAdj: 0.25, doorClear: 0.25,
    preferWallSide: 'corner', centerBias: 0.4
  },
  'philosophy-fengshui': {
    walkway: 0.15, focal: 0.25, light: 0.15, balance: 0.20, wallAdj: 0.15, doorClear: 0.10,
    preferWallSide: 'back_wall', centerBias: 0.5
  },
  'philosophy-family': {
    walkway: 0.15, focal: 0.10, light: 0.10, balance: 0.10, wallAdj: 0.20, doorClear: 0.35,
    preferWallSide: 'perimeter', centerBias: 0.1
  },
  'philosophy-executive': {
    walkway: 0.20, focal: 0.20, light: 0.20, balance: 0.20, wallAdj: 0.10, doorClear: 0.10,
    preferWallSide: null, centerBias: 0.5
  },
  'philosophy-sunset': {
    walkway: 0.10, focal: 0.10, light: 0.55, balance: 0.10, wallAdj: 0.05, doorClear: 0.10,
    preferWallSide: 'window_wall', centerBias: 0.6
  },
  'philosophy-grand': {
    walkway: 0.05, focal: 0.20, light: 0.10, balance: 0.45, wallAdj: 0.10, doorClear: 0.10,
    preferWallSide: null, centerBias: 0.8
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// FURNITURE ROLE KNOWLEDGE
// Which types are wall-adjacent vs. floating vs. focal-facing
// ─────────────────────────────────────────────────────────────────────────────
const WALL_TYPES = new Set(['bookshelf', 'wardrobe', 'bed', 'tv', 'dresser', 'desk', 'sideboard']);
const FOCAL_FACING_TYPES = new Set(['sofa', 'chair', 'loveseat', 'armchair', 'recliner', 'bench']);
const CENTER_FLOAT_TYPES = new Set(['table', 'coffee_table', 'dining_table', 'rug', 'ottoman']);
const VALID_ROTATIONS_BY_TYPE = {
  sofa: [0, Math.PI / 2, Math.PI, -Math.PI / 2],
  chair: [0, Math.PI / 2, Math.PI, -Math.PI / 2],
  bed: [0, Math.PI / 2, Math.PI, -Math.PI / 2],
  table: [0, Math.PI / 2],
  bookshelf: [0, Math.PI / 2, Math.PI, -Math.PI / 2],
  tv: [0, Math.PI / 2, Math.PI, -Math.PI / 2],
  wardrobe: [0, Math.PI / 2, Math.PI, -Math.PI / 2],
  desk: [0, Math.PI / 2, Math.PI, -Math.PI / 2],
  default: [0, Math.PI / 2, Math.PI, -Math.PI / 2],
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: Axis-Aligned Bounding Box (AABB) for a placed item
// ─────────────────────────────────────────────────────────────────────────────
function getAABB(item) {
  const rot = item.rotation || 0;
  const isSwapped = Math.abs(Math.sin(rot)) > 0.5;
  const baseW = item.width || 0;
  const baseD = item.depth || 0;
  const w = isSwapped ? baseD : baseW;
  const d = isSwapped ? baseW : baseD;
  return {
    left: (item.x || 0) - w / 2,
    right: (item.x || 0) + w / 2,
    top: (item.y || 0) - d / 2,
    bottom: (item.y || 0) + d / 2,
    w,
    d
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: Check if two placed items overlap (with optional buffer)
// ─────────────────────────────────────────────────────────────────────────────
function overlaps(a, b, buffer = 0.5) {
  const aBox = getAABB(a);
  const bBox = getAABB(b);
  return !(
    aBox.right + buffer <= bBox.left ||
    aBox.left - buffer >= bBox.right ||
    aBox.bottom + buffer <= bBox.top ||
    aBox.top - buffer >= bBox.bottom
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STRUCTURAL CONSTRAINTS: Door Swing Exclusion Zones
//
// Each door creates a rectangular exclusion zone = the swing arc footprint.
// Items placed inside this zone would block the door from opening.
// Zone = door width × DOOR_SWING_DEPTH (3ft default) extending into the room.
// ─────────────────────────────────────────────────────────────────────────────
const DOOR_SWING_DEPTH = 3.0; // ft — standard interior door swing radius

/**
 * Compute exclusion zones for all doors in fixedElements.
 * Each zone is a rectangle { left, right, top, bottom } in room-space ft.
 */
function computeDoorExclusionZones(fixedElements = []) {
  return (fixedElements || [])
    .filter(el => el.type === 'door')
    .map(door => {
      const pos = door.position || (door.x || 0);  // position along wall
      const halfW = (door.width || 2.5) / 2;
      const swing = DOOR_SWING_DEPTH;

      switch (door.wall) {
        case 'top':    return { left: pos - halfW, right: pos + halfW, top: 0,             bottom: swing    };
        case 'bottom': return { left: pos - halfW, right: pos + halfW, top: -swing + 999,  bottom: 999      };
        case 'left':   return { left: 0,           right: swing,       top: pos - halfW,   bottom: pos + halfW + swing };
        case 'right':  return { left: 999 - swing, right: 999,         top: pos - halfW,   bottom: pos + halfW + swing };
        default:       return null;
      }
    })
    .filter(Boolean);
}

/**
 * Returns true if an item's AABB intersects any door exclusion zone.
 * A 0.5ft margin is added so items don’t crowd the doorway.
 */
function isInDoorZone(item, doorZones, margin = 0.5) {
  if (!doorZones || doorZones.length === 0) return false;
  const aabb = getAABB(item);
  return doorZones.some(zone =>
    aabb.left   - margin < zone.right  &&
    aabb.right  + margin > zone.left   &&
    aabb.top    - margin < zone.bottom &&
    aabb.bottom + margin > zone.top
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: Place a single item at a candidate position, spiraling to find clean spot
// ─────────────────────────────────────────────────────────────────────────────
function placeItemClean(item, targetX, targetY, rotation, placedSoFar, fixedElements, roomW, roomL, buffer = 0.7) {
  const rot = rotation;
  const isSwapped = Math.abs(Math.sin(rot)) > 0.5;
  const w = isSwapped ? item.depth : item.width;
  const d = isSwapped ? item.width : item.depth;
  const WALL_PAD = 0.6;

  const clamp = (x, y) => ({
    x: Math.max(w / 2 + WALL_PAD, Math.min(roomW - w / 2 - WALL_PAD, x)),
    y: Math.max(d / 2 + WALL_PAD, Math.min(roomL - d / 2 - WALL_PAD, y)),
  });

  const allObstacles = [...placedSoFar, ...(fixedElements || [])];

  const doorZones = computeDoorExclusionZones(fixedElements);

  const isClean = (c) =>
    !allObstacles.some(obs => overlaps(c, obs, buffer)) &&
    !isInDoorZone(c, doorZones);

  const candidate = { ...item, rotation: rot, ...clamp(targetX, targetY) };
  if (isClean(candidate)) return candidate;

  for (let r = 0.4; r <= Math.max(roomW, roomL); r += 0.35) {
    const steps = Math.max(10, Math.round((2 * Math.PI * r) / 0.4));
    for (let step = 0; step < steps; step++) {
      const angle = (step / steps) * 2 * Math.PI;
      const { x, y } = clamp(targetX + Math.cos(angle) * r, targetY + Math.sin(angle) * r);
      const cand = { ...candidate, x, y };
      if (isClean(cand)) return cand;
    }
  }

  // If we couldn't find a spot with this buffer, and the buffer is large, try with a smaller one
  if (buffer > 0.2) {
    return placeItemClean(item, targetX, targetY, rotation, placedSoFar, fixedElements, roomW, roomL, 0.1);
  }

  return { ...candidate, ...clamp(targetX, targetY), _overflow: true };
}


// ─────────────────────────────────────────────────────────────────────────────
// CANDIDATE GENERATION
// Generates N random valid layouts for a given furniture list + room
// ─────────────────────────────────────────────────────────────────────────────
function generateCandidates(room, furniture, fixedElements, focalPoint, count = 200) {
  const roomW = room.width || 15;
  const roomL = room.length || 20;
  const candidates = [];

  const doors = (fixedElements || []).filter(e => e.type === 'door');
  const windows = (fixedElements || []).filter(e => e.type === 'window');

  const focal = focalPoint || { x: roomW / 2, y: 1.0 };

  const TOTAL = count;
  const zoneSize = Math.floor(TOTAL / 4);

  let validCandidates = 0;
  let attempts = 0;
  const MAX_ATTEMPTS = TOTAL * 3;

  while (validCandidates < TOTAL && attempts < MAX_ATTEMPTS) {
    attempts++;
    const placed = [];
    const zone = Math.floor(validCandidates / zoneSize) % 4;
    let overflowed = false;

    for (const item of furniture) {
      const typeKey = (item.type || 'default').toLowerCase().replace(/ /g, '_');
      const validRots = VALID_ROTATIONS_BY_TYPE[typeKey] || VALID_ROTATIONS_BY_TYPE.default;
      const rot = validRots[Math.floor(Math.random() * validRots.length)];

      let tx, ty;

      if (WALL_TYPES.has(typeKey)) {
        const wall = Math.floor(Math.random() * 4);
        const isSwapped = Math.abs(Math.sin(rot)) > 0.5;
        const d = isSwapped ? item.width : item.depth;
        if (wall === 0) { tx = roomW * (0.1 + Math.random() * 0.8); ty = d / 2 + 0.4 + Math.random() * 0.5; }
        else if (wall === 1) { tx = roomW - d / 2 - 0.4 - Math.random() * 0.5; ty = roomL * (0.1 + Math.random() * 0.8); }
        else if (wall === 2) { tx = roomW * (0.1 + Math.random() * 0.8); ty = roomL - d / 2 - 0.4 - Math.random() * 0.5; }
        else { tx = d / 2 + 0.4 + Math.random() * 0.5; ty = roomL * (0.1 + Math.random() * 0.8); }
      } else if (FOCAL_FACING_TYPES.has(typeKey)) {
        if (zone === 0) {
          tx = roomW * (0.10 + Math.random() * 0.80);
          ty = roomL * (0.20 + Math.random() * 0.20);
        } else if (zone === 1) {
          tx = roomW * (0.10 + Math.random() * 0.80);
          ty = roomL * (0.65 + Math.random() * 0.25);
        } else if (zone === 2) {
          tx = roomW * (0.05 + Math.random() * 0.25);
          ty = roomL * (0.20 + Math.random() * 0.60);
        } else {
          tx = roomW * (0.70 + Math.random() * 0.25);
          ty = roomL * (0.20 + Math.random() * 0.60);
        }
      } else if (CENTER_FLOAT_TYPES.has(typeKey)) {
        tx = roomW * (0.20 + Math.random() * 0.60);
        ty = roomL * (0.25 + Math.random() * 0.50);
      } else {
        tx = roomW * (0.05 + Math.random() * 0.90);
        ty = roomL * (0.05 + Math.random() * 0.90);
      }

      const placedItem = placeItemClean(item, tx, ty, rot, placed, fixedElements, roomW, roomL);
      if (placedItem._overflow) {
        overflowed = true;
        break;
      }
      placed.push(placedItem);
    }

    if (!overflowed) {
      candidates.push(placed);
      validCandidates++;
    }
  }

  return candidates;
}

// ─────────────────────────────────────────────────────────────────────────────
// SCORING METRICS
// Each returns 0.0–1.0. Higher = better.
// ─────────────────────────────────────────────────────────────────────────────

/** How much open floor space remains (minimalist metric) */
function scoreWalkway(layout, room, fixedElements) {
  const roomW = room.width;
  const roomL = room.length;
  const totalArea = roomW * roomL;
  
  // Sample a grid of points and count free cells
  const steps = 10;
  let freeCount = 0;
  for (let yi = 0; yi < steps; yi++) {
    for (let xi = 0; xi < steps; xi++) {
      const px = (xi + 0.5) / steps * roomW;
      const py = (yi + 0.5) / steps * roomL;
      const point = { x: px, y: py, width: 0.1, depth: 0.1, rotation: 0 };
      const blocked = layout.some(item => overlaps(point, item, 0));
      if (!blocked) freeCount++;
    }
  }
  return freeCount / (steps * steps);
}

/** How well seating faces the focal point (TV/focal element) */
function scoreFocal(layout, room, focalPoint) {
  if (!focalPoint) return 0.5;
  const fx = focalPoint.x || room.width / 2;
  const fy = focalPoint.y || 1.0;

  const seatItems = layout.filter(i => FOCAL_FACING_TYPES.has((i.type || '').toLowerCase()));
  if (seatItems.length === 0) return 0.5;

  let totalScore = 0;
  for (const seat of seatItems) {
    // Ideal: seat is facing toward focal point
    // Compute angle from seat to focal, compare with rotation
    const dx = fx - seat.x;
    const dy = fy - seat.y;
    const idealAngle = Math.atan2(dy, dx) - Math.PI / 2; // facing toward focal
    const itemAngle = seat.rotation || 0;
    const angleDiff = Math.abs(((idealAngle - itemAngle + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
    const angleScore = 1 - angleDiff / Math.PI;

    // Also score by distance: 6–12 ft from focal is ideal
    const dist = Math.sqrt(dx * dx + dy * dy);
    const idealDist = Math.min(room.width, room.length) * 0.4;
    const distScore = 1 - Math.min(1, Math.abs(dist - idealDist) / idealDist);

    totalScore += (angleScore * 0.6 + distScore * 0.4);
  }
  return totalScore / seatItems.length;
}

/** How close seating is to windows (light metric) */
function scoreLight(layout, room, fixedElements) {
  const windows = (fixedElements || []).filter(e => e.type === 'window');
  if (windows.length === 0) return 0.3; // No windows specified → neutral

  const seatItems = layout.filter(i => FOCAL_FACING_TYPES.has((i.type || '').toLowerCase()));
  if (seatItems.length === 0) return 0.3;

  let total = 0;
  for (const seat of seatItems) {
    let best = 0;
    for (const win of windows) {
      const dx = (win.x || 0) - seat.x;
      const dy = (win.y || 0) - seat.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxDist = Math.max(room.width, room.length);
      best = Math.max(best, 1 - dist / maxDist);
    }
    total += best;
  }
  return total / seatItems.length;
}

/** How evenly distributed the furniture is across the room space */
function scoreBalance(layout, room) {
  if (layout.length < 2) return 0.5;
  const cx = room.width / 2;
  const cy = room.length / 2;

  // Calculate center of mass of all furniture
  const comX = layout.reduce((s, i) => s + i.x, 0) / layout.length;
  const comY = layout.reduce((s, i) => s + i.y, 0) / layout.length;

  // Distance of center of mass from room center (lower = more balanced)
  const dx = Math.abs(comX - cx) / (room.width / 2);
  const dy = Math.abs(comY - cy) / (room.length / 2);
  const imbalance = (dx + dy) / 2;
  
  return Math.max(0, 1 - imbalance);
}

/** How well wall-type furniture is actually against walls */
function scoreWallAdjacency(layout, room) {
  const wallItems = layout.filter(i => WALL_TYPES.has((i.type || '').toLowerCase()));
  if (wallItems.length === 0) return 1.0;

  let score = 0;
  for (const item of wallItems) {
    const box = getAABB(item);
    const wallDists = [
      box.left,                          // dist from left wall
      room.width - box.right,            // dist from right wall
      box.top,                           // dist from top wall
      room.length - box.bottom           // dist from bottom wall
    ];
    const minDist = Math.min(...wallDists);
    // Within 1.2ft of a wall = great
    const itemScore = Math.max(0, 1 - minDist / 2.0);
    score += itemScore;
  }
  return score / wallItems.length;
}

/** How clear the area around doors is */
function scoreDoorClearance(layout, fixedElements) {
  const doors = (fixedElements || []).filter(e => e.type === 'door');
  if (doors.length === 0) return 0.5; // No doors = neutral

  let totalScore = 0;
  for (const door of doors) {
    const doorX = door.x || 0;
    const doorY = door.y || 0;
    const swingRadius = 3.5; // 3.5ft swing arc clearance
    
    // Check if any furniture is within swing zone
    let blocked = false;
    for (const item of layout) {
      const dx = item.x - doorX;
      const dy = item.y - doorY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < swingRadius + Math.max(item.width, item.depth) / 2) {
        blocked = true;
        break;
      }
    }
    totalScore += blocked ? 0 : 1;
  }
  return totalScore / doors.length;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN SCORER: score a single layout against a philosophy weight vector
// ─────────────────────────────────────────────────────────────────────────────
export function scoreLayout(layout, room, fixedElements, focalPoint, weights) {
  const w = weights;
  const s = {
    walkway:    scoreWalkway(layout, room, fixedElements),
    focal:      scoreFocal(layout, room, focalPoint),
    light:      scoreLight(layout, room, fixedElements),
    balance:    scoreBalance(layout, room),
    wallAdj:    scoreWallAdjacency(layout, room),
    doorClear:  scoreDoorClearance(layout, fixedElements),
  };

  const total =
    w.walkway   * s.walkway +
    w.focal     * s.focal +
    w.light     * s.light +
    w.balance   * s.balance +
    w.wallAdj   * s.wallAdj +
    w.doorClear * s.doorClear;

  return { total, breakdown: s };
}

// ─────────────────────────────────────────────────────────────────────────────
// DIVERSITY CHECK: Are two layouts visibly different from each other?
// Returns average positional distance across all items (0.0–1.0)
// ─────────────────────────────────────────────────────────────────────────────
function layoutDiversity(layoutA, layoutB, room) {
  if (!layoutA || !layoutB || layoutA.length !== layoutB.length) return 1.0;
  const maxDist = Math.sqrt(room.width * room.width + room.length * room.length);
  let totalDist = 0;
  for (let i = 0; i < layoutA.length; i++) {
    const a = layoutA[i];
    const b = layoutB[i];
    if (!a || !b) continue;
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    totalDist += Math.sqrt(dx * dx + dy * dy);
  }
  return totalDist / (layoutA.length * maxDist);
}

// ─────────────────────────────────────────────────────────────────────────────
// PLAIN ENGLISH EXPLANATION GENERATOR
// ─────────────────────────────────────────────────────────────────────────────
function generateExplanation(layout, room, fixedElements, focalPoint, scores, philosophyId) {
  const doors = (fixedElements || []).filter(e => e.type === 'door');
  const windows = (fixedElements || []).filter(e => e.type === 'window');
  const sofas = layout.filter(i => (i.type || '').toLowerCase() === 'sofa');
  const focal = focalPoint || { x: room.width / 2, y: 1.0 };

  const parts = [];

  if (sofas.length > 0 && focalPoint) {
    const dist = Math.sqrt(
      Math.pow(sofas[0].x - focal.x, 2) + Math.pow(sofas[0].y - focal.y, 2)
    );
    parts.push(`Primary sofa is ${dist.toFixed(1)}ft from the focal point`);
  }

  if (scores.breakdown.walkway > 0.6) {
    parts.push(`${Math.round(scores.breakdown.walkway * 100)}% open floor space preserved`);
  } else {
    parts.push(`room is densely furnished — consider removing 1–2 items`);
  }

  if (doors.length > 0 && scores.breakdown.doorClear > 0.7) {
    parts.push(`door swing area is clear`);
  } else if (doors.length > 0) {
    parts.push(`⚠ check door swing — some furniture may be too close`);
  }

  if (windows.length > 0 && scores.breakdown.light > 0.6) {
    parts.push(`seating benefits from natural window light`);
  }

  return parts.join('. ') + '.';
}

// ─────────────────────────────────────────────────────────────────────────────
// FIT WARNINGS: Check each item for practical clearance issues
// ─────────────────────────────────────────────────────────────────────────────
function generateFitWarnings(layout, room, fixedElements) {
  const warnings = [];
  const doors = (fixedElements || []).filter(e => e.type === 'door');
  const WALKWAY_MINIMUM_FT = 2.5;

  for (const item of layout) {
    const box = getAABB(item);
    
    // Check wall clearance on all sides
    const leftClear = box.left;
    const rightClear = room.width - box.right;
    const topClear = box.top;
    const bottomClear = room.length - box.bottom;
    const minClear = Math.min(leftClear, rightClear, topClear, bottomClear);

    if (minClear < WALKWAY_MINIMUM_FT) {
      const clearInInches = Math.round(minClear * 12);
      warnings.push({
        itemId: item.id,
        itemType: item.type,
        message: `${item.type} leaves only ${clearInInches}" clearance to nearest wall (min 30" recommended)`
      });
    }

    // Check door proximity
    for (const door of doors) {
      const dx = item.x - (door.x || 0);
      const dy = item.y - (door.y || 0);
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 3.0 + Math.max(item.width, item.depth) / 2) {
        warnings.push({
          itemId: item.id,
          itemType: item.type,
          message: `${item.type} may interfere with door swing — move it at least 3ft from the door`
        });
      }
    }
  }

  return warnings;
}

// ─────────────────────────────────────────────────────────────────────────────
// SIMULATED ANNEALING REFINEMENT (Make It Home — SIGGRAPH 2011 method)
//
// After the generate→score→pick phase finds the best candidate, SA takes
// that layout and keeps trying small perturbations (nudges + rotations).
// It accepts worse solutions with probability e^(ΔE/T), so it can escape
// local optima that pure random search cannot.
//
// Parameters tuned for <50ms budget:
//   T0 = 1.0  (starting temperature — accepts 37% of solutions that are 1.0 worse)
//   Tf = 0.01 (final temperature — almost never accepts bad moves)
//   iterations = 150 (fast enough for real-time, meaningful improvement)
// ─────────────────────────────────────────────────────────────────────────────
function refineCandidateWithSA(layout, room, fixedElements, focalPoint, weights) {
  const T0 = 1.0;
  const Tf = 0.01;
  const ITERATIONS = 50;
  const CLEAR_BUFFER = 0.7;
  const WALL_PAD = 0.6;

  // Deep-copy the layout so we don't mutate the original
  let current = layout.map(item => ({ ...item }));
  let currentScore = scoreLayout(current, room, fixedElements, focalPoint, weights).total;
  let best = current.map(item => ({ ...item }));
  let bestScore = currentScore;

  for (let iter = 0; iter < ITERATIONS; iter++) {
    const T = T0 * Math.pow(Tf / T0, iter / ITERATIONS); // geometric cooling

    // Pick a random item to perturb
    const idx = Math.floor(Math.random() * current.length);
    const item = current[idx];
    const aabb = getAABB(item);

    // Perturbation: small nudge (up to 1.5ft) or 90° rotation flip
    const perturb = Math.random();
    let newItem;
    if (perturb < 0.6) {
      // Position nudge
      const dx = (Math.random() - 0.5) * 3.0;
      const dy = (Math.random() - 0.5) * 3.0;
      const rot = item.rotation || 0;
      const isSwapped = Math.abs(Math.sin(rot)) > 0.5;
      const w = isSwapped ? item.depth : item.width;
      const d = isSwapped ? item.width : item.depth;
      newItem = {
        ...item,
        x: Math.max(w / 2 + WALL_PAD, Math.min(room.width  - w / 2 - WALL_PAD, item.x + dx)),
        y: Math.max(d / 2 + WALL_PAD, Math.min(room.length - d / 2 - WALL_PAD, item.y + dy)),
      };
    } else {
      // Rotation flip (90° increments)
      const rotations = VALID_ROTATIONS_BY_TYPE[(item.type || '').toLowerCase()]
        || VALID_ROTATIONS_BY_TYPE.default;
      const newRot = rotations[Math.floor(Math.random() * rotations.length)];
      const isSwapped = Math.abs(Math.sin(newRot)) > 0.5;
      const w = isSwapped ? item.depth : item.width;
      const d = isSwapped ? item.width : item.depth;
      newItem = {
        ...item,
        rotation: newRot,
        x: Math.max(w / 2 + WALL_PAD, Math.min(room.width  - w / 2 - WALL_PAD, item.x)),
        y: Math.max(d / 2 + WALL_PAD, Math.min(room.length - d / 2 - WALL_PAD, item.y)),
      };
    }

    // Check that the new position doesn't collide with other items
    const others = current.filter((_, i) => i !== idx);
    const collides = others.some(other => overlaps(newItem, other, CLEAR_BUFFER));
    if (collides) continue; // reject without energy calculation

    // Build new layout and score it
    const newLayout = [...others.slice(0, idx), newItem, ...others.slice(idx)];
    // Reconstruct in original order
    const trial = current.map((orig, i) => i === idx ? newItem : orig);
    const trialScore = scoreLayout(trial, room, fixedElements, focalPoint, weights).total;

    // Metropolis acceptance criterion
    const delta = trialScore - currentScore;
    if (delta > 0 || Math.random() < Math.exp(delta / T)) {
      current = trial;
      currentScore = trialScore;
      if (currentScore > bestScore) {
        best = current.map(item => ({ ...item }));
        bestScore = currentScore;
      }
    }
  }

  return { layout: best, scoreTotal: bestScore };
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXPORT: Generate best layout for a given philosophy
// ─────────────────────────────────────────────────────────────────────────────
export function generateScoredLayout(room, furniture, fixedElements, focalPoint, philosophyId, candidatePool = null) {
  const weights = PHILOSOPHY_WEIGHTS[philosophyId] || PHILOSOPHY_WEIGHTS['philosophy-curator'];
  
  // Use shared candidate pool if provided (for efficiency), else generate
  const candidates = candidatePool || generateCandidates(room, furniture, fixedElements, focalPoint, 350);

  // Score every candidate
  const scored = candidates.map(layout => ({
    layout,
    scores: scoreLayout(layout, room, fixedElements, focalPoint, weights)
  }));

  // Sort by total score descending
  scored.sort((a, b) => b.scores.total - a.scores.total);

  let best = scored[0];
  if (!best) return null;

  // ── SA Refinement pass ────────────────────────────────────────────────────
  // Take the best random candidate and run SA to squeeze out more quality.
  // SA can escape local optima (e.g. sofa at 7ft might score better at 6.8ft
  // with a slightly different chair rotation).
  const refined = refineCandidateWithSA(
    best.layout, room, fixedElements, focalPoint, weights
  );
  // Only use SA result if it genuinely improved the score
  if (refined.scoreTotal > best.scores.total) {
    best = {
      layout: refined.layout,
      scores: scoreLayout(refined.layout, room, fixedElements, focalPoint, weights)
    };
  }

  const explanation = generateExplanation(
    best.layout, room, fixedElements, focalPoint, best.scores, philosophyId
  );
  const fitWarnings = generateFitWarnings(best.layout, room, fixedElements);

  return {
    layout: best.layout,
    scoreTotal: Math.round(best.scores.total * 100),
    scoreBreakdown: {
      walkway:   Math.round(best.scores.breakdown.walkway * 100),
      focal:     Math.round(best.scores.breakdown.focal * 100),
      light:     Math.round(best.scores.breakdown.light * 100),
      balance:   Math.round(best.scores.breakdown.balance * 100),
      wallAdj:   Math.round(best.scores.breakdown.wallAdj * 100),
      doorClear: Math.round(best.scores.breakdown.doorClear * 100),
    },
    explanation,
    fitWarnings,
  };
}

// Export the candidate generator for shared use
export { generateCandidates, layoutDiversity };
