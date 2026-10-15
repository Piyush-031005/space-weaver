import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, Upload, Layers, Compass, Eye, ShieldCheck, 
  ArrowRight, Check, Maximize2, RefreshCw, Box, Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface StyleOption {
  id: string;
  name: string;
  icon: string;
  tagline: string;
  palette: string[];
  materials: string[];
  image2D: string;
  image3D: string;
  imageIso?: string;
  colorTone: string;
  description: string;
}

const STYLES: StyleOption[] = [
  {
    id: "modern",
    name: "Modern Luxury",
    icon: "🏛️",
    tagline: "Clean architectural lines, waterfall marble island, and recessed LED channels",
    palette: ["#18181b", "#71717a", "#e4e4e7", "#ffffff"],
    materials: ["Calacatta Marble", "Matte Anthracite Cabinets", "Smoked Oak Flooring"],
    image2D: "/blueprints/blueprint_cad.jpg",
    image3D: "/blueprints/style_modern.jpg",
    imageIso: "/blueprints/style_iso_3d.jpg",
    colorTone: "Monochrome & Slate",
    description: "Sleek metropolitan aesthetic with high-contrast surfaces, integrated handleless cabinetry, and seamless flow between living and kitchen."
  },
  {
    id: "tropical",
    name: "Tropical Sanctuary",
    icon: "🌴",
    tagline: "Lush botanical foliage, honey-toned teak wood, and natural terrazzo stone",
    palette: ["#2d4a22", "#d97706", "#fef3c7", "#f3f4f6"],
    materials: ["Rattan & Woven Cane", "Honed Terrazzo", "Indoor Fiddle Leaf & Palms"],
    image2D: "/blueprints/blueprint_cad.jpg",
    image3D: "/blueprints/style_tropical.jpg",
    imageIso: "/blueprints/style_iso_3d.jpg",
    colorTone: "Lush Green & Warm Teak",
    description: "Biophilic architectural layout integrating vibrant indoor greenery, organic wood slabs, and sunlight-maximizing circulation."
  },
  {
    id: "japandi",
    name: "Japandi Harmony",
    icon: "🎋",
    tagline: "Japanese wabi-sabi minimalism meets Scandinavian functional warmth",
    palette: ["#d4d4d8", "#a1a1aa", "#b45309", "#fafaf9"],
    materials: ["Rift White Oak", "Linen Upholstery", "Handmade Ceramic Accents"],
    image2D: "/blueprints/blueprint_cad.jpg",
    image3D: "/blueprints/style_japandi.jpg",
    imageIso: "/blueprints/style_iso_3d.jpg",
    colorTone: "Warm Oak & Neutral Linen",
    description: "Understated serenity emphasizing natural light, low-slung furniture profiles, clutter-free surfaces, and tactile textures."
  },
  {
    id: "scandinavian",
    name: "Scandinavian Airy",
    icon: "❄️",
    tagline: "Light birch woods, cozy layered wool textiles, and gentle ambient hygge",
    palette: ["#f4f4f5", "#e4e4e7", "#3b82f6", "#ffffff"],
    materials: ["Bleached Pine", "Bouclé Wool Fabric", "Powdercoated White Steel"],
    image2D: "/blueprints/blueprint_cad.jpg",
    image3D: "/blueprints/style_japandi.jpg",
    imageIso: "/blueprints/style_iso_3d.jpg",
    colorTone: "Pale Birch & Crisp White",
    description: "Optimized for natural daylight retention with light-reflective floor finishes and cozy, multi-functional seating clusters."
  },
  {
    id: "farmhouse",
    name: "Modern Farmhouse",
    icon: "🌾",
    tagline: "Reclaimed architectural timber, wrought iron accents, and deep slipcover sofas",
    palette: ["#78350f", "#451a03", "#f5f5f4", "#e7e5e4"],
    materials: ["Reclaimed Chestnut Wood", "Matte Black Wrought Iron", "Textured Cotton"],
    image2D: "/blueprints/blueprint_cad.jpg",
    image3D: "/blueprints/style_modern.jpg",
    imageIso: "/blueprints/style_iso_3d.jpg",
    colorTone: "Earthy Timber & Iron",
    description: "Inviting rustic elegance with warm wooden kitchen islands, deep sectional comfort, and welcoming hospitality zoning."
  }
];

