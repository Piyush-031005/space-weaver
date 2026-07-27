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
import { ArrowLeft, RefreshCw, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

// Premium minimal loader — no AI branding, no CPU icons, no HSRE stage text
const GeneratingLoader = ({ active }: { active: boolean }) => {
  if (!active) return null;
  return (
    <div className="absolute inset-0 bg-background/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-6 animate-in fade-in duration-300">
      <div className="flex items-center gap-2">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-foreground"
            style={{ animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }}
          />
        ))}
      </div>
      <p className="text-[11px] font-mono tracking-[0.3em] uppercase text-muted-foreground">
        Generating arrangements
      </p>
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
  const [reopen3DAfterCustomizing, setReopen3DAfterCustomizing] = useState(false);
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
      <div className="container mx-auto px-6 pt-24 md:pt-28 pb-4 flex flex-col md:flex-row items-center justify-between border-b border-border/40 gap-4 relative z-40">
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

      {/* 3D Viewer for the selected layout */}
      <div className="flex-none h-[48vh] relative border-b border-border/50 overflow-hidden">
        <GeneratingLoader active={isGenerating} />
        <Suspense fallback={<div className="h-full w-full bg-background flex items-center justify-center text-primary font-mono text-sm">Loading 3D Spatial Visualization...</div>}>
          <WebGLHero 
            onGenerate={() => {}} 
            isGenerating={isGenerating} 
            hasGenerated={true}
            layoutData={activeOption?.layout}
            fixedElements={activeOption?.structuralElements || payloadToUse?.structuralElements || []}
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
                <span className="px-4 py-2 bg-zinc-100 dark:bg-zinc-900 text-foreground border border-border/80 rounded-full text-xs font-mono font-semibold uppercase tracking-wider shadow-sm">
                  🏛️ MILAN LUXURY STUDIO CURATED
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
          onClose={() => {
            setIsCustomizeOpen(false);
            if (reopen3DAfterCustomizing) {
              setIs3DStudioOpen(true);
              setReopen3DAfterCustomizing(false);
            }
          }}
          initialLayout={activeOption.layout}
          initialStructuralElements={activeOption.structuralElements || payloadToUse?.structuralElements || []}
          room={payloadToUse?.room || { width: 20, length: 20 }}
          unit={payloadToUse?.unit || "ft"}
          onSave={(newLayout, newStructuralElements) => {
            const newOptions = [...currentData.options];
            newOptions[activeOptionIndex] = {
              ...newOptions[activeOptionIndex],
              layout: newLayout,
              structuralElements: newStructuralElements || newOptions[activeOptionIndex].structuralElements || payloadToUse?.structuralElements || []
            };
            setCurrentData({ ...currentData, options: newOptions });
            setIsCustomizeOpen(false);
            if (reopen3DAfterCustomizing) {
              setIs3DStudioOpen(true);
              setReopen3DAfterCustomizing(false);
            } else {
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
        />
      )}

      {activeOption && (
        <Fullscreen3DStudio
          isOpen={is3DStudioOpen}
          onClose={() => setIs3DStudioOpen(false)}
          onCustomize={() => {
            setIs3DStudioOpen(false);
            setReopen3DAfterCustomizing(true);
            setIsCustomizeOpen(true);
          }}
          activeOption={activeOption}
          room={payloadToUse?.room || { width: 20, length: 20 }}
          fixedElements={activeOption.structuralElements || payloadToUse?.structuralElements || []}
          focalPoint={currentData?.focalPoint}
        />
      )}
    </div>
  );
};

export default DesignResults;
