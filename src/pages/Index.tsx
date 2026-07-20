import Navbar from "@/components/Navbar";
import WebGLHero from "@/components/WebGLHero";
import SpaceDNA from "@/components/SpaceDNA";
import AffiliateShowcase from "@/components/AffiliateShowcase";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <WebGLHero />

      <SpaceDNA />
      <AffiliateShowcase />
      <Footer />
    </div>
  );
};

export default Index;
