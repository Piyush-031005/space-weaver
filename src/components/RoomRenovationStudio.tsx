// src/components/RoomRenovationStudio.tsx
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoveHorizontal, Sparkles, Upload, ArrowUpRight, Check, Compass, ShieldCheck } from 'lucide-react';

interface RenovationPreset {
  id: string;
  title: string;
  subtitle: string;
  metricBadge: string;
  beforeLabel: string;
  afterLabel: string;
  specs: string[];
  beforeImage?: string;
  afterImage?: string;
  roomParams: { width: number; length: number; furniture: any[]; vibe: string };
  beforeSvgType: 'stairs-empty' | 'rental-dated' | 'stairs-nook';
  afterSvgType: 'stairs-library' | 'stairs-office' | 'rental-modern' | 'stairs-credenza';
}

const RENOVATION_PRESETS: RenovationPreset[] = [
  {
    id: 'stairs-library',
    title: 'Under-Stairs Curated Reading Library',
    subtitle: 'Foyr-style dead-space conversion into custom millwork library',
    metricBadge: '+140% Storage Volume',
    beforeLabel: 'BEFORE: Empty Under-Stairs Drywall',
    afterLabel: 'AFTER: Charcoal Bookcase & Cognac Lounge',
    beforeImage: '/renovations/stair_office_before.jpg',
    afterImage: '/renovations/stair_library_after.jpg',
    specs: [
      'Custom matte charcoal built-in bookcase fit to 38° stair stringer',
      'Mid-century cognac leather armchair with bouclé lumbar pillow',
      '2700K directional brass sconce + woven wool area rug',
    ],
    roomParams: {
      width: 14,
      length: 16,
      furniture: [
        { id: 'lib-chair', name: 'Leather Lounge Chair', type: 'chair', x: 5, y: 8, width: 3, depth: 3, rotation: 0 },
        { id: 'lib-shelf', name: 'Built-in Bookcase', type: 'bookshelf', x: 2, y: 8, width: 8, depth: 1.5, rotation: 0 },
        { id: 'lib-lamp', name: 'Directional Brass Lamp', type: 'lamp', x: 8, y: 8, width: 1.5, depth: 1.5, rotation: 0 }
      ],
      vibe: 'aesthetic'
    },
    beforeSvgType: 'stairs-empty',
    afterSvgType: 'stairs-library',
  },
  {
    id: 'stairs-office',
    title: 'Under-Stairs Architectural Home Office',
    subtitle: 'Ergonomic double-pedestal workstation tucked beneath staircase',
    metricBadge: '+165% Usable Space',
    beforeLabel: 'BEFORE: Unfinished Stairwell Alcove',
    afterLabel: 'AFTER: White Oak Desk & Floating Shelving',
    beforeImage: '/renovations/stair_office_before.jpg',
    afterImage: '/renovations/stair_office_after.jpg',
    specs: [
      'Floating white oak butcher-block desk with dual file pedestals',
      'Triple-tier open shelving + integrated cork pinboard',
      'Swivel task chair with 36-inch chair pull-out clearance',
    ],
    roomParams: {
      width: 14,
      length: 18,
      furniture: [
        { id: 'desk-1', name: 'Butcherblock Study Desk', type: 'table', x: 6, y: 9, width: 5.5, depth: 2.5, rotation: 0 },
        { id: 'chair-1', name: 'Ergonomic Swivel Chair', type: 'chair', x: 6, y: 6.5, width: 2.2, depth: 2.2, rotation: 0 },
        { id: 'shelf-1', name: 'Floating Open Shelves', type: 'bookshelf', x: 6, y: 11, width: 4.5, depth: 1.2, rotation: 0 }
      ],
      vibe: 'cozy'
    },
    beforeSvgType: 'stairs-empty',
    afterSvgType: 'stairs-office',
  },
  {
    id: 'rental-makeover',
    title: 'Dated Rental Living Room Makeover',
    subtitle: 'Non-destructive peel-and-stick & lighting transformation',
    metricBadge: '+90% Visual Harmony',
    beforeLabel: 'BEFORE: Dated Carpet & Bare Corner',
    afterLabel: 'AFTER: Botanical Wallpaper & 2700K Perimeter LEDs',
    beforeImage: '/renovations/rental_living_before.jpg',
    afterImage: '/renovations/rental_living_after.jpg',
    specs: [
      'Removable botanical peel-and-stick feature wall',
      'Layered vintage medallion rug over existing rental carpet',
      'Floating media console with 55" OLED & warm string lighting',
    ],
    roomParams: {
      width: 16,
      length: 20,
      furniture: [
        { id: 'sofa-1', name: 'Curved Cream Sectional', type: 'sofa', x: 8, y: 12, width: 7, depth: 3.5, rotation: 0 },
        { id: 'table-1', name: 'Sculptural Coffee Table', type: 'table', x: 8, y: 9, width: 3.5, depth: 2.2, rotation: 0 },
        { id: 'tv-1', name: 'Media Console & Wall', type: 'tv', x: 8, y: 3, width: 5, depth: 1.2, rotation: 0 }
      ],
      vibe: 'cozy'
    },
    beforeSvgType: 'rental-dated',
    afterSvgType: 'rental-modern',
  },
  {
    id: 'stairs-credenza',
    title: 'Under-Stairs Luxury Display Credenza',
    subtitle: 'Backlit architectural showcase with handleless cabinetry',
    metricBadge: '+125% Property Value Appeal',
    beforeLabel: 'BEFORE: Blank Hallway Stair Wall',
    afterLabel: 'AFTER: Backlit Floating Credenza & Gallery Niche',
    beforeImage: '/renovations/stair_office_before.jpg',
    afterImage: '/renovations/stair_library_after.jpg',
    specs: [
      '4-door matte champagne handleless credenza with LED toe-kick',
      'Recessed 3000K linear cove lighting along stair soffit',
      'Framed minimalist gallery piece & indoor botanical accents',
    ],
    roomParams: {
      width: 14,
      length: 16,
      furniture: [
        { id: 'cred-1', name: 'Wall-Hung Storage Credenza', type: 'storage', x: 7, y: 8, width: 6, depth: 1.8, rotation: 0 },
        { id: 'lamp-1', name: 'Linear Wall Grazing Light', type: 'lamp', x: 7, y: 11, width: 1.5, depth: 1.5, rotation: 0 }
      ],
      vibe: 'aesthetic'
    },
    beforeSvgType: 'stairs-nook',
    afterSvgType: 'stairs-credenza',
  },
];

