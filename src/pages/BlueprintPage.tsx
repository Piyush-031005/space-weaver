import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BlueprintVisualizer from "@/components/BlueprintVisualizer";
import { useNavigate } from "react-router-dom";

export default function BlueprintPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar onGetStarted={() => navigate('/')} />
      <div className="pt-20 flex-1">
        <BlueprintVisualizer />
      </div>
      <Footer />
    </div>
  );
}
