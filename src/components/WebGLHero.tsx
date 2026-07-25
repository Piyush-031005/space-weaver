import React, { useEffect, useRef, useState, useMemo, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Environment, OrbitControls } from "@react-three/drei";
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
  chaosPos: { x: number; y: number; z: number; r: number };
  arrangedPos: { x: number; z: number; r: number };
  size: number;
  phase: "chaos" | "arranging" | "arranged";
  index: number;
}) => {
  const { scene } = useGLTF(src);
  const meshRef = useRef<THREE.Group>(null);
  
  // Clone, scale, and align model so bottom sits at y = 0
  const normalizedModel = useMemo(() => {
    const clone = scene.clone();
    
    // Calculate bounding box
    const box = new THREE.Box3().setFromObject(clone);
    const sizeVec = new THREE.Vector3();
    box.getSize(sizeVec);
    
    // Scale so largest dimension matches `size`
    const maxDim = Math.max(sizeVec.x, sizeVec.y, sizeVec.z);
    const targetScale = size / (maxDim || 1);
    clone.scale.set(targetScale, targetScale, targetScale);
    
    // Recompute box after scale to get exact bottom Y and center
    const scaledBox = new THREE.Box3().setFromObject(clone);
    const center = new THREE.Vector3();
    scaledBox.getCenter(center);
    const bottomY = scaledBox.min.y;
    
    // Align horizontally to center (0,0) and vertically to bottom edge (0)
    clone.position.set(-center.x, -bottomY, -center.z);
    
    // Enable shadows on all child meshes
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    return clone;
  }, [scene, size]);
  
  // Animate position/rotation based on phase
  useEffect(() => {
    if (!meshRef.current) return;
    const ref = meshRef.current;
    
    if (phase === "chaos") {
      gsap.to(ref.position, { x: chaosPos.x, y: chaosPos.y, z: chaosPos.z, duration: 1.5, ease: "power2.out" });
      gsap.to(ref.rotation, { x: Math.random() * 0.5, y: chaosPos.r, z: Math.random() * 0.5, duration: 1.5, ease: "power2.out" });
    } else if (phase === "arranging") {
      gsap.to(ref.position, { x: 0, y: 3, z: 0, duration: 0.6, ease: "power2.inOut" });
      gsap.to(ref.rotation, { x: 0, y: 0, z: 0, duration: 0.6, ease: "power2.inOut" });
    } else if (phase === "arranged") {
      const baseDelay = index * 0.05;
      // Land smoothly on floor (y = 0) at arranged coordinates
      gsap.to(ref.position, { x: arrangedPos.x, y: 0, z: arrangedPos.z, duration: 2.2, ease: "power3.out", delay: baseDelay });
      gsap.to(ref.rotation, { x: 0, y: arrangedPos.r, z: 0, duration: 2.2, ease: "power3.out", delay: baseDelay });
    }
  }, [phase, chaosPos, arrangedPos, index]);

  // Subtle breathing animation when in chaos
  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    if (phase === "chaos") {
      meshRef.current.position.y += Math.sin(t + index) * 0.005;
      meshRef.current.rotation.y += Math.cos(t * 0.5 + index) * 0.002;
    }
  });

  return (
    <group ref={meshRef}>
      <primitive object={normalizedModel} />
    </group>
  );
};

