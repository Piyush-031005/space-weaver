import React, { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Maximize2, Layers, ShieldCheck, Sparkles, Compass, 
  ArrowUp, ArrowDown, ArrowLeft, ArrowRight, RotateCw, 
  ZoomIn, ZoomOut, Save, Sliders, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Lazy load WebGLHero for performance inside modal
const WebGLHero = React.lazy(() => import("@/components/WebGLHero"));

interface Fullscreen3DStudioProps {
  isOpen: boolean;
  onClose: () => void;
  onCustomize?: () => void;
  onSaveLayout?: (newLayout: any[]) => void;
  activeOption: any;
  room: { width: number; length: number };
  fixedElements?: any[];
  focalPoint?: any;
}

const Fullscreen3DStudio: React.FC<Fullscreen3DStudioProps> = ({
  isOpen,
  onClose,
  onCustomize,
  onSaveLayout,
  activeOption,
  room,
  fixedElements = [],
  focalPoint
}) => {
  const [layout, setLayout] = useState<any[]>(activeOption?.layout || []);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Sync when activeOption changes
  useEffect(() => {
    if (activeOption?.layout) {
      setLayout(activeOption.layout);
      if (activeOption.layout.length > 0 && !selectedItemId) {
        setSelectedItemId(activeOption.layout[0].id || 'item-0');
      }
    }
  }, [activeOption]);

  const rW = room?.width || 20;
  const rL = room?.length || 20;

  const activeItem = layout.find((item, idx) => (item.id || `item-${idx}`) === selectedItemId);

  // Live Walkway Clearance & Fit Warning Engine
  const fitWarning = React.useMemo(() => {
    if (!activeItem) return null;
    const itemW = activeItem.width || 3;
    const itemD = activeItem.depth || 3;
    
    // Check perimeter wall distance (in inches)
    const leftDist = Math.max(0, (activeItem.x - itemW / 2) * 12);
    const rightDist = Math.max(0, (rW - (activeItem.x + itemW / 2)) * 12);
    const topDist = Math.max(0, (activeItem.y - itemD / 2) * 12);
    const bottomDist = Math.max(0, (rL - (activeItem.y + itemD / 2)) * 12);
    const minWallDist = Math.min(leftDist, rightDist, topDist, bottomDist);

    if (minWallDist < 26) {
      return `⚠️ ${activeItem.name || activeItem.type} (${Math.round(itemW)}ft) leaves only ${Math.round(minWallDist)}" clearance to wall.`;
    }

    // Check distance to other furniture
    for (const other of layout) {
      const otherId = other.id || other.name;
      const curId = activeItem.id || activeItem.name;
      if (otherId === curId) continue;
      const otherW = other.width || 3;
      const otherD = other.depth || 3;
      const dx = Math.abs(activeItem.x - other.x) - (itemW + otherW) / 2;
      const dy = Math.abs(activeItem.y - other.y) - (itemD + otherD) / 2;
      const dist = Math.max(dx, dy) * 12;
      if (dist < 28 && dist >= 0) {
        return `⚠️ Tight walkway between ${activeItem.name || activeItem.type} and ${other.name || other.type} (${Math.round(dist)}", recommended ≥ 36").`;
      }
    }
    return null;
  }, [activeItem, layout, rW, rL]);

  // Shift coordinates (Up, Down, Left, Right)
  const nudgeItem = (dx: number, dy: number) => {
    if (!activeItem) return;
    setLayout(prev => prev.map((item, idx) => {
      const idKey = item.id || `item-${idx}`;
      if (idKey === selectedItemId) {
        const itemW = item.width || 3;
        const itemD = item.depth || 3;
        const newX = Math.max(itemW / 2, Math.min(rW - itemW / 2, item.x + dx));
        const newY = Math.max(itemD / 2, Math.min(rL - itemD / 2, item.y + dy));
        return { ...item, x: newX, y: newY };
      }
      return item;
    }));
    setHasUnsavedChanges(true);
  };

  // Scale piece (Ctrl + / Ctrl -)
  const scaleItem = (multiplier: number) => {
    if (!activeItem) return;
    setLayout(prev => prev.map((item, idx) => {
      const idKey = item.id || `item-${idx}`;
      if (idKey === selectedItemId) {
        const newW = Math.max(1.0, Math.min(rW - 1, Math.round((item.width * multiplier) * 10) / 10));
        const newD = Math.max(0.8, Math.min(rL - 1, Math.round((item.depth * multiplier) * 10) / 10));
        return { ...item, width: newW, depth: newD };
      }
      return item;
    }));
    setHasUnsavedChanges(true);
  };

  // Rotate piece by 90 degrees
  const rotateItem = (angleRad: number) => {
    if (!activeItem) return;
    setLayout(prev => prev.map((item, idx) => {
      const idKey = item.id || `item-${idx}`;
      if (idKey === selectedItemId) {
        return { ...item, rotation: (item.rotation || 0) + angleRad };
      }
      return item;
    }));
    setHasUnsavedChanges(true);
  };

  // Change vertical elevation in 3D
  const elevateItem = (dz: number) => {
    if (!activeItem) return;
    setLayout(prev => prev.map((item, idx) => {
      const idKey = item.id || `item-${idx}`;
      if (idKey === selectedItemId) {
        const curEl = item.elevation !== undefined ? item.elevation : (item.type === 'tv' ? 2.4 : item.type === 'lamp' ? 1.5 : 0);
        return { ...item, elevation: Math.max(0, Math.min(8, curEl + dz)) };
      }
      return item;
    }));
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    if (onSaveLayout) {
      onSaveLayout(layout);
      setHasUnsavedChanges(false);
      toast.success("3D Layout changes saved successfully!");
    }
  };

  // Keyboard shortcut listener for active 3D studio manipulation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      const isModifier = e.ctrlKey || e.metaKey;

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        nudgeItem(0, e.shiftKey ? -1.0 : -0.5);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        nudgeItem(0, e.shiftKey ? 1.0 : 0.5);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        nudgeItem(e.shiftKey ? -1.0 : -0.5, 0);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        nudgeItem(e.shiftKey ? 1.0 : 0.5, 0);
      } else if ((isModifier && (e.key === '=' || e.key === '+')) || e.key === ']' || (e.key === '+' && !isModifier)) {
        e.preventDefault();
        scaleItem(1.1);
      } else if ((isModifier && (e.key === '-' || e.key === '_')) || e.key === '[' || (e.key === '-' && !isModifier)) {
        e.preventDefault();
        scaleItem(0.9);
      } else if (e.key.toLowerCase() === 'r') {
        e.preventDefault();
        rotateItem(Math.PI / 2);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedItemId, layout]);

  if (!isOpen || !activeOption) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-zinc-950 text-white flex flex-col overflow-hidden"
      >
        {/* Top Architectural Command Bar */}
        <div className="flex-none bg-zinc-900/90 backdrop-blur-md border-b border-zinc-800 px-6 py-4 flex items-center justify-between z-30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center text-primary">
              <Maximize2 size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-widest font-bold text-zinc-400">Architectural 3D Studio</span>
                <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700 text-[10px] font-mono font-semibold">MILAN LUXURY SPEC</span>
              </div>
              <h2 className="text-lg font-display font-bold text-white mt-0.5">
                {activeOption.name || "Curated Configuration"}
              </h2>
            </div>
          </div>

          {/* Center Info Pills */}
          <div className="hidden lg:flex items-center gap-4 text-xs font-mono bg-zinc-950/70 px-4 py-2 rounded-full border border-zinc-800/80">
            <span className="flex items-center gap-1.5 text-zinc-300">
              <Compass size={14} className="text-primary" /> Room: {room.width}ft × {room.length}ft
            </span>
            <span className="text-zinc-600">|</span>
            <span className="flex items-center gap-1.5 text-zinc-300 font-semibold">
              <ShieldCheck size={14} className="text-primary" /> Live 3D Interactive Mode
            </span>
            <span className="text-zinc-600">|</span>
            <span className="text-amber-400 font-medium">
              ⌨️ Arrows = Nudge • Ctrl +/- = Scale • R = Rotate
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {hasUnsavedChanges && (
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-lg animate-pulse"
                title="Save updated coordinates and dimensions"
              >
                <Save size={16} /> Save 3D Changes
              </button>
            )}

            {onCustomize && (
              <button
                onClick={() => {
                  onClose();
                  onCustomize();
                }}
                className="px-4 py-2 bg-primary hover:bg-primary/90 text-zinc-950 rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-lg active:scale-95"
                title="Open 2D CAD Blueprint customizer"
              >
                🎛️ 2D CAD Blueprint
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-sm font-semibold transition-all flex items-center gap-2 border border-zinc-700 shadow-lg active:scale-95"
            >
              <X size={16} /> Close Studio
            </button>
          </div>
        </div>

        {/* Immersive Dark Mode 3D Canvas */}
        <div className="flex-1 relative bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 overflow-hidden flex items-center justify-center">
          <Suspense fallback={
            <div className="flex flex-col items-center justify-center gap-3 text-zinc-400 font-mono text-sm animate-pulse">
              <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              <span>Rendering High-Fidelity 3D Studio Environment...</span>
            </div>
          }>
            <WebGLHero
              onGenerate={() => {}}
              isGenerating={false}
              hasGenerated={true}
              layoutData={layout}
              fixedElements={fixedElements}
              room={room}
              focalPoint={focalPoint}
              showAIThinking={false}
              showText={false}
              fullHeight={false}
              isStudio={true}
            />
          </Suspense>

          {/* Floating Piece Selector Carousel (Bottom Left) */}
          <div className="absolute bottom-6 left-6 z-20 max-w-md bg-zinc-900/90 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-3.5 shadow-2xl space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                <Sliders size={14} /> Interactive 3D Piece Selector
              </div>
              <span className="text-[10px] font-mono text-zinc-400">Click to Select</span>
            </div>
            
            <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-sm custom-scrollbar">
              {layout.map((item, idx) => {
                const idKey = item.id || `item-${idx}`;
                const isSelected = idKey === selectedItemId;
                const icon = item.type === 'sofa' ? '🛋️' : item.type === 'chair' ? '🪑' : item.type === 'table' ? '🪵' : item.type === 'tv' ? '📺' : item.type === 'bookshelf' ? '📚' : item.type === 'bed' ? '🛏️' : '💡';
                return (
                  <button
                    key={idKey}
                    onClick={() => setSelectedItemId(idKey)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                      isSelected 
                        ? "bg-primary text-zinc-950 border-primary shadow-md font-bold scale-105" 
                        : "bg-zinc-800/80 text-zinc-300 border-zinc-700/80 hover:bg-zinc-700 hover:text-white"
                    }`}
                  >
                    <span>{icon}</span>
                    <span className="capitalize">{item.type} {idx + 1}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Floating 3D Precision Transformation HUD (Bottom Right) */}
          {activeItem && (
            <div className="absolute bottom-6 right-6 z-20 w-80 bg-zinc-900/95 backdrop-blur-md border border-zinc-700/80 rounded-2xl p-4 shadow-2xl space-y-3.5 animate-in fade-in slide-in-from-bottom-4 duration-200">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary">Selected 3D Piece</span>
                  <h4 className="text-sm font-bold text-white capitalize">
                    {activeItem.type} • {Math.round(activeItem.width * 10) / 10}ft × {Math.round(activeItem.depth * 10) / 10}ft
                  </h4>
                </div>
                <span className="text-[11px] font-mono text-zinc-400">
                  ({Math.round(activeItem.x * 10) / 10}, {Math.round(activeItem.y * 10) / 10})
                </span>
              </div>

              {/* 4-Way Coordinate Nudge */}
              <div>
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block mb-1.5">
                  Shift Position (Arrow Keys)
                </span>
                <div className="grid grid-cols-3 gap-1 max-w-[150px] mx-auto">
                  <div />
                  <Button variant="outline" size="sm" onClick={() => nudgeItem(0, -0.5)} title="Move Forward / North" className="h-8 w-8 p-0 mx-auto bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-white rounded-lg">
                    <ArrowUp size={14} />
                  </Button>
                  <div />
                  <Button variant="outline" size="sm" onClick={() => nudgeItem(-0.5, 0)} title="Move Left / West" className="h-8 w-8 p-0 mx-auto bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-white rounded-lg">
                    <ArrowLeft size={14} />
                  </Button>
                  <div className="flex items-center justify-center text-[9px] font-mono text-zinc-400 bg-zinc-950/80 rounded-md">
                    Move
                  </div>
                  <Button variant="outline" size="sm" onClick={() => nudgeItem(0.5, 0)} title="Move Right / East" className="h-8 w-8 p-0 mx-auto bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-white rounded-lg">
                    <ArrowRight size={14} />
                  </Button>
                  <div />
                  <Button variant="outline" size="sm" onClick={() => nudgeItem(0, 0.5)} title="Move Backward / South" className="h-8 w-8 p-0 mx-auto bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-white rounded-lg">
                    <ArrowDown size={14} />
                  </Button>
                  <div />
                </div>
              </div>

              {/* Sizing & Rotation Controls */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-800/80">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => scaleItem(0.9)} 
                  className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-white text-xs rounded-xl flex items-center justify-center gap-1.5 h-8"
                  title="Shrink piece smaller (Ctrl -)"
                >
                  <ZoomOut size={13} /> Shrink <kbd className="text-[9px] bg-zinc-950 px-1 py-0.5 rounded text-zinc-400">Ctrl -</kbd>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => scaleItem(1.1)} 
                  className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-white text-xs rounded-xl flex items-center justify-center gap-1.5 h-8"
                  title="Enlarge piece bigger (Ctrl +)"
                >
                  <ZoomIn size={13} /> Enlarge <kbd className="text-[9px] bg-zinc-950 px-1 py-0.5 rounded text-zinc-400">Ctrl +</kbd>
                </Button>
              </div>

              {/* Rotation & Elevation */}
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => rotateItem(Math.PI / 2)} 
                  className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-white text-xs rounded-xl flex items-center justify-center gap-1.5 h-8"
                  title="Rotate 90 degrees (R)"
                >
                  <RotateCw size={13} /> Rotate 90°
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => elevateItem(0.5)} 
                  className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-white text-xs rounded-xl flex items-center justify-center gap-1.5 h-8"
                  title="Raise vertical height"
                >
                  <ArrowUp size={13} /> Elevate
                </Button>
              </div>
            </div>
          )}

          {/* Active Configuration Pill (Top Left) */}
          <div className="absolute top-6 left-6 z-20 bg-zinc-900/80 backdrop-blur-md px-4 py-2 rounded-xl border border-zinc-800 flex items-center gap-2 text-xs font-semibold text-zinc-300 shadow-xl">
            <Layers size={14} className="text-primary" /> Active Style: <span className="text-white font-bold">{activeOption.name}</span>
          </div>

          {/* Live Walkway Clearance Fit Warning Badge */}
          {fitWarning && (
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 bg-amber-500 text-zinc-950 font-bold px-4 py-2 rounded-xl border border-amber-300 shadow-2xl flex items-center gap-2 text-xs backdrop-blur-md">
              <span className="text-base">⚠️</span>
              <span>{fitWarning}</span>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Fullscreen3DStudio;
