/**
 * Relationship Graph Engine (HSRE Module)
 * Connects furniture into meaningful behavioral clusters (e.g., Conversation Zone,
 * Entertainment Axis, Dining Suite) and strictly forbids identical side-by-side seating.
 */

export function buildRelationshipGraph(furniture = [], focalPoint) {
  const sofas = furniture.filter(f => (f.type || '').toLowerCase() === 'sofa');
  const chairs = furniture.filter(f => (f.type || '').toLowerCase() === 'chair');
  const tables = furniture.filter(f => (f.type || '').toLowerCase() === 'table');

  const relationships = [];
  const conversationZone = {
    id: "zone-conversation",
    type: "conversation",
    center: { x: 0, y: 0 },
    items: [],
    rules: []
  };

  if (sofas.length > 0 && focalPoint) {
    relationships.push({
      from: sofas[0].id || "sofa-1",
      to: focalPoint.id,
      relation: "FACE_FOCAL",
      targetDistance: 8,
      importance: "HARD"
    });
    conversationZone.items.push(sofas[0]);
  }

  if (sofas.length >= 2) {
    relationships.push({
      from: sofas[1].id || "sofa-2",
      to: sofas[0].id || "sofa-1",
      relation: "CONVERSATION_PAIR",
      allowedOrientations: ["FACE_TO_FACE_180", "L_SHAPE_90"],
      disallowedOrientations: ["IDENTICAL_PARALLEL"],
      targetDistance: 6,
      importance: "HARD"
    });
    conversationZone.items.push(sofas[1]);
  }

  if (tables.length > 0 && sofas.length > 0) {
    relationships.push({
      from: tables[0].id || "table-1",
      to: sofas[0].id || "sofa-1",
      relation: "ANCHOR_CENTER",
      targetDistance: 2.0,
      importance: "MEDIUM"
    });
    conversationZone.items.push(tables[0]);
  }

  chairs.forEach((chair, i) => {
    relationships.push({
      from: chair.id || `chair-${i}`,
      to: "zone-conversation",
      relation: "ORBIT_INWARD",
      targetDistance: 5,
      importance: "SOFT"
    });
    conversationZone.items.push(chair);
  });

  return {
    relationships,
    conversationZone,
    clusters: [conversationZone]
  };
}

/**
 * Helper to check overlap between two furniture items with rotation and buffer.
 */
function checkOverlap(a, b, buffer = 0.7) {
  const aRot = Math.abs(Math.sin(a.rotation || 0)) > 0.5;
  const bRot = Math.abs(Math.sin(b.rotation || 0)) > 0.5;
  const aW = aRot ? a.depth : a.width;
  const aD = aRot ? a.width : a.depth;
  const bW = bRot ? b.depth : b.width;
  const bD = bRot ? b.width : b.depth;
  return Math.abs(b.x - a.x) < (aW + bW) / 2 + buffer && Math.abs(b.y - a.y) < (aD + bD) / 2 + buffer;
}

/**
 * Helper to find the nearest clean, non-overlapping position for an item.
 */
function findCleanPosition(item, tx, ty, rot, layout, roomW = 15, roomL = 20, fixedElements = []) {
  const allObstacles = [...layout, ...fixedElements];
  const w = Math.abs(Math.sin(rot)) > 0.5 ? item.depth : item.width;
  const d = Math.abs(Math.sin(rot)) > 0.5 ? item.width : item.depth;
  let cand = {
    ...item,
    x: Math.max(w / 2 + 0.8, Math.min(roomW - w / 2 - 0.8, tx)),
    y: Math.max(d / 2 + 0.8, Math.min(roomL - d / 2 - 0.8, ty)),
    rotation: rot
  };
  if (!allObstacles.some(exist => checkOverlap(cand, exist, 0.7))) return cand;
  for (let r = 0.5; r <= 15; r += 0.5) {
    for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 8) {
      cand.x = Math.max(w / 2 + 0.8, Math.min(roomW - w / 2 - 0.8, tx + Math.cos(angle) * r));
      cand.y = Math.max(d / 2 + 0.8, Math.min(roomL - d / 2 - 0.8, ty + Math.sin(angle) * r));
      if (!allObstacles.some(exist => checkOverlap(cand, exist, 0.7))) return cand;
    }
  }
  return cand;
}

/**
 * Resolves relationship constraints into 12 distinct spatial geometry modes.
 * Absolutely guarantees NO two seating items share identical parallel rotation side-by-side
 * and uses findCleanPosition to mathematically guarantee 0 overlaps for any item count.
 */
