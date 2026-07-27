import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, ShieldAlert, Sparkles, Building2, Trash2, ArrowRight, 
  Check, Plus, RotateCw, Tv, DoorClosed, AppWindow, Columns, 
  Layers, HelpCircle, Move, Sliders
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface StructuralElement {
  id: string;
  type: "pillar" | "beam" | "tv_wall" | "door" | "window" | string;
  label?: string;
  wall?: "top" | "right" | "bottom" | "left" | "interior";
  position?: number;
  x?: number;
  y?: number;
  width: number;
  depth?: number;
  rotation?: number;
  elevation?: number;
}

interface StructuralVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: { width: number; length: number };
  unit: string;
  initialStructuralElements?: StructuralElement[];
  onConfirm: (elements: StructuralElement[]) => void;
  onSkip: () => void;
}

const STRUCTURAL_TOOLS = [
  { type: "pillar", label: "Support Pillar / Column", w: 2, d: 2, wall: "interior", icon: Columns, color: "#cbd5e1", desc: "Freestanding or wall-edge column" },
  { type: "beam", label: "Wall Beam / Partition", w: 6, d: 1, wall: "interior", icon: Building2, color: "#8b5a2b", desc: "Internal dividing beam or wall jut" },
  { type: "tv_wall", label: "TV Entertainment Wall", w: 5, d: 1.2, wall: "top", icon: Tv, color: "#8b5cf6", desc: "Primary focal entertainment hub" },
  { type: "door", label: "Entryway / Door Corridor", w: 3.5, d: 0.5, wall: "bottom", icon: DoorClosed, color: "#10b981", desc: "Main room entrance or swing door" },
  { type: "window", label: "Architectural Window", w: 4, d: 0.5, wall: "top", icon: AppWindow, color: "#3b82f6", desc: "Natural light aperture" }
];

