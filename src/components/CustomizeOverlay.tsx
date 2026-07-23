import React, { useState } from "react";
import { X, Plus, Save } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface CustomizeOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  initialLayout: any[];
  room: { width: number; length: number };
  unit: string;
  onSave: (newLayout: any[]) => void;
}

const CustomizeOverlay: React.FC<CustomizeOverlayProps> = ({ isOpen, onClose, initialLayout, room, unit, onSave }) => {
  const [layout, setLayout] = useState(initialLayout || []);
  const [selectedTool, setSelectedTool] = useState<string>("sofa");

  if (!isOpen) return null;

  const tools = [
    { type: "sofa", label: "Sofa", w: 6, d: 3 },
    { type: "chair", label: "Chair", w: 2, d: 2 },
    { type: "table", label: "Table", w: 3, d: 3 },
    { type: "plant", label: "Plant", w: 1.5, d: 1.5 },
  ];

  const handleGridClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const cursorPt = pt.matrixTransform(svg.getScreenCTM()?.inverse());
    
    // Find active tool
    const tool = tools.find(t => t.type === selectedTool);
    if (!tool) return;

    // Add new item
    const newItem = {
      id: `custom-${selectedTool}-${Date.now()}`,
      type: selectedTool,
      x: cursorPt.x,
      y: cursorPt.y,
      width: tool.w,
      depth: tool.d,
      rotation: 0
    };
    
    setLayout([...layout, newItem]);
  };

  const handleRemove = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLayout(layout.filter(item => item.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-6">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-card w-full max-w-5xl rounded-3xl border shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-display font-semibold">Customize Room</h2>
            <p className="text-muted-foreground text-sm">Click the grid to drop new furniture. This is the foundation of our Drag & Drop editor.</p>
          </div>
          <button onClick={onClose} className="p-2 bg-muted rounded-full hover:bg-accent/10 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-1 h-[60vh]">
          {/* Sidebar Tools */}
          <div className="w-64 border-r p-6 space-y-4 overflow-y-auto">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">Add Items</h3>
            {tools.map(t => (
              <button
                key={t.type}
                onClick={() => setSelectedTool(t.type)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                  selectedTool === t.type 
                    ? "border-primary bg-primary/10 shadow-sm" 
                    : "border-border hover:border-primary/50"
                }`}
              >
                <span className="font-medium">{t.label}</span>
                <Plus size={16} className={selectedTool === t.type ? "text-primary" : "text-muted-foreground"} />
              </button>
            ))}
          </div>

          {/* Blueprint Area */}
          <div className="flex-1 bg-[#1e293b] p-8 flex items-center justify-center relative overflow-hidden">
            <div className="text-white/50 absolute top-4 left-4 text-sm font-semibold pointer-events-none">
              Active Tool: {tools.find(t => t.type === selectedTool)?.label}
            </div>
            
            <svg 
              viewBox={`-2 -2 ${(room?.width || 20) + 4} ${(room?.length || 20) + 4}`} 
              className="w-full h-full max-h-[50vh] cursor-crosshair drop-shadow-lg"
              preserveAspectRatio="xMidYMid meet"
              onClick={handleGridClick}
            >
              {/* Grid */}
              <pattern id="blueprint-grid" width="1" height="1" patternUnits="userSpaceOnUse">
                <path d="M 1 0 L 0 0 0 1" fill="none" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="0.05" />
              </pattern>
              <rect width={room?.width || 20} height={room?.length || 20} fill="url(#blueprint-grid)" />
              <rect width={room?.width || 20} height={room?.length || 20} fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="0.2" />

              {/* Layout Items */}
              {layout.map((item, i) => (
                <g 
                  key={`${item.id}-${i}`}
                  transform={`translate(${item.x}, ${item.y}) rotate(${(item.rotation || 0) * (180 / Math.PI)})`}
                  onClick={(e) => handleRemove(item.id, e)}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
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
                  <text 
                    x="0" 
                    y="0" 
                    fontSize={Math.min(item.width, item.depth) * 0.3} 
                    fill="white" 
                    className="font-semibold pointer-events-none"
                    textAnchor="middle" 
                    alignmentBaseline="middle"
                  >
                    {item.type}
                  </text>
                  {/* Remove icon overlay */}
                  <circle cx={item.width/2} cy={-item.depth/2} r="0.5" fill="red" opacity="0" className="group-hover:opacity-100" />
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t flex justify-end gap-4 bg-muted/20">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave(layout)} className="gap-2">
            <Save size={16} /> Save Layout & Render
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default CustomizeOverlay;
