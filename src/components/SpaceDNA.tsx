import { motion } from "framer-motion";
import { Share2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SpaceDNAProps {
  spaceData: any;
  onShare?: () => void;
  onDownload?: () => void;
}

const SpaceDNA: React.FC<SpaceDNAProps> = ({ spaceData, onShare, onDownload }) => {
  if (!spaceData) return null;

  const { genome, roast } = spaceData;
  const scoresArray = [
    { label: "Flow", value: genome.scores.flow },
    { label: "Light", value: genome.scores.light },
    { label: "Calm", value: genome.scores.calm },
    { label: "Focus", value: genome.scores.focus },
    { label: "Warmth", value: genome.scores.warmth },
    { label: "Privacy", value: genome.scores.privacy },
  ];
  return (
    <section id="spacedna" className="section-padding bg-background relative overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 items-center">
        
        {/* Left Side - Text */}
        <div className="flex-1 space-y-8">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <p className="text-[10px] uppercase tracking-[0.5em] text-accent mb-6 font-body font-medium">
              Space Identity
            </p>
            <h2 className="text-4xl md:text-5xl font-display font-bold leading-tight">
              Your space behaves like <br/>
              <span className="italic font-normal text-accent">{genome.archetype}</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
              {genome.tagline}
            </p>
            
            {/* AI ROAST CRITIC SECTION */}
            <div className="mt-8 p-6 bg-muted/30 rounded-2xl border border-border/50">
              <h3 className="text-sm font-semibold text-accent mb-4 uppercase tracking-wider">AI Interior Critic Says:</h3>
              <ul className="space-y-3">
                {roast.map((line: string, i: number) => (
                  <li key={i} className="text-muted-foreground flex items-start gap-2">
                    <span className="text-accent mt-1">{"→"}</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>

        {/* Right Side - The DNA Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 40 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="flex-1 w-full max-w-md relative"
        >
          <div id="spacedna-card" className="relative rounded-[2rem] bg-background/50 p-10 overflow-hidden">
            {/* Geometric Glyph Background */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 flex flex-col items-center">
              <h3 className="text-sm uppercase tracking-[0.3em] font-medium text-muted-foreground mb-8">
                Your Space DNA
              </h3>
              
              {/* Dynamic Glyph Placeholder */}
              <div className="relative w-40 h-40 mb-10 flex items-center justify-center">
                <motion.svg
                  viewBox="0 0 100 100"
                  className="w-full h-full text-accent drop-shadow-md"
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                >
                  <polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3" />
                  <polygon points="50,15 80,32.5 80,67.5 50,85 20,67.5 20,32.5" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.6" />
                  <polygon points="50,25 65,37.5 65,62.5 50,75 35,62.5 35,37.5" fill="currentColor" opacity="0.8" />
                  
                  {/* Outer orbiting ring */}
                  <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 8" opacity="0.4" />
                </motion.svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-display font-semibold text-primary">87<span className="text-sm">%</span></span>
                </div>
              </div>

              {/* Scores Grid */}
              <div className="w-full grid grid-cols-2 gap-x-6 gap-y-4 mb-10">
                {scoresArray.map((score, i) => (
                  <div key={i} className="flex flex-col">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{score.label}</span>
                      <span className="text-xs font-semibold">{score.value}%</span>
                    </div>
                    <div className="h-1 w-full bg-border/40 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${score.value}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.5 + i * 0.1, ease: "easeOut" }}
                        className="h-full bg-accent"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-4 w-full mt-6">
                <Button 
                  onClick={onShare}
                  className="flex-1 bg-primary text-primary-foreground rounded-xl hover:scale-105 transition-transform"
                >
                  <Share2 className="w-4 h-4 mr-2" /> Share Result
                </Button>
                <Button 
                  onClick={onDownload}
                  variant="outline" size="icon" 
                  className="rounded-xl border-border/50 hover:bg-accent/5"
                >
                  <Download className="w-4 h-4" />
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
