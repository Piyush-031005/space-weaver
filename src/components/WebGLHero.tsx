import React, { useEffect, useRef, useState, useMemo, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Environment } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

// A single 3D Furniture piece
const FurnitureModel = ({
  src,
  chaosPos,
  arrangedPos,
  size,
  phase,
  index,
}: {
  src: string;
  chaosPos: { x: number; y: number; r: number };
  arrangedPos: { x: number; y: number; r: number };
  size: number;
  phase: "chaos" | "arranging" | "arranged";
  index: number;
}) => {
  const { scene } = useGLTF(src);
  const meshRef = useRef<THREE.Group>(null);
  
  // Clone, scale, and center the model once
  const normalizedModel = useMemo(() => {
    const clone = scene.clone();
    
    // Calculate bounding box
    const box = new THREE.Box3().setFromObject(clone);
    const sizeVec = new THREE.Vector3();
    box.getSize(sizeVec);
    
    // Scale so the largest dimension matches `size`
    const maxDim = Math.max(sizeVec.x, sizeVec.y, sizeVec.z);
    const targetScale = size / (maxDim || 1);
    clone.scale.set(targetScale, targetScale, targetScale);
    
    // Center it
    const center = new THREE.Vector3();
    box.getCenter(center);
    clone.position.set(-center.x * targetScale, -center.y * targetScale, -center.z * targetScale);
    
    return clone;
  }, [scene, size]);
  
  // We use GSAP to animate position/rotation based on phase
  useEffect(() => {
    if (!meshRef.current) return;
    
    const ref = meshRef.current;
    
    if (phase === "chaos") {
      gsap.to(ref.position, { x: chaosPos.x, y: chaosPos.y, z: (Math.random() - 0.5) * 4, duration: 1.5, ease: "power2.out" });
      // In chaos, tumble around randomly
      gsap.to(ref.rotation, { x: Math.random() * 2, y: Math.random() * 2, z: chaosPos.r, duration: 1.5, ease: "power2.out" });
    } else if (phase === "arranging") {
      // Suck them into the center
      gsap.to(ref.position, { x: 0, y: 0, z: 0, duration: 0.6, ease: "power2.inOut" });
      gsap.to(ref.rotation, { x: 0, y: 0, z: 0, duration: 0.6, ease: "power2.inOut" });
    } else if (phase === "arranged") {
      const baseDelay = index * 0.05;
      
      // Top down view in 3D: Layout Y goes to Z (depth), layout Y is flat floor.
      // But we have orthographic/top down camera looking from Z?
      // Wait, original was top-down with orthographic-like planes.
      // Let's lay the models flat on a floor:
      // X = layout x, Y = 0 (floor), Z = layout y
      // But our camera is at [0,0,10] looking at [0,0,0].
      // So X is X, Y is up, Z is depth.
      // To match top-down floor plans, X=x, Y=y. 
      // If we put them at X=x, Y=y, they will look like they are bolted to a wall.
      // So we must rotate the models 90 degrees on X axis to show their top!
      
      gsap.to(ref.position, { x: arrangedPos.x, y: arrangedPos.y, z: 0, duration: 2.5, ease: "elastic.out(1, 0.75)", delay: baseDelay });
      // Rotate 90 degrees (1.57 rad) on X to face the camera (top-down view)
      gsap.to(ref.rotation, { x: Math.PI / 2, y: arrangedPos.r, z: 0, duration: 2.5, ease: "elastic.out(1, 0.75)", delay: baseDelay });
    }
  }, [phase, chaosPos, arrangedPos, index]);

  // Subtle breathing animation when in chaos
  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    if (phase === "chaos") {
      meshRef.current.position.y += Math.sin(t + index) * 0.005;
      meshRef.current.rotation.x += Math.sin(t * 0.5 + index) * 0.002;
      meshRef.current.rotation.y += Math.cos(t * 0.5 + index) * 0.002;
    }
  });

  return (
    <group ref={meshRef}>
      <primitive object={normalizedModel} />
    </group>
  );
};

