import React, { useState, useEffect } from 'react';

interface CatalogMatch {
  id: string;
  name: string;
  widthFt: number;
  depthFt: number;
  widthCm: number;
  depthCm: number;
  priceRangeINR: string;
  brands: string[];
  notes: string;
  wallAdjacent?: boolean;
}

interface ShoppingItem {
  itemId: string;
  itemType: string;
  itemName: string;
  placedDims: { widthFt: number; depthFt: number };
  catalogMatch: CatalogMatch | null;
  alternatives: CatalogMatch[];
  matchQuality: 'exact' | 'close' | 'approximate' | null;
  fitsRoom: boolean;
  gapWidth: number;
  gapDepth: number;
  fitWarnings: string[];
}

interface ShoppingListPanelProps {
  furniture: Array<{ id: string; type: string; width: number; depth: number; name?: string }>;
  room: { width: number; length: number };
  isVisible: boolean;
  onClose: () => void;
}

const TYPE_ICONS: Record<string, string> = {
  sofa: '🛋️', chair: '🪑', table: '🪞', dining_table: '🍽️',
  tv: '📺', bookshelf: '📚', wardrobe: '🚪', bed: '🛏️',
  desk: '💻', dresser: '🪞', ottoman: '🪑', rug: '🟫',
  lamp: '💡', sideboard: '🗄️', plant: '🪴', pooja_unit: '🪔', default: '📦',
};

