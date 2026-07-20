import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "Define Your Space",
    description: "Enter your room dimensions — width, height, and shape. Our system adapts to any floor plan.",
  },
  {
    number: "02",
    title: "Add Your Furniture",
    description: "Select from our library or add custom pieces with exact dimensions and placement priorities.",
  },
  {
    number: "03",
    title: "Generate Layouts",
    description: "Our AI creates multiple optimized arrangements ranked by efficiency, flow, and aesthetics.",
  },
  {
    number: "04",
    title: "Perfect & Export",
    description: "Fine-tune your favorite layout, get smart design suggestions, and export as high-res PDF.",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="section-padding bg-background">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-28"
        >
          <p className="text-[10px] uppercase tracking-[0.5em] text-muted-foreground mb-6 font-body font-medium">
            Simple Process
          </p>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-display font-semibold text-foreground leading-[0.95]">
            How It <span className="italic font-normal">Works</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 md:gap-12">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="relative group"
            >
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-full w-full h-px bg-gradient-to-r from-accent/20 to-transparent" />
              )}

              <span className="text-8xl md:text-9xl font-display font-bold text-accent/10 select-none leading-none group-hover:text-accent/20 transition-colors duration-500">
                {step.number}
              </span>
              <h3 className="text-xl font-display font-semibold text-foreground mt-6 mb-4">
                {step.title}
              </h3>
              <p className="text-muted-foreground font-body text-sm leading-relaxed font-light">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
