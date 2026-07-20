import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const CTASection = () => {
  return (
    <section id="cta" className="section-padding bg-background relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-accent/5 blur-[140px]" />
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="text-4xl md:text-6xl lg:text-[5.5rem] font-display font-semibold text-foreground mb-10 leading-[0.9] text-balance">
            Your Space Deserves
            <br />
            <span className="italic font-normal">Better Design.</span>
          </h2>
          <p className="text-base md:text-lg text-muted-foreground font-body max-w-lg mx-auto mb-16 leading-relaxed font-light">
            Stop adjusting to your space. Let your space adjust to you.
          </p>
          <div className="flex flex-wrap gap-5 justify-center">
            <Button variant="hero" size="lg" className="rounded-full px-14 py-7 text-sm shadow-hero hover:scale-[1.03] transition-transform duration-300">
              Start Designing Now
            </Button>
            <Button variant="heroOutline" size="lg" className="rounded-full px-14 py-7 text-sm hover:scale-[1.03] transition-transform duration-300">
              Explore More
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
