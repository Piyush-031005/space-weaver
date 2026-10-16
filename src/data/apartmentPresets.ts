// src/data/apartmentPresets.ts

export interface StyleTheme {
  id: 'modern' | 'scandinavian' | 'japandi' | 'tropical' | 'farmhouse';
  name: string;
  badge: string;
  floorLiving: string;
  floorWood: string;
  floorTile: string;
  wallColor: string;
  wallStroke: string;
  sofaColor: string;
  woodTone: string;
  islandColor: string;
  rugColor: string;
  beddingPrimary: string;
  beddingSecondary: string;
  accentPlant: boolean;
  ambientGlow: string;
}

export const STYLE_THEMES: Record<StyleTheme['id'], StyleTheme> = {
  modern: {
    id: 'modern',
    name: 'Modern Luxury',
    badge: '🏛️',
    floorLiving: '#dcdad5',
    floorWood: '#4a4138',
    floorTile: '#c8c4bc',
    wallColor: '#2b2b2b',
    wallStroke: '#141414',
    sofaColor: '#e4e2dd',
    woodTone: '#52473f',
    islandColor: '#f0eee9',
    rugColor: '#b8b4ac',
    beddingPrimary: '#7d746b',
    beddingSecondary: '#dcd8d0',
    accentPlant: false,
    ambientGlow: 'rgba(255, 255, 255, 0.08)',
  },
  tropical: {
    id: 'tropical',
    name: 'Tropical Sanctuary',
    badge: '🌴',
    floorLiving: '#efe6d5',
    floorWood: '#9e6b3b',
    floorTile: '#e3d6c1',
    wallColor: '#f4efe6',
    wallStroke: '#3d352e',
    sofaColor: '#ede4d3',
    woodTone: '#b87d46',
    islandColor: '#d99b56',
    rugColor: '#d4b37f',
    beddingPrimary: '#e5dec9',
    beddingSecondary: '#8c9e6e',
    accentPlant: true,
    ambientGlow: 'rgba(255, 210, 130, 0.14)',
  },
  japandi: {
    id: 'japandi',
    name: 'Japandi Harmony',
    badge: '🎋',
    floorLiving: '#e6dec8',
    floorWood: '#c7aa83',
    floorTile: '#d9d2c5',
    wallColor: '#d8d0c5',
    wallStroke: '#595147',
    sofaColor: '#f2ece1',
    woodTone: '#cfa97e',
    islandColor: '#d8b892',
    rugColor: '#cbbba0',
    beddingPrimary: '#c2b5a3',
    beddingSecondary: '#ede8df',
    accentPlant: true,
    ambientGlow: 'rgba(245, 222, 179, 0.12)',
  },
  scandinavian: {
    id: 'scandinavian',
    name: 'Scandinavian Airy',
    badge: '❄️',
    floorLiving: '#f5f2eb',
    floorWood: '#dfc7a7',
    floorTile: '#eae6df',
    wallColor: '#ffffff',
    wallStroke: '#7a756c',
    sofaColor: '#f7f5f0',
    woodTone: '#e3c39d',
    islandColor: '#f2ede4',
    rugColor: '#e0d6c5',
    beddingPrimary: '#d6cfc2',
    beddingSecondary: '#ffffff',
    accentPlant: false,
    ambientGlow: 'rgba(220, 235, 255, 0.12)',
  },
  farmhouse: {
    id: 'farmhouse',
    name: 'Modern Farmhouse',
    badge: '🌾',
    floorLiving: '#e2d9c8',
    floorWood: '#7c5836',
    floorTile: '#d4cec3',
    wallColor: '#3a3632',
    wallStroke: '#1f1c18',
    sofaColor: '#f0ece1',
    woodTone: '#6b4727',
    islandColor: '#ebe5d8',
    rugColor: '#bfa888',
    beddingPrimary: '#8c7762',
    beddingSecondary: '#f4f0e8',
    accentPlant: true,
    ambientGlow: 'rgba(255, 200, 140, 0.1)',
  },
};

export interface StudioItem {
  id: string;
  name: string;
  type: 'sofa' | 'table' | 'tv' | 'bed' | 'storage' | 'island' | 'chair' | 'bookshelf' | 'lamp';
  x: number;
  y: number;
  width: number;
  depth: number;
  rotation: number;
  zone: string;
  elevation?: number;
}

// Passes directly into SpaceWeaver's Fullscreen3DStudio
export const APARTMENT_3D_ITEMS: StudioItem[] = [
  { id: 'lr-sofa', name: 'L-Shaped Sectional Sofa', type: 'sofa', x: 7.5, y: 5.5, width: 7.5, depth: 8.5, rotation: 0, zone: 'Living Room' },
  { id: 'lr-table', name: 'Sculptural Coffee Table', type: 'table', x: 5.2, y: 6.2, width: 3.2, depth: 3.2, rotation: 0, zone: 'Living Room' },
  { id: 'lr-tv', name: 'Architectural Media Wall', type: 'tv', x: 1.2, y: 6.0, width: 1.5, depth: 7.0, rotation: 90, zone: 'Living Room' },
  { id: 'kt-island', name: 'Waterfall Kitchen Island', type: 'table', x: 15.5, y: 5.8, width: 3.2, depth: 6.5, rotation: 0, zone: 'Kitchen' },
  { id: 'bd-bed', name: 'King Platform Bed', type: 'bed', x: 4.5, y: 17.5, width: 6.5, depth: 6.0, rotation: 90, zone: 'Bedroom' },
  { id: 'bd-wardrobe', name: 'Built-in Wardrobe', type: 'storage', x: 5.5, y: 12.8, width: 8.0, depth: 2.0, rotation: 0, zone: 'Bedroom' },
];
