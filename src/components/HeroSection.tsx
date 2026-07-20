import { useEffect, useState, useRef, useCallback } from "react";
import { motion, useAnimation, useMotionValue, useTransform } from "framer-motion";
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

interface FurnitureItem {
  id: string;
  src: string;
  label: string;
  chaos: { x: number; y: number; rotate: number; scale: number };
  arranged: { x: number; y: number; rotate: number; scale: number };
  size: number;
  parallaxStrength: number;
}

const furnitureItems: FurnitureItem[] = [
  {
    id: "sofa", src: sofaImg, label: "Sofa",
    chaos: { x: -380, y: -160, rotate: -18, scale: 0.6 },
    arranged: { x: -280, y: 140, rotate: -2, scale: 0.85 },
    size: 260, parallaxStrength: 0.03,
  },
  {
    id: "table", src: tableImg, label: "Dining Table",
    chaos: { x: 340, y: -140, rotate: 55, scale: 0.4 },
    arranged: { x: 30, y: 0, rotate: 0, scale: 0.75 },
    size: 240, parallaxStrength: 0.02,
  },
  {
    id: "chair", src: chairImg, label: "Armchair",
    chaos: { x: -260, y: 240, rotate: -45, scale: 0.55 },
    arranged: { x: -120, y: -80, rotate: 4, scale: 0.6 },
    size: 180, parallaxStrength: 0.04,
  },
  {
    id: "bookshelf", src: bookshelfImg, label: "Bookshelf",
    chaos: { x: -150, y: -300, rotate: 90, scale: 0.35 },
    arranged: { x: 320, y: -60, rotate: 0, scale: 0.7 },
    size: 210, parallaxStrength: 0.015,
  },
  {
    id: "bed", src: bedImg, label: "Bed",
    chaos: { x: -400, y: 60, rotate: -110, scale: 0.45 },
    arranged: { x: -320, y: -100, rotate: 1, scale: 0.8 },
    size: 260, parallaxStrength: 0.025,
  },
  {
    id: "wardrobe", src: tvImg, label: "Wardrobe",
    chaos: { x: 320, y: 180, rotate: 40, scale: 0.4 },
    arranged: { x: 300, y: 120, rotate: -1, scale: 0.65 },
    size: 200, parallaxStrength: 0.035,
  },
  {
    id: "stool", src: lampImg, label: "Stool",
    chaos: { x: 400, y: -260, rotate: 130, scale: 0.5 },
    arranged: { x: 140, y: -120, rotate: 0, scale: 0.45 },
    size: 130, parallaxStrength: 0.05,
  },
  {
    id: "recliner", src: reclinerImg, label: "Recliner",
    chaos: { x: 180, y: 280, rotate: -70, scale: 0.45 },
    arranged: { x: -80, y: 160, rotate: 3, scale: 0.55 },
    size: 170, parallaxStrength: 0.04,
  },
  {
    id: "nightstand", src: nightstandImg, label: "Nightstand",
    chaos: { x: -340, y: -80, rotate: 160, scale: 0.5 },
    arranged: { x: 180, y: 150, rotate: 0, scale: 0.5 },
    size: 120, parallaxStrength: 0.045,
  },
];