// Scene wrapper to handle mouse parallax and lights
const Scene = ({ phase, layoutData }: { phase: "chaos" | "arranging" | "arranged", layoutData?: any[] }) => {
  const { camera, pointer } = useThree();
  
  useFrame(() => {
    // Smooth camera parallax
    const targetX = (pointer.x * 2);
    const targetY = (pointer.y * 2);
    camera.position.x += (targetX - camera.position.x) * 0.05;
    camera.position.y += (targetY - camera.position.y) * 0.05;
    camera.lookAt(0, 0, 0);
  });

  const defaultItems = [
    { src: "/models/sofa.glb", chaos: { x: -4, y: -2, r: -0.5 }, arranged: { x: -2.5, y: 1, r: -0.05 }, size: 3.5 },
    { src: "/models/classic_table.glb", chaos: { x: 4, y: -2, r: 1.2 }, arranged: { x: 0.5, y: 0, r: 0 }, size: 3 },
    { src: "/models/old_armchair.glb", chaos: { x: -3, y: 3, r: -0.8 }, arranged: { x: -1.5, y: -1, r: 0.1 }, size: 2 },
    { src: "/models/bookshelf.glb", chaos: { x: -2, y: -4, r: 1.5 }, arranged: { x: 3.5, y: -0.5, r: 0 }, size: 2.5 },
    { src: "/models/bed.glb", chaos: { x: -5, y: 1, r: -1.8 }, arranged: { x: -3.5, y: -1.5, r: 0.02 }, size: 3.5 },
    { src: "/models/flat_screen_tv.glb", chaos: { x: 3.5, y: 2.5, r: 0.7 }, arranged: { x: 3, y: 1.5, r: -0.02 }, size: 2.5 },
    { src: "/models/titanic_lamp.glb", chaos: { x: 4.5, y: -3.5, r: 2.2 }, arranged: { x: 1.5, y: -1.5, r: 0 }, size: 1.5 },
  ];

  const typeMap: Record<string, string> = {
    sofa: "/models/sofa.glb", 
    table: "/models/classic_table.glb", 
    chair: "/models/old_armchair.glb", 
    bookshelf: "/models/bookshelf.glb", 
    bed: "/models/bed.glb", 
    tv: "/models/flat_screen_tv.glb", 
    lamp: "/models/titanic_lamp.glb"
  };

  const activeItems = layoutData 
    ? layoutData.map((ld: any) => ({
        src: typeMap[ld.type] || "/models/sofa.glb",
        chaos: { x: (Math.random() - 0.5) * 8, y: (Math.random() - 0.5) * 8, r: Math.random() * 4 },
        arranged: { x: ld.x - 7.5, y: ld.y - 10, r: ld.rotation },
        size: Math.max(ld.width, ld.depth) * 0.7
      }))
    : defaultItems;

  return (
    <>
      <ambientLight intensity={1.2} />
      <directionalLight position={[10, 10, 5]} intensity={1.5} castShadow />
      <directionalLight position={[-10, -10, 5]} intensity={0.5} color="#8cb3a6" />
      <Environment preset="city" />
      
      <group>
        {activeItems.map((item, i) => (
          <FurnitureModel
            key={`${i}-${item.src}`}
            index={i}
            src={item.src}
            chaosPos={item.chaos}
            arrangedPos={item.arranged}
            size={item.size}
            phase={phase}
          />
        ))}
      </group>
    </>
  );
};

interface WebGLHeroProps {
  onGenerate?: () => void;
  isGenerating?: boolean;
  hasGenerated?: boolean;
  layoutData?: any[];
  showText?: boolean;
}

const WebGLHero: React.FC<WebGLHeroProps> = ({ onGenerate, isGenerating, hasGenerated, layoutData, showText = true }) => {
  const [phase, setPhase] = useState<"chaos" | "arranging" | "arranged">("chaos");

  useEffect(() => {
    if (isGenerating) {
      setPhase("arranging");
    } else if (hasGenerated) {
      setPhase("arranged");
    } else {
      setPhase("chaos");
      
      const handleScroll = () => {
        if (window.scrollY > 50) {
          setPhase("arranged");
          window.removeEventListener("scroll", handleScroll);
        }
      };

      window.addEventListener("scroll", handleScroll, { passive: true });
      return () => {
        window.removeEventListener("scroll", handleScroll);
      };
    }
  }, [isGenerating, hasGenerated]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* 3D Canvas Background */}
      <div className="absolute inset-0 z-0 opacity-60">
        <Canvas camera={{ position: [0, 0, 15], fov: 40 }}>
          <Suspense fallback={null}>
            <Scene phase={phase} layoutData={layoutData} />
          </Suspense>
        </Canvas>
      </div>

      {/* Gradient overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/70 to-background/95 pointer-events-none z-10" />

      {/* Intelligence Grid (appears when arranged) */}
      <motion.div
        className="absolute w-[85%] h-[75%] pointer-events-none z-10"
        initial={{ opacity: 0 }}
        animate={phase === "arranged" ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 2, delay: 0.5 }}
      >
        <div className="absolute inset-0 border border-dashed border-accent/20 rounded-[3rem]" />
        <div className="absolute top-1/3 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/10 to-transparent" />
        <div className="absolute top-2/3 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/10 to-transparent" />
        <div className="absolute left-1/3 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-accent/10 to-transparent" />
        <div className="absolute left-2/3 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-accent/10 to-transparent" />
      </motion.div>

      {/* Main Content */}
      {showText && (
        <div className="relative z-20 text-center max-w-5xl mx-auto px-6 mt-16">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-[11px] uppercase tracking-[0.5em] text-accent mb-8 font-body font-medium">
              Intelligent Space Design
            </p>
            <h1 className="text-5xl md:text-7xl lg:text-[7rem] font-display font-semibold text-foreground leading-[1] mb-10 tracking-tight drop-shadow-xl">
              Design Space
              <br />
              <span className="hero-gradient-text italic font-medium">That Thinks.</span>
            </h1>
            <p className="text-base md:text-lg text-muted-foreground/80 max-w-xl mx-auto mb-14 font-body leading-relaxed font-light">
              Your space is a living intelligence that learns, adapts, and evolves with you. Watch chaos turn into perfect harmony.
            </p>
            <div className="flex flex-wrap gap-6 justify-center">
              <Button 
                size="lg" 
                className="rounded-full px-8 h-14 text-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-hero"
                onClick={onGenerate}
                disabled={isGenerating}
              >
                {isGenerating ? "Analyzing Space..." : hasGenerated ? "Configure Space" : "Get Started"}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </section>
  );
};

export default WebGLHero;
