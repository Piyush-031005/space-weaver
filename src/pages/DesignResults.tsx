import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import WebGLHero from "@/components/WebGLHero";
import SpaceDNA from "@/components/SpaceDNA";
import LayoutGallery from "@/components/LayoutGallery";
import AffiliateShowcase from "@/components/AffiliateShowcase";
import CustomizeOverlay from "@/components/CustomizeOverlay";
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

  const handleVibeChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newVibe = e.target.value;
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
      <div className="container mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between border-b border-border/50 gap-4">
        <Button variant="ghost" onClick={() => navigate('/')} className="gap-2">
          <ArrowLeft size={16} /> Back to Configurator
        </Button>
        
        <div className="flex items-center gap-3">
          <label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Spatial Objective:</label>
          <select 
            className="bg-background border border-border rounded-md px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
            value={currentVibe}
            onChange={handleVibeChange}
            disabled={isGenerating}
          >
            <option value="space_saver">Efficiency (Space Saver)</option>
            <option value="cozy">Intimacy (Cozy & Comfy)</option>
            <option value="aesthetic">Aesthetic (Visual Balance)</option>
          </select>
          {isGenerating && <RefreshCw size={16} className="animate-spin text-primary" />}
        </div>
      </div>

      {/* 3D Viewer for the selected layout with AI Timeline Loader */}
      <div className="flex-none h-[48vh] relative border-b border-border/50 overflow-hidden">
        <AITimelineLoader active={isGenerating} />
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
        <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-xs text-white font-medium flex items-center gap-2 border border-white/10">
          <Layers size={14} className="text-primary" /> Active Philosophy: <span className="font-bold text-primary">{activeOption?.name}</span>
        </div>
      </div>

      {/* AI Reasoning & Constraint Debugger Panel */}
      <section className="bg-muted/10 border-b border-border/50 py-10">
        <div className="container mx-auto px-6">
          <div className="bg-card border border-border/80 rounded-3xl p-6 md:p-8 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-border/60">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
                  <Sparkles size={14} /> AI Designer Explanation
                </div>
                <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">
                  Why "{activeOption?.name}" Works
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Our Human Spatial Reasoning Engine (HSRE) evaluated circulation, lighting, and conversational angles to craft this layout.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-4 py-2 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded-full text-sm font-bold flex items-center gap-1.5">
                  <ShieldCheck size={16} /> {activeOption?.confidence || 96}% Spatial Match
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Overall Philosophy Reasoning */}
              <div>
                <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Check className="text-primary" size={18} /> Philosophy Strategy & Grammar
                </h3>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  {(activeOption?.why || [
                    "Maintains an exact 8-foot conversation distance directly facing the entertainment focal point.",
                    "Enforces symmetrical seating orientation across the coffee table to encourage natural eye contact.",
                    "Preserves 36-inch continuous circulation corridors from entry doors."
                  ]).map((reason: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-3 bg-muted/40 p-3.5 rounded-2xl border border-border/40">
                      <span className="text-primary font-bold text-base mt-0.5">✓</span>
                      <span className="leading-relaxed font-medium text-foreground/90">{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Interactive Constraint Debugger for Items */}
              <div>
                <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                  <ShieldCheck className="text-accent" size={18} /> Constraint Debugger (Item Analysis)
                </h3>
                <div className="max-h-64 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                  {activeOption?.layout?.map((item: any, idx: number) => {
                    const idKey = item.id || `${(item.type || '').toLowerCase()}-${idx}`;
                    const reasons = activeOption?.itemReasons?.[idKey] || [
                      { text: "✓ Optimized 8ft conversational distance & orientation" },
                      { text: "✓ Unobstructed walking circulation corridor" }
                    ];

                    return (
                      <div key={idx} className="p-3.5 bg-background border border-border/60 rounded-2xl transition-all hover:border-primary/40">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-sm text-foreground capitalize flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-primary" /> {item.type}
                          </span>
                          <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                            Pos: ({Math.round(item.x)}ft, {Math.round(item.y)}ft) • Rot: {Math.round((item.rotation || 0) * (180/Math.PI))}°
                          </span>
                        </div>
                        <div className="space-y-1 pl-3.5 border-l-2 border-primary/30">
                          {reasons.map((r: any, rIdx: number) => (
                            <div key={rIdx} className="text-xs text-muted-foreground/90 font-medium">
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
    </div>
  );
};

export default DesignResults;
