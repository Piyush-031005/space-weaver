import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, Upload, ArrowRight, Check, Sliders, 
  Layers, ShieldCheck, Download, RefreshCw, Eye, Lightbulb, Compass
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface RenovationPreset {
  id: string;
  title: string;
  category: string;
  tagline: string;
  image: string; // Combined or comparison image
  beforeLabel: string;
  afterLabel: string;
  efficiencyGain: string;
  estimatedBudget: string;
  timeline: string;
  keyFeatures: string[];
  materials: string[];
  description: string;
  roomParams: { width: number; length: number; furniture: any[]; vibe: string };
}

const PRESETS: RenovationPreset[] = [
  {
    id: "under-stairs-office",
    title: "Under-Stairs Architectural Home Office",
    category: "Alcove & Nook Optimization",
    tagline: "Turn an empty stair void into an ergonomic, light-filled study sanctuary",
    image: "/renovations/under_stair_desk.jpg",
    beforeLabel: "Empty Stair Void",
    afterLabel: "Built-In Study Desk & Shelving",
    efficiencyGain: "+165% Usable Space",
    estimatedBudget: "$850 – $1,400",
    timeline: "2 Days Custom Millwork",
    keyFeatures: [
      "Custom floating desktop matched to stair tread angle",
      "Triple-tier open display shelves for books and plants",
      "Ergonomic low-back swivel chair with 36\" pushback clearance",
      "Flush under-shelf 3000K warm LED light strip"
    ],
    materials: ["White Oak Veneer", "Matte Powdercoated Steel", "Dimmable LED Channels"],
    description: "Transforms dead space underneath standard residential stairs into a productive work-from-home corner without expanding the room's footprint.",
    roomParams: {
      width: 14,
      length: 18,
      furniture: [
        { id: "desk-1", type: "table", width: 5, depth: 2.5 },
        { id: "chair-1", type: "chair", width: 2.2, depth: 2.2 },
        { id: "bookshelf-1", type: "bookshelf", width: 4, depth: 1.2 }
      ],
      vibe: "cozy"
    }
  },
  {
    id: "under-stairs-library",
    title: "Under-Stairs Curated Reading Library",
    category: "Luxury Architectural Nook",
    tagline: "Cozy reading retreat with charcoal built-ins and vintage leather armchair",
    image: "/renovations/under_stair_library.jpg",
    beforeLabel: "Bare Drywall",
    afterLabel: "Floor-to-Ceiling Bookshelf & Lounge",
    efficiencyGain: "+140% Storage Volume",
    estimatedBudget: "$1,200 – $2,100",
    timeline: "3 Days Cabinetry Build",
    keyFeatures: [
      "Angled multi-tier bookshelf recessed into stair rise",
      "Cognac full-grain leather accent chair with lumbar support",
      "Plush woven storage ottoman for footrest or throw blankets",
      "Brass directional task spotlight for night reading"
    ],
    materials: ["Charcoal Matte Lacquer", "Cognac Saddle Leather", "Brushed Brass Fixtures"],
    description: "Maximizes vertical wall storage in an otherwise neglected stair corner, creating a sanctuary for relaxation and book displays.",
    roomParams: {
      width: 16,
      length: 20,
      furniture: [
        { id: "chair-1", type: "chair", width: 3, depth: 3 },
        { id: "bookshelf-1", type: "bookshelf", width: 5, depth: 1.5 },
        { id: "lamp-1", type: "lamp", width: 1.5, depth: 1.5 }
      ],
      vibe: "aesthetic"
    }
  },
  {
    id: "rental-living-makeover",
    title: "Dated Rental Living Room Transformation",
    category: "Full Space Makeover",
    tagline: "Rental-friendly botanical wallpaper, warm lighting layers, and cozy lounge zoning",
    image: "/renovations/rental_makeover.jpg",
    beforeLabel: "Dated & Bland Carpet",
    afterLabel: "Modern Warm Aesthetic Lounge",
    efficiencyGain: "+90% Visual Harmony",
    estimatedBudget: "$600 – $1,200",
    timeline: "1 Weekend DIY",
    keyFeatures: [
      "Peel-and-stick botanical statement wall behind media console",
      "Layered oversized jute rug concealing tired wall-to-wall carpeting",
      "Linear LED cove string lighting for cozy twilight ambience",
      "Low-profile Scandinavian seating cluster facing primary natural light"
    ],
    materials: ["Removable Vinyl Wallpaper", "Natural Jute Fiber", "2700K Ambient LED Rope"],
    description: "Upgrades a generic, dated rental living room into a designer-grade space without permanent wall modifications or security deposit risks.",
    roomParams: {
      width: 15,
      length: 20,
      furniture: [
        { id: "sofa-1", type: "sofa", width: 7, depth: 3.2 },
        { id: "table-1", type: "table", width: 3.5, depth: 2 },
        { id: "chair-1", type: "chair", width: 2.8, depth: 2.8 },
        { id: "tv-1", type: "tv", width: 4.5, depth: 1.2 }
      ],
      vibe: "cozy"
    }
  },
  {
    id: "under-stairs-office-desk",
    title: "Under-Stairs Minimalist Workstation",
    category: "Compact Space Planning",
    tagline: "Clean Scandinavian white cabinetry with dual drawer pedestals and corkboard",
    image: "/renovations/under_stair_office.jpg",
    beforeLabel: "Empty Stair Entry",
    afterLabel: "Double-Pedestal Built-in Desk",
    efficiencyGain: "+180% Organization",
    estimatedBudget: "$700 – $1,100",
    timeline: "1 Day Modular Assembly",
    keyFeatures: [
      "Twin file/storage drawer pedestals supporting butcherblock desktop",
      "Integrated pinboard backsplash for notes and inspirational art",
      "Low-profile swivel desk chair tucked flush under counter",
      "Overhead cube shelving for books, bins, and curated pottery"
    ],
    materials: ["Nordic Pine Wood", "Matte White Melamine", "Natural Cork Backing"],
    description: "A bright, accessible home office built directly into the main circulation corridor without protruding into the entryway walkway.",
    roomParams: {
      width: 14,
      length: 16,
      furniture: [
        { id: "desk-1", type: "table", width: 5.5, depth: 2.5 },
        { id: "chair-1", type: "chair", width: 2.2, depth: 2.2 },
        { id: "bookshelf-1", type: "bookshelf", width: 3.5, depth: 1.2 }
      ],
      vibe: "space_saver"
    }
  },
  {
    id: "under-stairs-luxury-display",
    title: "Under-Stairs Architectural Display Credenza",
    category: "High-End Millwork",
    tagline: "Backlit slatted wall paneling with floating cantilevered storage credenza",
    image: "/renovations/under_stair_display.jpg",
    beforeLabel: "Unfinished Nook",
    afterLabel: "Luxury Backlit Display Credenza",
    efficiencyGain: "+130% Aesthetic Value",
    estimatedBudget: "$1,800 – $3,200",
    timeline: "3 Days Custom Fabrication",
    keyFeatures: [
      "Concealed LED light channels creating dramatic vertical wall grazing",
      "Cantilevered wall-hung credenza with push-to-open seamless doors",
      "Warm acoustic oak veneer backing dampening stair footfall noise",
      "Recessed museum-quality art niche for botanical ceramics"
    ],
    materials: ["FSC Rift White Oak", "Integrated COB LED Strips", "Fluted Wall Cladding"],
    description: "An ultra-luxurious architectural feature wall that turns dead stair space into the centerpiece of the ground floor.",
    roomParams: {
      width: 16,
      length: 22,
      furniture: [
        { id: "bookshelf-1", type: "bookshelf", width: 6, depth: 1.5 },
        { id: "table-1", type: "table", width: 4, depth: 1.8 }
      ],
      vibe: "aesthetic"
    }
  }
];

