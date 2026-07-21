import React from "react";
import { Check } from "lucide-react";

interface LayoutOption {
  id: string;
  name: string;
  desc: string;
  layout: any[];
  clearanceScores: any;
  genome: any;
  roast: string[];
}

interface LayoutGalleryProps {
  options: LayoutOption[];
  activeIndex: number;
  onSelect: (index: number) => void;
}

const LayoutGallery: React.FC<LayoutGalleryProps> = ({ options, activeIndex, onSelect }) => {
  if (!options || options.length === 0) return null;

  return (
    <section className="py-12 bg-muted/20 border-t border-border/50">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="font-display font-semibold text-3xl mb-3">Generated Layouts</h2>
          <p className="text-muted-foreground">
            Our spatial AI generated multiple ways to arrange your room. Click on a layout below to instantly see the furniture reconfigure in 3D.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {options.map((opt, idx) => (
            <div
              key={opt.id}
              onClick={() => onSelect(idx)}
              className={`relative cursor-pointer overflow-hidden rounded-2xl border transition-all duration-300 p-6 ${
                activeIndex === idx 
                  ? "border-primary bg-primary/5 shadow-md scale-[1.02]" 
                  : "border-border/50 bg-background hover:border-primary/50 hover:shadow-sm"
              }`}
            >
              {activeIndex === idx && (
                <div className="absolute top-4 right-4 bg-primary text-primary-foreground p-1 rounded-full shadow-sm">
                  <Check size={14} strokeWidth={3} />
                </div>
              )}
              
              <div className="mb-4 inline-flex px-3 py-1 bg-muted rounded-full text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                Option {idx + 1}
              </div>
              <h3 className={`text-xl font-bold mb-2 ${activeIndex === idx ? "text-primary" : "text-foreground"}`}>
                {opt.name}
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                {opt.desc}
              </p>

              {/* Mini radar visualization (abstract) */}
              <div className={`h-32 w-full rounded-xl border flex items-center justify-center bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] ${activeIndex === idx ? "border-primary/30" : "border-border/50"}`}>
                 <div className="grid grid-cols-2 gap-2 p-4 w-full h-full opacity-60">
                    {/* Abstract dots representing furniture positioning */}
                    {opt.id === 'space_saver' && (
                      <>
                        <div className="w-full h-4 bg-foreground/20 rounded-sm self-start"></div>
                        <div className="w-4 h-full bg-foreground/20 rounded-sm justify-self-end"></div>
                      </>
                    )}
                    {opt.id === 'cozy' && (
                      <>
                        <div className="w-8 h-8 bg-foreground/30 rounded-md place-self-center"></div>
                        <div className="w-6 h-6 bg-foreground/20 rounded-full place-self-center"></div>
                        <div className="w-10 h-4 bg-foreground/20 rounded-sm place-self-center"></div>
                      </>
                    )}
                    {opt.id === 'aesthetic' && (
                      <>
                        <div className="w-6 h-6 bg-foreground/20 rounded-sm place-self-center"></div>
                        <div className="w-8 h-4 bg-foreground/30 rounded-sm justify-self-center mt-4"></div>
                        <div className="w-6 h-6 bg-foreground/20 rounded-sm place-self-center"></div>
                      </>
                    )}
                 </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LayoutGallery;
