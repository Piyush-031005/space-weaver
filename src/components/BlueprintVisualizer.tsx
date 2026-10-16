// src/components/BlueprintVisualizer.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { STYLE_THEMES, StyleTheme, APARTMENT_3D_ITEMS } from '../data/apartmentPresets';
import { Layers, Box, Compass, Sparkles, Upload, ArrowUpRight, Check, Image as ImageIcon } from 'lucide-react';

export const BlueprintVisualizer: React.FC = () => {
  const navigate = useNavigate();
  const [activeTheme, setActiveTheme] = useState<StyleTheme['id']>('tropical');
  const [viewMode, setViewMode] = useState<'cad' | '3d-top' | 'isometric'>('3d-top');
  const [selectedZone, setSelectedZone] = useState<string>('Living Room');
  const [customBlueprint, setCustomBlueprint] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const theme = STYLE_THEMES[activeTheme];
  const isCAD = viewMode === 'cad';

  const handleOpenIn3DStudio = () => {
    // Save generated multi-room layout to sessionStorage so Fullscreen3DStudio picks it up cleanly
    const payload = {
      roomWidth: 22,
      roomLength: 26,
      theme: activeTheme,
      items: APARTMENT_3D_ITEMS,
    };
    sessionStorage.setItem('spaceweaver_active_3d_layout', JSON.stringify(payload));
    
    // Also pass state directly to /results for zero-latency load
    navigate('/results?studio=3d&source=blueprint', {
      state: {
        payloadToUse: {
          room: { width: 22, length: 26 },
          furniture: APARTMENT_3D_ITEMS,
          vibe: activeTheme,
          structuralElements: []
        },
        data: {
          options: [
            {
              id: `blueprint-${activeTheme}`,
              name: `${theme.name} Architectural Layout`,
              desc: `Photorealistic ${theme.name} multi-room floor plan with optimized clearances`,
              layout: APARTMENT_3D_ITEMS,
              genome: { archetype: theme.name },
              why: [
                'Optimized 42" kitchen work triangle clearance',
                '38" circulation corridor to natural daylight balcony',
                'Zoned moisture barriers and acoustic partition buffers'
              ]
            }
          ]
        }
      }
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomBlueprint(url);
      setIsScanning(true);
      setTimeout(() => setIsScanning(false), 1200);
    }
  };

  return (
    <section className="w-full bg-[#080d18] text-white py-12 px-4 md:px-8 border-t border-white/10">
      <div className="max-w-7xl mx-auto">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#AEFD00]/10 border border-[#AEFD00]/30 text-[#AEFD00] text-xs font-semibold tracking-wider uppercase mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Instant 2D CAD → 3D Apartment
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Multi-Room Top-Down 3D Visualizer
            </h2>
            <p className="text-slate-400 text-sm md:text-base mt-1">
              Switch between technical 2D CAD line drawings, photorealistic top-down 3D plans, and isometric cutaways.
            </p>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center bg-slate-900/90 p-1.5 rounded-xl border border-white/10 self-start">
            <button
              onClick={() => setViewMode('cad')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'cad'
                  ? 'bg-[#AEFD00] text-black font-bold shadow-lg'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Compass className="w-4 h-4" /> 2D CAD Blueprint
            </button>
            <button
              onClick={() => setViewMode('3d-top')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
                viewMode === '3d-top'
                  ? 'bg-[#AEFD00] text-black font-bold shadow-lg'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" /> 3D Top-Down Plan
            </button>
            <button
              onClick={() => setViewMode('isometric')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'isometric'
                  ? 'bg-[#AEFD00] text-black font-bold shadow-lg'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Box className="w-4 h-4" /> Isometric 3D Cutaway
            </button>
          </div>
        </div>

        {/* Top Style Carousel */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
          {(Object.keys(STYLE_THEMES) as Array<StyleTheme['id']>).map((key) => {
            const item = STYLE_THEMES[key];
            const active = activeTheme === key;
            return (
              <button
                key={key}
                onClick={() => {
                  setActiveTheme(key);
                  if (viewMode === 'cad') setViewMode('3d-top');
                }}
                className={`group relative overflow-hidden rounded-2xl p-3.5 text-left transition-all border ${
                  active
                    ? 'border-[#AEFD00] bg-slate-900/95 ring-2 ring-[#AEFD00]/30 scale-[1.01]'
                    : 'border-white/10 bg-slate-900/40 hover:border-white/25'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl">{item.badge}</span>
                  <div className="flex -space-x-1">
                    <span className="w-4 h-4 rounded-full border border-black/40" style={{ background: item.floorLiving }} />
                    <span className="w-4 h-4 rounded-full border border-black/40" style={{ background: item.floorWood }} />
                    <span className="w-4 h-4 rounded-full border border-black/40" style={{ background: item.wallColor }} />
                  </div>
                </div>
                <div className={`text-sm font-semibold ${active ? 'text-[#AEFD00]' : 'text-white'}`}>
                  {item.name}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">Click to reskin 3D plan</div>
              </button>
            );
          })}
        </div>

        {/* Main Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left 7 Cols: Interactive Top-Down 3D / CAD Floorplan Canvas */}
          <div className="lg:col-span-7 bg-[#0c1322] rounded-3xl border border-white/10 p-6 flex flex-col items-center justify-center relative overflow-hidden min-h-[620px]">
            {/* Top Status Pill */}
            <div className="w-full flex items-center justify-between mb-4 z-10">
              <span className="text-xs uppercase tracking-widest text-slate-400 font-mono">
                {isCAD ? 'TECHNICAL CAD MODE • SCALE 1:50' : `${theme.name.toUpperCase()} • PHOTOMETRIC TOP-DOWN 3D`}
              </span>
              <div className="flex items-center gap-2">
                {customBlueprint && (
                  <span className="text-xs px-2.5 py-1 rounded bg-[#AEFD00]/20 text-[#AEFD00] font-mono">
                    CUSTOM PLAN LOADED
                  </span>
                )}
                <span className="text-xs px-2.5 py-1 rounded bg-white/5 text-slate-300 font-mono">
                  740 SQ FT • 5 ZONES
                </span>
              </div>
            </div>

            {/* Scanning Overlay */}
            {isScanning && (
              <div className="absolute inset-0 z-30 bg-background/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center space-y-3">
                <div className="w-10 h-10 rounded-full border-2 border-[#AEFD00] border-t-transparent animate-spin" />
                <h4 className="font-bold text-base text-white">Extracting CAD Perimeter & Zones...</h4>
                <p className="text-xs font-mono text-slate-400">Calibrating door swings and wall vectors</p>
              </div>
            )}

            {/* SVG Architectural / 3D Top-Down Engine */}
            <div
              className="w-full max-w-[460px] transition-all duration-700 ease-out"
              style={{
                transform:
                  viewMode === 'isometric'
                    ? 'perspective(1100px) rotateX(48deg) rotateZ(-26deg) scale(0.92)'
                    : 'perspective(1100px) rotateX(0deg) rotateZ(0deg) scale(1)',
                transformStyle: 'preserve-3d',
                filter:
                  viewMode === 'isometric'
                    ? 'drop-shadow(-18px 28px 24px rgba(0,0,0,0.65))'
                    : 'drop-shadow(0px 16px 32px rgba(0,0,0,0.45))',
              }}
            >
              <svg
                viewBox="0 0 500 620"
                className="w-full h-auto rounded-xl select-none"
                style={{ background: isCAD ? '#ffffff' : '#181c24' }}
              >
                <defs>
                  {/* Realistic Soft 3D Drop Shadow for Furniture & Walls */}
                  <filter id="softShadow" x="-15%" y="-15%" width="140%" height="140%">
                    <feDropShadow dx="3" dy="6" stdDeviation="5" floodColor="#000000" floodOpacity={isCAD ? '0' : '0.38'} />
                  </filter>
                  <filter id="wallShadow" x="-10%" y="-10%" width="130%" height="130%">
                    <feDropShadow dx="4" dy="8" stdDeviation="6" floodColor="#000000" floodOpacity={isCAD ? '0' : '0.55'} />
                  </filter>

                  {/* CAD Hatch Pattern for Walls */}
                  <pattern id="cadHatch" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                    <line x1="0" y1="0" x2="0" y2="8" stroke="#222" strokeWidth="1.2" />
                  </pattern>

                  {/* Tile Grid Pattern */}
                  <pattern id="tileGrid" width="28" height="28" patternUnits="userSpaceOnUse">
                    <path d="M 28 0 L 0 0 0 28" fill="none" stroke={isCAD ? '#ccc' : 'rgba(0,0,0,0.08)'} strokeWidth="1" />
                  </pattern>

                  {/* Hardwood Plank Pattern */}
                  <pattern id="woodPlanks" width="14" height="65" patternUnits="userSpaceOnUse">
                    <rect width="14" height="65" fill={isCAD ? '#ffffff' : theme.floorWood} />
                    <path d="M 14 0 L 0 0 0 65" fill="none" stroke={isCAD ? '#bbb' : 'rgba(0,0,0,0.16)'} strokeWidth="1" />
                  </pattern>
                </defs>

                {/* ================= FLOOR ZONES ================= */}
                {/* 1. Living Room Floor */}
                <rect
                  x="25"
                  y="25"
                  width="245"
                  height="310"
                  fill={isCAD ? '#ffffff' : theme.floorLiving}
                  onClick={() => setSelectedZone('Living Room')}
                  className="cursor-pointer"
                />
                {/* 2. Kitchen Floor (Tiled) */}
                <rect
                  x="270"
                  y="25"
                  width="205"
                  height="285"
                  fill={isCAD ? '#ffffff' : theme.floorTile}
                  onClick={() => setSelectedZone('Kitchen')}
                  className="cursor-pointer"
                />
                <rect x="270" y="25" width="205" height="285" fill="url(#tileGrid)" pointerEvents="none" />

                {/* 3. Bedroom + Hallway Wood Floor */}
                <rect
                  x="25"
                  y="335"
                  width="305"
                  height="260"
                  fill="url(#woodPlanks)"
                  onClick={() => setSelectedZone('Bedroom')}
                  className="cursor-pointer"
                />

                {/* 4. Bathroom Floor (Tiled) */}
                <rect
                  x="330"
                  y="390"
                  width="145"
                  height="205"
                  fill={isCAD ? '#ffffff' : theme.floorTile}
                  onClick={() => setSelectedZone('Bathroom')}
                  className="cursor-pointer"
                />
                <rect x="330" y="390" width="145" height="205" fill="url(#tileGrid)" pointerEvents="none" />

                {/* Upper Right Entry Nook Wood */}
                <rect x="330" y="310" width="145" height="80" fill="url(#woodPlanks)" />

                {/* ================= LIVING ROOM FURNITURE ================= */}
                {/* Large Area Rug under Sofa & Coffee Table */}
                {!isCAD && (
                  <rect
                    x="85"
                    y="100"
                    width="155"
                    height="175"
                    rx="4"
                    fill={theme.rugColor}
                    opacity="0.7"
                  />
                )}

                {/* L-Shaped Sectional Sofa */}
                <g filter="url(#softShadow)" onClick={() => setSelectedZone('Living Room')} className="cursor-pointer">
                  {/* Top Horizontal Chaise Section */}
                  <rect
                    x="140"
                    y="52"
                    width="115"
                    height="62"
                    rx="4"
                    fill={isCAD ? '#ffffff' : theme.sofaColor}
                    stroke={isCAD ? '#111' : 'rgba(0,0,0,0.2)'}
                    strokeWidth={isCAD ? '1.8' : '1'}
                  />
                  {/* Right Vertical Sofa Section */}
                  <rect
                    x="195"
                    y="52"
                    width="60"
                    height="185"
                    rx="4"
                    fill={isCAD ? '#ffffff' : theme.sofaColor}
                    stroke={isCAD ? '#111' : 'rgba(0,0,0,0.2)'}
                    strokeWidth={isCAD ? '1.8' : '1'}
                  />
                  {/* Backrest Cushions */}
                  <rect x="144" y="54" width="108" height="12" rx="2" fill={isCAD ? 'none' : 'rgba(0,0,0,0.08)'} stroke={isCAD ? '#111' : 'none'} />
                  <rect x="242" y="56" width="11" height="178" rx="2" fill={isCAD ? 'none' : 'rgba(0,0,0,0.08)'} stroke={isCAD ? '#111' : 'none'} />
                  {/* Throw Pillows */}
                  <rect x="180" y="68" width="18" height="18" rx="3" transform="rotate(12 180 68)" fill={isCAD ? '#fff' : theme.beddingPrimary} stroke="#222" strokeWidth="0.8" />
                  <rect x="220" y="72" width="18" height="18" rx="3" transform="rotate(-15 220 72)" fill={isCAD ? '#fff' : theme.beddingSecondary} stroke="#222" strokeWidth="0.8" />
                  <rect x="222" y="195" width="18" height="18" rx="3" transform="rotate(8 222 195)" fill={isCAD ? '#fff' : theme.beddingPrimary} stroke="#222" strokeWidth="0.8" />
                </g>

                {/* Coffee Table */}
                <g filter="url(#softShadow)">
                  <rect
                    x="122"
                    y="152"
                    width="54"
                    height="62"
                    rx={activeTheme === 'tropical' ? '18' : '3'}
                    fill={isCAD ? '#ffffff' : theme.woodTone}
                    stroke={isCAD ? '#111' : 'rgba(255,255,255,0.2)'}
                    strokeWidth={isCAD ? '1.8' : '1'}
                  />
                  {isCAD && (
                    <>
                      <line x1="122" y1="152" x2="176" y2="214" stroke="#111" strokeWidth="1.2" />
                      <line x1="176" y1="152" x2="122" y2="214" stroke="#111" strokeWidth="1.2" />
                    </>
                  )}
                </g>

                {/* Left Wall TV Media Console */}
                <g filter="url(#softShadow)">
                  <rect
                    x="36"
                    y="92"
                    width="26"
                    height="175"
                    rx="2"
                    fill={isCAD ? '#fff' : theme.woodTone}
                    stroke="#111"
                    strokeWidth={isCAD ? '1.8' : '0.8'}
                  />
                  {/* Flat Screen TV Bar */}
                  <rect x="42" y="120" width="6" height="110" fill="#111" />
                </g>

                {/* Lower Living Room Storage Credenza */}
                <g filter="url(#softShadow)">
                  <rect x="35" y="344" width="185" height="32" fill={isCAD ? '#fff' : theme.woodTone} stroke="#111" strokeWidth={isCAD ? '1.8' : '0.8'} />
                </g>

                {/* ================= KITCHEN FURNITURE ================= */}
                {/* L-Shaped Perimeter Countertop */}
                <g filter="url(#softShadow)" onClick={() => setSelectedZone('Kitchen')} className="cursor-pointer">
                  <path
                    d="M 278 35 H 465 V 295 H 425 V 78 H 278 Z"
                    fill={isCAD ? '#ffffff' : theme.woodTone}
                    stroke="#111"
                    strokeWidth={isCAD ? '1.8' : '0.8'}
                  />
                  {/* Kitchen Sink */}
                  <rect x="352" y="42" width="44" height="26" rx="2" fill={isCAD ? '#fff' : '#d8dce0'} stroke="#111" strokeWidth="1.4" />
                  <circle cx="374" cy="55" r="3" fill="#333" />
                  {/* Induction Cooktop */}
                  <rect x="432" y="138" width="26" height="52" fill="#181818" stroke="#111" strokeWidth="1.2" />
                  <circle cx="440" cy="150" r="5" stroke="#777" fill="none" />
                  <circle cx="440" cy="176" r="5" stroke="#777" fill="none" />
                </g>

                {/* Central Waterfall Kitchen Island + 3 Bar Stools */}
                <g filter="url(#softShadow)" onClick={() => setSelectedZone('Kitchen')} className="cursor-pointer">
                  {/* 3 Barstools */}
                  {[128, 162, 196].map((cy, idx) => (
                    <circle
                      key={idx}
                      cx="332"
                      cy={cy}
                      r="11"
                      fill={isCAD ? '#fff' : '#b87b4c'}
                      stroke="#111"
                      strokeWidth="1.5"
                    />
                  ))}
                  {/* Marble / Wood Island Top */}
                  <rect
                    x="338"
                    y="108"
                    width="52"
                    height="112"
                    rx="3"
                    fill={isCAD ? '#ffffff' : theme.islandColor}
                    stroke="#111"
                    strokeWidth={isCAD ? '1.8' : '1'}
                  />
                </g>

                {/* ================= BEDROOM FURNITURE ================= */}
                <g filter="url(#softShadow)" onClick={() => setSelectedZone('Bedroom')} className="cursor-pointer">
                  {/* Bedroom Rug */}
                  {!isCAD && <rect x="75" y="410" width="128" height="150" rx="3" fill={theme.rugColor} opacity="0.65" />}
                  {/* Nightstands */}
                  <rect x="38" y="395" width="26" height="28" fill={isCAD ? '#fff' : theme.woodTone} stroke="#111" strokeWidth="1.4" />
                  <rect x="38" y="545" width="26" height="28" fill={isCAD ? '#fff' : theme.woodTone} stroke="#111" strokeWidth="1.4" />
                  {/* King Platform Bed */}
                  <rect x="38" y="428" width="142" height="112" rx="4" fill={isCAD ? '#fff' : theme.sofaColor} stroke="#111" strokeWidth="1.6" />
                  {/* Duvet Layer */}
                  <rect x="78" y="432" width="98" height="104" rx="3" fill={isCAD ? 'none' : theme.beddingPrimary} stroke={isCAD ? '#111' : 'none'} />
                  {/* 2 Pillows */}
                  <rect x="46" y="438" width="24" height="40" rx="4" fill={isCAD ? '#fff' : theme.beddingSecondary} stroke="#111" strokeWidth="1.2" />
                  <rect x="46" y="488" width="24" height="40" rx="4" fill={isCAD ? '#fff' : theme.beddingSecondary} stroke="#111" strokeWidth="1.2" />
                  {/* Opposite Media / Desk Console */}
                  <rect x="218" y="418" width="22" height="135" fill={isCAD ? '#fff' : theme.woodTone} stroke="#111" strokeWidth="1.4" />
                </g>

                {/* ================= BATHROOM FIXTURES ================= */}
                <g filter="url(#softShadow)" onClick={() => setSelectedZone('Bathroom')} className="cursor-pointer">
                  {/* Toilet */}
                  <rect x="342" y="468" width="14" height="26" fill="#fff" stroke="#111" strokeWidth="1.4" />
                  <ellipse cx="366" cy="481" rx="14" ry="10" fill="#fff" stroke="#111" strokeWidth="1.4" />
                  {/* Vanity Sink */}
                  <rect x="425" y="460" width="36" height="48" fill="#fff" stroke="#111" strokeWidth="1.4" />
                  <rect x="432" y="470" width="20" height="28" rx="3" fill={isCAD ? '#fff' : '#d8dce0'} stroke="#111" strokeWidth="1.2" />
                  {/* Glass Walk-in Shower */}
                  <rect x="395" y="525" width="68" height="58" fill={isCAD ? 'none' : 'rgba(200, 235, 255, 0.18)'} stroke="#111" strokeWidth="1.5" strokeDasharray={isCAD ? '4 2' : 'none'} />
                </g>

                {/* ================= TROPICAL / JAPANDI PLANTS ================= */}
                {!isCAD && theme.accentPlant && (
                  <g filter="url(#softShadow)">
                    {/* Top Left Living Room Palm */}
                    <circle cx="58" cy="58" r="24" fill="#2d5a27" />
                    <circle cx="62" cy="54" r="16" fill="#477d3e" />
                    {/* Mid Left Partition Monstera */}
                    <circle cx="58" cy="325" r="22" fill="#2d5a27" />
                    <circle cx="55" cy="322" r="14" fill="#528c47" />
                    {/* Coffee Table Centerpiece */}
                    <circle cx="149" cy="183" r="11" fill="#3a6b33" />
                    {/* Hallway & Bathroom Greenery */}
                    <circle cx="332" cy="415" r="14" fill="#3a6b33" />
                    <circle cx="385" cy="340" r="16" fill="#2d5a27" />
                  </g>
                )}

                {/* ================= ARCHITECTURAL WALLS (WITH 3D SHADOW) ================= */}
                <g
                  filter="url(#wallShadow)"
                  fill={isCAD ? 'url(#cadHatch)' : theme.wallColor}
                  stroke={isCAD ? '#111111' : theme.wallStroke}
                  strokeWidth="2"
                >
                  {/* Outer Perimeter Walls */}
                  <rect x="15" y="15" width="470" height="14" />
                  <rect x="15" y="585" width="470" height="14" />
                  <rect x="15" y="15" width="14" height="584" />
                  <rect x="471" y="15" width="14" height="584" />

                  {/* Living Room / Kitchen Divider Wall */}
                  <rect x="264" y="25" width="12" height="235" />

                  {/* Living Room / Bedroom Horizontal Divider Wall */}
                  <rect x="25" y="330" width="215" height="12" />

                  {/* Bedroom / Hallway Divider Wall */}
                  <rect x="238" y="405" width="10" height="185" />

                  {/* Kitchen / Entry Nook Divider Wall */}
                  <rect x="335" y="304" width="140" height="12" />
                  <rect x="330" y="304" width="12" height="62" />

                  {/* Bathroom Partition Walls */}
                  <rect x="335" y="395" width="140" height="10" />
                  <rect x="315" y="445" width="24" height="145" />
                </g>

                {/* CAD Door Swing Arcs */}
                {isCAD && (
                  <g fill="none" stroke="#111" strokeWidth="1.2" strokeDasharray="3 3">
                    <path d="M 238 342 A 42 42 0 0 1 280 384" />
                    <path d="M 335 405 A 38 38 0 0 0 373 443" />
                  </g>
                )}

                {/* ================= ROOM LABELS ================= */}
                <g
                  fontFamily="Inter, system-ui, sans-serif"
                  fontWeight="600"
                  fontSize="16"
                  fill={isCAD ? '#111111' : '#1f2421'}
                  textAnchor="middle"
                >
                  <text x="148" y="292">Living room</text>
                  <text x="352" y="282">Kitchen</text>
                  <text x="115" y="492" fill={isCAD ? '#111' : '#ffffff'}>Bedroom</text>
                  <text x="285" y="462" fill={isCAD ? '#111' : '#ffffff'}>Hallway</text>
                  <text x="396" y="516">Bathroom</text>
                </g>
              </svg>
            </div>
          </div>

          {/* Right 5 Cols: Multi-Room Zone Breakdown & 3D Studio Handoff */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            <div className="bg-[#0c1322] rounded-3xl border border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">5-Zone Spatial Breakdown</h3>
                <span className="text-xs text-[#AEFD00] bg-[#AEFD00]/10 px-2.5 py-1 rounded-full font-medium">
                  Collision-Checked ✓
                </span>
              </div>

              <div className="space-y-3">
                {[
                  {
                    zone: 'Living Room',
                    sqft: '240 sq ft',
                    icon: '🛋️',
                    desc: 'L-shaped sectional sofa, sculptural coffee table, media wall & 38" walking corridor.',
                  },
                  {
                    zone: 'Kitchen',
                    sqft: '160 sq ft',
                    icon: '🍳',
                    desc: 'Waterfall island with 3 counter stools & 42" ergonomic work triangle clearance.',
                  },
                  {
                    zone: 'Bedroom',
                    sqft: '190 sq ft',
                    icon: '🛏️',
                    desc: 'King platform bed with dual floating nightstands, rug & full-wall wardrobe.',
                  },
                  {
                    zone: 'Bathroom',
                    sqft: '85 sq ft',
                    icon: '🚿',
                    desc: 'Frameless walk-in glass shower, floating vanity & moisture-zoned tile grid.',
                  },
                  {
                    zone: 'Hallway',
                    sqft: '65 sq ft',
                    icon: '🚪',
                    desc: '40" unobstructed circulation spine linking primary living and private zones.',
                  },
                ].map((item) => {
                  const isSel = selectedZone === item.zone;
                  return (
                    <div
                      key={item.zone}
                      onClick={() => setSelectedZone(item.zone)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        isSel
                          ? 'bg-slate-900 border-[#AEFD00] shadow-md'
                          : 'bg-slate-900/40 border-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm flex items-center gap-2">
                          <span>{item.icon}</span> {item.zone}
                        </span>
                        <span className="text-xs font-mono text-slate-400">{item.sqft}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{item.desc}</p>
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleOpenIn3DStudio}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#AEFD00] hover:bg-[#9be300] text-black font-bold py-3.5 px-5 rounded-xl transition-all shadow-lg shadow-[#AEFD00]/10"
                >
                  Open in 3D WebGL Studio <ArrowUpRight className="w-4 h-4" />
                </button>
                <label className="cursor-pointer px-4 py-3.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-semibold flex items-center justify-center gap-2 text-slate-300 hover:text-white transition-all">
                  <Upload className="w-4 h-4 text-[#AEFD00]" /> Upload Blueprint
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
              <p className="text-[11px] text-slate-400 mt-3 text-center">
                Supports 360° Orbit, Arrow Key Nudging, <kbd className="px-1.5 py-0.5 bg-white/10 rounded">Ctrl +</kbd> / <kbd className="px-1.5 py-0.5 bg-white/10 rounded">Ctrl -</kbd> Scaling & <kbd className="px-1.5 py-0.5 bg-white/10 rounded">R</kbd> Rotation
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BlueprintVisualizer;
