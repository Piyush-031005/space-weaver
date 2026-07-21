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
          { id: 'sofa-1', type: 'sofa', width: 6, depth: 3 }
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
      />

      {spaceData && <SpaceDNA spaceData={spaceData} />}
      <AffiliateShowcase />
      <Footer />
    </div>
  );
};

export default Index;