const ShoppingListPanel: React.FC<ShoppingListPanelProps> = ({ furniture, room, isVisible, onClose }) => {
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalMin, setTotalMin] = useState(0);
  const [totalMax, setTotalMax] = useState(0);

  useEffect(() => {
    if (!isVisible || !furniture.length) return;
    setLoading(true);
    setError(null);
    fetch('/api/shopping-list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ furniture, room }),
    })
      .then(r => r.json())
      .then(data => {
        const list: ShoppingItem[] = data.shoppingList || [];
        setShoppingList(list);
        // Use server-computed budget totals
        setTotalMin(data.budgetMin || 0);
        setTotalMax(data.budgetMax || 0);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [isVisible, furniture, room]);

  const fmt = (n: number) => n >= 100000 ? `₹${(n/100000).toFixed(1)}L` : n >= 1000 ? `₹${(n/1000).toFixed(0)}K` : `₹${n}`;

  const copyList = () => {
    const text = shoppingList.map(i => {
      const m = i.catalogMatch;
      if (!m) return `• ${i.itemType}`;
      return `• ${m.name} (${m.widthFt}×${m.depthFt}ft | ₹${m.priceRangeINR})\n  ${m.brands.join(', ')}\n  ${i.fitsRoom ? '✅ Fits' : '⚠️ ' + i.fitWarnings.join('; ')}`;
    }).join('\n\n');
    navigator.clipboard.writeText(`Space Weaver — Shopping List\nRoom: ${room.width}×${room.length}ft | Budget: ${fmt(totalMin)}–${fmt(totalMax)}\n\n${text}`);
  };

  if (!isVisible) return null;

  return (
    <div className="sl-overlay" onClick={onClose}>
      <div className="sl-panel" onClick={e => e.stopPropagation()}>

        {/* ── Header ─────────────────────────────────── */}
        <div className="sl-header">
          <div>
            <h2 className="sl-title">🛍️ Shopping List</h2>
            <p className="sl-sub">
              {room.width}ft × {room.length}ft &nbsp;·&nbsp; {shoppingList.length} items &nbsp;·&nbsp;
              <strong>{fmt(totalMin)}–{fmt(totalMax)}</strong>
            </p>
          </div>
          <div className="sl-hdr-btns">
            <button className="btn-copy" onClick={copyList}>📋 Copy</button>
            <button className="btn-x" onClick={onClose}>✕</button>
          </div>
        </div>

        {/* ── Body ───────────────────────────────────── */}
        <div className="sl-body">
          {loading && (
            <div className="sl-loading">
              <div className="sl-spinner" />
              Finding products for your room…
            </div>
          )}
          {error && <div className="sl-error">⚠️ {error}</div>}

          {!loading && !error && shoppingList.map((item, idx) => {
            const m = item.catalogMatch;
            const mqColor = item.matchQuality === 'exact' ? '#22c55e'
              : item.matchQuality === 'close' ? '#fbbf24' : '#94a3b8';
            const mqLabel = item.matchQuality === 'exact' ? '✓ Exact'
              : item.matchQuality === 'close' ? '~ Close' : '≈ Approx';
            return (
              <div key={item.itemId || idx} className={`sl-item ${item.fitsRoom ? 'ok' : 'warn'}`}>
                <div className="sl-item-row">
                  <span className="sl-icon">{TYPE_ICONS[item.itemType] || TYPE_ICONS.default}</span>
                  <div className="sl-item-info">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                      <div className="sl-item-name">{m?.name || item.itemName}</div>
                      {item.matchQuality && (
                        <span style={{ fontSize: '0.66rem', color: mqColor, border: `1px solid ${mqColor}30`,
                          background: `${mqColor}15`, borderRadius: '10px', padding: '1px 6px', flexShrink: 0 }}>
                          {mqLabel}
                        </span>
                      )}
                    </div>
                    {m && <div className="sl-dims">{m.widthFt}×{m.depthFt}ft · {m.widthCm}×{m.depthCm}cm</div>}
                  </div>
                  <div className="sl-right">
                    {m && <div className="sl-price">₹{m.priceRangeINR.replace('-','–')}</div>}
                    <div className={`sl-badge ${item.fitsRoom ? 'badge-ok' : 'badge-warn'}`}>
                      {item.fitsRoom ? '✅ Fits' : '⚠️ Tight'}
                    </div>
                  </div>
                </div>

                {item.fitWarnings.length > 0 && (
                  <div className="sl-warnings">
                    {item.fitWarnings.map((w, i) => <div key={i} className="sl-warn-line">⚠️ {w}</div>)}
                  </div>
                )}

                {m && (
                  <div className="sl-brands">
                    <span className="brands-lbl">Buy from: </span>
                    {m.brands.map((b, i) => <span key={i} className="brand-tag">{b}</span>)}
                  </div>
                )}

                {m?.notes && <div className="sl-note">💡 {m.notes}</div>}
              </div>
            );
          })}

          {!loading && !error && shoppingList.length === 0 && (
            <div className="sl-empty">Add furniture to your room to see the shopping list.</div>
          )}
        </div>

        {/* ── Footer ─────────────────────────────────── */}
        {!loading && shoppingList.length > 0 && (
          <div className="sl-footer">
            <div className="sl-budget-row">
              <span>Estimated budget</span>
              <strong>{fmt(totalMin)} – {fmt(totalMax)}</strong>
            </div>
            <div className="sl-disclaimer">Prices are approximate. Verify dimensions before purchase.</div>
          </div>
        )}

        <style>{`
          .sl-overlay{position:fixed;inset:0;background:rgba(0,0,0,.65);backdrop-filter:blur(4px);z-index:1000;display:flex;align-items:center;justify-content:flex-end}
          .sl-panel{width:420px;max-width:95vw;height:100vh;background:#0d0f18;border-left:1px solid rgba(139,92,246,.3);display:flex;flex-direction:column;animation:slIn .25s ease}
          @keyframes slIn{from{transform:translateX(100%);opacity:0}to{transform:none;opacity:1}}
          .sl-header{padding:20px 20px 16px;border-bottom:1px solid rgba(255,255,255,.08);display:flex;justify-content:space-between;align-items:flex-start;background:linear-gradient(135deg,#1a1040,#0d0f18)}
          .sl-title{margin:0 0 4px;font-size:1.15rem;font-weight:700;color:#fff}
          .sl-sub{margin:0;font-size:.78rem;color:rgba(255,255,255,.5)}
          .sl-sub strong{color:#a78bfa}
          .sl-hdr-btns{display:flex;gap:8px;align-items:center}
          .btn-copy{background:rgba(139,92,246,.15);border:1px solid rgba(139,92,246,.4);color:#c4b5fd;border-radius:8px;padding:6px 12px;font-size:.78rem;cursor:pointer;transition:.2s}
          .btn-copy:hover{background:rgba(139,92,246,.3)}
          .btn-x{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);color:rgba(255,255,255,.6);border-radius:8px;padding:6px 10px;cursor:pointer;transition:.2s}
          .btn-x:hover{background:rgba(255,60,60,.2);color:#fff}
          .sl-body{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px}
          .sl-body::-webkit-scrollbar{width:4px}
          .sl-body::-webkit-scrollbar-thumb{background:rgba(139,92,246,.4);border-radius:4px}
          .sl-loading{display:flex;flex-direction:column;align-items:center;gap:10px;padding:40px;color:rgba(255,255,255,.5);font-size:.88rem}
          .sl-spinner{width:30px;height:30px;border:3px solid rgba(139,92,246,.2);border-top-color:#8b5cf6;border-radius:50%;animation:spin .7s linear infinite}
          @keyframes spin{to{transform:rotate(360deg)}}
          .sl-error{background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.3);border-radius:10px;padding:14px;color:#fca5a5;font-size:.84rem}
          .sl-item{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:12px;padding:13px;border-left-width:3px}
          .sl-item.ok{border-left-color:#22c55e}
          .sl-item.warn{border-left-color:#f59e0b}
          .sl-item-row{display:flex;gap:10px;align-items:flex-start}
          .sl-icon{font-size:1.4rem;flex-shrink:0;margin-top:2px}
          .sl-item-info{flex:1}
          .sl-item-name{font-size:.9rem;font-weight:600;color:#e2e8f0;margin-bottom:2px}
          .sl-dims{font-size:.72rem;color:rgba(255,255,255,.38);font-family:monospace}
          .sl-right{text-align:right;flex-shrink:0}
          .sl-price{font-size:.86rem;font-weight:700;color:#a78bfa;margin-bottom:4px}
          .sl-badge{font-size:.7rem;font-weight:600;padding:2px 8px;border-radius:20px;display:inline-block}
          .badge-ok{background:rgba(34,197,94,.15);color:#86efac}
          .badge-warn{background:rgba(245,158,11,.15);color:#fcd34d}
          .sl-warnings{margin-top:8px;padding:8px 10px;background:rgba(245,158,11,.06);border-radius:8px}
          .sl-warn-line{font-size:.74rem;color:#fcd34d;margin-bottom:2px}
          .sl-brands{margin-top:9px;display:flex;flex-wrap:wrap;gap:5px;align-items:center}
          .brands-lbl{font-size:.7rem;color:rgba(255,255,255,.3)}
          .brand-tag{background:rgba(139,92,246,.12);border:1px solid rgba(139,92,246,.25);color:#c4b5fd;border-radius:20px;padding:2px 8px;font-size:.68rem}
          .sl-note{margin-top:8px;font-size:.72rem;color:rgba(255,255,255,.32);line-height:1.4}
          .sl-empty{text-align:center;padding:40px;color:rgba(255,255,255,.28);font-size:.88rem}
          .sl-footer{padding:14px 20px;border-top:1px solid rgba(255,255,255,.08);background:rgba(0,0,0,.3)}
          .sl-budget-row{display:flex;justify-content:space-between;align-items:center;font-size:.88rem;color:rgba(255,255,255,.65);margin-bottom:5px}
          .sl-budget-row strong{color:#a78bfa;font-size:.95rem}
          .sl-disclaimer{font-size:.68rem;color:rgba(255,255,255,.22);line-height:1.4}
        `}</style>
      </div>
    </div>
  );
};

export default ShoppingListPanel;
