import React, { useState, useEffect, Suspense } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
const WebGLHero = React.lazy(() => import("@/components/WebGLHero"));
import SpaceDNA from "@/components/SpaceDNA";
import LayoutGallery from "@/components/LayoutGallery";
import AffiliateShowcase from "@/components/AffiliateShowcase";
import CustomizeOverlay from "@/components/CustomizeOverlay";
import Fullscreen3DStudio from "@/components/Fullscreen3DStudio";
import html2canvas from "html2canvas";
import { ArrowLeft, RefreshCw, Check, Sparkles, ShieldCheck, Cpu, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

// AI Timeline Loader cycling through YC-grade HSRE stages
const AITimelineLoader = ({ active }: { active: boolean }) => {
  const stages = [
    "Analyzing room geometry & wall boundaries...",
    "Detecting primary focal points (TV / Windows)...",
    "Building bi-directional relationship graph...",
    "Simulating 36\" human walking circulation...",
    "Optimizing cognitive calm & visual clutter...",
    "Finalizing cinematic layout philosophies..."
  ];
  const [stageIdx, setStageIdx] = useState(0);

  useEffect(() => {
    if (!active) return;
    setStageIdx(0);
    const interval = setInterval(() => {
      setStageIdx((prev) => (prev + 1) % stages.length);
    }, 700);
    return () => clearInterval(interval);
  }, [active]);

  if (!active) return null;

  return (
    <div className="absolute inset-0 bg-background/85 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
      <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center mb-6 animate-pulse">
        <Cpu className="text-primary animate-spin" size={32} />
      </div>
      <h3 className="text-xl md:text-2xl font-display font-bold text-foreground mb-2">
        Human Spatial Reasoning Engine (HSRE)
      </h3>
      <p className="text-primary font-mono text-sm md:text-base h-6 flex items-center justify-center">
        {stages[stageIdx]}
      </p>
      <div className="w-48 h-1.5 bg-muted rounded-full mt-6 overflow-hidden">
        <div className="h-full bg-primary animate-pulse w-full rounded-full" />
      </div>
    </div>
  );
};

const DesignResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const searchParams = new URLSearchParams(location.search);
  const shareId = searchParams.get('shareId');
  
  const { data: initialData, payloadToUse } = location.state || {};
  
  const [activeOptionIndex, setActiveOptionIndex] = useState(0);
  const [currentData, setCurrentData] = useState(initialData);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [is3DStudioOpen, setIs3DStudioOpen] = useState(false);
  const [currentVibe, setCurrentVibe] = useState(payloadToUse?.vibe || "cozy");

  useEffect(() => {
    if (shareId) {
      fetch(`http://localhost:5000/api/genome/${shareId}`)
        .then(res => res.json())
        .then(data => {
          if (!data.error) {
            setCurrentData({ options: [data] });
            setCurrentVibe(data.id.split('_')[0]);
          }
        })
        .catch(err => console.error("Failed to load shared genome:", err));
    }
  }, [shareId]);

  const handleVibeSwitch = async (newVibe: string) => {
    if (newVibe === currentVibe || isGenerating) return;
    setCurrentVibe(newVibe);
    setIsGenerating(true);
    
    try {
      const payload = { 
        ...payloadToUse, 
        vibe: newVibe,
        structuralElements: payloadToUse?.structuralElements || []
      };
      const response = await fetch("http://localhost:5000/api/generate-layout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      const newData = await response.json();
      if (newData && newData.options) {
        setCurrentData(newData);
        setActiveOptionIndex(0); // Reset selection
      }
    } catch (error) {
      console.error("Failed to generate layout:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleVibeChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newVibe = e.target.value;
    handleVibeSwitch(newVibe);
  };

  if (!currentData || !currentData.options) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">No layout data found.</h1>
        <Button onClick={() => navigate('/')}>Return to Builder</Button>
      </div>
    );
  }

  const activeOption = currentData.options[activeOptionIndex];

  const handleShare = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(activeOption)
      });
      
      const { id } = await response.json();
      const url = `${window.location.origin}/results?shareId=${id}`;
      await navigator.clipboard.writeText(url);
      alert("Shareable URL copied to clipboard: " + url);
    } catch (e) {
      console.error("Failed to copy URL", e);
      alert("Failed to create shareable link.");
    }
  };

  const handleDownload = async () => {
    const element = document.getElementById("spacedna-card");
    if (element) {
      try {
        const canvas = await html2canvas(element, { backgroundColor: "#09090b" });
        const link = document.createElement("a");
        link.download = `SpaceGenome_${activeOption.genome.archetype.replace(/\s+/g, '_')}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      } catch (e) {
        console.error("Failed to download image", e);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar onGetStarted={() => navigate('/')} />
      
      {/* Top bar with back button and vibe switcher */}
      <div className="container mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between border-b border-border/40 gap-4">
        <Button variant="ghost" onClick={() => navigate('/')} className="gap-2 text-foreground/80 hover:text-foreground">
          <ArrowLeft size={16} /> Back to Configurator
        </Button>
        
        <div className="flex items-center gap-1.5 bg-muted/40 p-1.5 rounded-2xl border border-border/40 max-w-full overflow-hidden">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground px-2.5 hidden md:inline">Layout Mode:</span>
          {[
            { id: "space_saver", label: "⚡ Efficiency", desc: "Space Saver" },
            { id: "cozy", label: "🛋️ Intimacy", desc: "Cozy & Comfy" },
            { id: "aesthetic", label: "🏛️ Gallery", desc: "Visual Balance" }
          ].map((vibe) => (
            <button
              key={vibe.id}
              onClick={() => handleVibeSwitch(vibe.id)}
              disabled={isGenerating}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                currentVibe === vibe.id
                  ? "bg-foreground text-background shadow-md scale-[1.01]"
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>{vibe.label}</span>
              <span className="opacity-70 font-normal hidden lg:inline">({vibe.desc})</span>
            </button>
          ))}
          {isGenerating && <RefreshCw size={16} className="animate-spin text-primary ml-1.5 mr-1 flex-shrink-0" />}
        </div>
      </div>

      {/* 3D Viewer for the selected layout with AI Timeline Loader */}
      <div className="flex-none h-[48vh] relative border-b border-border/50 overflow-hidden">
        <AITimelineLoader active={isGenerating} />
        <Suspense fallback={<div className="h-full w-full bg-background flex items-center justify-center text-primary font-mono text-sm">Loading 3D Spatial Visualization...</div>}>
          <WebGLHero 
            onGenerate={() => {}} 
            isGenerating={isGenerating} 
            hasGenerated={true}
            layoutData={activeOption?.layout}
            fixedElements={payloadToUse?.structuralElements}
            room={payloadToUse?.room}
            focalPoint={currentData?.focalPoint}
            showAIThinking={true}
            showText={false}
            fullHeight={false}
          />
        </Suspense>
        <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-xs text-white font-medium flex items-center gap-2 border border-white/10">
          <Layers size={14} className="text-primary" /> Active Philosophy: <span className="font-bold text-primary">{activeOption?.name}</span>
        </div>
      </div>

      {/* Milan Architectural Studio Specifications Panel */}
      <section className="bg-background border-b border-border/40 py-12">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="border-t border-b border-border/60 py-8 my-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-8 border-b border-border/40">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-full text-[11px] font-mono font-bold uppercase tracking-widest mb-3 shadow-sm">
                  <span>🏛️ MILAN ARCHITECTURAL STUDIO</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground tracking-tight">
                  {activeOption?.name} — Spatial Harmony
                </h2>
                <p className="text-base text-muted-foreground mt-2 font-light max-w-2xl leading-relaxed">
                  Curated for uninterrupted 36-inch continuous circulation corridors, glare-free natural daylight orientation, and effortless human conversational sightlines.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-5 py-2.5 bg-zinc-100 dark:bg-zinc-900 text-foreground border border-border/80 rounded-full text-xs font-mono font-bold uppercase tracking-wider shadow-sm">
                  ★ 100% STUDIO ERGONOMIC SPEC
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* Architectural Sightline Strategy */}
              <div className="lg:col-span-6 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4 block">
                  Architectural Sightline Strategy
                </h3>
                <div className="space-y-4">
                  {(activeOption?.why || [
                    "Maintains an exact 8-foot conversation distance directly facing the primary entertainment focal point.",
                    "Enforces balanced seating orientation across the central table to encourage natural eye contact.",
                    "Preserves 36-inch continuous walking corridors from main entry doors."
                  ]).map((reason: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-3.5 pb-4 border-b border-border/30 last:border-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-foreground mt-2 flex-shrink-0" />
                      <p className="text-sm leading-relaxed font-light text-foreground/90">{reason}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Curated Piece Coordinates */}
              <div className="lg:col-span-6 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4 block">
                  Curated Piece Specifications & Coordinates
                </h3>
                <div className="max-h-64 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                  {activeOption?.layout?.map((item: any, idx: number) => {
                    const idKey = item.id || `${(item.type || '').toLowerCase()}-${idx}`;
                    const reasons = activeOption?.itemReasons?.[idKey] || [
                      { text: "Optimized 8ft conversational distance & orientation" },
                      { text: "Unobstructed walking circulation corridor" }
                    ];

                    return (
                      <div key={idx} className="p-4 bg-muted/20 border border-border/40 rounded-xl transition-all hover:border-border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-display font-semibold text-sm text-foreground capitalize flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-foreground" /> {item.type}
                          </span>
                          <span className="text-[11px] font-mono text-muted-foreground">
                            ({Math.round(item.x)}ft, {Math.round(item.y)}ft) • {Math.round((item.rotation || 0) * (180/Math.PI))}°
                          </span>
                        </div>
                        <div className="space-y-1 pl-4 border-l border-border/60">
                          {reasons.map((r: any, rIdx: number) => (
                            <div key={rIdx} className="text-xs text-muted-foreground font-light">
                              {r.text || r}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Layout Gallery */}
      <div className="flex-1 pb-12">
        <LayoutGallery 
          options={currentData.options} 
          activeIndex={activeOptionIndex}
          onSelect={setActiveOptionIndex} 
          onOpen3D={(idx) => {
            setActiveOptionIndex(idx);
            setIs3DStudioOpen(true);
          }}
          room={payloadToUse?.room}
          unit={payloadToUse?.unit}
        />
        
        {activeOption && (
          <SpaceDNA 
            spaceData={activeOption} 
            onShare={handleShare}
            onDownload={handleDownload}
            onCustomize={() => setIsCustomizeOpen(true)}
          />
        )}
        
        {/* Dynamic Budget Decor / Monetization */}
        <div className="mt-12">
          <AffiliateShowcase budget={payloadToUse?.budget || "budget"} />
        </div>
      </div>

      {activeOption && (
        <CustomizeOverlay 
          isOpen={isCustomizeOpen}
          onClose={() => setIsCustomizeOpen(false)}
          initialLayout={activeOption.layout}
          room={payloadToUse?.room || { width: 20, length: 20 }}
          unit={payloadToUse?.unit || "ft"}
          onSave={(newLayout) => {
            const newOptions = [...currentData.options];
            newOptions[activeOptionIndex] = {
              ...newOptions[activeOptionIndex],
              layout: newLayout
            };
            setCurrentData({ ...currentData, options: newOptions });
            setIsCustomizeOpen(false);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      )}

      {activeOption && (
        <Fullscreen3DStudio
          isOpen={is3DStudioOpen}
          onClose={() => setIs3DStudioOpen(false)}
          activeOption={activeOption}
          room={payloadToUse?.room || { width: 20, length: 20 }}
          fixedElements={payloadToUse?.structuralElements}
          focalPoint={currentData?.focalPoint}
        />
      )}
    </div>
  );
};

export default DesignResults;
