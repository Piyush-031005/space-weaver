import { motion } from "framer-motion";
import { ArrowRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

import sofaImg from "@/assets/furniture/sofa.png";
import tableImg from "@/assets/furniture/table.png";
import lampImg from "@/assets/furniture/lamp.png";

const products = [
  {
    id: 1,
    name: "Aura Minimalist Sofa",
    brand: "Design Within Reach",
    price: "$1,299",
    image: sofaImg,
    link: "#",
  },
  {
    id: 2,
    name: "Walnut Dining Table",
    brand: "Herman Miller",
    price: "$2,450",
    image: tableImg,
    link: "#",
  },
  {
    id: 3,
    name: "Ambient Floor Lamp",
    brand: "Flos",
    price: "$450",
    image: lampImg,
    link: "#",
  },
];

const AffiliateShowcase = () => {
  return (
    <section className="section-padding bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-[10px] uppercase tracking-[0.5em] text-accent mb-4 font-body font-medium">
              Shop The Look
            </p>
            <h2 className="text-3xl md:text-5xl font-display font-semibold text-foreground">
              Curated for your <span className="italic font-normal">Space DNA</span>
            </h2>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Button variant="link" className="text-foreground hover:text-accent font-medium p-0">
              View full manifest <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product, i) => (
            <motion.a
              href={product.link}
              key={product.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              whileHover={{ y: -8 }}
              className="group block relative bg-transparent rounded-[1.5rem] p-6 overflow-hidden transition-all hover:bg-accent/5"
            >
              <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <ExternalLink className="w-5 h-5 text-accent" />
              </div>
              
              <div className="h-48 w-full flex items-center justify-center mb-8 p-4">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-contain filter drop-shadow-lg group-hover:scale-105 transition-transform duration-500" 
                />
              </div>
              
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                  {product.brand}
                </p>
                <div className="flex justify-between items-center">
                  <h3 className="font-display text-lg font-semibold text-foreground">
                    {product.name}
                  </h3>
                  <span className="font-body font-medium text-sm text-foreground">
                    {product.price}
                  </span>
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AffiliateShowcase;
