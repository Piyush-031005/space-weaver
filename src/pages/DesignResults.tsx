import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import WebGLHero from "@/components/WebGLHero";
import SpaceDNA from "@/components/SpaceDNA";
import LayoutGallery from "@/components/LayoutGallery";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const DesignResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Retrieve the generated data from router state
  const { data: initialData, payloadToUse } = location.state || {};
  
  const [activeOptionIndex, setActiveOptionIndex] = useState(0);
  const [currentData, setCurrentData] = useState(initialData);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentVibe, setCurrentVibe] = useState(payloadToUse?.vibe || "cozy");

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

  // If no data is present (e.g., user navigated here directly), return to home
  if (!currentData || !currentData.options) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">No layout data found.</h1>
        <Button onClick={() => navigate('/')}>Return to Builder</Button>
      </div>
    );
  }

  const activeOption = currentData.options[activeOptionIndex];

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

      {/* 3D Viewer for the selected layout */}
      <div className="flex-none h-[45vh] relative border-b border-border/50">
        <WebGLHero 
          onGenerate={() => {}} 
          isGenerating={false} 
          hasGenerated={true}
          layoutData={activeOption?.layout}
          showText={false}
          fullHeight={false}
        />
      </div>

      {/* Layout Gallery */}
      <div className="flex-1 pb-12">
        <LayoutGallery 
          options={currentData.options} 
          activeIndex={activeOptionIndex}
          onSelect={setActiveOptionIndex} 
          room={payloadToUse?.room}
          unit={payloadToUse?.unit}
        />
        
        {activeOption && <SpaceDNA spaceData={activeOption} />}
      </div>
    </div>
  );
};

export default DesignResults;
