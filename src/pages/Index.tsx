import React, { useState, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import AffiliateShowcase from "@/components/AffiliateShowcase";
import Footer from "@/components/Footer";
import RoomBuilder from "@/components/RoomBuilder";
import SpaceGenomePreview from "@/components/SpaceGenomePreview";
import RealHomeShowcase from "@/components/RealHomeShowcase";
import { Cpu } from "lucide-react";

// Lazy load 3D WebGL Canvas for 90+ Lighthouse Performance
const WebGLHero = React.lazy(() => import("@/components/WebGLHero"));

export interface RoomPayload {
  room: { width: number; length: number };
  fixedElements?: any[];
  structuralElements?: any[];
  furniture: Array<{ id: string; type: string; width: number; depth: number }>;
  vibe: string;
  budget?: string;
  unit?: string;
}

const HeroFallback = () => (
  <div className="h-[75vh] w-full bg-background flex flex-col items-center justify-center p-6 text-center border-b border-border/50">
    <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 animate-pulse">
      <Cpu className="text-primary animate-spin" size={28} />
    </div>
    <h2 className="text-2xl md:text-4xl font-display font-bold text-foreground mb-2">
      Initializing 3D Spatial Intelligence...
    </h2>
    <p className="text-muted-foreground text-sm max-w-md">
      Loading interactive 3D room builder, real-time lighting simulation, and ergonomic layout engines.
    </p>
  </div>
);

const Index = () => {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  
  const [currentPayload, setCurrentPayload] = useState<RoomPayload | null>(null);

  const handleGenerate = async (customPayload?: RoomPayload | React.SyntheticEvent) => {
    setIsGenerating(true);
    
    const isEvent = customPayload && ('nativeEvent' in customPayload || 'target' in customPayload);
    const validPayload = isEvent ? null : (customPayload as RoomPayload);

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
      setIsBuilderOpen(false);
    }

    try {
      const response = await fetch("/api/generate-layout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadToUse)
      });
      
      const data = await response.json();
      
      setTimeout(() => {
        setIsGenerating(false);
        if (data && data.options) {
          navigate('/results', { state: { data, payloadToUse } });
        } else {
          console.error("No options returned from API:", data);
        }
      }, 1500);

    } catch (error) {
      console.error("Failed to generate layout:", error);
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar onGetStarted={() => setIsBuilderOpen(true)} />
      
      <Suspense fallback={<HeroFallback />}>
        <WebGLHero 
          onGenerate={() => setIsBuilderOpen(true)} 
          isGenerating={isGenerating} 
          hasGenerated={false}
          layoutData={undefined}
        />
      </Suspense>
      
      {/* Real Home Transformations Showcase (4K Photography & Practical Stories) */}
      <RealHomeShowcase />

      {/* Practical Room Harmony & Lifestyle Analysis (Friendly Language) */}
      <SpaceGenomePreview />

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