const ROOM_SPECS = [
  {
    id: "living",
    name: "Living Room",
    area: "240 sq ft",
    furniture: ["L-Shaped Sectional Sofa", "Sculptural Coffee Table", "85\" TV Media Console", "Floor Reading Lamp"],
    clearance: "38 in corridor to balcony window",
    focalPoint: "Natural daylight balcony wall"
  },
  {
    id: "kitchen",
    name: "Open Chef's Kitchen",
    area: "160 sq ft",
    furniture: ["Marble Waterfall Island", "3 Counter Stools", "Integrated Induction Cooktop", "Pantry Storage"],
    clearance: "42 in work triangle walkway",
    focalPoint: "Central breakfast island"
  },
  {
    id: "bedroom",
    name: "Primary Suite",
    area: "190 sq ft",
    furniture: ["King Platform Bed", "Twin Floating Nightstands", "Double Wardrobe Closet", "Vanity Desk"],
    clearance: "32 in bedside perimeter space",
    focalPoint: "Direct exterior window daylight"
  },
  {
    id: "bathroom",
    name: "Spa Bathroom",
    area: "85 sq ft",
    furniture: ["Walk-in Frameless Glass Shower", "Floating Double Vanity", "Backlit Anti-Fog Mirror", "Recessed Niche"],
    clearance: "36 in door and vanity corridor",
    focalPoint: "Floating basin vanity"
  },
  {
    id: "hallway",
    name: "Circulation Hallway",
    area: "65 sq ft",
    furniture: ["Wall Flush Shoe Storage", "Full Length Mirror", "Recessed Warm Downlights"],
    clearance: "40 in central spine walkway",
    focalPoint: "Unobstructed entry sightline"
  }
];

