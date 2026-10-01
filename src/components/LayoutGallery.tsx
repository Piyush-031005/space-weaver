import React, { useState } from "react";
import { Check, ShoppingCart } from "lucide-react";
import ShoppingListPanel from "./ShoppingListPanel";

interface LayoutOption {
  id: string;
  name: string;
  desc: string;
  viralBadge?: string;
  bestFor?: string;
  philosophyDescription?: string;
  confidence?: number;
  layout: any[];
  clearanceScores?: any;
  genome?: any;
  roast?: string[];
  droppedItems?: any[];
  structuralElements?: any[];
}

interface LayoutGalleryProps {
  options: LayoutOption[];
  activeIndex: number;
  onSelect: (index: number) => void;
  onOpen3D?: (index: number) => void;
  room?: { width: number; length: number };
  unit?: string;
  furniture?: Array<{ id: string; type: string; width: number; depth: number; name?: string }>;
}

const LayoutGallery: React.FC<LayoutGalleryProps> = ({
  options,
  activeIndex,
  onSelect,
  onOpen3D,
  room,
  unit = "ft",
  furniture = [],
}) => {
  const [showShoppingList, setShowShoppingList] = useState(false);
  if (!options || options.length === 0) return null;

  const rWidth  = room?.width  || 20;
  const rLength = room?.length || 20;

  return (
    <section className="py-20 bg-background border-t border-border/20">
      <div className="container mx-auto px-6 lg:px-10">
        <div className="max-w-2xl mb-16">
          <p className="text-[11px] font-mono tracking-[0.35em] uppercase text-muted-foreground mb-4">
            Spatial Configurations
          </p>
          <h2 className="font-display font-light text-4xl md:text-5xl lg:text-6xl text-foreground tracking-tight leading-none mb-5">
            12 Expert<br />Arrangements
          </h2>
          <p className="text-muted-foreground text-base leading-relaxed mb-6">
            Each layout scored on walkway clearance, focal alignment, natural light, and room balance.
          </p>
          {/* Shopping List button */}
          <button
            onClick={() => setShowShoppingList(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.4)', color: '#c4b5fd' }}
          >
            <ShoppingCart size={16} />
            Shopping List &amp; Prices
          </button>
          <p className="text-muted-foreground text-base leading-relaxed max-w-lg mt-4">
            Each arrangement is authored by a distinct interior design philosophy. Select the configuration that best reflects your lifestyle and spatial priorities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border/20">
          {options.map((opt, idx) => {
            const isSelected = activeIndex === idx;
            return (
              <div
                key={opt.id}
                onClick={() => onSelect(idx)}
                className={`group relative cursor-pointer flex flex-col bg-background transition-all duration-200 ${
                  isSelected
                    ? "outline outline-1 outline-foreground/50 z-10"
                    : "hover:bg-muted/20"
                }`}
              >
                {isSelected && (
                  <div className="absolute top-4 right-4 z-20 w-5 h-5 rounded-full bg-foreground flex items-center justify-center">
                    <Check size={10} strokeWidth={3.5} className="text-background" />
                  </div>
                )}

                <div className="w-full aspect-video bg-[#080d18] overflow-hidden">
                  <svg
                    viewBox={`-1 -1 ${rWidth + 2} ${rLength + 2}`}
                    className="w-full h-full"
                    preserveAspectRatio="xMidYMid meet"
                  >
                    <pattern id={`grid-${opt.id}`} width="2" height="2" patternUnits="userSpaceOnUse">
                      <path d="M 2 0 L 0 0 0 2" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.06" />
                    </pattern>
                    <rect width={rWidth} height={rLength} fill={`url(#grid-${opt.id})`} />
                    <rect width={rWidth} height={rLength} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="0.18" />

                    {opt.structuralElements?.map((el: any, elIdx: number) => {
                      let x = 0, y = 0, w = 0, h = 0;
                      let arcX = 0, arcY = 0, doorSwingD = '';
                      if (el.wall === "top")    { x = el.position - el.width / 2; y = 0;              w = el.width; h = 0.5; }
                      if (el.wall === "bottom") { x = el.position - el.width / 2; y = rLength - 0.5; w = el.width; h = 0.5; }
                      if (el.wall === "left")   { x = 0;             y = el.position - el.width / 2;  w = 0.5; h = el.width; }
                      if (el.wall === "right")  { x = rWidth - 0.5;  y = el.position - el.width / 2;  w = 0.5; h = el.width; }

                      // Door swing arc
                      if (el.type === 'door') {
                        const r = el.width || 2.5;
                        if (el.wall === 'top')    doorSwingD = `M ${x} 0.5 A ${r} ${r} 0 0 1 ${x + r} ${0.5 + r}`;
                        if (el.wall === 'bottom') doorSwingD = `M ${x} ${rLength - 0.5} A ${r} ${r} 0 0 0 ${x + r} ${rLength - 0.5 - r}`;
                        if (el.wall === 'left')   doorSwingD = `M 0.5 ${y} A ${r} ${r} 0 0 1 ${0.5 + r} ${y + r}`;
                        if (el.wall === 'right')  doorSwingD = `M ${rWidth - 0.5} ${y} A ${r} ${r} 0 0 0 ${rWidth - 0.5 - r} ${y + r}`;
                      }

                      return (
                        <g key={elIdx}>
                          <rect x={x} y={y} width={w} height={h}
                            fill={el.type === 'window' ? '#38bdf8' : '#fbbf24'} opacity={0.7} />
                          {doorSwingD && (
                            <path d={doorSwingD} fill="none"
                              stroke="rgba(251,191,36,0.35)" strokeWidth="0.12" strokeDasharray="0.3 0.2" />
                          )}
                        </g>
                      );
                    })}

                    {/* Furniture items — color-coded by type */}
                    {opt.layout?.map((item: any, iIdx: number) => {
                      const type = (item.type || '').toLowerCase();
                      // Color by category
                      const fill = type === 'sofa' || type === 'chair' || type === 'armchair' || type === 'ottoman'
                        ? 'rgba(139,92,246,0.35)'  // seating: purple
                        : type === 'table' || type === 'dining_table' || type === 'coffee_table'
                        ? 'rgba(20,184,166,0.30)'  // tables: teal
                        : type === 'bed'
                        ? 'rgba(59,130,246,0.30)'  // bed: blue
                        : type === 'tv' || type === 'bookshelf' || type === 'wardrobe' || type === 'sideboard'
                        ? 'rgba(245,158,11,0.30)'  // storage/media: amber
                        : type === 'desk'
                        ? 'rgba(34,197,94,0.25)'   // desk: green
                        : type === 'rug'
                        ? 'rgba(255,255,255,0.04)'  // rug: very subtle
                        : 'rgba(255,255,255,0.12)'; // default
                      const stroke = type === 'sofa' || type === 'chair' || type === 'armchair' || type === 'ottoman'
                        ? 'rgba(167,139,250,0.85)'
                        : type === 'table' || type === 'dining_table'
                        ? 'rgba(45,212,191,0.75)'
                        : type === 'bed'
                        ? 'rgba(96,165,250,0.80)'
                        : type === 'tv' || type === 'bookshelf' || type === 'wardrobe' || type === 'sideboard'
                        ? 'rgba(251,191,36,0.70)'
                        : type === 'desk'
                        ? 'rgba(74,222,128,0.70)'
                        : isSelected ? 'rgba(255,255,255,0.80)' : 'rgba(255,255,255,0.45)';
                      return (
                        <g key={iIdx} transform={`translate(${item.x},${item.y}) rotate(${(item.rotation || 0) * (180 / Math.PI)})`}>
                          <rect
                            x={-item.width / 2} y={-item.depth / 2}
                            width={item.width} height={item.depth}
                            fill={fill} stroke={stroke} strokeWidth="0.13" rx="0.15"
                          />
                          <text
                            x="0" y="0"
                            fontSize={Math.min(item.width, item.depth) * 0.26}
                            fill={stroke}
                            textAnchor="middle" alignmentBaseline="middle"
                            fontFamily="monospace"
                          >
                            {item.type?.slice(0, 3).toUpperCase()}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>

                  <div className="flex flex-col flex-1 px-5 pt-4 pb-5">
                    <p className="text-[10px] font-mono tracking-[0.25em] uppercase text-muted-foreground mb-1.5">
                      {opt.bestFor || "Spatial Configuration"}
                    </p>
                    <h3 className="font-display text-lg font-medium text-foreground mb-2 leading-snug">
                      {opt.name}
                    </h3>

                    {/* Plain-English explanation from the engine */}
                    {opt.explanation && (
                      <p className="text-xs text-muted-foreground leading-relaxed mb-3 italic">
                        "{opt.explanation}"
                      </p>
                    )}

                    {/* Score breakdown bars */}
                    {opt.scoreBreakdown && (() => {
                      const sb = opt.scoreBreakdown;
                      const metrics = [
                        { key: 'walkway',    label: 'Walkway',  color: '#22c55e' },
                        { key: 'focal',      label: 'Focal',    color: '#a78bfa' },
                        { key: 'light',      label: 'Light',    color: '#fbbf24' },
                        { key: 'balance',    label: 'Balance',  color: '#38bdf8' },
                      ];
                      return (
                        <div className="mb-3 grid grid-cols-2 gap-x-3 gap-y-1.5">
                          {metrics.map(m => {
                            // scoreBreakdown values are already 0-100 integers from the API
                            const val = Math.min(100, Math.max(0, sb[m.key] || 0));
                            return (
                              <div key={m.key}>
                                <div className="flex justify-between text-[10px] mb-0.5">
                                  <span style={{ color: 'rgba(255,255,255,0.45)' }}>{m.label}</span>
                                  <span style={{ color: m.color, fontWeight: 600 }}>{val}</span>
                                </div>
                                <div style={{ height: '3px', background: 'rgba(255,255,255,0.07)', borderRadius: '2px', overflow: 'hidden' }}>
                                  <div style={{ width: `${val}%`, height: '100%', background: m.color, borderRadius: '2px', transition: 'width 0.6s ease' }} />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}

                    {/* Fit warnings */}
                    {opt.fitWarnings && opt.fitWarnings.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {opt.fitWarnings.slice(0, 2).map((w: string, wi: number) => (
                          <span key={wi} className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full"
                            style={{ background: 'rgba(245,158,11,0.12)', color: '#fcd34d', border: '1px solid rgba(245,158,11,0.25)' }}>
                            ⚠️ {w}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-3 pt-3 border-t border-border/20 mt-auto">
                      <button
                        onClick={(e) => { e.stopPropagation(); onSelect(idx); }}
                        className={`text-sm font-medium tracking-wide transition-colors ${
                          isSelected
                            ? "text-foreground underline underline-offset-4"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {isSelected ? '✓ Selected' : 'Select'}
                      </button>
                      {/* Total score pill */}
                      {opt.scoreTotal !== undefined && (
                        <span className="ml-auto text-[11px] font-mono px-2.5 py-1 rounded-full"
                          style={{ background: 'rgba(139,92,246,0.12)', color: '#c4b5fd', border: '1px solid rgba(139,92,246,0.25)' }}>
                          Score {Math.round(opt.scoreTotal)}
                        </span>
                      )}
                      {onOpen3D && (
                        <button
                          onClick={(e) => { e.stopPropagation(); onSelect(idx); onOpen3D(idx); }}
                          className="px-3 py-1.5 bg-foreground text-background text-xs font-semibold tracking-widest uppercase hover:opacity-75 transition-opacity rounded"
                          title="Open Fullscreen 3D Studio"
                        >
                          3D
                        </button>
                      )}
                    </div>
                  </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Shopping List slide-in panel */}
      <ShoppingListPanel
        furniture={furniture}
        room={room || { width: rWidth, length: rLength }}
        isVisible={showShoppingList}
        onClose={() => setShowShoppingList(false)}
      />
    </section>
  );
};

export default LayoutGallery;
