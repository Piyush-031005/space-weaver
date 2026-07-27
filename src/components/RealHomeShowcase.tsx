import React from "react";
import { Check, Home, ShieldCheck, ArrowRight } from "lucide-react";

interface RealTransformation {
  id: string;
  title: string;
  style: string;
  location: string;
  beforeDesc: string;
  afterDesc: string;
  imageUrl: string;
  stat: string;
  statLabel: string;
}

const TRANSFORMATIONS: RealTransformation[] = [
  {
    id: "scandi-living",
    title: "The Scandinavian Sunburst Living Room",
    style: "The Curator Style",
    location: "Gothenburg, Sweden",
    beforeDesc: "Awkward side-by-side sofas blocking the balcony doorway with severe afternoon window glare on the television.",
    afterDesc: "Re-oriented into an inviting 180° face-to-face conversational layout with 36-inch continuous walkways.",
    imageUrl: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=80",
    stat: "42%",
    statLabel: "More Free Walking Space"
  },
  {
    id: "minimal-studio",
    title: "The Urban Sanctuary Studio",
    style: "The Minimalist Retreat",
    location: "Zurich, Switzerland",
    beforeDesc: "Bed and workspace collided in a cramped corner, creating high cognitive clutter during work-from-home hours.",
    afterDesc: "Established clear visual zoning with floating furniture placement and unobstructed window daylight flow.",
    imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1600&q=80",
    stat: "3.5 hrs",
    statLabel: "Saved in Weekly Friction"
  },
  {
    id: "cozy-lounge",
    title: "The Warm Hearth Family Den",
    style: "The Family Haven",
    location: "Edinburgh, Scotland",
    beforeDesc: "Sharp coffee table corners and cluttered foot traffic pathways made it stressful for young children to play.",
    afterDesc: "Created an open central floor arena surrounded by an L-shape plush seating arrangement.",
    imageUrl: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=80",
    stat: "98%",
    statLabel: "Ergonomic Safety Score"
  },
  {
    id: "exec-office",
    title: "The Dual-Purpose Executive Loft",
    style: "The Executive Studio",
    location: "Berlin, Germany",
    beforeDesc: "Desk faced a blank wall while the seating area suffered from awkward acoustic reflection.",
    afterDesc: "Positioned the desk in the architectural command position with professional background framing and natural side-lighting.",
    imageUrl: "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1600&q=80",
    stat: "100%",
    statLabel: "Command Position Fit"
  }
];

const RealHomeShowcase: React.FC = () => {
  return (
    <section className="py-28 bg-background border-t border-border/40 relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        
        {/* Editorial Title */}
        <div className="text-center max-w-3xl mx-auto mb-24">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary mb-4">
            Real Home Transformations
          </p>
          <h2 className="text-4xl md:text-6xl font-display font-bold text-foreground mb-6 tracking-tight">
            Loved by Real Homeowners & Interior Designers
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl font-light max-w-2xl mx-auto leading-relaxed">
            See how our spatial intelligence transforms everyday living rooms, apartments, and studios into breathtaking, functional spaces designed for real human life.
          </p>
        </div>

        {/* Alternating Left/Right Z-Pattern Layout (No Tab Buttons, No 4K Badges, No AI Boxes!) */}
        <div className="space-y-28 md:space-y-36">
          {TRANSFORMATIONS.map((item, index) => {
            const isEven = index % 2 === 0; // Even: Image Left / Text Right | Odd: Text Left / Image Right
            return (
              <div 
                key={item.id}
                className={`grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center ${
                  !isEven ? "lg:grid-flow-dense" : ""
                }`}
              >
                {/* Image Column */}
                <div className={`lg:col-span-7 ${!isEven ? "lg:col-start-6" : ""}`}>
                  <div className="relative rounded-[2rem] overflow-hidden shadow-2xl group">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-[400px] md:h-[500px] object-cover object-center transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                    <div className="absolute bottom-6 left-6 text-white">
                      <span className="text-xs uppercase tracking-widest font-bold opacity-80">{item.location}</span>
                    </div>
                  </div>
                </div>

                {/* Text & Narrative Column */}
                <div className={`lg:col-span-5 space-y-8 ${!isEven ? "lg:col-start-1" : ""}`}>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-primary mb-2 block">
                      {item.style}
                    </span>
                    <h3 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-6 leading-tight">
                      {item.title}
                    </h3>
                  </div>

                  {/* Flowing Storytelling without boxed containers */}
                  <div className="space-y-6 border-y border-border/40 py-6">
                    <div className="space-y-1">
                      <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Common Friction (Before)
                      </div>
                      <p className="text-base text-muted-foreground font-light leading-relaxed">
                        "{item.beforeDesc}"
                      </p>
                    </div>

                    <div className="space-y-1">
                      <div className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                        <Check size={16} /> Spatial Harmony (After)
                      </div>
                      <p className="text-base text-foreground font-normal leading-relaxed">
                        "{item.afterDesc}"
                      </p>
                    </div>
                  </div>

                  {/* Stat Highlight */}
                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <div className="text-4xl font-display font-bold text-primary">
                        {item.stat}
                      </div>
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-1">
                        {item.statLabel}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-bold text-foreground/80 pl-4 border-l border-border/60">
                      <ShieldCheck size={18} className="text-primary" /> Verified Ergonomic Fit
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default RealHomeShowcase;
