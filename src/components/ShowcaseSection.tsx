import { motion } from "framer-motion";
import { ArrowRight, TrendingUp, Maximize, Smile } from "lucide-react";

const metrics = [
  { icon: TrendingUp, value: "92%", label: "Space Efficiency" },
  { icon: Maximize, value: "35%", label: "More Free Area" },
  { icon: Smile, value: "4.9", label: "Comfort Score" },
];

const ShowcaseSection = () => {
  return (
    <section id="showcase" className="section-padding bg-card">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-28"
        >
          <p className="text-[10px] uppercase tracking-[0.5em] text-muted-foreground mb-6 font-body font-medium">
            Transformation Engine
          </p>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-display font-semibold text-foreground leading-[0.95]">
            Before → <span className="italic font-normal">After Magic</span>
          </h2>
        </motion.div>

        {/* Before/After visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="relative rounded-[2.5rem] overflow-hidden bg-background border border-border/30 mb-28 shadow-lg"
        >
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Before */}
            <div className="p-16 md:p-24 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-border/30 min-h-[400px]">
              <div className="relative w-56 h-56 mb-10">
                <div className="absolute w-14 h-14 bg-accent/25 rounded-lg rotate-45 top-2 left-6 shadow-md" />
                <div className="absolute w-20 h-12 bg-primary/15 rounded-md -rotate-12 top-18 right-2 shadow-sm" />
                <div className="absolute w-12 h-18 bg-secondary rounded-md rotate-[30deg] bottom-6 left-4 shadow-md" />
                <div className="absolute w-16 h-16 bg-accent/15 rounded-full bottom-0 right-6 shadow-sm" />
                <div className="absolute w-10 h-14 bg-primary/10 rounded-sm rotate-[60deg] top-10 left-22 shadow-sm" />
              </div>
              <span className="text-[9px] uppercase tracking-[0.4em] text-muted-foreground font-body font-medium">Before — Chaos</span>
            </div>

            {/* After */}
            <div className="p-16 md:p-24 flex flex-col items-center justify-center min-h-[400px]">
              <div className="relative w-56 h-56 mb-10 border border-dashed border-accent/15 rounded-2xl p-4">
                <div className="absolute w-20 h-12 bg-primary/25 rounded-md bottom-5 left-5 shadow-sm" />
                <div className="absolute w-14 h-14 bg-accent/30 rounded-lg top-5 right-5 shadow-sm" />
                <div className="absolute w-12 h-12 bg-secondary rounded-md top-5 left-5 shadow-sm" />
                <div className="absolute w-10 h-10 bg-accent/15 rounded-full bottom-5 right-5 shadow-sm" />
                <div className="absolute w-28 h-8 bg-primary/10 rounded-sm bottom-18 left-1/2 -translate-x-1/2 shadow-sm" />
              </div>
              <span className="text-[9px] uppercase tracking-[0.4em] text-muted-foreground font-body font-medium">After — Perfect</span>
            </div>
          </div>

          {/* Center divider icon */}
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-xl"
            whileHover={{ scale: 1.1, rotate: 90 }}
            transition={{ duration: 0.4 }}
          >
            <ArrowRight className="w-5 h-5 text-primary-foreground" />
          </motion.div>
        </motion.div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {metrics.map((metric, i) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.14, ease: [0.22, 1, 0.36, 1] }}
              className="text-center p-12 group"
            >
              <metric.icon className="w-7 h-7 text-accent mx-auto mb-6 group-hover:scale-110 transition-transform duration-500" strokeWidth={1.2} />
              <p className="text-6xl md:text-7xl font-display font-bold text-foreground mb-4">
                {metric.value}
              </p>
              <p className="text-[9px] text-muted-foreground uppercase tracking-[0.4em] font-body font-medium">
                {metric.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ShowcaseSection;