export default function BlueprintVisualizer() {
  const navigate = useNavigate();
  const [activeStyleId, setActiveStyleId] = useState<string>("modern");
  const [viewMode, setViewMode] = useState<"render3d" | "blueprint" | "isometric">("render3d");
  const [selectedRoom, setSelectedRoom] = useState<string>("living");
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadedBlueprint, setUploadedBlueprint] = useState<string | null>(null);

  const activeStyle = STYLES.find(s => s.id === activeStyleId) || STYLES[0];
  const activeRoomSpec = ROOM_SPECS.find(r => r.id === selectedRoom) || ROOM_SPECS[0];

  const handleStyleChange = (styleId: string) => {
    if (styleId === activeStyleId) return;
    setIsGenerating(true);
    setTimeout(() => {
      setActiveStyleId(styleId);
      setIsGenerating(false);
    }, 450);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadedBlueprint(url);
      setViewMode("blueprint");
    }
  };

  const getImageToDisplay = () => {
    if (viewMode === "blueprint") {
      return uploadedBlueprint || activeStyle.image2D;
    }
    if (viewMode === "isometric") {
      return activeStyle.imageIso || activeStyle.image3D;
    }
    return activeStyle.image3D;
  };

  const handleLaunch3DStudio = () => {
    navigate("/results", {
      state: {
        payloadToUse: {
          room: { width: 22, length: 32 },
          furniture: [
            { id: "sofa-1", type: "sofa", width: 8, depth: 4 },
            { id: "table-1", type: "table", width: 4, depth: 3 },
            { id: "chair-1", type: "chair", width: 2.8, depth: 2.8 },
            { id: "tv-1", type: "tv", width: 6, depth: 1.2 },
            { id: "bed-1", type: "bed", width: 6.5, depth: 7 },
            { id: "bookshelf-1", type: "bookshelf", width: 5, depth: 1.5 }
          ],
          vibe: activeStyleId === "tropical" ? "aesthetic" : activeStyleId === "scandinavian" ? "space_saver" : "cozy",
          structuralElements: [
            { type: "window", wall: "top", position: 11, width: 8 },
            { type: "door", wall: "bottom", position: 11, width: 3.5 }
          ]
        },
        data: {
          options: [
            {
              id: `blueprint-${activeStyle.id}`,
              name: `${activeStyle.name} Apartment Specification`,
              desc: activeStyle.tagline,
              layout: [
                { id: "sofa-1", type: "sofa", width: 8, depth: 4, x: 11, y: 10, rotation: 0 },
                { id: "table-1", type: "table", width: 4, depth: 3, x: 11, y: 15, rotation: 0 },
                { id: "chair-1", type: "chair", width: 2.8, depth: 2.8, x: 6, y: 10, rotation: Math.PI / 2 },
                { id: "tv-1", type: "tv", width: 6, depth: 1.2, x: 11, y: 3, rotation: Math.PI },
                { id: "bed-1", type: "bed", width: 6.5, depth: 7, x: 6, y: 24, rotation: 0 },
                { id: "bookshelf-1", type: "bookshelf", width: 5, depth: 1.5, x: 18, y: 22, rotation: -Math.PI / 2 }
              ],
              genome: { archetype: activeStyle.name },
              philosophyDescription: activeStyle.description,
              why: [
                "36-inch continuous corridor connecting entry door directly to natural light balcony.",
                "Open kitchen island positioned to foster conversation into living lounge without obstructing prep zones.",
                "Primary suite buffered by hallway for acoustic privacy away from entertainment core."
              ]
            }
          ]
        }
      }
    });
  };

  return (
    <div className="w-full bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* Top Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono font-bold tracking-widest uppercase">
            <Sparkles size={14} /> AI Blueprint to 3D Apartment Engine
          </div>
          <h1 className="text-3xl sm:text-5xl font-display font-bold text-foreground tracking-tight">
            I Uploaded My Floor Plan, AI Furnished It Instantly
          </h1>
          <p className="text-base text-muted-foreground font-light leading-relaxed">
            Convert any 2D architectural blueprint or CAD drawing into photorealistic 3D apartment plans across 5 curated luxury design themes.
          </p>
        </div>

        {/* Style Selection Horizontal Carousel (Exact SnapHome/Foyr UX) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Layers size={14} className="text-primary" /> Curated Architectural Themes:
            </span>
            <span className="text-xs font-mono text-primary font-semibold">
              Active: {activeStyle.name}
            </span>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-2 custom-scrollbar">
            {STYLES.map((style) => {
              const isActive = style.id === activeStyleId;
              return (
                <button
                  key={style.id}
                  onClick={() => handleStyleChange(style.id)}
                  className={`relative px-5 py-3 rounded-2xl border transition-all flex items-center gap-3 whitespace-nowrap shadow-sm group ${
                    isActive 
                      ? "bg-foreground text-background border-foreground shadow-lg scale-[1.02] ring-2 ring-primary/40" 
                      : "bg-card border-border/70 text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <span className="text-xl">{style.icon}</span>
                  <div className="text-left">
                    <div className="font-display font-bold text-sm leading-tight flex items-center gap-1.5">
                      <span>{style.name}</span>
                      {isActive && <Check size={14} className="text-primary" />}
                    </div>
                    <div className="text-[10px] font-mono opacity-70">
                      {style.colorTone}
                    </div>
                  </div>
                </button>
              );
            })}

            {/* Custom Blueprint Upload Button */}
            <label className="cursor-pointer px-5 py-3 rounded-2xl border border-dashed border-primary/60 bg-primary/5 text-primary hover:bg-primary/10 transition-all flex items-center gap-2 whitespace-nowrap shadow-sm">
              <Upload size={16} />
              <div className="text-left">
                <div className="font-display font-bold text-sm leading-tight">Upload CAD / Blueprint</div>
                <div className="text-[10px] font-mono text-muted-foreground">JPG, PNG, PDF</div>
              </div>
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </div>

        {/* Main Floor Plan Stage */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left/Center Visual Canvas */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* View Mode Command Pills */}
            <div className="flex items-center justify-between bg-card/80 p-2 rounded-2xl border border-border/60">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setViewMode("blueprint")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    viewMode === "blueprint" 
                      ? "bg-foreground text-background shadow-sm" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span>📐</span> <span>2D CAD Blueprint</span>
                </button>
                <button
                  onClick={() => setViewMode("render3d")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    viewMode === "render3d" 
                      ? "bg-foreground text-background shadow-sm" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span>✨</span> <span>Photorealistic 3D Plan</span>
                </button>
                <button
                  onClick={() => setViewMode("isometric")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    viewMode === "isometric" 
                      ? "bg-foreground text-background shadow-sm" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span>🏛️</span> <span>Isometric 3D Cutaway</span>
                </button>
              </div>

              <span className="hidden sm:inline-block text-[11px] font-mono text-muted-foreground pr-2">
                Total Area: <strong>740 sq ft (2 BHK)</strong>
              </span>
            </div>

            {/* Floor Plan Display Frame with High-Fidelity Glow */}
            <div className="relative w-full aspect-[9/16] sm:aspect-[4/3] rounded-3xl overflow-hidden border border-border/80 shadow-2xl bg-zinc-950 flex items-center justify-center select-none group">
              <AnimatePresence mode="wait">
                {isGenerating ? (
                  <motion.div 
                    key="generating"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-30 bg-background/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-3"
                  >
                    <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    <h3 className="font-display font-bold text-lg text-foreground">
                      Rendering {activeStyle.name} Architectural Finish...
                    </h3>
                    <p className="text-xs font-mono text-muted-foreground">
                      Applying materials, photometric shadows, and circulation clearances...
                    </p>
                  </motion.div>
                ) : (
                  <motion.img 
                    key={`${activeStyleId}-${viewMode}`}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    src={getImageToDisplay()} 
                    alt={activeStyle.name} 
                    className="w-full h-full object-contain object-center"
                  />
                )}
              </AnimatePresence>

              {/* Floating Top Badge */}
              <div className="absolute top-4 left-4 z-20 bg-black/75 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 text-xs font-mono text-white flex items-center gap-2 shadow-xl">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Theme: <strong className="text-primary">{activeStyle.name}</strong></span>
              </div>

              {/* View Mode Tag */}
              <div className="absolute top-4 right-4 z-20 bg-black/70 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 text-[11px] font-mono text-zinc-300 uppercase">
                {viewMode === "blueprint" ? "2D Architectural Line Drawing" : viewMode === "isometric" ? "Isometric 3D Perspective" : "Top-Down Photorealistic 3D"}
              </div>

              {/* Bottom Quick-Action Bar */}
              <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between bg-black/70 backdrop-blur-md p-3 rounded-2xl border border-white/10 text-xs text-white">
                <div className="flex items-center gap-2">
                  <Compass size={14} className="text-primary" />
                  <span className="font-mono text-[11px] text-zinc-300">
                    Living • Kitchen • Bedroom • Bathroom • Hallway
                  </span>
                </div>
                <Button 
                  size="sm"
                  onClick={handleLaunch3DStudio}
                  className="bg-primary text-zinc-950 hover:bg-primary/90 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md"
                >
                  <Box size={14} /> Open in 3D WebGL Studio <ArrowRight size={14} />
                </Button>
              </div>
            </div>

            {/* Architectural Theme Rationale Banner */}
            <div className="p-5 rounded-2xl bg-card border border-border/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary">
                  Architectural Rationale & Materials
                </span>
                <span className="text-xs font-mono text-muted-foreground">
                  Ergonomic Flow Score: <strong className="text-foreground">96/100</strong>
                </span>
              </div>
              <p className="text-sm text-foreground/90 font-light leading-relaxed">
                {activeStyle.description}
              </p>
            </div>

          </div>

          {/* Right Column: Room-by-Room Zone Specifications */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Room Zone Selector */}
            <div className="p-6 rounded-2xl bg-card border border-border/60 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground">
                  <ShieldCheck size={16} className="text-primary" /> Multi-Room Zone Breakdown
                </div>
                <span className="text-[10px] font-mono text-muted-foreground">5 Zones Detected</span>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {ROOM_SPECS.map((room) => {
                  const isSelected = room.id === selectedRoom;
                  return (
                    <button
                      key={room.id}
                      onClick={() => setSelectedRoom(room.id)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                        isSelected 
                          ? "bg-foreground text-background border-foreground shadow-sm" 
                          : "bg-muted/30 border-border/60 hover:bg-muted/60 text-foreground"
                      }`}
                    >
                      <div>
                        <div className="font-display font-bold text-sm">{room.name}</div>
                        <div className={`text-[11px] font-mono mt-0.5 ${isSelected ? "text-background/80" : "text-muted-foreground"}`}>
                          Area: {room.area} • {room.clearance}
                        </div>
                      </div>
                      <ArrowRight size={14} className={isSelected ? "text-background" : "text-muted-foreground"} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Selected Room Details */}
            <div className="p-6 rounded-2xl bg-card border border-border/60 space-y-4 animate-in fade-in duration-200">
              <div className="border-b border-border/40 pb-3">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary">Selected Room Spec</span>
                <h3 className="font-display font-bold text-xl text-foreground mt-0.5">{activeRoomSpec.name}</h3>
                <span className="text-xs font-mono text-muted-foreground">{activeRoomSpec.area} • Primary Focal: {activeRoomSpec.focalPoint}</span>
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                  Curated Furniture Package:
                </span>
                <div className="space-y-1.5">
                  {activeRoomSpec.furniture.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-foreground/90 font-light">
                      <Check size={13} className="text-emerald-500 flex-shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-border/40">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                  Active Style Finishes:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {activeStyle.materials.map((mat, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-muted/60 border border-border/60 text-[11px] font-mono text-foreground">
                      {mat}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Turnkey Export CTA */}
            <div className="p-5 rounded-2xl bg-primary/10 border border-primary/20 space-y-3 text-center">
              <h4 className="font-display font-bold text-base text-foreground">Have a Blueprint to Test?</h4>
              <p className="text-xs text-muted-foreground font-light leading-relaxed">
                Upload your blueprint file or photo to immediately generate CAD furniture layouts and multi-theme 3D architectural renders.
              </p>
              <label className="cursor-pointer w-full py-2.5 rounded-xl bg-foreground text-background font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:bg-foreground/90 transition-all">
                <Upload size={14} /> Upload Custom Blueprint
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
