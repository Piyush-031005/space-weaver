import React from "react";
import { Check, Sparkles, ShieldCheck } from "lucide-react";

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
}

interface LayoutGalleryProps {
  options: LayoutOption[];
  activeIndex: number;
  onSelect: (index: number) => void;
  onOpen3D?: (index: number) => void;
  room?: { width: number; length: number };
  unit?: string;
}

const LayoutGallery: React.FC<LayoutGalleryProps> = ({ options, activeIndex, onSelect, onOpen3D, room, unit = 'ft' }) => {
  if (!options || options.length === 0) return null;

  const rWidth = room?.width || 20;
  const rLength = room?.length || 20;

  return (
    <section className="py-12 bg-muted/20 border-t border-border/50">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold uppercase tracking-widest mb-3">
            <Sparkles size={14} /> Expert Layout Variations
          </div>
          <h2 className="font-display font-semibold text-3xl md:text-4xl text-foreground mb-3">
            12 Expert Spatial Configurations
          </h2>
          <p className="text-muted-foreground text-sm md:text-base">
            Our spatial intelligence engine generated 12 expert interior design configurations tailored to your lifestyle objective. Select any layout below to inspect its ergonomics and floor flow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {options.map((opt, idx) => {
            const isSelected = activeIndex === idx;
            const clearance = opt.clearanceScores;

            return (
              <div
                key={opt.id}
                onClick={() => {
                  onSelect(idx);
                }}
                className={`group relative cursor-pointer overflow-hidden rounded-3xl border transition-all duration-300 p-6 flex flex-col h-full ${
                  isSelected 
                    ? "border-primary bg-primary/5 shadow-xl scale-[1.02] ring-2 ring-primary/20" 
                    : "border-border/60 bg-background hover:border-primary/50 hover:shadow-lg hover:scale-[1.01]"
                }`}
              >
                {isSelected && (
                  <div className="absolute top-5 right-5 bg-primary text-primary-foreground p-1.5 rounded-full shadow-md z-10 animate-pulse">
                    <Check size={16} strokeWidth={3} />
                  </div>
                )}
                
                {/* Luxury Studio Badges */}
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest">
                    <span>🏛️ {opt.viralBadge || "STUDIO CURATED"}</span>
                  </span>
                </div>
                
                <h3 className={`text-2xl font-display font-bold mb-1 ${isSelected ? "text-primary" : "text-foreground"}`}>
                  {opt.name}
                </h3>
                
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Best For: <span className="text-foreground">{opt.bestFor || "Optimal living"}</span>
                </p>
                
                <p className="text-sm text-muted-foreground/90 mb-5 flex-grow leading-relaxed">
                  {opt.philosophyDescription || opt.desc}
                </p>

                {/* Metrics */}
                {clearance?.spaceSavedPercentage !== undefined && (
                  <div className="mb-5 grid grid-cols-2 gap-3 p-3 bg-muted/40 rounded-2xl border border-border/40 text-xs font-medium">
                    <div className="flex flex-col">
                      <span className="text-muted-foreground text-[11px]">Space Efficiency</span>
                      <span className="text-accent font-bold text-sm">{clearance.spaceSavedPercentage}% Free</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-muted-foreground text-[11px]">Recovered Area</span>
                      <span className="text-foreground font-bold text-sm">{Math.round(clearance.freeSpaceArea)} sq {unit}</span>
                    </div>
                  </div>
                )}

                {/* Accurate Blueprint Visualization */}
                <div className={`h-44 w-full rounded-2xl border flex items-center justify-center overflow-hidden bg-[#0f172a] relative ${isSelected ? "border-primary shadow-inner" : "border-border/50"}`}>
                  <svg 
                    viewBox={`-1 -1 ${rWidth + 2} ${rLength + 2}`} 
                    className="w-full h-full p-3 drop-shadow-md"
                    preserveAspectRatio="xMidYMid meet"
                  >
                    {/* Background Grid */}
                    <pattern id={`grid-${opt.id}`} width="2" height="2" patternUnits="userSpaceOnUse">
                      <path d="M 2 0 L 0 0 0 2" fill="none" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="0.1" />
                    </pattern>
                    <rect width={rWidth} height={rLength} fill={`url(#grid-${opt.id})`} />
                    
                    {/* Structural Elements */}
                    {opt.structuralElements?.map((el: any, elIdx: number) => {
                      let x = 0; let y = 0; let w = 0; let h = 0;
                      if (el.wall === 'top') { x = el.position - el.width/2; y = 0; w = el.width; h = 0.5; }
                      else if (el.wall === 'bottom') { x = el.position - el.width/2; y = rLength - 0.5; w = el.width; h = 0.5; }
                      else if (el.wall === 'left') { x = 0; y = el.position - el.width/2; w = 0.5; h = el.width; }
                      else if (el.wall === 'right') { x = rWidth - 0.5; y = el.position - el.width/2; w = 0.5; h = el.width; }
                      return (
                        <rect 
                          key={`struct-${elIdx}`} 
                          x={x} y={y} width={w} height={h} 
                          fill={el.type === 'window' ? '#38bdf8' : '#eab308'} 
                          opacity={0.8}
                        />
                      );
                    })}

                    {/* Furniture Blueprint */}
                    {opt.layout?.map((item: any, iIdx: number) => (
                      <g 
                        key={iIdx} 
                        transform={`translate(${item.x}, ${item.y}) rotate(${(item.rotation || 0) * (180/Math.PI)})`}
                      >
                        <rect 
                          x={-item.width / 2} 
                          y={-item.depth / 2} 
                          width={item.width} 
                          height={item.depth} 
                          fill="rgba(255,255,255,0.15)" 
                          stroke="rgba(255,255,255,0.8)" 
                          strokeWidth="0.12" 
                          rx="0.2"
                        />
                        {/* Direction Arrow / Orientation Indicator */}
                        <line x1="0" y1="0" x2="0" y2={-item.depth / 2} stroke="rgba(255,255,255,0.4)" strokeWidth="0.08" strokeDasharray="0.1,0.1" />
                        {/* Type Label */}
                        <text 
                          x="0" 
                          y="0" 
                          fontSize={Math.min(item.width, item.depth) * 0.32} 
                          fill="white" 
                          className="font-bold tracking-tight"
                          textAnchor="middle" 
                          alignmentBaseline="middle"
                        >
                          {item.type}
                        </text>
                      </g>
                    ))}
                  </svg>
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/60 backdrop-blur-md rounded text-[10px] text-white/80 font-mono">
                    2D Studio CAD Blueprint
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-border/50 flex gap-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(idx);
                    }}
                    className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all shadow-sm ${isSelected ? 'bg-primary text-primary-foreground shadow-primary/20' : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'}`}
                  >
                    {isSelected ? 'Active Configuration' : 'Select Configuration'}
                  </button>
                  {onOpen3D && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect(idx);
                        onOpen3D(idx);
                      }}
                      className="px-4 py-3 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 rounded-xl text-sm font-bold shadow-md transition-transform active:scale-95 flex items-center gap-1.5"
                      title="Open Fullscreen 3D Studio"
                    >
                      <span>🛋️</span> <span className="hidden sm:inline">3D Studio</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default LayoutGallery;