export const RoomRenovationStudio: React.FC = () => {
  const navigate = useNavigate();
  const [activePreset, setActivePreset] = useState<RenovationPreset>(RENOVATION_PRESETS[0]);
  const [sliderPos, setSliderPos] = useState<number>(50);
  const [customBefore, setCustomBefore] = useState<string | null>(null);
  const [customAfter, setCustomAfter] = useState<string | null>(null);
  const [useRenderMode, setUseRenderMode] = useState<boolean>(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.buttons !== 1 && e.pointerType === 'mouse') return;
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    setSliderPos(Math.round((x / rect.width) * 100));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setCustomBefore(url);
    // Use the preset after image as the AI transformation target
    setCustomAfter(activePreset.afterImage || url);
  };

  const handleOpenIn3D = () => {
    const payload = {
      roomWidth: activePreset.roomParams.width,
      roomLength: activePreset.roomParams.length,
      theme: activePreset.id,
      items: activePreset.roomParams.furniture,
    };
    sessionStorage.setItem('spaceweaver_active_3d_layout', JSON.stringify(payload));

    navigate('/results?studio=3d&source=renovation', {
      state: {
        payloadToUse: {
          room: { width: activePreset.roomParams.width, length: activePreset.roomParams.length },
          furniture: activePreset.roomParams.furniture,
          vibe: activePreset.roomParams.vibe,
          structuralElements: []
        },
        data: {
          options: [
            {
              id: activePreset.id,
              name: activePreset.title,
              desc: activePreset.subtitle,
              layout: activePreset.roomParams.furniture,
              genome: { archetype: activePreset.title },
              why: activePreset.specs
            }
          ]
        }
      }
    });
  };

  return (
    <section className="w-full bg-[#080d18] text-white py-12 px-4 md:px-8 border-t border-white/10">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/30 text-yellow-300 text-xs font-semibold uppercase mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Before → After AI Renovation Studio
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">
              Awkward Alcoves & Room Makeovers
            </h2>
            <p className="text-slate-400 text-sm md:text-base mt-1">
              Drag the split-screen slider to compare empty under-stairs dead zones against custom architectural build-outs.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start">
            <button
              onClick={() => setUseRenderMode(!useRenderMode)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                useRenderMode
                  ? 'bg-primary/20 border-primary text-primary'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              {useRenderMode ? '✨ 4K Architectural Renders' : '📐 Procedural SVG Vectors'}
            </button>
            <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-semibold cursor-pointer transition-all">
              <Upload className="w-4 h-4 text-[#AEFD00]" />
              Upload Room Photo
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </label>
          </div>
        </div>

        {/* Preset Selector Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {RENOVATION_PRESETS.map((preset) => {
            const active = activePreset.id === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => {
                  setActivePreset(preset);
                  setCustomBefore(null);
                  setCustomAfter(null);
                }}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  active
                    ? 'border-[#AEFD00] bg-slate-900/90 shadow-lg ring-1 ring-[#AEFD00]/30'
                    : 'border-white/10 bg-slate-900/40 hover:border-white/25'
                }`}
              >
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#AEFD00]/15 text-[#AEFD00]">
                  {preset.metricBadge}
                </span>
                <h4 className="font-bold text-sm mt-2 line-clamp-1">{preset.title}</h4>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{preset.subtitle}</p>
              </button>
            );
          })}
        </div>

        {/* Interactive Split Comparison Canvas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8">
            <div
              ref={containerRef}
              onPointerDown={handlePointerMove}
              onPointerMove={handlePointerMove}
              className="relative w-full h-[460px] rounded-3xl overflow-hidden border border-white/15 select-none cursor-ew-resize bg-slate-950 shadow-2xl"
            >
              {/* AFTER LAYER (Full Width Base) */}
              <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-[#1c222d]">
                {customAfter ? (
                  <img
                    src={customAfter}
                    alt="After Renovation"
                    className="w-full h-full object-cover"
                  />
                ) : useRenderMode && activePreset.afterImage ? (
                  <img
                    src={activePreset.afterImage}
                    alt="After Renovation"
                    className="w-full h-full object-cover object-center"
                  />
                ) : (
                  <svg viewBox="0 0 800 500" className="w-full h-full object-cover">
                    {/* Warm Renovated Architectural Scene */}
                    <rect width="800" height="400" fill="#f2ece1" />
                    <rect y="400" width="800" height="100" fill="#b88655" />
                    {/* Staircase Diagonal */}
                    <polygon points="120,0 800,360 800,0" fill="#ffffff" stroke="#d4cbbe" strokeWidth="4" />
                    {/* Under-Stairs Built-In Dark Charcoal Bookcase / Credenza */}
                    <polygon points="120,40 740,360 740,400 120,400" fill="#282c30" />
                    {/* Illuminated Shelves & Books */}
                    {[130, 210, 290].map((y, i) => (
                      <g key={i}>
                        <line x1="150" y1={y} x2={250 + i * 160} y2={y} stroke="#454b52" strokeWidth="6" />
                        <rect x="170" y={y - 38} width="45" height="35" fill="#d97742" rx="2" />
                        <rect x="230" y={y - 38} width="55" height="35" fill="#e6ccb2" rx="2" />
                      </g>
                    ))}
                    {/* Cognac Leather Lounge Chair in Foreground */}
                    <rect x="210" y="310" width="140" height="85" rx="14" fill="#8c4a27" />
                    <rect x="235" y="290" width="90" height="45" rx="8" fill="#f5ebe0" />
                    {/* Warm Brass Sconce Glow */}
                    <circle cx="380" cy="175" r="45" fill="rgba(255, 215, 120, 0.35)" />
                    <circle cx="380" cy="175" r="8" fill="#ffd166" />
                  </svg>
                )}
                <span className="absolute top-4 right-4 bg-[#AEFD00] text-black text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                  {activePreset.afterLabel}
                </span>
              </div>

              {/* BEFORE LAYER (Clipped by Slider Position) */}
              <div
                className="absolute inset-0 h-full overflow-hidden"
                style={{ width: `${sliderPos}%` }}
              >
                {customBefore ? (
                  <img
                    src={customBefore}
                    alt="Before Renovation"
                    className="w-full h-full object-cover"
                    style={{ width: containerRef.current?.clientWidth || 800 }}
                  />
                ) : useRenderMode && activePreset.beforeImage ? (
                  <img
                    src={activePreset.beforeImage}
                    alt="Before Renovation"
                    className="w-full h-full object-cover object-center"
                    style={{ width: containerRef.current?.clientWidth || 800 }}
                  />
                ) : (
                  <svg
                    viewBox="0 0 800 500"
                    className="h-full object-cover"
                    style={{ width: containerRef.current?.clientWidth || 800 }}
                  >
                    {/* Blank Empty Under-Stairs Wall */}
                    <rect width="800" height="400" fill="#dad7d2" />
                    <rect y="400" width="800" height="100" fill="#9c7a54" />
                    <polygon points="120,0 800,360 800,0" fill="#e8e6e1" stroke="#b5afa6" strokeWidth="4" />
                    {/* Bare Railing Balusters */}
                    {Array.from({ length: 14 }).map((_, idx) => (
                      <line
                        key={idx}
                        x1={160 + idx * 42}
                        y1={20 + idx * 21}
                        x2={160 + idx * 42}
                        y2={80 + idx * 21}
                        stroke="#222"
                        strokeWidth="3"
                      />
                    ))}
                  </svg>
                )}
                <span className="absolute top-4 left-4 bg-black/80 text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-white/15">
                  {activePreset.beforeLabel}
                </span>
              </div>

              {/* Drag Handle Divider */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-[#AEFD00] shadow-[0_0_15px_#AEFD00]"
                style={{ left: `${sliderPos}%` }}
              >
                <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#AEFD00] text-black flex items-center justify-center shadow-xl">
                  <MoveHorizontal className="w-5 h-5" />
                </div>
              </div>

              {/* Bottom Drag Hint */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/75 backdrop-blur-md px-3.5 py-1 rounded-full text-[11px] font-mono text-white/90 border border-white/10 pointer-events-none">
                👈 Drag slider left/right to compare 👉
              </div>
            </div>
          </div>

          {/* Right 4 Cols: Architectural Specs & 3D Studio Button */}
          <div className="lg:col-span-4 bg-[#0c1322] rounded-3xl border border-white/10 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#AEFD00]" />
                <span className="text-xs font-mono text-[#AEFD00] uppercase">AI Spatial Scan Output</span>
              </div>
              <h3 className="text-xl font-bold mt-2">{activePreset.title}</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{activePreset.subtitle}</p>

              <div className="mt-6 space-y-3">
                {activePreset.specs.map((spec, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-slate-200">
                    <Check className="w-4 h-4 text-[#AEFD00] shrink-0 mt-0.5" />
                    <span>{spec}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleOpenIn3D}
              className="mt-8 w-full flex items-center justify-center gap-2 bg-[#AEFD00] hover:bg-[#9be300] text-black font-bold py-3.5 px-5 rounded-xl transition-all shadow-lg shadow-[#AEFD00]/10"
            >
              Open in 3D WebGL Studio <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RoomRenovationStudio;
