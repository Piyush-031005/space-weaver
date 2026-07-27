import { motion } from "framer-motion";
import { Share2, Download, Sparkles, CheckCircle2, Sliders, Compass, ShieldCheck, Sun, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SpaceDNAProps {
  spaceData: any;
  onShare?: () => void;
  onDownload?: () => void;
  onCustomize?: () => void;
}

const SpaceDNA: React.FC<SpaceDNAProps> = ({ spaceData, onShare, onDownload, onCustomize }) => {
  if (!spaceData) return null;

  const { genome, roast, confidence } = spaceData;

  const architecturalSpecs = [
    { label: "Seating Distance", value: "8.0 ft exact", sub: "Eye Strain Safe", icon: Compass },
    { label: "Walkway Corridors", value: "36-in Continuous", sub: "Zero Obstacles", icon: ShieldCheck },
    { label: "Daylight Orientation", value: "Glare Free", sub: "Natural Lighting", icon: Sun },
    { label: "Conversation Angle", value: "180° Interactive", sub: "Face-to-Face", icon: Users },
  ];

  return (
    <section id="spacedna" className="py-20 bg-background relative overflow-hidden border-t border-border/40">
      <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row gap-16 items-start">
        
        {/* Left Side - Architectural Storytelling (No AI Tags or Boxes) */}
        <div className="flex-1 space-y-8">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary mb-4">
              Architectural Design Specification
            </p>
            <h2 className="text-4xl md:text-5xl font-display font-bold leading-tight text-foreground">
              Your room is styled as <br/>
              <span className="italic font-normal text-primary">{genome.archetype || "The Curator Studio"}</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-xl mt-4 font-light">
              {genome.tagline || "Designed to give you effortless walking corridors, zero window glare, and maximum everyday comfort."}
            </p>
            
            {/* Editorial Highlights without heavy box borders */}
            <div className="mt-10 pt-8 border-t border-border/40 space-y-6">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
                <CheckCircle2 className="text-primary" size={18} /> Professional Layout Highlights:
              </h3>
              <div className="space-y-4">
                {(roast || [
                  "We placed your main sofa exactly 8 feet from the TV wall to prevent eye strain.",
                  "Side-by-side parallel seating was replaced with an interactive face-to-face arrangement across your coffee table.",
                  "Continuous 36-inch walkways were preserved from your main door so you never bump into furniture."
                ]).map((line: string, i: number) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <p className="text-base text-foreground/90 font-light leading-relaxed">{line}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Side - Clean Editorial Blueprint Card (No Progress Bar Graphs!) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex-1 w-full max-w-lg"
        >
          <div id="spacedna-card" className="bg-card/40 backdrop-blur-md border border-border/50 rounded-[2rem] p-8 md:p-10 shadow-sm relative">
            
            <div className="flex items-center justify-between pb-6 border-b border-border/40 mb-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Specification Sheet</span>
                <h3 className="text-2xl font-display font-bold text-foreground mt-1">Room Ergonomics</h3>
              </div>
              <div className="text-right">
                <span className="text-2xl font-display font-bold text-primary">100%</span>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Practical Fit</p>
              </div>
            </div>

            {/* 2x2 Architectural Spec Grid (Replacing AI Bar Graphs) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              {architecturalSpecs.map((spec, idx) => {
                const Icon = spec.icon;
                return (
                  <div key={idx} className="p-4 rounded-xl bg-background/50 border border-border/30 space-y-1">
                    <div className="flex items-center gap-2 text-primary mb-2">
                      <Icon size={16} />
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{spec.label}</span>
                    </div>
                    <div className="text-lg font-display font-bold text-foreground">{spec.value}</div>
                    <div className="text-xs text-muted-foreground">{spec.sub}</div>
                  </div>
                );
              })}
            </div>

            {/* Practical Actions */}
            <div className="flex flex-col gap-3 w-full">
              <Button 
                onClick={onCustomize}
                className="w-full bg-primary text-primary-foreground rounded-xl hover:scale-[1.01] transition-transform font-bold py-6 shadow-sm flex items-center justify-center gap-2"
              >
                <Sliders size={18} /> Customize This Arrangement
              </Button>
              <div className="flex gap-3 w-full">
                <Button 
                  onClick={onShare}
                  variant="outline"
                  className="flex-1 rounded-xl border-border/50 hover:bg-muted font-semibold py-5"
                >
                  <Share2 className="w-4 h-4 mr-2 text-primary" /> Share Blueprint
                </Button>
                <Button 
                  onClick={onDownload}
                  variant="outline"
                  className="rounded-xl border-border/50 hover:bg-muted px-5 py-5"
                  title="Download Blueprint Specification"
                >
                  <Download className="w-4 h-4 text-foreground" />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default SpaceDNA;
