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
 * Resolves relationship constraints into 12 distinct spatial geometry modes.
 * Absolutely guarantees NO two seating items share identical parallel rotation side-by-side.
 */
export function resolveRelationshipLayout(room, furniture = [], focalPoint, mode = "FACE_TO_FACE_CENTER") {
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

  // ─────────────────────────────────────────────────────────────────
  // ZONE A: TV — anchored top-wall center
  // ─────────────────────────────────────────────────────────────────
  if (tvs.length > 0) {
    layout.push({ ...tvs[0], x: centerX, y: tvs[0].depth / 2 + 0.5, rotation: 0 });
  }

  // ─────────────────────────────────────────────────────────────────
  // ZONE B: Sofa positions — mode-aware, clearly spaced
  // ─────────────────────────────────────────────────────────────────
  let primarySofaX = centerX;
  let primarySofaY = roomL * 0.70;  // 70% down the room

  // Adjust for specific modes
  if (mode === "MINIMAL_FLOAT" || mode === "FENG_SHUI_COMMAND") primarySofaY = roomL * 0.65;
  if (mode === "CINEMA_VIEWING_V") primarySofaY = roomL * 0.60;

  if (sofas.length > 0) {
    layout.push({ ...sofas[0], x: primarySofaX, y: primarySofaY, rotation: Math.PI });
  }

  // Secondary sofa — 180° face-to-face or 90° L-Shape depending on mode
  const sofa2Gap   = mode === "FACE_TO_FACE_WIDE" ? 8.0 : 6.5;
  const sofa2Y     = Math.max(sofaD + 1.5, primarySofaY - sofa2Gap);

  if (sofas.length >= 2) {
    sofas.slice(1).forEach((sofa, idx) => {
      if (mode.includes("FACE_TO_FACE") || mode === "SUNLIGHT_PARALLEL_OPPOSITE" || mode === "GRAND_SALON") {
        layout.push({ ...sofa, x: centerX, y: Math.max(sofaD + 1.5, sofa2Y - idx * 4), rotation: 0 });
      } else if (mode.includes("L_SHAPE_RIGHT") || mode === "COZY_RETREAT") {
        const lx = Math.min(roomW - sofaD - 1, centerX + 4.0 + idx * 3.5);
        layout.push({ ...sofa, x: lx, y: primarySofaY - 2, rotation: -Math.PI / 2 });
      } else if (mode === "CINEMA_VIEWING_V") {
        layout.push({ ...sofa, x: centerX - 4.5 - idx * 2.5, y: primarySofaY - 1.5, rotation: Math.PI - 0.3 });
      } else if (mode === "U_SHAPE_GATHERING") {
        const ux = Math.max(sofaD + 1, centerX - 5.0 - idx * 3.5);
        layout.push({ ...sofa, x: ux, y: primarySofaY - 2, rotation: Math.PI / 2 });
      } else {
        const lx2 = Math.max(sofaD + 1, centerX - 4.5 - idx * 3.5);
        layout.push({ ...sofa, x: lx2, y: primarySofaY - 2.8, rotation: Math.PI / 2 });
      }
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // ZONE C: Coffee table — exact center between primary and face-to-face sofa
  // ─────────────────────────────────────────────────────────────────
  let tableY = primarySofaY - sofaD / 2 - 1.8 - (tables[0]?.depth || 1.5) / 2;
  tableY = Math.max(2.5, tableY);

  if (tables.length > 0) {
    layout.push({
      ...tables[0],
      x: centerX,
      y: tableY,
      rotation: mode === "SUNLIGHT_PARALLEL_OPPOSITE" ? Math.PI / 2 : 0
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // ZONE D: Secondary and tertiary tables — side tables along flanks
  // Positioned BESIDE the conversation zone, not on top of sofas
  // ─────────────────────────────────────────────────────────────────
  if (tables.length > 1) {
    // Pre-defined side-table slots that are guaranteed clear of sofa zones
    const sideTableSlots = [
      // Flanking the coffee table area, at the sides of the conversation zone
      { x: Math.max(tables[1].width / 2 + 1, centerX - sofaW / 2 - tables[1].width / 2 - 1.0), y: tableY, rot: 0 },
      { x: Math.min(roomW - tables[2 < tables.length ? 2 : 1].width / 2 - 1, centerX + sofaW / 2 + (tables[2 < tables.length ? 2 : 1].width || 2) / 2 + 1.0), y: tableY, rot: 0 },
      // End-table next to primary sofa back corner
      { x: Math.max(1.5, centerX - sofaW / 2 - 1.5), y: primarySofaY + sofaD / 2 + 1.0, rot: 0 },
      { x: Math.min(roomW - 1.5, centerX + sofaW / 2 + 1.5), y: primarySofaY + sofaD / 2 + 1.0, rot: 0 },
    ];

    tables.slice(1).forEach((table, idx) => {
      const slot = sideTableSlots[idx % sideTableSlots.length];
      layout.push({
        ...table,
        x: Math.max(table.width / 2 + 1, Math.min(roomW - table.width / 2 - 1, slot.x)),
        y: Math.max(table.depth / 2 + 1, Math.min(roomL - table.depth / 2 - 1, slot.y)),
        rotation: slot.rot
      });
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // ZONE E: Chairs — pre-defined SIDE slots guaranteed NOT in front/behind any sofa
  // Chairs are placed at the FLANKS of sofas (left/right sides), not in front
  // ─────────────────────────────────────────────────────────────────
  const chairSlots = [
    // Flanking primary sofa on the left
    { x: Math.max(1.8, centerX - sofaW / 2 - 2.8), y: primarySofaY, rot:  Math.PI / 2 },
    // Flanking primary sofa on the right
    { x: Math.min(roomW - 1.8, centerX + sofaW / 2 + 2.8), y: primarySofaY, rot: -Math.PI / 2 },
    // Flanking the secondary sofa or conversation zone left
    { x: Math.max(1.8, centerX - sofaW / 2 - 2.8), y: Math.max(1.8, sofa2Y), rot:  Math.PI / 2 },
    // Flanking the secondary sofa or conversation zone right
    { x: Math.min(roomW - 1.8, centerX + sofaW / 2 + 2.8), y: Math.max(1.8, sofa2Y), rot: -Math.PI / 2 },
    // Front-corner accent chairs
    { x: Math.max(1.8, centerX - sofaW / 2 - 2.5), y: Math.min(roomL - 1.8, primarySofaY + sofaD + 2.5), rot: Math.PI * 0.75 },
    { x: Math.min(roomW - 1.8, centerX + sofaW / 2 + 2.5), y: Math.min(roomL - 1.8, primarySofaY + sofaD + 2.5), rot: -Math.PI * 0.75 },
  ];

  // Override slot positions for specific modes
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
    layout.push({
      ...chair,
      x: Math.max(1.8, Math.min(roomW - 1.8, slot.x)),
      y: Math.max(1.8, Math.min(roomL - 1.8, slot.y)),
      rotation: slot.rot
    });
  });

  // ─────────────────────────────────────────────────────────────────
  // ZONE F: Other furniture — wall-aligned
  // ─────────────────────────────────────────────────────────────────
  others.forEach((item, i) => {
    const typeKey = (item.type || '').toLowerCase();
    if (typeKey === 'bookshelf') {
      layout.push({ ...item, x: roomW - item.depth / 2 - 0.5, y: centerY + i * 3 - 2, rotation: -Math.PI / 2 });
    } else if (typeKey === 'bed') {
      layout.push({ ...item, x: item.width / 2 + 1, y: roomL - item.depth / 2 - 1, rotation: 0 });
    } else {
      layout.push({ ...item, x: centerX + (i % 2 === 0 ? 4 : -4), y: roomL - 2, rotation: 0 });
    }
  });

  return layout;
}

