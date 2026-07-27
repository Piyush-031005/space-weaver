import React, { Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Maximize2, Layers, ShieldCheck, Sparkles, Compass } from "lucide-react";

// Lazy load WebGLHero for performance inside modal
const WebGLHero = React.lazy(() => import("@/components/WebGLHero"));

interface Fullscreen3DStudioProps {
  isOpen: boolean;
  onClose: () => void;
  onCustomize?: () => void;
  activeOption: any;
  room: { width: number; length: number };
  fixedElements?: any[];
  focalPoint?: any;
}

const Fullscreen3DStudio: React.FC<Fullscreen3DStudioProps> = ({
  isOpen,
  onClose,
  onCustomize,
  activeOption,
  room,
  fixedElements = [],
  focalPoint
}) => {
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
        <div className="flex-none bg-zinc-900/80 backdrop-blur-md border-b border-zinc-800 px-6 py-4 flex items-center justify-between z-20">
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
          <div className="hidden md:flex items-center gap-4 text-xs font-mono bg-zinc-950/60 px-4 py-2 rounded-full border border-zinc-800/80">
            <span className="flex items-center gap-1.5 text-zinc-300">
              <Compass size={14} className="text-primary" /> Dimensions: {room.width}ft × {room.length}ft
            </span>
            <span className="text-zinc-600">|</span>
            <span className="flex items-center gap-1.5 text-zinc-300 font-semibold">
              <ShieldCheck size={14} className="text-primary" /> Studio Ergonomic Spec
            </span>
            <span className="text-zinc-600">|</span>
            <span className="text-zinc-400">
              Items: {activeOption.layout?.length || 0}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {onCustomize && (
              <button
                onClick={() => {
                  onClose();
                  onCustomize();
                }}
                className="px-4 py-2 bg-primary hover:bg-primary/90 text-zinc-950 rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-lg active:scale-95"
                title="Customize furniture coordinates, rotation, and architectural pillars"
              >
                🎛️ Customize Arrangement
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
              layoutData={activeOption.layout}
              fixedElements={fixedElements}
              room={room}
              focalPoint={focalPoint}
              showAIThinking={false}
              showText={false}
              fullHeight={false}
              isStudio={true}
            />
          </Suspense>

          {/* Floating Floor Plan Legend */}
          <div className="absolute bottom-6 left-6 z-20 bg-zinc-900/90 backdrop-blur-md border border-zinc-800 rounded-2xl p-4 max-w-sm shadow-2xl space-y-2 pointer-events-auto">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
              <Sparkles size={14} /> Design Philosophy
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed font-light">
              {activeOption.philosophyDescription || activeOption.desc || "Arranged for optimal spatial flow, glare-free daylight orientation, and interactive conversation geometry."}
            </p>
            <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400 font-mono">
              <span>🖱️ Drag to rotate</span>
              <span>🔍 Scroll to zoom</span>
              <span>📐 Right-click to pan</span>
            </div>
          </div>

          {/* Active Configuration Pill */}
          <div className="absolute top-6 left-6 z-20 bg-zinc-900/80 backdrop-blur-md px-4 py-2 rounded-xl border border-zinc-800 flex items-center gap-2 text-xs font-semibold text-zinc-300 shadow-xl">
            <Layers size={14} className="text-primary" /> Active Style: <span className="text-white font-bold">{activeOption.name}</span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Fullscreen3DStudio;
