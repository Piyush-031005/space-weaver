import Navbar from "@/components/Navbar";
import WebGLHero from "@/components/WebGLHero";

import HowItWorksSection from "@/components/HowItWorksSection";
import ShowcaseSection from "@/components/ShowcaseSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <WebGLHero />

      <HowItWorksSection />
      <ShowcaseSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
