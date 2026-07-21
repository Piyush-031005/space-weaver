import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, Sofa, BedDouble, Monitor, Lamp, BookOpen, Armchair } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RoomBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (payload: any) => void;
  isGenerating: boolean;
}

const FURNITURE_TYPES = [
  { type: "sofa", label: "Sofa", icon: Sofa, defaultWidth: 6, defaultDepth: 3 },
  { type: "chair", label: "Chair", icon: Armchair, defaultWidth: 2, defaultDepth: 2 },
  { type: "table", label: "Table", icon: BookOpen, defaultWidth: 3, defaultDepth: 3 },
  { type: "bed", label: "Bed", icon: BedDouble, defaultWidth: 5, defaultDepth: 7 },
  { type: "tv", label: "TV Unit", icon: Monitor, defaultWidth: 4, defaultDepth: 1 },
  { type: "bookshelf", label: "Bookshelf", icon: BookOpen, defaultWidth: 4, defaultDepth: 1 },
  { type: "lamp", label: "Floor Lamp", icon: Lamp, defaultWidth: 1, defaultDepth: 1 },
];

const RoomBuilder: React.FC<RoomBuilderProps> = ({ isOpen, onClose, onGenerate, isGenerating }) => {
  const [width, setWidth] = useState<number>(15);
  const [length, setLength] = useState<number>(20);
  const [vibe, setVibe] = useState<string>("cozy");
  
  // Store counts for each type
  const [inventory, setInventory] = useState<Record<string, number>>({
    sofa: 1,
    table: 1,
    chair: 1,
    bed: 1,
    tv: 1,
    lamp: 1,
    bookshelf: 1
  });

  const handleItemCount = (type: string, delta: number) => {
    setInventory(prev => ({
      ...prev,
      [type]: Math.max(0, (prev[type] || 0) + delta)
    }));
  };

  const handleGenerateClick = () => {
    // Flatten inventory into individual items for the backend payload
    const furniturePayload: any[] = [];
    let idCounter = 1;

    Object.entries(inventory).forEach(([type, count]) => {
      const typeDef = FURNITURE_TYPES.find(t => t.type === type);
      if (!typeDef) return;

      for (let i = 0; i < count; i++) {
        furniturePayload.push({
          id: `${type}-${idCounter++}`,
          type: type,
          width: typeDef.defaultWidth,
          depth: typeDef.defaultDepth
        });
      }
    });

    const payload = {
      room: { width, length },
      fixedElements: [],
      furniture: furniturePayload,
      vibe: vibe
    };

    onGenerate(payload);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/40 backdrop-blur-sm z-40"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-background border-l border-border/50 shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border/50">
              <h2 className="font-display font-bold text-2xl">Room Configurator</h2>
              <button onClick={onClose} className="p-2 hover:bg-accent/10 rounded-full transition-colors text-muted-foreground hover:text-foreground">
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-10 custom-scrollbar">
              
              {/* Step 1: Dimensions */}
              <section className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-accent">1. Space Dimensions (ft)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground font-medium">Width</label>
                    <input 
                      type="number" 
                      value={width}
                      onChange={(e) => setWidth(Number(e.target.value))}
                      className="w-full bg-muted/50 border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground font-medium">Length</label>
                    <input 
                      type="number" 
                      value={length}
                      onChange={(e) => setLength(Number(e.target.value))}
                      className="w-full bg-muted/50 border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
              </section>

              {/* Step 2: Inventory */}
              <section className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-accent">2. Furniture Inventory</h3>
                <div className="space-y-3">
                  {FURNITURE_TYPES.map(({ type, label, icon: Icon }) => (
                    <div key={type} className="flex items-center justify-between p-3 rounded-xl border border-border/50 bg-muted/20">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-background rounded-lg shadow-sm border border-border/50">
                          <Icon size={16} className="text-primary" />
                        </div>
                        <span className="font-medium text-sm">{label}</span>
                      </div>
                      
                      <div className="flex items-center gap-3 bg-background rounded-lg border border-border/50 p-1">
                        <button 
                          onClick={() => handleItemCount(type, -1)}
                          className="p-1 hover:bg-muted rounded-md text-muted-foreground transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-4 text-center text-sm font-medium">{inventory[type] || 0}</span>
                        <button 
                          onClick={() => handleItemCount(type, 1)}
                          className="p-1 hover:bg-muted rounded-md text-muted-foreground transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Step 3: Vibe */}
              <section className="space-y-4 pb-8">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-accent">3. Spatial Objective</h3>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { id: "space_saver", label: "Efficiency (Space Saver)", desc: "Maximizes open floor space in the center." },
                    { id: "cozy", label: "Intimacy (Cozy & Comfy)", desc: "Pulls seating together for conversation." },
                    { id: "aesthetic", label: "Gallery (Aesthetic)", desc: "Symmetrical alignment with breathing room." }
                  ].map((v) => (
                    <div 
                      key={v.id}
                      onClick={() => setVibe(v.id)}
                      className={`cursor-pointer p-4 rounded-xl border transition-all duration-200 ${
                        vibe === v.id 
                          ? "border-primary bg-primary/5 shadow-sm" 
                          : "border-border/50 bg-background hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-medium ${vibe === v.id ? "text-primary" : "text-foreground"}`}>
                          {v.label}
                        </span>
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          vibe === v.id ? "border-primary" : "border-muted-foreground"
                        }`}>
                          {vibe === v.id && <div className="w-2 h-2 bg-primary rounded-full" />}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">{v.desc}</p>
                    </div>
                  ))}
                </div>
              </section>

            </div>

            {/* Footer Action */}
            <div className="p-6 border-t border-border/50 bg-background">
              <Button 
                onClick={handleGenerateClick}
                disabled={isGenerating}
                className="w-full h-14 text-lg rounded-xl shadow-hero bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isGenerating ? "Analyzing & Generating..." : "Generate Spatial Layout"}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default RoomBuilder;
