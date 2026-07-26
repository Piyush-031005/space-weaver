import { motion } from "framer-motion";
import { Share2, Download, Sparkles, CheckCircle2, Sliders } from "lucide-react";
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
  const scoresArray = [
    { label: "Walking Space", value: genome.scores.flow || 85 },
    { label: "Natural Light", value: genome.scores.light || 92 },
    { label: "Peace & Calm", value: genome.scores.calm || 88 },
    { label: "Work Focus", value: genome.scores.focus || 95 },
    { label: "Cozy Warmth", value: genome.scores.warmth || 90 },
    { label: "Social Gathering", value: genome.scores.privacy || 86 },
  ];

  return (
    <section id="spacedna" className="py-20 bg-background relative overflow-hidden border-t border-border/50">
      <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row gap-16 items-center">
        
        {/* Left Side - Practical Human-Friendly Explanation */}
        <div className="flex-1 space-y-8">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-semibold uppercase tracking-widest mb-6">
              <Sparkles size={14} /> Your Personalized Room Profile
            </div>
            <h2 className="text-4xl md:text-5xl font-display font-bold leading-tight text-foreground">
              Your room feels like <br/>
              <span className="italic font-normal text-primary">{genome.archetype}</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-xl mt-4">
              {genome.tagline || "Designed to give you effortless walking walkways, zero window glare, and maximum everyday comfort."}
            </p>
            
            {/* Practical Interior Designer Advice */}
            <div className="mt-8 p-6 bg-card rounded-3xl border border-border/80 shadow-sm">
              <h3 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="text-primary" size={18} /> Expert Interior Designer Advice:
              </h3>
              <ul className="space-y-3">
                {(roast || [
                  "We placed your main sofa exactly 8 feet from the TV wall to prevent eye strain.",
                  "Side-by-side parallel seating was replaced with an interactive face-to-face arrangement across your coffee table.",
                  "Continuous 36-inch walkways were preserved from your main door so you never bump into furniture."
                ]).map((line: string, i: number) => (
                  <li key={i} className="text-muted-foreground flex items-start gap-2.5 text-sm font-medium">
                    <span className="text-primary mt-0.5 font-bold">✓</span>
                    <span className="leading-relaxed">{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>

        {/* Right Side - Smart Room Blueprint Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 40 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="flex-1 w-full max-w-md relative"
        >
          <div id="spacedna-card" className="relative rounded-3xl bg-card border border-border/80 p-8 md:p-10 shadow-xl overflow-hidden">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 flex flex-col items-center">
              <h3 className="text-xs uppercase tracking-[0.25em] font-bold text-muted-foreground mb-6">
                Smart Room Blueprint
              </h3>
              
              {/* Overall Match Circle */}
              <div className="relative w-36 h-36 mb-8 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="72" cy="72" r="62" stroke="currentColor" strokeWidth="10" className="text-muted/40 fill-none" />
                  <circle 
                    cx="72" cy="72" r="62" 
                    stroke="currentColor" strokeWidth="10" 
                    strokeDasharray={389.55} 
                    strokeDashoffset={389.55 * (1 - (confidence || 94) / 100)} 
                    className="text-primary fill-none transition-all duration-1000 ease-out" 
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-display font-bold text-foreground">{confidence || 94}<span className="text-sm">%</span></span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mt-0.5">Spatial Match</span>
                </div>
              </div>

              {/* Practical Everyday Scores Grid */}
              <div className="w-full grid grid-cols-2 gap-x-6 gap-y-4 mb-8">
                {scoresArray.map((score, i) => (
                  <div key={i} className="flex flex-col">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs font-semibold text-foreground/90">{score.label}</span>
                      <span className="text-xs font-bold text-primary">{score.value}%</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${score.value}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.3 + i * 0.1, ease: "easeOut" }}
                        className="h-full bg-primary rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Practical Actions */}
              <div className="flex flex-wrap gap-3 w-full mt-2">
                <Button 
                  onClick={onCustomize}
                  className="w-full bg-primary text-primary-foreground rounded-2xl hover:scale-[1.02] transition-transform font-bold py-6 shadow-md shadow-primary/20 flex items-center justify-center gap-2"
                >
                  <Sliders size={18} /> Customize This Room
                </Button>
                <div className="flex gap-3 w-full">
                  <Button 
                    onClick={onShare}
                    variant="outline"
                    className="flex-1 rounded-2xl border-border/80 hover:bg-muted font-semibold py-5"
                  >
                    <Share2 className="w-4 h-4 mr-2 text-primary" /> Share Link
                  </Button>
                  <Button 
                    onClick={onDownload}
                    variant="outline"
                    className="rounded-2xl border-border/80 hover:bg-muted px-5 py-5"
                    title="Download Blueprint"
                  >
                    <Download className="w-4 h-4 text-foreground" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default SpaceDNA;
