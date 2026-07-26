/**
 * Relationship Graph Engine (HSRE Module)
 * Connects furniture into meaningful behavioral clusters (e.g., Conversation Zone,
 * Entertainment Axis, Dining Suite) and prevents identical side-by-side seating.
 */

export function buildRelationshipGraph(furniture = [], focalPoint) {
  const sofas = furniture.filter(f => (f.type || '').toLowerCase() === 'sofa');
  const chairs = furniture.filter(f => (f.type || '').toLowerCase() === 'chair');
  const tables = furniture.filter(f => (f.type || '').toLowerCase() === 'table');
  const tvs = furniture.filter(f => (f.type || '').toLowerCase() === 'tv');
  const others = furniture.filter(f => !['sofa', 'chair', 'table', 'tv'].includes((f.type || '').toLowerCase()));

  const relationships = [];
  const conversationZone = {
    id: "zone-conversation",
    type: "conversation",
    center: { x: 0, y: 0 },
    items: [],
    rules: []
  };

  // Rule 1: Link primary seating to Focal Point (TV/Window)
  if (sofas.length > 0 && focalPoint) {
    relationships.push({
      from: sofas[0].id || "sofa-1",
      to: focalPoint.id,
      relation: "FACE_FOCAL",
      targetDistance: 8, // 8 feet viewing distance
      importance: "HARD"
    });
    conversationZone.items.push(sofas[0]);
  }

  // Rule 2: Multi-Sofa Conversational Grammar (Prevent identical side-by-side)
  if (sofas.length >= 2) {
    relationships.push({
      from: sofas[1].id || "sofa-2",
      to: sofas[0].id || "sofa-1",
      relation: "CONVERSATION_PAIR",
      allowedOrientations: ["FACE_TO_FACE_180", "L_SHAPE_90"],
      disallowedOrientations: ["IDENTICAL_PARALLEL"],
      targetDistance: 6, // 6 feet apart across coffee table
      importance: "HARD"
    });
    conversationZone.items.push(sofas[1]);
  }

  // Rule 3: Coffee Table Centering (18 inches from sofa)
  if (tables.length > 0 && sofas.length > 0) {
    relationships.push({
      from: tables[0].id || "table-1",
      to: sofas[0].id || "sofa-1",
      relation: "ANCHOR_CENTER",
      targetDistance: 2.5, // 1.5 ft (18 in) clearance + table half-width
      importance: "MEDIUM"
    });
    conversationZone.items.push(tables[0]);
  }

  // Rule 4: Chairs orbit conversation center
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
 * Resolves relationship constraints into coordinates that guarantee no side-by-side facing sofas
 * and proper 18-inch coffee table clearances.
 */
export function resolveRelationshipLayout(room, furniture = [], focalPoint, philosophy = "the_curator") {
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

  // 1. Place TV on top wall
  if (tvs.length > 0) {
    const tv = tvs[0];
    layout.push({
      ...tv,
      x: centerX,
      y: tv.depth / 2 + 0.5,
      rotation: 0 // facing down into room
    });
  }

  // 2. Place Primary Sofa facing TV (or room center)
  let primarySofaY = centerY + 1;
  if (sofas.length > 0) {
    const sofa1 = sofas[0];
    layout.push({
      ...sofa1,
      x: centerX,
      y: primarySofaY,
      rotation: Math.PI // facing up towards TV/focal point
    });
  }

  // 3. Place Coffee Table in front of Primary Sofa (18 inches = 1.5 ft gap)
  if (tables.length > 0) {
    const table = tables[0];
    const tableY = sofas.length > 0 ? primarySofaY - (sofas[0].depth / 2) - 1.5 - (table.depth / 2) : centerY;
    layout.push({
      ...table,
      x: centerX,
      y: Math.max(2, tableY),
      rotation: 0
    });
  }

  // 4. Place Secondary Sofa (NEVER identical side-by-side!)
  if (sofas.length >= 2) {
    const sofa2 = sofas[1];
    if (philosophy === "the_curator" || philosophy === "the_designer") {
      // Face-to-Face 180° layout across coffee table
      layout.push({
        ...sofa2,
        x: centerX,
        y: Math.max(2.5, primarySofaY - 6.5),
        rotation: 0 // facing down towards Sofa 1
      });
    } else {
      // L-Shape 90° layout for open circulation (The Architect / The Humanist)
      layout.push({
        ...sofa2,
        x: Math.max(3, centerX - 5),
        y: primarySofaY - 3,
        rotation: Math.PI / 2 // facing right towards conversation center
      });
    }
  }

  // 5. Place Chairs around remaining open conversational orbit
  chairs.forEach((chair, i) => {
    const side = i % 2 === 0 ? 1 : -1;
    layout.push({
      ...chair,
      x: centerX + (side * 5),
      y: primarySofaY - 2,
      rotation: side === 1 ? -Math.PI / 2 : Math.PI / 2 // facing inwards
    });
  });

  // 6. Place bookshelves, beds, lamps along perimeter walls safely
  let wallOffset = 2;
  others.forEach((item, i) => {
    if ((item.type || '').toLowerCase() === 'bookshelf') {
      layout.push({
        ...item,
        x: roomW - (item.depth / 2) - 0.5,
        y: centerY + (i * 3) - 2,
        rotation: -Math.PI / 2
      });
    } else if ((item.type || '').toLowerCase() === 'bed') {
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
