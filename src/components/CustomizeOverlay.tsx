import React, { useState } from "react";
import { X, Plus, Save, RotateCw, RotateCcw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Trash2, Sliders, ShieldAlert, Sparkles, Building2, Box } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

interface CustomizeOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  initialLayout: any[];
  initialStructuralElements?: any[];
  room: { width: number; length: number };
  unit: string;
  onSave: (newLayout: any[], newStructuralElements?: any[]) => void;
}

const CustomizeOverlay: React.FC<CustomizeOverlayProps> = ({ 
  isOpen, 
  onClose, 
  initialLayout, 
  initialStructuralElements = [], 
  room, 
  unit, 
  onSave 
}) => {
  const [layout, setLayout] = useState<any[]>(initialLayout || []);
  const [structuralElements, setStructuralElements] = useState<any[]>(initialStructuralElements || []);
  const [selectedTab, setSelectedTab] = useState<"furniture" | "structure">("furniture");
  const [selectedTool, setSelectedTool] = useState<string>("sofa");
  const [selectedStructTool, setSelectedStructTool] = useState<string>("pillar");
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedStructId, setSelectedStructId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [draggingType, setDraggingType] = useState<'furniture' | 'structure' | null>(null);

  if (!isOpen) return null;

  const rW = room?.width || 20;
  const rL = room?.length || 20;

  const furnitureTools = [
    { type: "sofa", label: "Sofa / Lounge", w: 7, d: 3, icon: "🛋️" },
    { type: "chair", label: "Armchair", w: 2.5, d: 2.5, icon: "🪑" },
    { type: "table", label: "Table / Desk", w: 4, d: 2.5, icon: "🪵" },
    { type: "tv", label: "TV Console", w: 5, d: 1.2, icon: "📺" },
    { type: "plant", label: "Botanical Decor", w: 1.5, d: 1.5, icon: "🌿" },
    { type: "bookshelf", label: "Bookshelf", w: 4, d: 1.2, icon: "📚" }
  ];

  const structureTools = [
    { type: "pillar", label: "Wall Pillar / Column", w: 2, d: 2, wall: "interior", desc: "Internal support column or freestanding pillar" },
    { type: "pillar", label: "Wall-Edge Pillar", w: 2, d: 2, wall: "top", desc: "Corner or wall-edge architectural bump-out" },
    { type: "beam", label: "Interior Wall / Beam", w: 6, d: 1, wall: "interior", desc: "Structural beam or internal wall partition" },
    { type: "window", label: "Window Frame", w: 5, d: 0.5, wall: "top", desc: "Exterior glass aperture" },
    { type: "door", label: "Entryway / Door", w: 3.5, d: 0.5, wall: "bottom", desc: "Primary room door corridor" }
  ];

  const handleGridClick = (e: React.MouseEvent<SVGSVGElement>) => {
    // Only drop item if we clicked empty space (not dragging/clicking an existing item)
    if ((e.target as HTMLElement).tagName !== 'svg' && (e.target as HTMLElement).tagName !== 'rect' && (e.target as HTMLElement).id !== 'grid-bg') return;

    const svg = e.currentTarget;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const cursorPt = pt.matrixTransform(svg.getScreenCTM()?.inverse());
    const clampX = Math.max(1, Math.min(rW - 1, cursorPt.x));
    const clampY = Math.max(1, Math.min(rL - 1, cursorPt.y));

    if (selectedTab === "furniture") {
      const tool = furnitureTools.find(t => t.type === selectedTool) || furnitureTools[0];
      const newItem = {
        id: `custom-${selectedTool}-${Date.now()}`,
        type: selectedTool,
        x: clampX,
        y: clampY,
        width: tool.w,
        depth: tool.d,
        rotation: 0
      };
      setLayout([...layout, newItem]);
      setSelectedItemId(newItem.id);
      setSelectedStructId(null);
    } else {
      const tool = structureTools.find(t => t.type === selectedStructTool) || structureTools[0];
      const newStruct = {
        id: `struct-${selectedStructTool}-${Date.now()}`,
        type: selectedStructTool,
        position: clampX,
        width: tool.w,
        wall: tool.wall === "interior" ? "top" : tool.wall,
        x: clampX,
        y: clampY,
        depth: tool.d,
        rotation: 0
      };
      setStructuralElements([...structuralElements, newStruct]);
      setSelectedStructId(newStruct.id);
      setSelectedItemId(null);
    }
  };

  // Find currently selected item (either furniture or structural element)
  const activeItem = layout.find(item => item.id === selectedItemId);
  const activeStruct = structuralElements.find(item => item.id === selectedStructId);

  // Shift Coordinates by Nudge Amount (e.g. 0.5 ft / ~6 inches)
  const nudgeItem = (dx: number, dy: number) => {
    if (activeItem) {
      setLayout(layout.map(item => {
        if (item.id === selectedItemId) {
          const newX = Math.max(item.width/2, Math.min(rW - item.width/2, item.x + dx));
          const newY = Math.max(item.depth/2, Math.min(rL - item.depth/2, item.y + dy));
          return { ...item, x: newX, y: newY };
        }
        return item;
      }));
    } else if (activeStruct) {
      setStructuralElements(structuralElements.map(item => {
        if (item.id === selectedStructId) {
          const newX = Math.max(0.5, Math.min(rW - 0.5, (item.x || item.position || 2) + dx));
          const newY = Math.max(0.5, Math.min(rL - 0.5, (item.y || 2) + dy));
          return { ...item, x: newX, y: newY, position: newX };
        }
        return item;
      }));
    }
  };

  // Rotate Piece by 90 degrees or arbitrary angle
  const rotateItem = (angleRad: number) => {
    if (activeItem) {
      setLayout(layout.map(item => {
        if (item.id === selectedItemId) {
          const currentRot = item.rotation || 0;
          return { ...item, rotation: currentRot + angleRad };
        }
        return item;
      }));
    } else if (activeStruct) {
      setStructuralElements(structuralElements.map(item => {
        if (item.id === selectedStructId) {
          const currentRot = item.rotation || 0;
          return { ...item, rotation: currentRot + angleRad };
        }
        return item;
      }));
    }
  };

  const deleteSelected = () => {
    if (selectedItemId) {
      setLayout(layout.filter(item => item.id !== selectedItemId));
      setSelectedItemId(null);
    } else if (selectedStructId) {
      setStructuralElements(structuralElements.filter(item => item.id !== selectedStructId));
      setSelectedStructId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6 animate-fade-in">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-background w-full max-w-6xl h-[90vh] rounded-[2rem] border border-border/80 shadow-2xl flex flex-col overflow-hidden text-foreground"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/40 bg-card/60">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest mb-1.5 shadow-sm">
              <span>🏛️ MILAN STUDIO ARCHITECTURAL CUSTOMIZER</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">Interactive Spatial Editor & Fine-Tuning</h2>
            <p className="text-xs md:text-sm text-muted-foreground mt-0.5 font-light">
              Select any furniture piece or architectural pillar to precision shift coordinates (X/Y axis) and rotate orientation to match real-world room constraints.
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2.5 bg-muted/60 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Close Customizer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Main Editor Body */}
        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          
          {/* Left Inspector Sidebar */}
          <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-border/40 p-6 flex flex-col bg-card/30 overflow-y-auto space-y-6">
            
            {/* Mode Selector Tabs */}
            <div className="flex rounded-xl bg-muted/40 p-1 border border-border/40">
              <button
                onClick={() => { setSelectedTab("furniture"); setSelectedStructId(null); }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  selectedTab === "furniture" ? "bg-foreground text-background shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Box size={14} /> <span>Furniture</span>
              </button>
              <button
                onClick={() => { setSelectedTab("structure"); setSelectedItemId(null); }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  selectedTab === "structure" ? "bg-foreground text-background shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Building2 size={14} /> <span>Structure & Pillars</span>
              </button>
            </div>

            {/* Active Inspector / Manipulation Panel */}
            {(activeItem || activeStruct) ? (
              <div className="p-4 rounded-2xl bg-muted/30 border border-border/60 space-y-4 animate-fade-in">
                <div className="flex items-center justify-between border-b border-border/40 pb-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary block">
                      Selected {activeItem ? "Piece" : "Structural Element"}
                    </span>
                    <h4 className="font-display font-bold text-lg capitalize text-foreground mt-0.5">
                      {activeItem ? activeItem.type : activeStruct?.type}
                    </h4>
                  </div>
                  <button 
                    onClick={deleteSelected}
                    className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                    title="Delete Selected Item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Precision Coordinate Shifting Controls (Nudge by ~6 inches) */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                    Precision Coordinate Shifting (Nudge X/Y)
                  </span>
                  <div className="grid grid-cols-3 gap-1.5 max-w-[180px] mx-auto py-2">
                    <div />
                    <Button variant="outline" size="sm" onClick={() => nudgeItem(0, -0.5)} title="Move Up / North" className="h-9 w-9 p-0 mx-auto rounded-xl">
                      <ArrowUp size={16} />
                    </Button>
                    <div />
                    <Button variant="outline" size="sm" onClick={() => nudgeItem(-0.5, 0)} title="Move Left / West" className="h-9 w-9 p-0 mx-auto rounded-xl">
                      <ArrowLeft size={16} />
                    </Button>
                    <div className="flex items-center justify-center text-[10px] font-mono text-muted-foreground bg-muted rounded-lg">
                      Move
                    </div>
                    <Button variant="outline" size="sm" onClick={() => nudgeItem(0.5, 0)} title="Move Right / East" className="h-9 w-9 p-0 mx-auto rounded-xl">
                      <ArrowRight size={16} />
                    </Button>
                    <div />
                    <Button variant="outline" size="sm" onClick={() => nudgeItem(0, 0.5)} title="Move Down / South" className="h-9 w-9 p-0 mx-auto rounded-xl">
                      <ArrowDown size={16} />
                    </Button>
                    <div />
                  </div>
                </div>

                {/* Rotation Controls */}
                <div className="space-y-2 pt-2 border-t border-border/40">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                    Orientation & Angle
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => rotateItem(Math.PI / 2)} 
                      className="text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 py-2.5"
                    >
                      <RotateCw size={14} /> Rotate 90°
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => rotateItem(-Math.PI / 2)} 
                      className="text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 py-2.5"
                    >
                      <RotateCcw size={14} /> Rotate -90°
                    </Button>
                  </div>
                </div>

                <div className="text-[11px] font-mono text-muted-foreground pt-2 text-center bg-background/50 p-2 rounded-lg">
                  Pos: ({Math.round((activeItem?.x || activeStruct?.x || 0) * 10) / 10}ft, {Math.round((activeItem?.y || activeStruct?.y || 0) * 10) / 10}ft) • Angle: {Math.round(((activeItem?.rotation || activeStruct?.rotation || 0) * (180/Math.PI)) % 360)}°
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-muted/20 border border-dashed border-border/60 text-center py-8">
                <Sliders size={24} className="mx-auto text-muted-foreground/60 mb-2" />
                <p className="text-xs font-semibold text-muted-foreground">No Piece Selected</p>
                <p className="text-[11px] text-muted-foreground/80 mt-1">Click any furniture or pillar on the canvas to shift or rotate it.</p>
              </div>
            )}

            {/* Insertion Palette */}
            <div className="space-y-3 flex-1 overflow-y-auto">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                {selectedTab === "furniture" ? "Add Furniture Palette" : "Add Structural Constraints"}
              </span>
              <div className="space-y-2">
                {(selectedTab === "furniture" ? furnitureTools : structureTools).map((tool: any) => {
                  const isSelectedTool = selectedTab === "furniture" ? selectedTool === tool.type : selectedStructTool === tool.type;
                  return (
                    <button
                      key={tool.type}
                      onClick={() => {
                        if (selectedTab === "furniture") setSelectedTool(tool.type);
                        else setSelectedStructTool(tool.type);
                      }}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                        isSelectedTool
                          ? "border-foreground bg-muted/50 shadow-sm ring-1 ring-foreground"
                          : "border-border/60 bg-background/50 hover:bg-muted/30 hover:border-border"
                      }`}
                    >
                      <div>
                        <div className="font-display font-semibold text-sm text-foreground flex items-center gap-2">
                          <span>{tool.icon || "🏛️"}</span> {tool.label}
                        </div>
                        <div className="text-[11px] font-mono text-muted-foreground mt-0.5">
                          {tool.w}ft × {tool.d}ft {tool.desc ? `• ${tool.desc}` : ""}
                        </div>
                      </div>
                      <Plus size={16} className={isSelectedTool ? "text-foreground" : "text-muted-foreground/60"} />
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Interactive CAD Blueprint Canvas */}
          <div className="flex-1 bg-[#0f172a] p-6 lg:p-10 flex flex-col items-center justify-center relative overflow-hidden select-none">
            <div className="absolute top-4 left-6 z-10 flex items-center gap-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-xs font-mono text-white/80">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Click empty grid to insert tool • Click & drag any piece to move directly on floor plan</span>
            </div>

            <div className="w-full h-full max-w-4xl max-h-[70vh] flex items-center justify-center">
              <svg 
                id="grid-bg"
                viewBox={`-2 -2 ${rW + 4} ${rL + 4}`} 
                className="w-full h-full cursor-crosshair drop-shadow-2xl rounded-2xl overflow-hidden border border-white/10 bg-[#0b1120]"
                preserveAspectRatio="xMidYMid meet"
                onClick={handleGridClick}
                onMouseMove={(e) => {
                  if (!draggingId || !draggingType) return;
                  const svg = e.currentTarget;
                  const pt = svg.createSVGPoint();
                  pt.x = e.clientX;
                  pt.y = e.clientY;
                  const cursorPt = pt.matrixTransform(svg.getScreenCTM()?.inverse());
                  const clampX = Math.max(1, Math.min(rW - 1, cursorPt.x));
                  const clampY = Math.max(1, Math.min(rL - 1, cursorPt.y));
                  
                  if (draggingType === 'furniture') {
                    setLayout(prev => prev.map(item => item.id === draggingId ? { ...item, x: clampX, y: clampY } : item));
                  } else {
                    setStructuralElements(prev => prev.map(item => item.id === draggingId ? { ...item, x: clampX, y: clampY, position: clampX } : item));
                  }
                }}
                onMouseUp={() => { setDraggingId(null); setDraggingType(null); }}
                onMouseLeave={() => { setDraggingId(null); setDraggingType(null); }}
              >
                {/* Architectural Grid */}
                <pattern id="customizer-grid" width="1" height="1" patternUnits="userSpaceOnUse">
                  <path d="M 1 0 L 0 0 0 1" fill="none" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="0.04" />
                </pattern>
                <pattern id="customizer-grid-major" width="5" height="5" patternUnits="userSpaceOnUse">
                  <rect width="5" height="5" fill="url(#customizer-grid)" />
                  <path d="M 5 0 L 0 0 0 5" fill="none" stroke="rgba(255, 255, 255, 0.18)" strokeWidth="0.08" />
                </pattern>
                <rect id="grid-bg" width={rW} height={rL} fill="url(#customizer-grid-major)" />
                <rect id="grid-bg" width={rW} height={rL} fill="none" stroke="rgba(255, 255, 255, 0.7)" strokeWidth="0.25" rx="0.3" />

                {/* Wall Label Directions */}
                <text x={rW/2} y={-0.6} fill="rgba(255,255,255,0.4)" fontSize="0.7" fontFamily="monospace" textAnchor="middle">TOP WALL / WINDOWS</text>
                <text x={rW/2} y={rL + 1.2} fill="rgba(255,255,255,0.4)" fontSize="0.7" fontFamily="monospace" textAnchor="middle">BOTTOM WALL / DOORS</text>
                <text x={-0.8} y={rL/2} fill="rgba(255,255,255,0.4)" fontSize="0.7" fontFamily="monospace" textAnchor="middle" transform={`rotate(-90, -0.8, ${rL/2})`}>LEFT WALL</text>
                <text x={rW + 0.8} y={rL/2} fill="rgba(255,255,255,0.4)" fontSize="0.7" fontFamily="monospace" textAnchor="middle" transform={`rotate(90, ${rW + 0.8}, ${rL/2})`}>RIGHT WALL</text>

                {/* Structural Elements (Pillars, Beams, Windows, Doors) */}
                {structuralElements.map((el, idx) => {
                  const isSelected = el.id === selectedStructId;
                  let w = el.width || 2; let h = el.depth || 2;
                  const isPillarOrBeam = el.type === 'pillar' || el.type === 'column' || el.type === 'beam';
                  if (el.wall === 'top' && !isPillarOrBeam) { w = el.width; h = 0.6; }
                  else if (el.wall === 'bottom' && !isPillarOrBeam) { w = el.width; h = 0.6; }
                  else if (el.wall === 'left' && !isPillarOrBeam) { w = 0.6; h = el.width; }
                  else if (el.wall === 'right' && !isPillarOrBeam) { w = 0.6; h = el.width; }

                  let x = el.x || el.position || w/2;
                  let y = el.y || h/2;
                  if (el.wall === 'top') { x = el.position || el.x || w/2; y = h/2; }
                  else if (el.wall === 'bottom') { x = el.position || el.x || w/2; y = rL - h/2; }
                  else if (el.wall === 'left') { x = w/2; y = el.position || el.y || h/2; }
                  else if (el.wall === 'right') { x = rW - w/2; y = el.position || el.y || h/2; }

                  return (
                    <g
                      key={`struct-el-${idx}`}
                      transform={`translate(${x}, ${y}) rotate(${(el.rotation || 0) * (180 / Math.PI)})`}
                      onClick={(e) => { e.stopPropagation(); setSelectedStructId(el.id); setSelectedItemId(null); }}
                      onMouseDown={(e) => { e.stopPropagation(); setSelectedStructId(el.id); setSelectedItemId(null); setDraggingId(el.id); setDraggingType('structure'); }}
                      className="cursor-pointer transition-all"
                    >
                      <rect
                        x={-w/2}
                        y={-h/2}
                        width={w}
                        height={h}
                        fill={el.type === 'window' ? '#38bdf8' : el.type === 'door' ? '#eab308' : '#cbd5e1'}
                        opacity={isSelected ? 1 : 0.8}
                        stroke={isSelected ? '#facc15' : 'rgba(255,255,255,0.9)'}
                        strokeWidth={isSelected ? '0.2' : '0.08'}
                        rx="0.1"
                      />
                      <text
                        x={0}
                        y={0}
                        fontSize="0.5"
                        fill="#0f172a"
                        fontFamily="monospace"
                        fontWeight="bold"
                        textAnchor="middle"
                        alignmentBaseline="middle"
                      >
                        {el.type?.toUpperCase()}
                      </text>
                    </g>
                  );
                })}

                {/* Furniture Layout Pieces */}
                {layout.map((item, i) => {
                  const isSelected = item.id === selectedItemId;
                  return (
                    <g 
                      key={`${item.id}-${i}`}
                      transform={`translate(${item.x}, ${item.y}) rotate(${(item.rotation || 0) * (180 / Math.PI)})`}
                      onClick={(e) => { e.stopPropagation(); setSelectedItemId(item.id); setSelectedStructId(null); }}
                      onMouseDown={(e) => { e.stopPropagation(); setSelectedItemId(item.id); setSelectedStructId(null); setDraggingId(item.id); setDraggingType('furniture'); }}
                      className="cursor-pointer transition-all group"
                    >
                      {/* Selection Glow Box */}
                      {isSelected && (
                        <rect 
                          x={(-item.width / 2) - 0.2} 
                          y={(-item.depth / 2) - 0.2} 
                          width={item.width + 0.4} 
                          height={item.depth + 0.4} 
                          fill="none" 
                          stroke="#facc15" 
                          strokeWidth="0.15" 
                          strokeDasharray="0.3,0.2"
                          rx="0.3"
                          className="animate-pulse"
                        />
                      )}
                      
                      <rect 
                        x={-item.width / 2} 
                        y={-item.depth / 2} 
                        width={item.width} 
                        height={item.depth} 
                        fill={isSelected ? "rgba(250, 204, 21, 0.3)" : "rgba(255, 255, 255, 0.18)"} 
                        stroke={isSelected ? "#facc15" : "rgba(255, 255, 255, 0.85)"}
                        strokeWidth={isSelected ? "0.15" : "0.1"}
                        rx="0.2"
                      />
                      
                      {/* Direction Orientation Arrow */}
                      <line x1="0" y1="0" x2="0" y2={-item.depth / 2} stroke={isSelected ? "#facc15" : "rgba(255,255,255,0.5)"} strokeWidth="0.08" />
                      <circle cx="0" cy={-item.depth / 2} r="0.15" fill={isSelected ? "#facc15" : "rgba(255,255,255,0.8)"} />

                      <text 
                        x="0" 
                        y="0" 
                        fontSize={Math.min(item.width, item.depth) * 0.32} 
                        fill="white" 
                        className="font-bold tracking-tight select-none pointer-events-none"
                        textAnchor="middle" 
                        alignmentBaseline="middle"
                      >
                        {item.type}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            <div className="absolute bottom-4 right-6 text-[11px] font-mono text-white/60 bg-black/40 px-3 py-1 rounded-lg">
              Room Dimensions: {rW}ft × {rL}ft ({rW * rL} sq ft)
            </div>
          </div>

        </div>

        {/* Footer Controls */}
        <div className="p-6 border-t border-border/40 flex items-center justify-between bg-card/80">
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
            <span>Pieces: <strong className="text-foreground">{layout.length}</strong></span>
            <span>•</span>
            <span>Structural Pillars/Windows: <strong className="text-foreground">{structuralElements.length}</strong></span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onClose} className="rounded-xl px-6 py-5 text-xs font-semibold">
              Cancel
            </Button>
            <Button 
              onClick={() => onSave(layout, structuralElements)} 
              className="bg-foreground text-background hover:bg-foreground/90 rounded-xl px-7 py-5 text-xs font-bold shadow-md flex items-center gap-2"
            >
              <Save size={16} /> Save Custom Arrangement & Render 3D
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CustomizeOverlay;
