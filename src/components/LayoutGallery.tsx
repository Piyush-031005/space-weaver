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
                      if (el.wall === "top")    { x = el.position - el.width / 2; y = 0;              w = el.width; h = 0.5; }
                      if (el.wall === "bottom") { x = el.position - el.width / 2; y = rLength - 0.5; w = el.width; h = 0.5; }
                      if (el.wall === "left")   { x = 0;             y = el.position - el.width / 2;  w = 0.5; h = el.width; }
                      if (el.wall === "right")  { x = rWidth - 0.5;  y = el.position - el.width / 2;  w = 0.5; h = el.width; }
                      return <rect key={elIdx} x={x} y={y} width={w} height={h} fill={el.type === "window" ? "#38bdf8" : "#fbbf24"} opacity={0.65} />;
                    })}

                    {opt.layout?.map((item: any, iIdx: number) => (
                      <g key={iIdx} transform={`translate(${item.x},${item.y}) rotate(${(item.rotation || 0) * (180 / Math.PI)})`}>
                        <rect
                          x={-item.width / 2} y={-item.depth / 2}
                          width={item.width} height={item.depth}
                          fill="rgba(255,255,255,0.10)"
                          stroke={isSelected ? "rgba(255,255,255,0.90)" : "rgba(255,255,255,0.55)"}
                          strokeWidth="0.13" rx="0.12"
                        />
                        <text
                          x="0" y="0"
                          fontSize={Math.min(item.width, item.depth) * 0.28}
                          fill="rgba(255,255,255,0.65)"
                          textAnchor="middle"
                          alignmentBaseline="middle"
                          fontFamily="monospace"
                        >
                          {item.type}
                        </text>
                      </g>
                    ))}
                  </svg>
                </div>

                <div className="flex flex-col flex-1 px-5 pt-5 pb-6">
                  <p className="text-[10px] font-mono tracking-[0.25em] uppercase text-muted-foreground mb-2">
                    {opt.bestFor || "Spatial Configuration"}
                  </p>
                  <h3 className="font-display text-xl font-medium text-foreground mb-3 leading-snug">
                    {opt.name}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-grow mb-6">
                    {opt.philosophyDescription || opt.desc}
                  </p>

                  <div className="flex items-center gap-4 pt-4 border-t border-border/20">
                    <button
                      onClick={(e) => { e.stopPropagation(); onSelect(idx); }}
                      className={`text-sm font-medium tracking-wide transition-colors ${
                        isSelected
                          ? "text-foreground underline underline-offset-4"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {isSelected ? "Selected" : "Select"}
                    </button>
                    {onOpen3D && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onSelect(idx); onOpen3D(idx); }}
                        className="ml-auto px-4 py-2 bg-foreground text-background text-xs font-semibold tracking-widest uppercase hover:opacity-75 transition-opacity"
                        title="Open Fullscreen 3D Studio"
                      >
                        3D View
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
