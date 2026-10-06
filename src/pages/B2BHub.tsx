import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw, Layers } from "lucide-react";
import { useNavigate } from "react-router-dom";
import B2BVisualizer from "@/components/B2BVisualizer";

export default function B2BHub() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"exam" | "parking">("exam");

  // Exam Hall State
  const [examRoomW, setExamRoomW] = useState<number>(30);
  const [examRoomL, setExamRoomL] = useState<number>(25);
  const [examResult, setExamResult] = useState<any>(null);
  const [examLoading, setExamLoading] = useState(false);

  // Parking Lot State
  const [parkRoomW, setParkRoomW] = useState<number>(150);
  const [parkRoomL, setParkRoomL] = useState<number>(200);
  const [parkResult, setParkResult] = useState<any>(null);
  const [parkLoading, setParkLoading] = useState(false);

  const generateExam = async () => {
    setExamLoading(true);
    try {
      const res = await fetch("/api/exam-hall", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room: { width: examRoomW, length: examRoomL } }),
      });
      const data = await res.json();
      setExamResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setExamLoading(false);
    }
  };

  const generateParking = async () => {
    setParkLoading(true);
    try {
      const res = await fetch("/api/parking-lot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plot: { width: parkRoomW, length: parkRoomL } }),
      });
      const data = await res.json();
      setParkResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setParkLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar onGetStarted={() => navigate("/")} />
      
      <div className="container mx-auto px-6 pt-24 md:pt-28 pb-12 flex-1">
        <div className="flex flex-col md:flex-row items-center justify-between mb-8">
          <Button variant="ghost" onClick={() => navigate("/")} className="gap-2 text-foreground/80">
            <ArrowLeft size={16} /> Back to Home
          </Button>
          <div className="flex space-x-2 mt-4 md:mt-0 bg-muted/40 p-1.5 rounded-xl border border-border/40">
            <button
              onClick={() => setActiveTab("exam")}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                activeTab === "exam" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Exam Hall Seating
            </button>
            <button
              onClick={() => setActiveTab("parking")}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                activeTab === "parking" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Commercial Parking
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="p-6 bg-card border border-border/50 rounded-2xl">
              <h2 className="text-xl font-bold mb-2">
                {activeTab === "exam" ? "Exam Hall Configuration" : "Parking Lot Configuration"}
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                {activeTab === "exam" 
                  ? "Enforces UGC/CBSE spacing (1m distance) and invigilator aisles (3ft)." 
                  : "Enforces NBC 2016 norms (2.5m x 5m standard, 6m driveways, ADA buffers)."}
              </p>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">
                    {activeTab === "exam" ? "Hall Width (ft)" : "Plot Width (ft)"}
                  </label>
                  <input
                    type="number"
                    value={activeTab === "exam" ? examRoomW : parkRoomW}
                    onChange={(e) => activeTab === "exam" ? setExamRoomW(Number(e.target.value)) : setParkRoomW(Number(e.target.value))}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">
                    {activeTab === "exam" ? "Hall Length (ft)" : "Plot Length (ft)"}
                  </label>
                  <input
                    type="number"
                    value={activeTab === "exam" ? examRoomL : parkRoomL}
                    onChange={(e) => activeTab === "exam" ? setExamRoomL(Number(e.target.value)) : setParkRoomL(Number(e.target.value))}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground"
                  />
                </div>
                
                <Button 
                  onClick={activeTab === "exam" ? generateExam : generateParking}
                  disabled={activeTab === "exam" ? examLoading : parkLoading}
                  className="w-full mt-4"
                >
                  {(activeTab === "exam" ? examLoading : parkLoading) ? (
                    <RefreshCw className="animate-spin mr-2" size={16} />
                  ) : (
                    <Layers className="mr-2" size={16} />
                  )}
                  Generate Compliance Layout
                </Button>
              </div>
            </div>
          </div>

          {/* Results Area */}
          <div className="lg:col-span-8">
            <div className="p-6 bg-muted/10 border border-border/40 rounded-2xl min-h-[500px]">
              {activeTab === "exam" && !examResult && !examLoading && (
                <div className="flex items-center justify-center h-full text-muted-foreground">Enter dimensions and generate to see seating layout.</div>
              )}
              {activeTab === "parking" && !parkResult && !parkLoading && (
                <div className="flex items-center justify-center h-full text-muted-foreground">Enter dimensions and generate to see parking lot layout.</div>
              )}
              
              {/* Exam Result Display */}
              {activeTab === "exam" && examResult && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="flex justify-between items-center border-b border-border/30 pb-4">
                    <h3 className="text-2xl font-bold">Generated Exam Seating</h3>
                    <div className="text-right">
                      <div className="text-3xl font-display text-primary">{examResult.capacity}</div>
                      <div className="text-xs text-muted-foreground uppercase tracking-widest">Total Seats</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-background rounded-xl border border-border/50">
                      <div className="text-xl font-semibold">{examResult.rowCount} × {examResult.colCount}</div>
                      <div className="text-[10px] text-muted-foreground uppercase">Grid Matrix</div>
                    </div>
                    <div className="p-4 bg-background rounded-xl border border-border/50">
                      <div className="text-xl font-semibold">{examResult.density}%</div>
                      <div className="text-[10px] text-muted-foreground uppercase">Area Density</div>
                    </div>
                  </div>

                  <B2BVisualizer type="exam" data={examResult} widthFt={examRoomW} lengthFt={examRoomL} />

                  <div className="mt-8">
                    <h4 className="font-semibold mb-3">Compliance Report</h4>
                    <div className="space-y-2">
                      {examResult.compliance?.checks?.map((check: any, i: number) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-background rounded-lg border border-border/30">
                          <div className="flex items-center gap-3">
                            <span className={check.pass ? "text-green-500" : "text-red-500"}>
                              {check.pass ? "✅" : "❌"}
                            </span>
                            <span className="text-sm font-medium">{check.rule}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">{check.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Parking Result Display */}
              {activeTab === "parking" && parkResult && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="flex justify-between items-center border-b border-border/30 pb-4">
                    <h3 className="text-2xl font-bold">Commercial Parking Layout</h3>
                    <div className="text-right">
                      <div className="text-3xl font-display text-primary">{parkResult.capacity}</div>
                      <div className="text-xs text-muted-foreground uppercase tracking-widest">Total Vehicles</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-background rounded-xl border border-border/50">
                      <div className="text-xl font-semibold">{parkResult.metrics.standardSpots}</div>
                      <div className="text-[10px] text-muted-foreground uppercase">Standard Bays</div>
                    </div>
                    <div className="p-4 bg-background rounded-xl border border-border/50">
                      <div className="text-xl font-semibold text-blue-400">{parkResult.metrics.adaSpots}</div>
                      <div className="text-[10px] text-muted-foreground uppercase">ADA / Disabled Bays</div>
                    </div>
                    <div className="p-4 bg-background rounded-xl border border-border/50">
                      <div className="text-xl font-semibold">{parkResult.metrics.areaPerCarSqFt} sq.ft</div>
                      <div className="text-[10px] text-muted-foreground uppercase">Efficiency / Car</div>
                    </div>
                  </div>

                  <B2BVisualizer type="parking" data={parkResult} widthFt={parkRoomW} lengthFt={parkRoomL} />

                  <div className="mt-8">
                    <h4 className="font-semibold mb-3">NBC 2016 Compliance</h4>
                    <div className="space-y-2">
                      {parkResult.compliance?.checks?.map((check: any, i: number) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-background rounded-lg border border-border/30">
                          <div className="flex items-center gap-3">
                            <span className={check.pass ? "text-green-500" : "text-red-500"}>
                              {check.pass ? "✅" : "❌"}
                            </span>
                            <span className="text-sm font-medium">{check.rule}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">{check.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
