import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import WebGLHero from "@/components/WebGLHero";
import SpaceDNA from "@/components/SpaceDNA";
import LayoutGallery from "@/components/LayoutGallery";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const DesignResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Retrieve the generated data from router state
  const { data, payloadToUse } = location.state || {};
  
  const [activeOptionIndex, setActiveOptionIndex] = useState(0);

  // If no data is present (e.g., user navigated here directly), return to home
  if (!data || !data.options) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">No layout data found.</h1>
        <Button onClick={() => navigate('/')}>Return to Builder</Button>
      </div>
    );
  }

  const activeOption = data.options[activeOptionIndex];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar onGetStarted={() => navigate('/')} />
      
      {/* Back button */}
      <div className="container mx-auto px-6 py-4">
        <Button variant="ghost" onClick={() => navigate('/')} className="gap-2">
          <ArrowLeft size={16} /> Back to Configurator
        </Button>
      </div>

      {/* 3D Viewer for the selected layout */}
      <div className="flex-none h-[50vh] relative border-b border-border/50">
        <WebGLHero 
          onGenerate={() => {}} 
          isGenerating={false} 
          hasGenerated={true}
          layoutData={activeOption?.layout}
        />
      </div>

      {/* Layout Gallery */}
      <div className="flex-1">
        <LayoutGallery 
          options={data.options} 
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
