import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, Sofa, BedDouble, Monitor, Lamp, BookOpen, Armchair, Trash2 } from "lucide-react";
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

interface CustomItem {
  id: string;
  type: string;
  label: string;
  width: number;
  depth: number;
}

const RoomBuilder: React.FC<RoomBuilderProps> = ({ isOpen, onClose, onGenerate, isGenerating }) => {
  const [width, setWidth] = useState<number>(15);
  const [length, setLength] = useState<number>(20);
  const [vibe, setVibe] = useState<string>("cozy");
  
  // Custom items list instead of simple counts
  const [items, setItems] = useState<CustomItem[]>([
    { id: "sofa-1", type: "sofa", label: "Sofa", width: 6, depth: 3 },
    { id: "chair-1", type: "chair", label: "Chair", width: 2, depth: 2 },
    { id: "table-1", type: "table", label: "Table", width: 3, depth: 3 }
  ]);

  const handleAddItem = (typeDef: typeof FURNITURE_TYPES[0]) => {
    const newItem: CustomItem = {
      id: `${typeDef.type}-${Date.now()}`,
      type: typeDef.type,
      label: typeDef.label,
      width: typeDef.defaultWidth,
      depth: typeDef.defaultDepth
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleUpdateItem = (id: string, field: "width" | "depth", value: number) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleGenerateClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Explicitly create payload without any Event objects
    const payload = {
      room: { width, length },
      fixedElements: [],
      furniture: items.map(item => ({
        id: item.id,
        type: item.type,
        width: item.width,
        depth: item.depth
      })),
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
            <div className="flex items-center justify-between p-6 border-b border-border/50 bg-background z-10">
              <h2 className="font-display font-bold text-2xl">Room Configurator</h2>
              <button onClick={onClose} className="p-2 hover:bg-accent/10 rounded-full transition-colors text-muted-foreground hover:text-foreground">
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-10 custom-scrollbar pb-32">
              
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

              {/* Step 2: Custom Inventory */}
              <section className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-accent flex justify-between items-center">
                  2. Furniture Inventory
                </h3>
                
                {/* Add New Item Selector */}
                <div className="flex overflow-x-auto gap-2 pb-2 custom-scrollbar -mx-2 px-2">
                  {FURNITURE_TYPES.map((typeDef) => {
                    const Icon = typeDef.icon;
                    return (
                      <button
                        key={typeDef.type}
                        onClick={() => handleAddItem(typeDef)}
                        className="flex-shrink-0 flex items-center gap-2 bg-muted/30 border border-border rounded-full px-4 py-2 hover:bg-primary/10 hover:border-primary/50 transition-colors"
                      >
                        <Icon size={14} className="text-muted-foreground" />
                        <span className="text-xs font-medium">{typeDef.label}</span>
                        <Plus size={12} className="text-primary" />
                      </button>
                    );
                  })}
                </div>

                {/* List of custom items */}
                <div className="space-y-3 mt-4">
                  {items.map((item) => (
                    <div key={item.id} className="p-4 rounded-xl border border-border/50 bg-muted/10 relative group">
                      <button 
                        onClick={() => handleRemoveItem(item.id)}
                        className="absolute right-3 top-3 p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <span className="font-semibold text-foreground text-sm">{item.label}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">Width (ft)</label>
                          <input 
                            type="number" 
                            step="0.5"
                            value={item.width}
                            onChange={(e) => handleUpdateItem(item.id, "width", Number(e.target.value))}
                            className="w-full bg-background border border-border/50 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">Depth (ft)</label>
                          <input 
                            type="number" 
                            step="0.5"
                            value={item.depth}
                            onChange={(e) => handleUpdateItem(item.id, "depth", Number(e.target.value))}
                            className="w-full bg-background border border-border/50 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  {items.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground text-sm border border-dashed border-border rounded-xl">
                      No items added yet.
                    </div>
                  )}
                </div>
              </section>

              {/* Step 3: Vibe */}
              <section className="space-y-4">
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

            {/* Footer Action - fixed at bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-border/50 bg-background/95 backdrop-blur-md">
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