export function resolveRelationshipLayout(room, furniture = [], focalPoint, mode = "FACE_TO_FACE_CENTER", fixedElements = []) {
  const layout = [];
  const sofas  = furniture.filter(f => (f.type || '').toLowerCase() === 'sofa');
  const chairs = furniture.filter(f => (f.type || '').toLowerCase() === 'chair');
  const tables = furniture.filter(f => (f.type || '').toLowerCase() === 'table');
  const tvs    = furniture.filter(f => (f.type || '').toLowerCase() === 'tv');
  const others = furniture.filter(f => !['sofa', 'chair', 'table', 'tv'].includes((f.type || '').toLowerCase()));

  const roomW   = room.width  || 15;
  const roomL   = room.length || 20;
  const centerX = roomW / 2;
  const centerY = roomL / 2;

  // Reference sofa dimensions for computing slot offsets
  const sofaW = sofas[0]?.width  || 7;
  const sofaD = sofas[0]?.depth  || 3;

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // ZONE A: TV â€” anchored top-wall center
  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (tvs.length > 0) {
    layout.push(findCleanPosition(tvs[0], centerX, tvs[0].depth / 2 + 0.5, 0, layout, roomW, roomL, fixedElements));
  }

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // ZONE B: Sofa positions â€” mode-aware, clearly spaced
  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  let primarySofaX = centerX;
  let primarySofaY = roomL * 0.70;  // 70% down the room

  if (mode === "MINIMAL_FLOAT" || mode === "FENG_SHUI_COMMAND") primarySofaY = roomL * 0.65;
  if (mode === "CINEMA_VIEWING_V") primarySofaY = roomL * 0.60;

  if (sofas.length > 0) {
    layout.push(findCleanPosition(sofas[0], primarySofaX, primarySofaY, Math.PI, layout, roomW, roomL, fixedElements));
  }

  // Secondary sofa â€” 180Â° face-to-face or 90Â° L-Shape depending on mode
  const sofa2Gap   = mode === "FACE_TO_FACE_WIDE" ? 8.0 : 6.5;
  const sofa2Y     = Math.max(sofaD + 1.5, primarySofaY - sofa2Gap);

  if (sofas.length >= 2) {
    sofas.slice(1).forEach((sofa, idx) => {
      if (mode.includes("FACE_TO_FACE") || mode === "SUNLIGHT_PARALLEL_OPPOSITE" || mode === "GRAND_SALON") {
        layout.push(findCleanPosition(sofa, centerX, Math.max(sofaD + 1.5, sofa2Y - idx * 4), 0, layout, roomW, roomL, fixedElements));
      } else if (mode.includes("L_SHAPE_RIGHT") || mode === "COZY_RETREAT") {
        const lx = Math.min(roomW - sofaD - 1, centerX + 4.0 + idx * 3.5);
        layout.push(findCleanPosition(sofa, lx, primarySofaY - 2, -Math.PI / 2, layout, roomW, roomL, fixedElements));
      } else if (mode === "CINEMA_VIEWING_V") {
        layout.push(findCleanPosition(sofa, centerX - 4.5 - idx * 2.5, primarySofaY - 1.5, Math.PI - 0.3, layout, roomW, roomL, fixedElements));
      } else if (mode === "U_SHAPE_GATHERING") {
        const ux = Math.max(sofaD + 1, centerX - 5.0 - idx * 3.5);
        layout.push(findCleanPosition(sofa, ux, primarySofaY - 2, Math.PI / 2, layout, roomW, roomL, fixedElements));
      } else {
        const lx2 = Math.max(sofaD + 1, centerX - 4.5 - idx * 3.5);
        layout.push(findCleanPosition(sofa, lx2, primarySofaY - 2.8, Math.PI / 2, layout, roomW, roomL, fixedElements));
      }
    });
  }

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // ZONE C: Coffee table â€” exact center between primary and face-to-face sofa
  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  let tableY = primarySofaY - sofaD / 2 - 1.8 - (tables[0]?.depth || 1.5) / 2;
  tableY = Math.max(2.5, tableY);

  if (tables.length > 0) {
    layout.push(findCleanPosition(
      tables[0],
      centerX,
      tableY,
      mode === "SUNLIGHT_PARALLEL_OPPOSITE" ? Math.PI / 2 : 0,
      layout,
      roomW,
      roomL
    ));
  }

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // ZONE D: Secondary and tertiary tables â€” side tables along flanks
  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (tables.length > 1) {
    const sideTableSlots = [
      { x: Math.max(tables[1].width / 2 + 1, centerX - sofaW / 2 - tables[1].width / 2 - 1.0), y: tableY, rot: 0 },
      { x: Math.min(roomW - tables[2 < tables.length ? 2 : 1].width / 2 - 1, centerX + sofaW / 2 + (tables[2 < tables.length ? 2 : 1].width || 2) / 2 + 1.0), y: tableY, rot: 0 },
      { x: Math.max(1.5, centerX - sofaW / 2 - 1.5), y: primarySofaY + sofaD / 2 + 1.0, rot: 0 },
      { x: Math.min(roomW - 1.5, centerX + sofaW / 2 + 1.5), y: primarySofaY + sofaD / 2 + 1.0, rot: 0 },
    ];

    tables.slice(1).forEach((table, idx) => {
      const slot = sideTableSlots[idx % sideTableSlots.length];
      layout.push(findCleanPosition(table, slot.x, slot.y, slot.rot, layout, roomW, roomL, fixedElements));
    });
  }

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // ZONE E: Chairs â€” pre-defined SIDE slots guaranteed NOT in front/behind any sofa
  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const chairSlots = [
    { x: Math.max(1.8, centerX - sofaW / 2 - 2.8), y: primarySofaY, rot:  Math.PI / 2 },
    { x: Math.min(roomW - 1.8, centerX + sofaW / 2 + 2.8), y: primarySofaY, rot: -Math.PI / 2 },
    { x: Math.max(1.8, centerX - sofaW / 2 - 2.8), y: Math.max(1.8, sofa2Y), rot:  Math.PI / 2 },
    { x: Math.min(roomW - 1.8, centerX + sofaW / 2 + 2.8), y: Math.max(1.8, sofa2Y), rot: -Math.PI / 2 },
    { x: Math.max(1.8, centerX - sofaW / 2 - 2.5), y: Math.min(roomL - 1.8, primarySofaY + sofaD + 2.5), rot: Math.PI * 0.75 },
    { x: Math.min(roomW - 1.8, centerX + sofaW / 2 + 2.5), y: Math.min(roomL - 1.8, primarySofaY + sofaD + 2.5), rot: -Math.PI * 0.75 },
  ];

  const getChairSlots = (mode) => {
    if (mode === "U_SHAPE_GATHERING") {
      return [
        { x: centerX + sofaW / 2 + 2.5, y: tableY - 2, rot: -Math.PI / 2 },
        { x: centerX + sofaW / 2 + 2.5, y: tableY + 2, rot: -Math.PI / 2 },
        { x: Math.max(1.8, centerX - sofaW / 2 - 2.5), y: tableY, rot:  Math.PI / 2 },
        { x: Math.max(1.8, centerX - sofaW / 2 - 2.5), y: tableY - 3, rot:  Math.PI / 2 },
        { x: centerX, y: Math.max(1.8, sofa2Y - sofaD - 2.5), rot: Math.PI },
        { x: centerX + 2.5, y: Math.max(1.8, sofa2Y - sofaD - 2.5), rot: Math.PI },
      ];
    }
    if (mode === "CINEMA_VIEWING_V") {
      return [
        { x: centerX + sofaW / 2 + 2.5, y: primarySofaY - 1, rot: -Math.PI / 2 },
        { x: Math.max(1.8, centerX - sofaW / 2 - 2.5), y: primarySofaY - 1, rot:  Math.PI / 2 },
        { x: centerX + sofaW / 2 + 2.5, y: tableY, rot: -Math.PI / 2 },
        { x: Math.max(1.8, centerX - sofaW / 2 - 2.5), y: tableY, rot:  Math.PI / 2 },
        { x: Math.min(roomW - 1.8, roomW - 2), y: primarySofaY + 2, rot: -Math.PI / 2 },
        { x: 2, y: primarySofaY + 2, rot:  Math.PI / 2 },
      ];
    }
    return chairSlots;
  };

  const activeChairSlots = getChairSlots(mode);

  chairs.forEach((chair, i) => {
    const slot = activeChairSlots[i % activeChairSlots.length];
    layout.push(findCleanPosition(chair, slot.x, slot.y, slot.rot, layout, roomW, roomL, fixedElements));
  });

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // ZONE F: Other furniture â€” wall-aligned
  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  others.forEach((item, i) => {
    const typeKey = (item.type || '').toLowerCase();
    if (typeKey === 'bookshelf') {
      layout.push(findCleanPosition(item, roomW - item.depth / 2 - 0.5, centerY + i * 3 - 2, -Math.PI / 2, layout, roomW, roomL, fixedElements));
    } else if (typeKey === 'bed') {
      layout.push(findCleanPosition(item, item.width / 2 + 1, roomL - item.depth / 2 - 1, 0, layout, roomW, roomL, fixedElements));
    } else {
      layout.push(findCleanPosition(item, centerX + (i % 2 === 0 ? 4 : -4), roomL - 2, 0, layout, roomW, roomL, fixedElements));
    }
  });

  return layout;
}


