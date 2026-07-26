import React, { useState } from "react";
import { Sparkles, Check, ArrowRight, Home, Heart, ShieldCheck } from "lucide-react";

interface RealTransformation {
  id: string;
  title: string;
  style: string;
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
    beforeDesc: "Desk faced a blank wall while the seating area suffered from awkward acoustic reflection.",
    afterDesc: "Positioned the desk in the architectural command position with professional background framing and natural side-lighting.",
    imageUrl: "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1600&q=80",
    stat: "100%",
    statLabel: "Video Conference Ready"
  }
];

const RealHomeShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<number>(0);

  return (
    <section className="py-20 bg-background border-t border-border/50 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-semibold uppercase tracking-widest mb-4">
            <Home size={14} /> Real Home Transformations
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4 tracking-tight">
            Loved by Real Homeowners & Interior Designers
          </h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            See how our spatial intelligence transforms everyday living rooms, apartments, and studios into breathtaking, functional spaces designed for real human life.
          </p>
        </div>

        {/* Style Selector Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 mb-10">
          {TRANSFORMATIONS.map((item, index) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(index)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                activeTab === index
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-105"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-accent" />
              {item.style}
            </button>
          ))}
        </div>

        {/* Featured Transformation Card */}
        <div className="bg-card border border-border/80 rounded-3xl overflow-hidden shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-0 transition-all duration-500">
          {/* High-Resolution Photography Column */}
          <div className="lg:col-span-7 relative min-h-[350px] md:min-h-[450px] overflow-hidden group">
            <img
              src={TRANSFORMATIONS[activeTab].imageUrl}
              alt={TRANSFORMATIONS[activeTab].title}
              className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent lg:hidden" />
            <div className="absolute bottom-6 left-6 right-6 lg:hidden text-white">
              <span className="px-3 py-1 bg-primary/90 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider">
                {TRANSFORMATIONS[activeTab].style}
              </span>
              <h3 className="text-2xl font-display font-bold mt-2">
                {TRANSFORMATIONS[activeTab].title}
              </h3>
            </div>
            <div className="absolute top-6 right-6 bg-black/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 text-white flex items-center gap-2 shadow-lg">
              <Sparkles className="text-accent" size={16} />
              <span className="text-xs font-semibold">4K Real Photography</span>
            </div>
          </div>

          {/* Practical Design Narrative Column */}
          <div className="lg:col-span-5 p-8 md:p-12 flex flex-col justify-between bg-card/95 backdrop-blur-sm">
            <div>
              <div className="hidden lg:flex items-center gap-2 mb-3">
                <span className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-bold uppercase tracking-wider">
                  {TRANSFORMATIONS[activeTab].style}
                </span>
                <span className="px-3 py-1 bg-accent/15 text-accent rounded-full text-xs font-bold">
                  Verified Result
                </span>
              </div>
              
              <h3 className="hidden lg:block text-3xl font-display font-bold text-foreground mb-6">
                {TRANSFORMATIONS[activeTab].title}
              </h3>

              <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-destructive/5 border border-destructive/20">
                  <div className="text-xs font-bold uppercase tracking-wider text-destructive mb-1 flex items-center gap-1.5">
                    <span>⚠️ Before (Common Friction)</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    "{TRANSFORMATIONS[activeTab].beforeDesc}"
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1 flex items-center gap-1.5">
                    <Check size={16} /> After (Spatial Harmony)
                  </div>
                  <p className="text-sm text-foreground/90 font-medium leading-relaxed">
                    "{TRANSFORMATIONS[activeTab].afterDesc}"
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-border/60 flex items-center justify-between">
              <div>
                <div className="text-3xl md:text-4xl font-display font-bold text-primary">
                  {TRANSFORMATIONS[activeTab].stat}
                </div>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {TRANSFORMATIONS[activeTab].statLabel}
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground bg-muted/60 px-3 py-2 rounded-xl border border-border/40">
                <ShieldCheck size={16} className="text-primary" /> 100% Practical Layout
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RealHomeShowcase;
