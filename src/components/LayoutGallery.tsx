import React from "react";
import { Check } from "lucide-react";

interface LayoutOption {
  id: string;
  name: string;
  desc: string;
  layout: any[];
  clearanceScores: any;
  genome: any;
  roast: string[];
}

interface LayoutGalleryProps {
  options: LayoutOption[];
  activeIndex: number;
  onSelect: (index: number) => void;
  room?: { width: number; length: number };
  unit?: string;
}

const LayoutGallery: React.FC<LayoutGalleryProps> = ({ options, activeIndex, onSelect, room, unit = 'ft' }) => {
  if (!options || options.length === 0) return null;

  // Default room if not provided
  const rWidth = room?.width || 20;
  const rLength = room?.length || 20;

  return (
    <section className="py-12 bg-muted/20 border-t border-border/50">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="font-display font-semibold text-3xl mb-3">Generated Layouts</h2>
          <p className="text-muted-foreground">
            Our spatial AI generated multiple ways to arrange your room. Click on a layout below to instantly see the furniture reconfigure in 3D.
          </p>
        </div>

        {/* Change grid to handle 6 options nicely */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {options.map((opt, idx) => {
            const isSelected = activeIndex === idx;
            const clearance = opt.clearanceScores;
            const isSpaceSaver = opt.id.includes('space_saver');

            return (
              <div
                key={opt.id}
                onClick={() => onSelect(idx)}
                className={`relative cursor-pointer overflow-hidden rounded-2xl border transition-all duration-300 p-6 flex flex-col h-full ${
                  isSelected 
                    ? "border-primary bg-primary/5 shadow-md scale-[1.02]" 
                    : "border-border/50 bg-background hover:border-primary/50 hover:shadow-sm"
                }`}
              >
                {isSelected && (
                  <div className="absolute top-4 right-4 bg-primary text-primary-foreground p-1 rounded-full shadow-sm">
                    <Check size={14} strokeWidth={3} />
                  </div>
                )}
                
                <div className="mb-4 inline-flex px-3 py-1 bg-muted rounded-full text-[10px] uppercase font-bold tracking-widest text-muted-foreground self-start">
                  Option {idx + 1}
                </div>
                
                <h3 className={`text-xl font-bold mb-2 ${isSelected ? "text-primary" : "text-foreground"}`}>
                  {opt.name}
                </h3>
                
                <p className="text-sm text-muted-foreground mb-4 flex-grow">
                  {opt.desc}
                </p>

                {/* Metrics */}
                {clearance?.spaceSavedPercentage !== undefined && (
                  <div className="mb-4 flex gap-4 text-xs font-medium">
                    <div className="flex flex-col">
                      <span className="text-muted-foreground">Space Saved</span>
                      <span className="text-accent">{clearance.spaceSavedPercentage}%</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-muted-foreground">Free Area</span>
                      <span className="text-foreground">{Math.round(clearance.freeSpaceArea)} sq {unit}</span>
                    </div>
                  </div>
                )}

                {/* Accurate Blueprint Visualization */}
                <div className={`h-40 w-full rounded-xl border flex items-center justify-center overflow-hidden bg-[#1e293b] ${isSelected ? "border-primary shadow-md" : "border-border/50"}`}>
                  <svg 
                    viewBox={`-1 -1 ${rWidth + 2} ${rLength + 2}`} 
                    className="w-full h-full p-2 drop-shadow-sm"
                    preserveAspectRatio="xMidYMid meet"
                  >
                    {/* Background Grid */}
                    <pattern id={`grid-${opt.id}`} width="2" height="2" patternUnits="userSpaceOnUse">
                      <path d="M 2 0 L 0 0 0 2" fill="none" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="0.1" />
                    </pattern>
                    <rect width={rWidth} height={rLength} fill={`url(#grid-${opt.id})`} />
                    
                    {/* True Room Boundary */}
                    <rect width={rWidth} height={rLength} fill="none" stroke="rgba(255, 255, 255, 0.8)" strokeWidth="0.4" />

                    {/* Furniture Layout */}
                    {opt.layout.map((item, i) => (
                      <g 
                        key={`${item.id}-${i}`}
                        transform={`translate(${item.x}, ${item.y}) rotate(${(item.rotation || 0) * (180 / Math.PI)})`}
                      >
                          <rect 
                          x={-item.width / 2} 
                          y={-item.depth / 2} 
                          width={item.width} 
                          height={item.depth} 
                          fill="rgba(255, 255, 255, 0.2)" 
                          stroke="rgba(255, 255, 255, 0.9)"
                          strokeWidth="0.2"
                        />
                        {/* Type Label */}
                        <text 
                          x="0" 
                          y="0" 
                          fontSize={Math.min(item.width, item.depth) * 0.3} 
                          fill="white" 
                          className="font-semibold"
                          textAnchor="middle" 
                          alignmentBaseline="middle"
                        >
                          {item.type}
                        </text>
                      </g>
                    ))}
                  </svg>
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
