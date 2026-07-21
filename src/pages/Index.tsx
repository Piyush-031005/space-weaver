import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import WebGLHero from "@/components/WebGLHero";
import SpaceDNA from "@/components/SpaceDNA";
import AffiliateShowcase from "@/components/AffiliateShowcase";
import Footer from "@/components/Footer";

const Index = () => {
  const [spaceData, setSpaceData] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      // Mock payload to match the backend structure
      const payload = {
        room: { width: 15, length: 20 },
        fixedElements: [],
        furniture: [
          { id: 'sofa-1', type: 'sofa', width: 6, depth: 3 },
          { id: 'table-1', type: 'table', width: 3, depth: 3 },
          { id: 'chair-1', type: 'chair', width: 2, depth: 2 },
          { id: 'bookshelf-1', type: 'bookshelf', width: 4, depth: 1 },
          { id: 'bed-1', type: 'bed', width: 5, depth: 7 },
          { id: 'tv-1', type: 'tv', width: 4, depth: 1 },
          { id: 'lamp-1', type: 'lamp', width: 1, depth: 1 },
          { id: 'recliner-1', type: 'chair', width: 3, depth: 3 },
          { id: 'nightstand-1', type: 'table', width: 2, depth: 2 },
        ],
        vibe: "cozy"
      };

      const response = await fetch("http://localhost:5000/api/generate-layout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      
      // Simulate slight delay for cinematic effect
      setTimeout(() => {
        setSpaceData(data);
        setIsGenerating(false);
      }, 1500);

    } catch (error) {
      console.error("Failed to generate layout:", error);
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <WebGLHero 
        onGenerate={handleGenerate} 
        isGenerating={isGenerating} 
        hasGenerated={!!spaceData}
        layoutData={spaceData?.layout}
      />

      {spaceData && <SpaceDNA spaceData={spaceData} />}
      <AffiliateShowcase />
      <Footer />
    </div>
  );
};

export default Index;
