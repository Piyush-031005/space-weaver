import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RoomRenovationStudio from "@/components/RoomRenovationStudio";
import { useNavigate } from "react-router-dom";

export default function RenovationPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar onGetStarted={() => navigate('/')} />
      <div className="pt-20 flex-1">
        <RoomRenovationStudio />
      </div>
      <Footer />
    </div>
  );
}
