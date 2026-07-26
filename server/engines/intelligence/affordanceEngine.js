/**
 * Affordance & Clearance Engine (HSRE Module)
 * Enforces actual human ergonomics and operational clearance standards
 * (e.g. 36" dining chair pullout, 24" bed side access, door swing zones).
 */

export const AFFORDANCE_STANDARDS = {
  sofa: { frontClearance: 1.5, sideClearance: 0.5, name: "Legroom & Coffee Table Reach (18 in)" },
  bed: { sideClearance: 2.0, frontClearance: 2.5, name: "Side Access & Bed-Making Walkway (24 in)" },
  table: { perimeterClearance: 3.0, name: "Dining/Chair Pull-Out Zone (36 in)" },
  door: { swingRadius: 3.0, name: "Unobstructed Door Swing Zone (36 in)" },
  wardrobe: { frontClearance: 3.0, name: "Door Swing & Dressing Clearance (36 in)" }
};

export function evaluateAffordanceClearances(layout, room, fixedElements = []) {
  const violations = [];
  let totalScore = 100;

  for (const item of layout) {
    const typeKey = (item.type || '').toLowerCase();
    const standard = AFFORDANCE_STANDARDS[typeKey] || { frontClearance: 1.0, sideClearance: 0.5 };
    
    // Check if bed is jammed against two side walls
    if (typeKey === 'bed') {
      const leftGap = (item.x - item.width / 2);
      const rightGap = room.width - (item.x + item.width / 2);
      if (leftGap < standard.sideClearance && rightGap < standard.sideClearance) {
        violations.push({
          itemId: item.id || item.type,
          rule: standard.name,
          issue: `Bed lacks minimum 24-inch side walkway clearance (Left: ${leftGap.toFixed(1)}ft, Right: ${rightGap.toFixed(1)}ft).`,
          severity: "HIGH"
        });
        totalScore -= 15;
      }
    }

    // Check door swing clearances against fixed elements
    for (const el of fixedElements) {
      if (el.type === 'door') {
        const dx = Math.abs(el.position - item.x);
        const dy = Math.abs((el.wall === 'top' ? 0 : el.wall === 'bottom' ? room.length : el.position) - item.y);
        if (dx < 3.0 && dy < 3.0) {
          violations.push({
            itemId: item.id || item.type,
            rule: "Door Swing Clearance",
            issue: `${item.type || 'Item'} encroaches on main entry door swing arc.`,
            severity: "CRITICAL"
          });
          totalScore -= 30;
        }
      }
    }
  }

  return {
    score: Math.max(0, totalScore),
    violations,
    passed: violations.filter(v => v.severity === "CRITICAL").length === 0
  };
}
