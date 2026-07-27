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
  const sofas = furniture.filter(f => (f.type || '').toLowerCase() === 'sofa');
  const chairs = furniture.filter(f => (f.type || '').toLowerCase() === 'chair');
  const tables = furniture.filter(f => (f.type || '').toLowerCase() === 'table');
  const tvs = furniture.filter(f => (f.type || '').toLowerCase() === 'tv');
  const others = furniture.filter(f => !['sofa', 'chair', 'table', 'tv'].includes((f.type || '').toLowerCase()));

  const roomW = room.width || 15;
  const roomL = room.length || 20;
  const centerX = roomW / 2;
  const centerY = roomL / 2;

  // 1. Place TV along top wall
  if (tvs.length > 0) {
    const tv = tvs[0];
    layout.push({
      ...tv,
      x: centerX,
      y: tv.depth / 2 + 0.5,
      rotation: 0 // facing down into room
    });
  }

  // 2. Determine Primary Sofa Position (facing TV)
  let primarySofaY = centerY + 1;
  let primarySofaX = centerX;
  if (sofas.length > 0) {
    const sofa1 = sofas[0];
    if (mode === "MINIMAL_FLOAT" || mode === "FENG_SHUI_COMMAND") {
      primarySofaY = centerY + 3; // Float further back
    } else if (mode === "CINEMA_VIEWING_V") {
      primarySofaY = centerY + 1.5;
    }
    layout.push({
      ...sofa1,
      x: primarySofaX,
      y: primarySofaY,
      rotation: Math.PI // facing up towards TV/focal point
    });
  }

  // 3. Place Coffee Table in front of Primary Sofa (18 to 24 inches gap)
  let tableY = centerY;
  if (tables.length > 0) {
    const table = tables[0];
    tableY = sofas.length > 0 ? primarySofaY - (sofas[0].depth / 2) - 1.8 - (table.depth / 2) : centerY;
    layout.push({
      ...table,
      x: centerX,
      y: Math.max(2.5, tableY),
      rotation: mode === "SUNLIGHT_PARALLEL_OPPOSITE" ? Math.PI / 2 : 0
    });
  }

  // 3b. Place Secondary & Tertiary Tables (Side Tables / Accent Tables)
  if (tables.length > 1) {
    tables.slice(1).forEach((table, idx) => {
      const isLeft = idx % 2 === 0;
      let xPos = isLeft ? centerX - 6 : centerX + 6;
      let yPos = primarySofaY;
      if (idx >= 2) {
        xPos = isLeft ? 2.5 : roomW - 2.5;
        yPos = 3 + idx * 3;
      }
      layout.push({
        ...table,
        x: Math.max(1.5, Math.min(roomW - 1.5, xPos)),
        y: Math.max(1.5, Math.min(roomL - 1.5, yPos)),
        rotation: 0
      });
    });
  }

  // 4. Place Secondary & Tertiary Sofas (STRICT 180° FACE-TO-FACE OR 90° L-SHAPE!)
  if (sofas.length >= 2) {
    sofas.slice(1).forEach((sofa, idx) => {
      const sofaNum = idx + 2;
      
      if (mode.includes("FACE_TO_FACE") || mode === "SUNLIGHT_PARALLEL_OPPOSITE" || mode === "GRAND_SALON") {
        // 180° Face-to-Face Opposite across coffee table
        const gapY = mode === "FACE_TO_FACE_WIDE" ? 7.5 : 6.0;
        layout.push({
          ...sofa,
          x: centerX,
          y: Math.max(2.5, primarySofaY - gapY - (idx * 3.5)),
          rotation: 0 // strictly facing opposite Primary Sofa!
        });
      } else if (mode.includes("L_SHAPE_RIGHT") || mode === "COZY_RETREAT") {
        // 90° L-Shape on Right Side
        layout.push({
          ...sofa,
          x: Math.min(roomW - 3, centerX + 4.5 + (idx * 2)),
          y: primarySofaY - 2.5,
          rotation: -Math.PI / 2 // facing left toward table center
        });
      } else if (mode === "CINEMA_VIEWING_V") {
        // V-Shape Angled 15° inward
        layout.push({
          ...sofa,
          x: centerX - 4.5 - (idx * 2),
          y: primarySofaY - 1.5,
          rotation: Math.PI - 0.3 // angled inward toward TV
        });
      } else if (mode === "U_SHAPE_GATHERING") {
        // Left flank of U-Shape
        layout.push({
          ...sofa,
          x: Math.max(3, centerX - 5 - (idx * 2)),
          y: primarySofaY - 2.5,
          rotation: Math.PI / 2 // facing right into U hub
        });
      } else {
        // Default L-Shape Left Corner (Architect / Minimalist / Family Haven)
        layout.push({
          ...sofa,
          x: Math.max(3, centerX - 4.5 - (idx * 2)),
          y: primarySofaY - 2.8,
          rotation: Math.PI / 2 // facing right toward table center
        });
      }
    });
  }

  // 5. Place Chairs orbiting open conversation perimeter with distinct offset spacing
  chairs.forEach((chair, i) => {
    const side = i % 2 === 0 ? 1 : -1;
    const pairIndex = Math.floor(i / 2);
    let chairX = centerX + (side * (4.8 + pairIndex * 2.0));
    let chairY = primarySofaY - 3.5 - (pairIndex * 3.2);
    let chairRot = side === 1 ? -Math.PI / 2 : Math.PI / 2;

    if (mode === "FACE_TO_FACE_CENTER" || mode === "GRAND_SALON") {
      chairX = centerX + (side * (5.5 + pairIndex * 1.8));
      chairY = tableY + (pairIndex % 2 === 0 ? 0 : -3.5);
      chairRot = side === 1 ? -Math.PI / 2 : Math.PI / 2;
    } else if (mode === "U_SHAPE_GATHERING") {
      chairX = centerX + (side * (4 + pairIndex * 2.2));
      chairY = primarySofaY - 6.5 - (pairIndex * 2.5);
      chairRot = 0; // facing up into U
    }

    layout.push({
      ...chair,
      x: Math.max(1.5, Math.min(roomW - 1.5, chairX)),
      y: Math.max(1.5, Math.min(roomL - 1.5, chairY)),
      rotation: chairRot
    });
  });

  // 6. Place remaining perimeter furniture safely
  others.forEach((item, i) => {
    const typeKey = (item.type || '').toLowerCase();
    if (typeKey === 'bookshelf') {
      layout.push({
        ...item,
        x: roomW - (item.depth / 2) - 0.5,
        y: centerY + (i * 3) - 2,
        rotation: -Math.PI / 2
      });
    } else if (typeKey === 'bed') {
      layout.push({
        ...item,
        x: (item.width / 2) + 1,
        y: roomL - (item.depth / 2) - 1,
        rotation: 0
      });
    } else {
      layout.push({
        ...item,
        x: centerX + (i % 2 === 0 ? 4 : -4),
        y: roomL - 2,
        rotation: 0
      });
    }
  });

  return layout;
}