export default function RoomRenovationStudio() {
  const navigate = useNavigate();
  const [selectedPreset, setSelectedPreset] = useState<RenovationPreset>(PRESETS[0]);
  const [sliderPos, setSliderPos] = useState<number>(50); // 0 to 100%
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);

  const handleSliderMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const clamped = Math.max(5, Math.min(95, (x / rect.width) * 100));
    setSliderPos(clamped);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadedImage(url);
      runCustomAnalysis();
    }
  };

  const runCustomAnalysis = () => {
    setIsAnalyzing(true);
    setAnalysisStep(1);
    setTimeout(() => setAnalysisStep(2), 700);
    setTimeout(() => setAnalysisStep(3), 1500);
    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisStep(0);
    }, 2200);
  };

  const handleOpenIn3D = (preset: RenovationPreset) => {
    // Generate layout and navigate to /results with room params
    navigate("/results", {
      state: {
        payloadToUse: {
          room: { width: preset.roomParams.width, length: preset.roomParams.length },
          furniture: preset.roomParams.furniture,
          vibe: preset.roomParams.vibe,
          structuralElements: []
        },
        data: {
          options: [
            {
              id: preset.id,
              name: preset.title,
              desc: preset.tagline,
              layout: preset.roomParams.furniture.map((f, i) => ({
                ...f,
                x: preset.roomParams.width / 2 + (i === 0 ? 0 : i === 1 ? -2.5 : 2.5),
                y: preset.roomParams.length / 2 + (i === 0 ? 0 : 2),
                rotation: i === 1 ? Math.PI / 2 : 0
              })),
              genome: { archetype: preset.category },
              philosophyDescription: preset.description,
              why: preset.keyFeatures
            }
          ]
        }
      }
    });
  };

  return (
    <div className="w-full bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono font-bold tracking-widest uppercase">
            <Sparkles size={14} /> AI Room Renovation & Makeover Studio
          </div>
          <h1 className="text-3xl sm:text-5xl font-display font-bold text-foreground tracking-tight">
            Before → After Room Redesign
          </h1>
          <p className="text-base text-muted-foreground font-light leading-relaxed">
            Upload a photo of any awkward nook, dead under-stairs space, or dated room. SpaceWeaver generates parametric built-in furniture millwork, lighting layers, and optimized circulation.
          </p>
        </div>

        {/* Preset Selector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar justify-start lg:justify-center">
          {PRESETS.map((preset) => {
            const isSelected = selectedPreset.id === preset.id && !uploadedImage;
            return (
              <button
                key={preset.id}
                onClick={() => {
                  setSelectedPreset(preset);
                  setUploadedImage(null);
                  setSliderPos(50);
                }}
                className={`px-4 py-2.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all border flex items-center gap-2 ${
                  isSelected
                    ? "bg-foreground text-background border-foreground shadow-md scale-[1.02]"
                    : "bg-muted/40 text-muted-foreground border-border/60 hover:bg-muted hover:text-foreground"
                }`}
              >
                <span>🏛️</span>
                <span>{preset.title.split(" ")[0]} {preset.title.split(" ")[1]}</span>
              </button>
            );
          })}

          {/* Upload Custom Room Photo */}
          <label className="cursor-pointer px-4 py-2.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all border border-dashed border-primary/60 bg-primary/5 text-primary hover:bg-primary/10 flex items-center gap-2 shadow-sm">
            <Upload size={14} />
            <span>Upload Your Room Photo</span>
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>

        {/* Main Renovation Viewer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Visual Comparison Display */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Split Comparison Frame */}
            <div 
              ref={containerRef}
              className="relative w-full aspect-[4/3] sm:aspect-[16/10] rounded-3xl overflow-hidden border border-border/80 shadow-2xl bg-zinc-950 select-none cursor-ew-resize group"
              onMouseMove={(e) => {
                if (e.buttons === 1) handleSliderMove(e.clientX);
              }}
              onTouchMove={(e) => {
                if (e.touches[0]) handleSliderMove(e.touches[0].clientX);
              }}
              onClick={(e) => handleSliderMove(e.clientX)}
            >
              {isAnalyzing ? (
                <div className="absolute inset-0 z-30 bg-background/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  <div className="space-y-1">
                    <h3 className="font-display font-bold text-lg text-foreground">
                      {analysisStep === 1 && "1/3 Detecting architectural perimeter & stairs..."}
                      {analysisStep === 2 && "2/3 Generating parametric millwork desk & shelving..."}
                      {analysisStep === 3 && "3/3 Simulating daylight illumination & materials..."}
                    </h3>
                    <p className="text-xs font-mono text-muted-foreground">Spatial reasoning engine running...</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Base Image (The User Photo or Preset) */}
                  <img 
                    src={uploadedImage || selectedPreset.image} 
                    alt={selectedPreset.title} 
                    className="w-full h-full object-cover object-center"
                  />

                  {/* Top-Right Badge */}
                  <div className="absolute top-4 right-4 z-20 bg-black/75 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 text-xs font-mono text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{selectedPreset.efficiencyGain}</span>
                  </div>

                  {/* Left "BEFORE" Tag */}
                  <div className="absolute top-4 left-4 z-20 bg-black/70 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 text-[11px] font-mono font-bold text-white uppercase tracking-wider">
                    {selectedPreset.beforeLabel}
                  </div>

                  {/* Interactive Slider Divider Bar */}
                  <div 
                    className="absolute top-0 bottom-0 z-20 w-1 bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)] pointer-events-none"
                    style={{ left: `${sliderPos}%` }}
                  >
                    <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-zinc-950 shadow-xl flex items-center justify-center text-xs font-bold border-2 border-primary">
                      ↔
                    </div>
                  </div>

                  {/* Bottom Drag Helper */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 bg-black/70 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 text-[11px] font-mono text-white/90">
                    👈 Drag slider left/right to compare 👉
                  </div>
                </>
              )}
            </div>

            {/* Renovation Overview Banner */}
            <div className="p-5 rounded-2xl bg-card border border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary block">
                  {selectedPreset.category}
                </span>
                <h3 className="font-display font-bold text-xl text-foreground mt-0.5">
                  {selectedPreset.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-xl font-light">
                  {selectedPreset.description}
                </p>
              </div>

              <Button 
                onClick={() => handleOpenIn3D(selectedPreset)}
                className="bg-foreground text-background hover:bg-foreground/90 rounded-xl px-5 py-2.5 text-xs font-bold flex items-center gap-2 whitespace-nowrap shadow-md"
              >
                <Compass size={14} /> Open in 3D Studio <ArrowRight size={14} />
              </Button>
            </div>

          </div>

          {/* Right Column: Architectural Specifications & Bill of Materials */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-card border border-border/50 space-y-1">
                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider block">Estimated Cost</span>
                <div className="text-lg font-display font-bold text-foreground">{selectedPreset.estimatedBudget}</div>
                <span className="text-[10px] text-emerald-500 font-medium">Turnkey Material Spec</span>
              </div>
              <div className="p-4 rounded-2xl bg-card border border-border/50 space-y-1">
                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider block">Timeline</span>
                <div className="text-lg font-display font-bold text-foreground">{selectedPreset.timeline}</div>
                <span className="text-[10px] text-primary font-medium">Zero Structural Demolition</span>
              </div>
            </div>

            {/* Key Architectural Improvements */}
            <div className="p-6 rounded-2xl bg-card border border-border/60 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground">
                <ShieldCheck size={16} className="text-primary" /> Key Architectural Additions
              </div>
              <div className="space-y-3">
                {selectedPreset.keyFeatures.map((feature, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-muted-foreground font-light leading-relaxed">
                    <Check size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Material & Finish Palette */}
            <div className="p-6 rounded-2xl bg-card border border-border/60 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground">
                <Layers size={16} className="text-primary" /> Curated Materials & Finishes
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedPreset.materials.map((mat, i) => (
                  <span key={i} className="px-3 py-1.5 rounded-xl bg-muted/60 border border-border/60 text-xs font-mono text-foreground font-medium">
                    🪵 {mat}
                  </span>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
