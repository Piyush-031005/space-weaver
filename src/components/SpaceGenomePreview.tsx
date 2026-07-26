import { motion } from "framer-motion";
import { BrainCircuit, Activity, Eye, Focus, Flame, Lock, Users, Maximize, Sparkles, CheckCircle2 } from "lucide-react";

const SpaceGenomePreview = () => {
  const metrics = [
    { label: "Walking Space", value: 85, icon: Activity },
    { label: "Natural Daylight", value: 92, icon: Eye },
    { label: "Peace & Calm", value: 88, icon: BrainCircuit },
    { label: "Work Focus", value: 95, icon: Focus },
    { label: "Cozy Warmth", value: 90, icon: Flame },
    { label: "Social Privacy", value: 82, icon: Lock },
    { label: "Party Gathering", value: 86, icon: Users },
    { label: "Breathing Room", value: 89, icon: Maximize },
  ];

  return (
    <section className="py-24 bg-background relative overflow-hidden border-t border-border/50">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-semibold uppercase tracking-widest mb-6">
              <Sparkles size={14} /> Practical Spatial Intelligence
            </div>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-6 leading-tight">
              Every room has its own <br />
              <span className="italic text-primary font-normal">Natural Harmony</span>.
            </h2>
            <p className="text-muted-foreground font-body text-lg leading-relaxed mb-8">
              We don't just place furniture randomly. Our engine analyzes how you walk, relax, host friends, and watch TV to organize your room for effortless everyday living.
            </p>
            <div className="p-6 bg-card border border-border/80 rounded-3xl shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 text-primary">
                <BrainCircuit size={100} />
              </div>
              <h3 className="font-bold text-sm text-foreground mb-2 uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="text-primary" size={18} /> Expert Interior Designer Insight:
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                "Your living room currently feels cramped near the balcony door. By arranging your sofas in an interactive 180° face-to-face layout across your coffee table, we instantly unlock 42% more walking space!"
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="p-8 lg:p-10 rounded-3xl bg-card border border-border/80 shadow-xl relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="flex justify-between items-end mb-8 pb-6 border-b border-border/60">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-1">Living Style Profile</p>
                <h3 className="text-3xl font-display font-bold text-foreground">The Curator Studio</h3>
              </div>
              <div className="text-right">
                <span className="text-3xl font-display font-bold text-primary">94%</span>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Harmony Match</p>
              </div>
            </div>

            <div className="space-y-4">
              {metrics.map((m, i) => {
                const Icon = m.icon;
                return (
                  <div key={m.label} className="flex items-center gap-4">
                    <div className="text-primary flex-shrink-0">
                      <Icon size={16} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-foreground/90">{m.label}</span>
                        <span className="text-primary font-bold">{m.value}%</span>
                      </div>
                      <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${m.value}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: i * 0.08, ease: "easeOut" }}
                          className="bg-primary h-full rounded-full"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default SpaceGenomePreview;
