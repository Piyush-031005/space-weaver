import { motion } from "framer-motion";
import { ArrowRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

import React, { Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF, Environment, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

const allProducts = [
  // Premium
  { id: 1, tier: "premium", name: "Aura Minimalist Sofa", brand: "Design Within Reach", price: "₹1,29,900", src: "/models/sofa.glb", link: "#" },
  { id: 2, tier: "premium", name: "Walnut Dining Table", brand: "Herman Miller", price: "₹2,45,000", src: "/models/classic_table.glb", link: "#" },
  { id: 3, tier: "premium", name: "Ambient Floor Lamp", brand: "Flos", price: "₹45,000", src: "/models/titanic_lamp.glb", link: "#" },
  // Mid-Range
  { id: 4, tier: "mid", name: "Contemporary Sofa", brand: "Urban Ladder", price: "₹45,000", src: "/models/sofa.glb", link: "#" },
  { id: 5, tier: "mid", name: "Oak Wood Table", brand: "Pepperfry", price: "₹35,000", src: "/models/classic_table.glb", link: "#" },
  { id: 6, tier: "mid", name: "Brass Floor Lamp", brand: "IKEA", price: "₹12,000", src: "/models/titanic_lamp.glb", link: "#" },
  // Budget (Artisan)
  { id: 7, tier: "budget", name: "Handcrafted Jute Sofa", brand: "Jaipur Artisans", price: "₹18,000", src: "/models/sofa.glb", link: "#" },
  { id: 8, tier: "budget", name: "Reclaimed Wood Table", brand: "Local Carpenter", price: "₹12,000", src: "/models/classic_table.glb", link: "#" },
  { id: 9, tier: "budget", name: "Terracotta Lamp", brand: "Moradabad Craft", price: "₹4,500", src: "/models/titanic_lamp.glb", link: "#" },
];

const ShowcaseModel = ({ src }: { src: string }) => {
  const { scene } = useGLTF(src);
  const normalizedModel = useMemo(() => {
    const clone = scene.clone();
    
    // Calculate bounding box
    const box = new THREE.Box3().setFromObject(clone);
    const sizeVec = new THREE.Vector3();
    box.getSize(sizeVec);
    
    // Scale so the largest dimension fits roughly in a 3 unit box
    const maxDim = Math.max(sizeVec.x, sizeVec.y, sizeVec.z);
    const targetScale = 3 / (maxDim || 1);
    clone.scale.set(targetScale, targetScale, targetScale);
    
    // Center it
    const center = new THREE.Vector3();
    box.getCenter(center);
    clone.position.set(-center.x * targetScale, -center.y * targetScale, -center.z * targetScale);
    
    return clone;
  }, [scene]);

  return <primitive object={normalizedModel} />;
};

const AffiliateShowcase = ({ budget = "budget" }: { budget?: string }) => {
  const products = allProducts.filter(p => p.tier === budget);
  
  return (
    <section className="section-padding bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-[10px] uppercase tracking-[0.5em] text-accent mb-4 font-body font-medium">
              Shop The Look
            </p>
            <h2 className="text-3xl md:text-5xl font-display font-semibold text-foreground">
              Curated for your <span className="italic font-normal">Space DNA</span>
            </h2>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Button variant="link" className="text-foreground hover:text-accent font-medium p-0">
              View full manifest <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product, i) => (
            <motion.a
              href={product.link}
              key={product.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              whileHover={{ y: -8 }}
              className="group block relative bg-transparent rounded-[1.5rem] p-6 overflow-hidden transition-all hover:bg-accent/5"
            >
              <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <ExternalLink className="w-5 h-5 text-accent" />
              </div>
              
              <div className="h-64 w-full flex items-center justify-center mb-4 p-0">
                <div className="w-full h-full cursor-grab active:cursor-grabbing">
                  <Canvas camera={{ position: [0, 2, 5], fov: 45 }}>
                    <ambientLight intensity={1.5} />
                    <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
                    <directionalLight position={[-10, -10, -5]} intensity={0.5} />
                    <Environment preset="city" />
                    <Suspense fallback={null}>
                      <ShowcaseModel src={product.src} />
                    </Suspense>
                    <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={3} />
                  </Canvas>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                    {product.brand}
                  </p>
                  {budget === "budget" && (
                    <span className="text-[10px] font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">Support Local</span>
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <h3 className="font-display text-lg font-semibold text-foreground">
                    {product.name}
                  </h3>
                  <span className="font-body font-medium text-sm text-foreground">
                    {product.price}
                  </span>
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AffiliateShowcase;
