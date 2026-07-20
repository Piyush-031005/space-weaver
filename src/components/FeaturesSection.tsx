import { motion } from "framer-motion";
import { Maximize2, Sparkles, LayoutGrid, Zap } from "lucide-react";

const features = [
  {
    icon: Maximize2,
    title: "Space Optimization",
    description: "AI analyzes every inch to maximize usable area while maintaining perfect flow and circulation paths.",
  },
  {
    icon: LayoutGrid,
    title: "Multiple Layouts",
    description: "Generate 3–5 unique arrangement options ranked by efficiency, comfort, and aesthetic harmony.",
  },
  {
    icon: Sparkles,
    title: "Aesthetic Intelligence",
    description: "Smart suggestions for decor placement, color coordination, and visual balance within your space.",
  },
  {
    icon: Zap,
    title: "Instant Results",
    description: "Optimized room layouts generated in under 10 seconds with real-time interactive preview.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="section-padding bg-card">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-28"
        >
          <p className="text-[10px] uppercase tracking-[0.5em] text-muted-foreground mb-6 font-body font-medium">
            Why SpaceFlow
          </p>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-display font-semibold text-foreground leading-[0.95]">
            Design Smarter,<br className="hidden md:block" />
            <span className="italic font-normal"> Not Harder</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -8, transition: { duration: 0.4 } }}
              className="group p-10 lg:p-12 rounded-3xl bg-background border border-border/30 hover:border-accent/25 hover:shadow-card-hover transition-all duration-500"
            >
              <div className="w-14 h-14 rounded-2xl bg-accent/8 flex items-center justify-center mb-8 group-hover:bg-accent/15 group-hover:scale-110 transition-all duration-500">
                <feature.icon className="w-6 h-6 text-accent" strokeWidth={1.3} />
              </div>
              <h3 className="text-lg font-display font-semibold text-foreground mb-4">{feature.title}</h3>
              <p className="text-muted-foreground font-body text-sm leading-relaxed font-light">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
