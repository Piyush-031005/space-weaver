import React from "react";
import { motion } from "framer-motion";
import { Check, Star, Quote } from "lucide-react";

const SpaceGenomePreview = () => {
  const designHighlights = [
    {
      title: "Effortless Walking Corridors",
      description: "We preserve continuous 36-inch walkways from your doorways to seating areas, ensuring you never stumble or squeeze past furniture."
    },
    {
      title: "Natural Daylight Maximization",
      description: "Seating is oriented to capture warm morning and afternoon daylight while eliminating frustrating glare on television and computer screens."
    },
    {
      title: "Interactive Conversation Circles",
      description: "By replacing awkward parallel seating with face-to-face and L-shape geometry, your room naturally encourages eye contact and connection."
    },
    {
      title: "Zero Clutter & Breathing Room",
      description: "We use negative space as an active architectural feature, allowing your room to feel visibly larger and more restful."
    }
  ];

  return (
    <section className="py-28 bg-background relative overflow-hidden border-t border-border/40">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Editorial Section Header (No Boxes, Pure Typography) */}
        <div className="max-w-3xl mb-20">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary mb-4">
            Architectural Philosophy
          </p>
          <h2 className="text-4xl md:text-6xl font-display font-bold text-foreground tracking-tight leading-[1.15] mb-6">
            Every room has its own <br />
            <span className="italic font-normal text-primary">natural harmony</span>.
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground font-light leading-relaxed">
            We don't use arbitrary algorithms or AI dashboards. Our design engine analyzes human movement, eye sightlines, daylight angles, and daily routines to organize your home like a master interior designer.
          </p>
        </div>

        {/* 2-Column Editorial Grid (No Box Borders, No Progress Bars!) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          {/* Left Column: Why The Space Breathes */}
          <div className="lg:col-span-7 space-y-12">
            <h3 className="text-2xl font-display font-bold text-foreground border-b border-border/40 pb-4">
              How We Create Spatial Harmony
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {designHighlights.map((highlight, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="space-y-3"
                >
                  <div className="flex items-center gap-2 text-primary font-bold">
                    <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs">✓</span>
                    <h4 className="text-lg font-display font-semibold text-foreground">
                      {highlight.title}
                    </h4>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed pl-8">
                    {highlight.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right Column: Editorial Homeowner & Designer Review (Replacing AI Progress Bars) */}
          <div className="lg:col-span-5 lg:pl-8">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} fill="currentColor" />
                ))}
                <span className="ml-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">5.0 Verified Review</span>
              </div>

              <blockquote className="text-xl md:text-2xl font-display font-normal italic text-foreground/90 leading-relaxed relative">
                <Quote className="absolute -top-4 -left-6 text-primary/10 -z-10" size={64} />
                "SpaceWeaver completely transformed our living room. Instead of feeling cramped by the balcony door, the new arrangement unlocked so much walking space and made our home feel like a professional Scandinavian studio."
              </blockquote>

              <div className="pt-4 border-t border-border/40">
                <div className="font-display font-bold text-foreground">Sarah & David Jenkins</div>
                <div className="text-xs text-muted-foreground uppercase tracking-widest mt-0.5">Homeowners • Stockholm, Sweden</div>
              </div>

              <div className="pt-6">
                <div className="inline-flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
                  <span>✦ Practical Human Ergonomics & Sightlines</span>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default SpaceGenomePreview;