// Scene wrapper with Architectural Floor, Walls, Grid, and Lights
const Scene = ({ 
  phase, 
  layoutData, 
  fixedElements, 
  fullHeight, 
  room 
}: { 
  phase: "chaos" | "arranging" | "arranged"; 
  layoutData?: any[]; 
  fixedElements?: any[]; 
  fullHeight: boolean;
  room?: { width: number; length: number };
}) => {
  const { camera, pointer } = useThree();
  const roomW = room?.width || 15;
  const roomL = room?.length || 20;
  
  useFrame(() => {
    if (!fullHeight) return; // Disable parallax on interactive results page
    // Smooth camera parallax for Hero section
    const targetX = (pointer.x * 3);
    const targetZ = 18 + (pointer.y * 3);
    camera.position.x += (targetX - camera.position.x) * 0.05;
    camera.position.z += (targetZ - camera.position.z) * 0.05;
    camera.lookAt(0, 0, 0);
  });

  const defaultItems = [
    { src: "/models/sofa.glb", chaos: { x: -5, y: 6, z: -3, r: -0.5 }, arranged: { x: -2.5, z: 2, r: 0 }, size: 3.5 },
    { src: "/models/classic_table.glb", chaos: { x: 5, y: 5, z: -2, r: 1.2 }, arranged: { x: 0.5, z: 0, r: 0 }, size: 3 },
    { src: "/models/old_armchair.glb", chaos: { x: -4, y: 7, z: 4, r: -0.8 }, arranged: { x: -2.0, z: -2, r: 0.5 }, size: 2 },
    { src: "/models/bookshelf.glb", chaos: { x: -3, y: 4, z: -5, r: 1.5 }, arranged: { x: (roomW/2) - 1.5, z: -2, r: -Math.PI/2 }, size: 2.5 },
    { src: "/models/bed.glb", chaos: { x: -6, y: 8, z: 2, r: -1.8 }, arranged: { x: -3.5, z: -3, r: 0 }, size: 3.5 },
    { src: "/models/flat_screen_tv.glb", chaos: { x: 4, y: 6, z: 3, r: 0.7 }, arranged: { x: 2.5, z: 3, r: Math.PI }, size: 2.5 },
    { src: "/models/titanic_lamp.glb", chaos: { x: 5, y: 4, z: -4, r: 2.2 }, arranged: { x: 1.5, z: -3, r: 0 }, size: 1.5 },
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
        chaos: { x: (Math.random() - 0.5) * 10, y: 4 + Math.random() * 4, z: (Math.random() - 0.5) * 10, r: Math.random() * 4 },
        arranged: { x: ld.x - (roomW / 2), z: ld.y - (roomL / 2), r: ld.rotation },
        size: Math.max(ld.width, ld.depth) * 0.75
      }))
    : defaultItems;

  return (
    <>
      <ambientLight intensity={1.1} />
      <directionalLight position={[15, 25, 20]} intensity={1.6} castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-0.0001} />
      <directionalLight position={[-15, 10, -10]} intensity={0.5} color="#8cb3a6" />
      <Environment preset="city" />
      
      {/* Architectural Room Environment (Floor, Grid, Walls) */}
      <group>
        {/* Floor Plane */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
          <planeGeometry args={[roomW, roomL]} />
          <meshStandardMaterial color="#f2eee8" roughness={0.8} metalness={0.05} />
        </mesh>
        
        {/* Floor Grid */}
        <gridHelper args={[Math.max(roomW, roomL), Math.max(roomW, roomL), "#cbc9bf", "#e2dfe5"]} position={[0, 0.01, 0]} />

        {/* Back Wall */}
        <mesh position={[0, 2, -roomL / 2]} receiveShadow castShadow>
          <boxGeometry args={[roomW, 4, 0.3]} />
          <meshStandardMaterial color="#e9e5de" roughness={0.9} />
        </mesh>

        {/* Left Side Wall */}
        <mesh position={[-roomW / 2, 2, 0]} receiveShadow castShadow>
          <boxGeometry args={[0.3, 4, roomL]} />
          <meshStandardMaterial color="#e5e1da" roughness={0.9} />
        </mesh>
      </group>
      
      {/* Structural Elements (Doors & Windows) */}
      {fixedElements && (
        <group>
          {fixedElements.map((el, i) => {
            let x = 0; let z = 0; let rotation = 0;
            if (el.wall === 'top') { x = el.position - (roomW/2); z = -(roomL/2); rotation = 0; }
            else if (el.wall === 'bottom') { x = el.position - (roomW/2); z = (roomL/2); rotation = 0; }
            else if (el.wall === 'left') { x = -(roomW/2); z = el.position - (roomL/2); rotation = Math.PI/2; }
            else if (el.wall === 'right') { x = (roomW/2); z = el.position - (roomL/2); rotation = Math.PI/2; }

            return (
              <group key={`struct-${i}`} position={[x, el.type === 'window' ? 2 : 1, z]} rotation={[0, rotation, 0]}>
                <mesh castShadow receiveShadow>
                  <boxGeometry args={[el.width, el.type === 'window' ? 1.5 : 2.5, 0.5]} />
                  <meshStandardMaterial 
                    color={el.type === 'window' ? "#88ccff" : "#8b5a2b"} 
                    transparent={el.type === 'window'} 
                    opacity={el.type === 'window' ? 0.6 : 1}
                    roughness={0.8}
                  />
                </mesh>
              </group>
            );
          })}
        </group>
      )}

      {/* Furniture Models */}
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
  fixedElements?: any[];
  room?: { width: number; length: number };
  showText?: boolean;
  fullHeight?: boolean;
}

const WebGLHero: React.FC<WebGLHeroProps> = ({ 
  onGenerate, 
  isGenerating, 
  hasGenerated, 
  layoutData, 
  fixedElements, 
  room,
  showText = true, 
  fullHeight = true 
}) => {
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
    <section className={`relative ${fullHeight ? "min-h-screen" : "w-full h-full"} flex items-center justify-center overflow-hidden bg-background`}>
      {/* 3D Canvas Background */}
      <div className={`absolute inset-0 z-0 ${fullHeight ? "opacity-75 pointer-events-none" : "opacity-100"}`}>
        <Canvas 
          camera={{ position: fullHeight ? [0, 16, 18] : [0, 18, 22], fov: 42 }}
          shadows
          dpr={[1, 2]}
          gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
        >
          {!fullHeight && (
            <OrbitControls 
              makeDefault 
              enableZoom={true} 
              enablePan={true} 
              enableDamping 
              dampingFactor={0.05} 
              maxPolarAngle={Math.PI / 2 - 0.05}
              target={[0, 0, 0]} 
            />
          )}
          <Suspense fallback={null}>
            <Scene phase={phase} layoutData={layoutData} fixedElements={fixedElements} fullHeight={fullHeight} room={room} />
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
