import React, { useRef, useEffect } from "react";

interface B2BVisualizerProps {
  type: "exam" | "parking";
  data: any;
  widthFt: number;
  lengthFt: number;
}

const B2BVisualizer: React.FC<B2BVisualizerProps> = ({ type, data, widthFt, lengthFt }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  if (!data) return null;

  // We'll use a relative coordinate system. 0,0 is top-left.
  // The container will maintain the aspect ratio of the room/plot.
  const aspectRatio = lengthFt / widthFt;

  return (
    <div className="w-full bg-black/40 border border-border/50 rounded-xl overflow-hidden mt-6 mb-8 flex flex-col items-center justify-center p-4">
      <div 
        ref={containerRef}
        className="relative bg-zinc-900 border-2 border-zinc-800 shadow-inner"
        style={{ 
          width: '100%', 
          maxWidth: '600px',
          aspectRatio: `${widthFt} / ${lengthFt}`
        }}
      >
        {/* Render Exam Hall Data */}
        {type === "exam" && data.desks && data.desks.map((desk: any, i: number) => {
          const leftPct = ((desk.x - desk.width / 2) / widthFt) * 100;
          const topPct = ((desk.y - desk.depth / 2) / lengthFt) * 100;
          const wPct = (desk.width / widthFt) * 100;
          const hPct = (desk.depth / lengthFt) * 100;

          return (
            <div
              key={i}
              className="absolute bg-blue-500/80 border border-blue-400 rounded-sm flex items-center justify-center shadow-sm"
              style={{
                left: `${leftPct}%`,
                top: `${topPct}%`,
                width: `${wPct}%`,
                height: `${hPct}%`,
                transform: `rotate(${desk.rotation}rad)`
              }}
              title={`Seat ${desk.seatNumber}`}
            >
              <span className="text-[6px] text-white opacity-80 md:text-[8px] font-mono">{desk.seatNumber}</span>
            </div>
          );
        })}

        {type === "exam" && data.invigilatorPaths && data.invigilatorPaths.map((path: any, i: number) => {
          const leftPct = (path.x / widthFt) * 100;
          const topPct = (path.y / lengthFt) * 100;
          const wPct = (path.width / widthFt) * 100;
          const hPct = (path.depth / lengthFt) * 100;

          return (
            <div
              key={`path-${i}`}
              className="absolute bg-green-500/10 border-2 border-dashed border-green-500/30 flex items-center justify-center pointer-events-none"
              style={{
                left: `${leftPct}%`,
                top: `${topPct}%`,
                width: `${wPct}%`,
                height: `${hPct}%`,
              }}
            >
              <span className="text-green-500/60 text-[8px] uppercase tracking-wider font-bold rotate-[-90deg] md:rotate-0 whitespace-nowrap">
                {path.label}
              </span>
            </div>
          );
        })}


        {/* Render Parking Lot Data */}
        {type === "parking" && data.driveways && data.driveways.map((path: any, i: number) => {
          const leftPct = (path.x / widthFt) * 100;
          const topPct = (path.y / lengthFt) * 100;
          const wPct = (path.width / widthFt) * 100;
          const hPct = (path.depth / lengthFt) * 100;

          return (
            <div
              key={`drive-${i}`}
              className="absolute bg-yellow-500/10 border-y border-dashed border-yellow-500/20 flex items-center justify-center pointer-events-none"
              style={{
                left: `${leftPct}%`,
                top: `${topPct}%`,
                width: `${wPct}%`,
                height: `${hPct}%`,
              }}
            >
              <span className="text-yellow-500/40 text-[10px] uppercase font-bold tracking-widest">Driveway</span>
            </div>
          );
        })}

        {type === "parking" && data.spots && data.spots.map((spot: any, i: number) => {
          // Parking spots uses center coordinates just like items in our engine
          const leftPct = ((spot.x - spot.width / 2) / widthFt) * 100;
          const topPct = ((spot.y - spot.depth / 2) / lengthFt) * 100;
          const wPct = (spot.width / widthFt) * 100;
          const hPct = (spot.depth / lengthFt) * 100;

          const isADA = spot.type === "ada";

          return (
            <div
              key={i}
              className={`absolute border-2 rounded-sm flex items-center justify-center shadow-sm ${
                isADA 
                  ? "bg-blue-500/30 border-blue-400 text-blue-400" 
                  : "bg-zinc-500/30 border-zinc-500 text-zinc-500"
              }`}
              style={{
                left: `${leftPct}%`,
                top: `${topPct}%`,
                width: `${wPct}%`,
                height: `${hPct}%`,
                transform: `rotate(${spot.rotation}rad)`
              }}
            >
              {isADA ? (
                <span className="text-[12px]">♿</span>
              ) : (
                <div className="w-[60%] h-[80%] border border-zinc-500/50 rounded opacity-30"></div>
              )}
            </div>
          );
        })}
      </div>
      <div className="text-xs text-muted-foreground mt-4 font-mono">
        Scale: {widthFt}ft × {lengthFt}ft
      </div>
    </div>
  );
};

export default B2BVisualizer;
