import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import WebGLHero from "@/components/WebGLHero";
import SpaceDNA from "@/components/SpaceDNA";
import AffiliateShowcase from "@/components/AffiliateShowcase";
import Footer from "@/components/Footer";
import RoomBuilder from "@/components/RoomBuilder";
import LayoutGallery from "@/components/LayoutGallery";

const Index = () => {
  const [spaceData, setSpaceData] = useState<any>(null);
  const [activeOptionIndex, setActiveOptionIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  
  // Store the user's custom payload
  const [currentPayload, setCurrentPayload] = useState<any>(null);

  const handleGenerate = async (customPayload?: any) => {
    setIsGenerating(true);
    
    // Check if customPayload is actually a React event
    const isEvent = customPayload && (customPayload.nativeEvent || customPayload.target);
    const validPayload = isEvent ? null : customPayload;

    // If no valid custom payload, use the stored one or a fallback
    const payloadToUse = validPayload || currentPayload || {
      room: { width: 15, length: 20 },
      fixedElements: [],
      furniture: [
        { id: 'sofa-1', type: 'sofa', width: 6, depth: 3 },
        { id: 'table-1', type: 'table', width: 3, depth: 3 },
        { id: 'chair-1', type: 'chair', width: 2, depth: 2 }
      ],
      vibe: "cozy"
    };

    if (validPayload) {
      setCurrentPayload(validPayload);
      setIsBuilderOpen(false); // Close the sidebar on generation
    }

    try {
      const response = await fetch("http://localhost:5000/api/generate-layout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadToUse)
      });
      
      const data = await response.json();
      
      // Simulate slight delay for cinematic effect
      setTimeout(() => {
        setSpaceData(data); // data now contains { options: [...] }
        setActiveOptionIndex(0); // Reset to first option
        setIsGenerating(false);
      }, 1500);

    } catch (error) {
      console.error("Failed to generate layout:", error);
      setIsGenerating(false);
    }
  };

  const activeOption = spaceData?.options?.[activeOptionIndex];

  return (
    <div className="min-h-screen bg-background">
      <Navbar onGetStarted={() => setIsBuilderOpen(true)} />
      <WebGLHero 
        onGenerate={() => setIsBuilderOpen(true)} // Open builder instead of auto-generating
        isGenerating={isGenerating} 
        hasGenerated={!!activeOption}
        layoutData={activeOption?.layout}
      />

      {spaceData?.options && (
        <LayoutGallery 
          options={spaceData.options} 
          activeIndex={activeOptionIndex}
          onSelect={setActiveOptionIndex} 
          room={currentPayload?.room}
          unit={currentPayload?.unit}
        />
      )}

      {activeOption && <SpaceDNA spaceData={activeOption} />}
      <AffiliateShowcase />
      <Footer />
      
      <RoomBuilder 
        isOpen={isBuilderOpen}
        onClose={() => setIsBuilderOpen(false)}
        onGenerate={handleGenerate}
        isGenerating={isGenerating}
      />
    </div>
  );
};

export default Index;