const HeroSection = () => {
  const [phase, setPhase] = useState<"chaos" | "arranging" | "arranged">("chaos");
  const controls = useAnimation();
  const containerRef = useRef<HTMLElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    mouseX.set((e.clientX - rect.left - centerX) / centerX);
    mouseY.set((e.clientY - rect.top - centerY) / centerY);
  }, [mouseX, mouseY]);

  useEffect(() => {
    const sequence = async () => {
      // Frame 0-1: Chaos state with breathing
      await controls.start((i) => ({
        x: furnitureItems[i].chaos.x,
        y: furnitureItems[i].chaos.y,
        rotate: furnitureItems[i].chaos.rotate,
        scale: furnitureItems[i].chaos.scale,
        opacity: 0.5,
        transition: { duration: 1.2, delay: i * 0.07 },
      }));

      // Pause — let user absorb chaos
      await new Promise((r) => setTimeout(r, 2500));

      // Frame 3: Anticipation — slight pause/scale-down
      setPhase("arranging");
      await controls.start((i) => ({
        scale: furnitureItems[i].chaos.scale * 0.95,
        transition: { duration: 0.3 },
      }));

      // Frame 4-5: Magnetic pull — smooth arrangement
      await controls.start((i) => ({
        x: furnitureItems[i].arranged.x,
        y: furnitureItems[i].arranged.y,
        rotate: furnitureItems[i].arranged.rotate,
        scale: furnitureItems[i].arranged.scale,
        opacity: 0.35,
        transition: {
          duration: 3.5,
          delay: i * 0.12,
          ease: [0.22, 1, 0.36, 1],
        },
      }));

      // Frame 5: Micro bounce snap
      await controls.start((i) => ({
        scale: furnitureItems[i].arranged.scale * 1.02,
        transition: { duration: 0.15 },
      }));
      await controls.start((i) => ({
        scale: furnitureItems[i].arranged.scale,
        transition: { duration: 0.2, ease: "easeOut" },
      }));

      setPhase("arranged");
    };

    sequence();
  }, [controls]);

  return (
    <section
      id="hero"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background"
    >
      {/* Ambient glow orbs */}
      <motion.div
        className="absolute w-[1000px] h-[1000px] rounded-full bg-accent/6 blur-[160px]"
        animate={{ x: [0, 80, 0], y: [0, -50, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        style={{ top: "-15%", right: "-30%" }}
      />
      <motion.div
        className="absolute w-[800px] h-[800px] rounded-full bg-secondary/12 blur-[140px]"
        animate={{ x: [0, -60, 0], y: [0, 60, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        style={{ bottom: "-10%", left: "-25%" }}
      />

      {/* Furniture animation layer with mouse parallax */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {furnitureItems.map((item, i) => {
          const px = useTransform(mouseX, [-1, 1], [-item.parallaxStrength * 100, item.parallaxStrength * 100]);
          const py = useTransform(mouseY, [-1, 1], [-item.parallaxStrength * 80, item.parallaxStrength * 80]);

          return (
            <motion.div
              key={item.id}
              custom={i}
              animate={controls}
              initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
              className="absolute"
              style={{
                width: item.size,
                height: item.size,
                translateX: px,
                translateY: py,
                filter: "drop-shadow(0 20px 40px rgba(60,40,20,0.25))",
              }}
            >
              <img
                src={item.src}
                alt={item.label}
                className="w-full h-full object-contain"
                draggable={false}
                width={item.size}
                height={item.size}
              />
            </motion.div>
          );
        })}
      </div>

      {/* Gradient overlay — 3-layer system for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/75 to-background/90 pointer-events-none" />

      {/* Room outline on arrange — intelligence visualization */}
      <motion.div
        className="absolute border border-dashed border-accent/15 rounded-[2.5rem] w-[75%] h-[65%]"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={
          phase === "arranged"
            ? { opacity: 1, scale: 1 }
            : { opacity: 0, scale: 0.85 }
        }
        transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
      />

      {/* Layout grid lines — appear after arrangement */}
      <motion.div
        className="absolute w-[75%] h-[65%] pointer-events-none"
        initial={{ opacity: 0 }}
        animate={phase === "arranged" ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 1.5, delay: 0.5 }}
      >
        <div className="absolute top-1/3 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-accent/10 to-transparent" />
        <div className="absolute top-2/3 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-accent/10 to-transparent" />
        <div className="absolute left-1/3 top-[10%] bottom-[10%] w-px bg-gradient-to-b from-transparent via-accent/10 to-transparent" />
        <div className="absolute left-2/3 top-[10%] bottom-[10%] w-px bg-gradient-to-b from-transparent via-accent/10 to-transparent" />
      </motion.div>

      {/* Main content */}
      <div className="relative z-10 text-center max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={phase !== "chaos" ? { opacity: 1, y: 0 } : { opacity: 0, y: 80 }}
          transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        >
          <p className="text-[10px] uppercase tracking-[0.6em] text-muted-foreground mb-12 font-body font-medium">
            Intelligent Space Design
          </p>
          <h1 className="text-6xl md:text-8xl lg:text-[7.5rem] font-display font-semibold text-foreground leading-[0.9] mb-12 tracking-tight">
            Design Space
            <br />
            <motion.span
              className="hero-gradient-text italic font-medium"
              initial={{ opacity: 0, y: 30 }}
              animate={phase !== "chaos" ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.8 }}
            >
              That Thinks.
            </motion.span>
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-lg mx-auto mb-16 font-body leading-relaxed font-light">
            Transform cluttered rooms into intelligently organized spaces — optimized for movement, comfort, and visual balance.
          </p>
          <div className="flex flex-wrap gap-5 justify-center">
            <Button variant="hero" size="lg" className="rounded-full px-14 py-7 text-sm shadow-hero hover:scale-[1.03] transition-transform duration-300">
              Design My Space
            </Button>
            <Button variant="heroOutline" size="lg" className="rounded-full px-14 py-7 text-sm backdrop-blur-sm hover:scale-[1.03] transition-transform duration-300">
              Watch Transformation
            </Button>
          </div>
        </motion.div>

        {/* Micro tag */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={phase === "arranged" ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 1.5 }}
          className="mt-28 inline-flex items-center bg-primary/5 backdrop-blur-sm px-8 py-3.5 rounded-full border border-primary/8"
        >
          <span className="text-[10px] font-body text-primary font-medium tracking-[0.4em] uppercase">
            Real dimensions · Real layouts · Real results
          </span>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-12 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={phase === "arranged" ? { opacity: 1, y: [0, 8, 0] } : { opacity: 0 }}
        transition={{ duration: 2.5, repeat: Infinity, delay: 2 }}
      >
        <div className="w-6 h-11 border border-foreground/10 rounded-full flex justify-center pt-2.5">
          <motion.div
            className="w-1 h-1 bg-foreground/20 rounded-full"
            animate={{ y: [0, 14, 0] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
