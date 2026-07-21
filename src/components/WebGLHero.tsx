import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

import sofaImg from "@/assets/furniture/sofa.png";
import tableImg from "@/assets/furniture/table.png";
import chairImg from "@/assets/furniture/chair.png";
import bookshelfImg from "@/assets/furniture/bookshelf.png";
import bedImg from "@/assets/furniture/bed.png";
import tvImg from "@/assets/furniture/tv.png";
import lampImg from "@/assets/furniture/lamp.png";
import reclinerImg from "@/assets/furniture/recliner.png";
import nightstandImg from "@/assets/furniture/nightstand.png";

// A single furniture piece in 3D
const FurniturePlane = ({
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
  const texture = useTexture(src);
  const meshRef = useRef<THREE.Mesh>(null);
  const ghost1Ref = useRef<THREE.Mesh>(null);
  const ghost2Ref = useRef<THREE.Mesh>(null);
  
  // Calculate aspect ratio dynamically
  const aspect = texture.image ? texture.image.width / texture.image.height : 1;
  
  // We use GSAP to animate position/rotation based on phase
  useEffect(() => {
    if (!meshRef.current || !ghost1Ref.current || !ghost2Ref.current) return;
    
    const meshes = [
      { ref: meshRef.current, delayOffset: 0, opacity: 0.9 },
      { ref: ghost1Ref.current, delayOffset: 0.08, opacity: 0.4 },
      { ref: ghost2Ref.current, delayOffset: 0.16, opacity: 0.15 },
    ];
    
    if (phase === "chaos") {
      meshes.forEach(({ ref }) => {
        gsap.to(ref.position, { x: chaosPos.x, y: chaosPos.y, z: 0, duration: 1.5, ease: "power2.out" });
        gsap.to(ref.rotation, { z: chaosPos.r, duration: 1.5, ease: "power2.out" });
        gsap.to(ref.scale, { x: 0.8, y: 0.8, z: 0.8, duration: 1.5 });
      });
    } else if (phase === "arranging") {
      meshes.forEach(({ ref }) => {
        gsap.to(ref.scale, { x: 0.7, y: 0.7, z: 0.7, duration: 0.4, ease: "power1.inOut" });
      });
    } else if (phase === "arranged") {
      meshes.forEach(({ ref, delayOffset }) => {
        const baseDelay = index * 0.05 + delayOffset;
        gsap.to(ref.position, { x: arrangedPos.x, y: arrangedPos.y, z: -delayOffset, duration: 2.5 + index * 0.1, ease: "elastic.out(1, 0.75)", delay: baseDelay });
        gsap.to(ref.rotation, { z: arrangedPos.r, duration: 2.5 + index * 0.1, ease: "elastic.out(1, 0.75)", delay: baseDelay });
        gsap.to(ref.scale, { x: 1, y: 1, z: 1, duration: 2.5, ease: "elastic.out(1, 0.75)", delay: baseDelay });
      });
    }
  }, [phase, chaosPos, arrangedPos, index]);

  // Subtle breathing animation when in chaos or arranged
  useFrame(({ clock }) => {
    if (!meshRef.current || !ghost1Ref.current || !ghost2Ref.current) return;
    const t = clock.getElapsedTime();
    if (phase === "arranged") {
      meshRef.current.position.y += Math.sin(t * 0.5 + index) * 0.002;
      ghost1Ref.current.position.y += Math.sin(t * 0.5 + index - 0.2) * 0.002;
      ghost2Ref.current.position.y += Math.sin(t * 0.5 + index - 0.4) * 0.002;
    } else if (phase === "chaos") {
      meshRef.current.position.y += Math.sin(t + index) * 0.005;
      ghost1Ref.current.position.y += Math.sin(t + index - 0.1) * 0.005;
      ghost2Ref.current.position.y += Math.sin(t + index - 0.2) * 0.005;
    }
  });

  return (
    <group>
      <mesh ref={ghost2Ref}>
        <planeGeometry args={[size * aspect, size]} />
        <meshBasicMaterial map={texture} transparent opacity={0.15} />
      </mesh>
      <mesh ref={ghost1Ref}>
        <planeGeometry args={[size * aspect, size]} />
        <meshBasicMaterial map={texture} transparent opacity={0.4} />
      </mesh>
      <mesh ref={meshRef}>
        <planeGeometry args={[size * aspect, size]} />
        <meshBasicMaterial map={texture} transparent opacity={0.9} />
      </mesh>
    </group>
  );
};

// Scene wrapper to handle mouse parallax
const Scene = ({ phase }: { phase: "chaos" | "arranging" | "arranged" }) => {
  const { camera, pointer } = useThree();
  
  useFrame(() => {
    // Smooth camera parallax
    const targetX = (pointer.x * 2);
    const targetY = (pointer.y * 2);
    camera.position.x += (targetX - camera.position.x) * 0.02;
    camera.position.y += (targetY - camera.position.y) * 0.02;
    camera.lookAt(0, 0, 0);
  });

  const items = [
    { src: sofaImg, chaos: { x: -4, y: -2, r: -0.5 }, arranged: { x: -2.5, y: 1, r: -0.05 }, size: 3.5 },
    { src: tableImg, chaos: { x: 4, y: -2, r: 1.2 }, arranged: { x: 0.5, y: 0, r: 0 }, size: 3 },
    { src: chairImg, chaos: { x: -3, y: 3, r: -0.8 }, arranged: { x: -1.5, y: -1, r: 0.1 }, size: 2 },
    { src: bookshelfImg, chaos: { x: -2, y: -4, r: 1.5 }, arranged: { x: 3.5, y: -0.5, r: 0 }, size: 2.5 },
    { src: bedImg, chaos: { x: -5, y: 1, r: -1.8 }, arranged: { x: -3.5, y: -1.5, r: 0.02 }, size: 3.5 },
    { src: tvImg, chaos: { x: 3.5, y: 2.5, r: 0.7 }, arranged: { x: 3, y: 1.5, r: -0.02 }, size: 2.5 },
    { src: lampImg, chaos: { x: 4.5, y: -3.5, r: 2.2 }, arranged: { x: 1.5, y: -1.5, r: 0 }, size: 1.5 },
    { src: reclinerImg, chaos: { x: 2, y: 3.5, r: -1.2 }, arranged: { x: -1, y: 2, r: 0.05 }, size: 2 },
    { src: nightstandImg, chaos: { x: -4, y: -1, r: 2.8 }, arranged: { x: 2, y: 2, r: 0 }, size: 1.5 },
  ];

  return (
    <group>
      {items.map((item, i) => (
        <FurniturePlane
          key={i}
          index={i}
          src={item.src}
          chaosPos={item.chaos}
          arrangedPos={item.arranged}
          size={item.size}
          phase={phase}
        />
      ))}
    </group>
  );
};

interface WebGLHeroProps {
  onGenerate?: () => void;
  isGenerating?: boolean;
  hasGenerated?: boolean;
}

const WebGLHero: React.FC<WebGLHeroProps> = ({ onGenerate, isGenerating, hasGenerated }) => {
  const [phase, setPhase] = useState<"chaos" | "arranging" | "arranged">("chaos");

  useEffect(() => {
    if (isGenerating) {
      setPhase("arranging");
    } else if (hasGenerated) {
      setPhase("arranged");
    } else {
      setPhase("chaos");
    }
  }, [isGenerating, hasGenerated]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* 3D Canvas Background */}
      <div className="absolute inset-0 z-0 opacity-40">
        <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
          <Scene phase={phase} />
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
      <div className="relative z-20 text-center max-w-5xl mx-auto px-6 mt-16">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={phase !== "chaos" ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-[11px] uppercase tracking-[0.5em] text-accent mb-8 font-body font-medium">
            Intelligent Space Design
          </p>
          <h1 className="text-5xl md:text-7xl lg:text-[7rem] font-display font-semibold text-foreground leading-[1] mb-10 tracking-tight">
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
            disabled={isGenerating || hasGenerated}
          >
            {isGenerating ? "Analyzing Space..." : hasGenerated ? "Space Optimized" : "Generate Space DNA"}
          </Button>
            <Button variant="outline" size="lg" className="rounded-full px-12 py-7 text-sm font-medium border-border/50 hover:bg-accent/5 hover:scale-[1.02] transition-transform duration-300">
              See How It Works
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default WebGLHero;