const StructuralVerificationModal: React.FC<StructuralVerificationModalProps> = ({
  isOpen,
  onClose,
  room,
  unit,
  initialStructuralElements = [],
  onConfirm,
  onSkip
}) => {
  const [mode, setMode] = useState<"choice" | "canvas">("choice");
  const [elements, setElements] = useState<StructuralElement[]>(initialStructuralElements || []);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedTool, setSelectedTool] = useState<string>("pillar");
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const rW = room?.width || 15;
  const rL = room?.length || 20;

  const activeElement = elements.find(e => e.id === selectedId);

  const handleAddTool = (toolDef: typeof STRUCTURAL_TOOLS[0]) => {
    const newEl: StructuralElement = {
      id: `struct-${toolDef.type}-${Date.now()}`,
      type: toolDef.type,
      label: toolDef.label,
      wall: toolDef.wall as any,
      width: toolDef.w,
      depth: toolDef.d,
      position: toolDef.wall === "top" || toolDef.wall === "bottom" ? rW / 2 : toolDef.wall === "left" || toolDef.wall === "right" ? rL / 2 : rW / 2,
      x: rW / 2,
      y: toolDef.wall === "top" ? toolDef.d / 2 : toolDef.wall === "bottom" ? rL - toolDef.d / 2 : rL / 2,
      rotation: 0
    };
    setElements([...elements, newEl]);
    setSelectedId(newEl.id);
  };

  const handleUpdateActive = (field: keyof StructuralElement, val: any) => {
    if (!selectedId) return;
    setElements(elements.map(el => {
      if (el.id === selectedId) {
        const updated = { ...el, [field]: val };
        // Sync wall position with x/y coordinates for clean rendering
        if (field === "x" || field === "y") {
          updated.position = field === "x" ? Number(val) : Number(val);
        }
        if (field === "wall") {
          if (val === "top") { updated.y = (updated.depth || 0.5) / 2; updated.rotation = 0; }
          else if (val === "bottom") { updated.y = rL - (updated.depth || 0.5) / 2; updated.rotation = 0; }
          else if (val === "left") { updated.x = (updated.depth || 0.5) / 2; updated.rotation = 90; }
          else if (val === "right") { updated.x = rW - (updated.depth || 0.5) / 2; updated.rotation = 90; }
        }
        return updated;
      }
      return el;
    }));
  };

  const handleDelete = (id: string) => {
    setElements(elements.filter(e => e.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6">
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-background w-full max-w-4xl rounded-3xl border border-border/80 shadow-2xl flex flex-col overflow-hidden text-foreground max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border/50 bg-card/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shadow-inner">
                <Building2 size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 bg-amber-500/10 text-amber-500 border border-amber-500/30 rounded-full">
                    COMPULSORY STEP 6
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">• 3D SPATIAL INTELLIGENCE</span>
                </div>
                <h2 className="text-xl md:text-2xl font-display font-bold text-foreground mt-0.5">
                  Structural & Focal Verification
                </h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 bg-muted/60 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title="Close"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {mode === "choice" ? (
              <div className="space-y-8 animate-fade-in py-2">
                <div className="text-center max-w-2xl mx-auto space-y-2">
                  <h3 className="text-lg md:text-xl font-bold text-foreground">
                    How should our AI handle structural obstacles in your {room.width}x{room.length} {unit} room?
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Before calculating layout mathematics, our engine aligns ergonomic TV viewing cones and collision-free circulation paths around fixed architectural anchors (pillars, beams, doors, windows, and TV wall).
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                  {/* Option 1: Manual Assignment */}
                  <div
                    onClick={() => setMode("canvas")}
                    className="cursor-pointer group relative p-6 rounded-2xl border-2 border-primary/40 bg-gradient-to-b from-primary/10 to-background hover:border-primary hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 flex flex-col justify-between"
                  >
                    <div className="absolute top-4 right-4 px-2.5 py-1 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm">
                      Recommended
                    </div>
                    <div className="space-y-4">
                      <div className="w-14 h-14 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <Tv size={28} />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                          Manually Assign Anchors
                          <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                          Open the interactive 2D Room Canvas to precisely position pillars, beams, doors, windows, and define your primary TV entertainment wall.
                        </p>
                      </div>
                    </div>
                    <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between text-xs font-semibold text-primary">
                      <span>Open Architectural Assigner</span>
                      <span className="bg-primary/10 px-2 py-1 rounded-md">Precision Mode</span>
                    </div>
                  </div>

                  {/* Option 2: Skip Option */}
                  <div
                    onClick={onSkip}
                    className="cursor-pointer group p-6 rounded-2xl border border-border/60 bg-card/40 hover:border-border hover:bg-card/80 hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      <div className="w-14 h-14 rounded-2xl bg-muted/60 border border-border/60 flex items-center justify-center text-muted-foreground group-hover:text-foreground group-hover:scale-110 transition-transform">
                        <Sparkles size={28} />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-foreground group-hover:text-accent transition-colors flex items-center gap-2">
                          Skip & Auto-Infer Layout
                          <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                          Skip manual obstacle placement. Let our spatial engine automatically infer the room center and generate layouts without fixed structural barriers.
                        </p>
                      </div>
                    </div>
                    <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between text-xs font-semibold text-muted-foreground group-hover:text-foreground">
                      <span>Skip & Calculate Immediately</span>
                      <span className="bg-muted px-2 py-1 rounded-md">Fast AI Inference</span>
                    </div>
                  </div>
                </div>

                <div className="text-center pt-2">
                  <span className="text-[11px] text-muted-foreground bg-muted/40 px-3 py-1.5 rounded-full border border-border/40">
                    💡 <strong>Tip:</strong> Assigning your TV Wall ensures all sofa seating automatically aligns within a 30° ergonomic viewing cone.
                  </span>
                </div>
              </div>
            ) : (
              /* Canvas Assigner Mode */
              <div className="space-y-6 animate-fade-in">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-muted/30 p-4 rounded-2xl border border-border/50">
                  <div>
                    <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                      <span>Interactive 2D Room Grid</span>
                      <span className="text-xs font-normal text-muted-foreground">({rW} x {rL} {unit})</span>
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Select a tool below to add elements, or click on an existing element to adjust coordinates and dimensions.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setMode("choice")}
                    className="text-xs h-8"
                  >
                    ← Back to Options
                  </Button>
                </div>

                {/* Toolbar */}
                <div className="flex flex-wrap gap-2 pb-2">
                  {STRUCTURAL_TOOLS.map((tool) => {
                    const Icon = tool.icon;
                    return (
                      <button
                        key={tool.type}
                        onClick={() => handleAddTool(tool)}
                        className="flex items-center gap-2 bg-card border border-border/80 hover:border-primary/60 hover:bg-primary/5 rounded-xl px-3 py-2 text-xs font-semibold transition-all shadow-sm"
                      >
                        <div className="w-5 h-5 rounded flex items-center justify-center text-white" style={{ backgroundColor: tool.color }}>
                          <Icon size={12} />
                        </div>
                        <span>+ Add {tool.label.split(" ")[0]}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Grid Canvas and Inspector Container */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Visual Grid Area */}
                  <div className="lg:col-span-2 bg-zinc-950 rounded-2xl border border-border/80 p-6 flex flex-col items-center justify-center min-h-[320px] relative overflow-hidden shadow-inner">
                    <div className="absolute top-3 left-3 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                      TOP WALL (Y = 0)
                    </div>
                    <div className="absolute bottom-3 left-3 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                      BOTTOM WALL (Y = {rL})
                    </div>
                    <div className="absolute top-1/2 left-2 -rotate-90 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                      LEFT (X = 0)
                    </div>
                    <div className="absolute top-1/2 right-2 rotate-90 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                      RIGHT (X = {rW})
                    </div>

                    {/* Scaled Room Box */}
                    <div
                      ref={canvasRef}
                      onMouseMove={(e) => {
                        if (!draggingId || !canvasRef.current) return;
                        const rect = canvasRef.current.getBoundingClientRect();
                        const relX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
                        const relY = Math.max(0, Math.min(rect.height, e.clientY - rect.top));
                        const newX = Number(((relX / rect.width) * rW).toFixed(1));
                        const newY = Number(((relY / rect.height) * rL).toFixed(1));
                        setElements(elements.map(el => el.id === draggingId ? { 
                          ...el, 
                          x: newX, 
                          y: newY, 
                          position: newX 
                        } : el));
                      }}
                      onMouseUp={() => setDraggingId(null)}
                      onMouseLeave={() => setDraggingId(null)}
                      onClick={(e) => {
                        if (selectedId && !draggingId && canvasRef.current && e.target === canvasRef.current) {
                          const rect = canvasRef.current.getBoundingClientRect();
                          const relX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
                          const relY = Math.max(0, Math.min(rect.height, e.clientY - rect.top));
                          const newX = Number(((relX / rect.width) * rW).toFixed(1));
                          const newY = Number(((relY / rect.height) * rL).toFixed(1));
                          handleUpdateActive("x", newX);
                          handleUpdateActive("y", newY);
                        }
                      }}
                      className="relative border-2 border-primary/60 bg-zinc-900/50 rounded-lg shadow-2xl transition-all cursor-crosshair select-none"
                      style={{
                        width: `${Math.min(100, Math.max(40, (rW / Math.max(rW, rL)) * 85))}%`,
                        height: "240px",
                        backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)",
                        backgroundSize: "20px 20px"
                      }}
                    >
                      {elements.map((el) => {
                        const isSelected = el.id === selectedId;
                        const toolDef = STRUCTURAL_TOOLS.find(t => t.type === el.type) || STRUCTURAL_TOOLS[0];
                        const Icon = toolDef.icon;
                        
                        // Calculate percentage positions inside box
                        const leftPct = ((el.x || rW / 2) / rW) * 100;
                        const topPct = ((el.y || rL / 2) / rL) * 100;
                        const widthPct = Math.max(10, (el.width / rW) * 100);
                        const heightPct = Math.max(10, ((el.depth || 1) / rL) * 100);

                        return (
                          <div
                            key={el.id}
                            onMouseDown={(e) => { 
                              e.stopPropagation(); 
                              setSelectedId(el.id); 
                              setDraggingId(el.id); 
                            }}
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              setSelectedId(el.id); 
                            }}
                            className={`absolute cursor-move flex items-center justify-center rounded transition-all select-none ${
                              isSelected 
                                ? "ring-2 ring-white scale-105 z-20 shadow-lg shadow-primary/30" 
                                : "opacity-90 hover:opacity-100 z-10"
                            } ${draggingId === el.id ? "opacity-75 scale-110 shadow-2xl ring-2 ring-primary" : ""}`}
                            style={{
                              left: `${Math.max(0, Math.min(90, leftPct - widthPct/2))}%`,
                              top: `${Math.max(0, Math.min(90, topPct - heightPct/2))}%`,
                              width: `${widthPct}%`,
                              height: `${heightPct}%`,
                              backgroundColor: toolDef.color,
                              transform: `rotate(${el.rotation || 0}deg)`
                            }}
                            title={`${toolDef.label} (${el.width}x${el.depth || 1}) - Drag to move`}
                          >
                            <Icon size={14} className="text-white drop-shadow pointer-events-none" />
                          </div>
                        );
                      })}
                      {elements.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center text-zinc-500 text-xs font-medium pointer-events-none">
                          No anchors placed yet. Add tools from above.
                        </div>
                      )}
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-xs text-zinc-400 bg-zinc-900/80 px-3.5 py-2 rounded-xl border border-border/40 shadow-sm w-full">
                      <Move size={15} className="text-primary animate-pulse shrink-0" />
                      <span>💡 <b>Pro Tip:</b> Drag any item directly on the grid or click anywhere to reposition the active anchor!</span>
                    </div>
                  </div>

                  {/* Inspector Panel */}
                  <div className="bg-card/40 rounded-2xl border border-border/60 p-5 flex flex-col justify-between">
                    {activeElement ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-border/50 pb-3">
                          <div>
                            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary block">
                              Active Inspector
                            </span>
                            <h4 className="font-bold text-sm text-foreground capitalize mt-0.5">
                              {STRUCTURAL_TOOLS.find(t => t.type === activeElement.type)?.label || activeElement.type}
                            </h4>
                          </div>
                          <button
                            onClick={() => handleDelete(activeElement.id)}
                            className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        {/* Wall Attachment / Position */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                            Wall / Location
                          </label>
                          <select
                            value={activeElement.wall || "interior"}
                            onChange={(e) => handleUpdateActive("wall", e.target.value)}
                            className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                          >
                            <option value="interior">Interior (Freestanding)</option>
                            <option value="top">Top Wall (North)</option>
                            <option value="bottom">Bottom Wall (South)</option>
                            <option value="left">Left Wall (West)</option>
                            <option value="right">Right Wall (East)</option>
                          </select>
                        </div>

                        {/* Coordinate Sliders */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                              X Position ({unit})
                            </label>
                            <input
                              type="number"
                              step="0.5"
                              min="0"
                              max={rW}
                              value={activeElement.x || rW / 2}
                              onChange={(e) => handleUpdateActive("x", Number(e.target.value))}
                              className="w-full bg-background border border-border rounded-lg px-2.5 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                              Y Position ({unit})
                            </label>
                            <input
                              type="number"
                              step="0.5"
                              min="0"
                              max={rL}
                              value={activeElement.y || rL / 2}
                              onChange={(e) => handleUpdateActive("y", Number(e.target.value))}
                              className="w-full bg-background border border-border rounded-lg px-2.5 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                          </div>
                        </div>

                        {/* Manual Nudge Pad */}
                        <div className="bg-muted/20 border border-border/50 rounded-xl p-2.5 space-y-1.5">
                          <div className="flex items-center justify-between text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                            <span>Interactive Nudge Pad</span>
                            <span className="text-primary/80 font-normal">Step: 0.5 {unit}</span>
                          </div>
                          <div className="grid grid-cols-3 gap-1.5 w-36 mx-auto">
                            <div />
                            <button 
                              onClick={() => handleUpdateActive("y", Math.max(0, Number(((activeElement.y || 0) - 0.5).toFixed(1))))}
                              className="p-1.5 bg-background hover:bg-primary/20 hover:text-primary rounded-lg border border-border flex items-center justify-center transition-colors shadow-sm font-bold text-xs"
                              title="Move Up (North)"
                            >
                              ▲
                            </button>
                            <div />
                            <button 
                              onClick={() => handleUpdateActive("x", Math.max(0, Number(((activeElement.x || 0) - 0.5).toFixed(1))))}
                              className="p-1.5 bg-background hover:bg-primary/20 hover:text-primary rounded-lg border border-border flex items-center justify-center transition-colors shadow-sm font-bold text-xs"
                              title="Move Left (West)"
                            >
                              ◀
                            </button>
                            <div className="flex items-center justify-center text-[9px] font-bold text-muted-foreground tracking-tighter bg-muted/50 rounded-lg border border-border/30 select-none">
                              MOVE
                            </div>
                            <button 
                              onClick={() => handleUpdateActive("x", Math.min(rW, Number(((activeElement.x || 0) + 0.5).toFixed(1))))}
                              className="p-1.5 bg-background hover:bg-primary/20 hover:text-primary rounded-lg border border-border flex items-center justify-center transition-colors shadow-sm font-bold text-xs"
                              title="Move Right (East)"
                            >
                              ▶
                            </button>
                            <div />
                            <button 
                              onClick={() => handleUpdateActive("y", Math.min(rL, Number(((activeElement.y || 0) + 0.5).toFixed(1))))}
                              className="p-1.5 bg-background hover:bg-primary/20 hover:text-primary rounded-lg border border-border flex items-center justify-center transition-colors shadow-sm font-bold text-xs"
                              title="Move Down (South)"
                            >
                              ▼
                            </button>
                            <div />
                          </div>
                        </div>

                        {/* Dimensions */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                              Width ({unit})
                            </label>
                            <input
                              type="number"
                              step="0.5"
                              min="0.5"
                              value={activeElement.width}
                              onChange={(e) => handleUpdateActive("width", Number(e.target.value))}
                              className="w-full bg-background border border-border rounded-lg px-2.5 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                              Depth ({unit})
                            </label>
                            <input
                              type="number"
                              step="0.5"
                              min="0.5"
                              value={activeElement.depth || 1}
                              onChange={(e) => handleUpdateActive("depth", Number(e.target.value))}
                              className="w-full bg-background border border-border rounded-lg px-2.5 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                          </div>
                        </div>

                        {/* Rotation */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                            Rotation
                          </label>
                          <div className="flex gap-1.5">
                            {[0, 90, 180, 270].map((deg) => (
                              <button
                                key={deg}
                                onClick={() => handleUpdateActive("rotation", deg)}
                                className={`flex-1 py-1 rounded border text-xs font-semibold transition-all ${
                                  (activeElement.rotation || 0) === deg 
                                    ? "bg-primary text-primary-foreground border-primary" 
                                    : "bg-background border-border/80 text-muted-foreground hover:text-foreground"
                                }`}
                              >
                                {deg}°
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center p-4 text-muted-foreground space-y-2 border border-dashed border-border/60 rounded-xl">
                        <Sliders size={24} className="opacity-40" />
                        <span className="text-xs font-medium">Select an anchor in the canvas to adjust its properties.</span>
                      </div>
                    )}

                    {/* Placed Items List Summary */}
                    <div className="mt-6 pt-4 border-t border-border/50">
                      <span className="text-[11px] font-semibold text-muted-foreground block mb-2">
                        Placed Anchors ({elements.length})
                      </span>
                      <div className="max-h-24 overflow-y-auto space-y-1 custom-scrollbar pr-1">
                        {elements.map((el) => (
                          <div 
                            key={el.id} 
                            onClick={() => setSelectedId(el.id)}
                            className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs cursor-pointer transition-colors ${
                              selectedId === el.id ? "bg-primary/10 text-primary font-semibold" : "hover:bg-muted text-foreground"
                            }`}
                          >
                            <span className="capitalize">{el.type.replace("_", " ")}</span>
                            <span className="text-[10px] text-muted-foreground font-mono">({el.x || 0}, {el.y || 0})</span>
                          </div>
                        ))}
                        {elements.length === 0 && (
                          <span className="text-[10px] text-muted-foreground italic">None placed yet.</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-border/50 bg-card/60 flex items-center justify-between gap-4">
            <div className="text-xs text-muted-foreground">
              {mode === "canvas" ? (
                <span>✓ Verified structural boundaries will anchor AI calculations.</span>
              ) : (
                <span>Please select an option above to proceed.</span>
              )}
            </div>

            <div className="flex items-center gap-3">
              {mode === "canvas" && (
                <Button
                  variant="ghost"
                  onClick={onSkip}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Skip All Anchors
                </Button>
              )}
              <Button
                onClick={() => {
                  if (mode === "choice") {
                    setMode("canvas");
                  } else {
                    onConfirm(elements);
                  }
                }}
                className="h-11 px-6 text-sm font-semibold shadow-xl shadow-primary/20 hover:shadow-primary/30 rounded-xl flex items-center gap-2"
              >
                <span>{mode === "choice" ? "Configure Anchors" : "✨ Confirm & Generate 3D Layout"}</span>
                <Check size={16} />
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default StructuralVerificationModal;
