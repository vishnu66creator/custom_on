export type ReferenceDesign = {
  id: string;
  name: string;
  svg: string; // Data URL or raw SVG string
};

const DEFAULT_DESIGNS: ReferenceDesign[] = [
  {
    id: "retro-surf-circle",
    name: "Retro Surf Circle",
    svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="%230A0A0A" /><circle cx="50" cy="50" r="42" fill="none" stroke="%23FF5F1F" stroke-width="2" /><path d="M 25,50 A 25,25 0 0,1 75,50 Z" fill="%23FF5F1F" /><line x1="22" y1="54" x2="78" y2="54" stroke="%230A0A0A" stroke-width="2" /><line x1="25" y1="58" x2="75" y2="58" stroke="%230A0A0A" stroke-width="2" /><line x1="30" y1="62" x2="70" y2="62" stroke="%230A0A0A" stroke-width="2" /><path d="M 28,68 Q 39,64 50,68 T 72,68" fill="none" stroke="%23FF5F1F" stroke-width="2" /><path d="M 32,74 Q 41,70 50,74 T 68,74" fill="none" stroke="%23FF5F1F" stroke-width="2" /><text x="50" y="32" fill="%23FFFFFF" font-family="'Plus Jakarta Sans', sans-serif" font-size="7" font-weight="bold" text-anchor="middle" letter-spacing="1">CALIFORNIA</text><text x="50" y="85" fill="%23FFFFFF" font-family="'Plus Jakarta Sans', sans-serif" font-size="6" font-weight="bold" text-anchor="middle" letter-spacing="2">WEST COAST</text></svg>`
  },
  {
    id: "wilderness-peak",
    name: "Wilderness Peak",
    svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="none" stroke="%230A0A0A" stroke-width="1.5" /><polygon points="50,28 72,68 28,68" fill="none" stroke="%230A0A0A" stroke-width="2" /><polygon points="62,42 78,68 46,68" fill="none" stroke="%230A0A0A" stroke-width="1.5" /><circle cx="38" cy="38" r="6" fill="%23FF5F1F" /><line x1="33" y1="68" x2="33" y2="58" stroke="%230A0A0A" stroke-width="1.5" /><polygon points="30,59 36,59 33,53" fill="%230A0A0A" /><line x1="67" y1="68" x2="67" y2="60" stroke="%230A0A0A" stroke-width="1.5" /><polygon points="65,61 69,61 67,56" fill="%230A0A0A" /><line x1="20" y1="68" x2="80" y2="68" stroke="%230A0A0A" stroke-width="2" /><text x="50" y="80" fill="%230A0A0A" font-family="'Plus Jakarta Sans', sans-serif" font-size="8" font-weight="bold" text-anchor="middle" letter-spacing="2">WILDERNESS</text></svg>`
  },
  {
    id: "retro-creative",
    name: "Retro Creative",
    svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 50"><rect width="150" height="50" rx="8" fill="%230A0A0A" /><line x1="10" y1="12" x2="140" y2="12" stroke="%23FF5F1F" stroke-width="1" stroke-opacity="0.3" /><line x1="10" y1="38" x2="140" y2="38" stroke="%23FF5F1F" stroke-width="1" stroke-opacity="0.3" /><text x="75" y="31" fill="%23FF5F1F" font-family="'Plus Jakarta Sans', sans-serif" font-size="18" font-weight="800" text-anchor="middle" letter-spacing="4">CREATIVE</text><text x="75" y="44" fill="%23FFFFFF" font-family="monospace" font-size="5" font-weight="bold" text-anchor="middle" letter-spacing="3">DESIGN STUDIO v1.0</text></svg>`
  },
  {
    id: "cyber-grid",
    name: "Cyber Grid",
    svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%230A0A0A" rx="10" /><line x1="10" y1="50" x2="90" y2="50" stroke="%231F2A44" stroke-width="0.5" /><line x1="50" y1="10" x2="50" y2="90" stroke="%231F2A44" stroke-width="0.5" /><ellipse cx="50" cy="50" rx="30" ry="30" fill="none" stroke="%23FF5F1F" stroke-width="1.5" /><ellipse cx="50" cy="50" rx="15" ry="30" fill="none" stroke="%23FF5F1F" stroke-width="1" /><ellipse cx="50" cy="50" rx="5" ry="30" fill="none" stroke="%23FF5F1F" stroke-width="0.5" /><ellipse cx="50" cy="50" rx="30" ry="10" fill="none" stroke="%23FF5F1F" stroke-width="1" /><ellipse cx="50" cy="50" rx="30" ry="20" fill="none" stroke="%23FF5F1F" stroke-width="1" /><line x1="15" y1="15" x2="25" y2="15" stroke="%23FFFFFF" stroke-width="1" /><line x1="15" y1="15" x2="15" y2="25" stroke="%23FFFFFF" stroke-width="1" /><line x1="85" y1="85" x2="75" y2="85" stroke="%23FFFFFF" stroke-width="1" /><line x1="85" y1="85" x2="85" y2="75" stroke="%23FFFFFF" stroke-width="1" /><text x="50" y="92" fill="%23FFFFFF" font-family="monospace" font-size="5" text-anchor="middle" letter-spacing="1">SYSTEM OVERRIDE</text></svg>`
  },
  {
    id: "vintage-bloom",
    name: "Vintage Bloom",
    svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="8" fill="%23FF5F1F" /><path d="M 50,42 C 45,30 55,30 50,42 Z" fill="none" stroke="%230A0A0A" stroke-width="1.5" /><path d="M 50,58 C 45,70 55,70 50,58 Z" fill="none" stroke="%230A0A0A" stroke-width="1.5" /><path d="M 42,50 C 30,45 30,55 42,50 Z" fill="none" stroke="%230A0A0A" stroke-width="1.5" /><path d="M 58,50 C 70,45 70,55 58,50 Z" fill="none" stroke="%230A0A0A" stroke-width="1.5" /><path d="M 44,44 C 34,34 40,30 44,44 Z" fill="none" stroke="%230A0A0A" stroke-width="1" /><path d="M 56,56 C 66,66 60,70 56,56 Z" fill="none" stroke="%230A0A0A" stroke-width="1" /><path d="M 56,44 C 66,34 70,40 56,44 Z" fill="none" stroke="%230A0A0A" stroke-width="1" /><path d="M 44,56 C 34,66 30,60 44,56 Z" fill="none" stroke="%230A0A0A" stroke-width="1" /><path d="M 50,50 L 50,85" stroke="%230A0A0A" stroke-width="1.5" /><path d="M 50,65 Q 40,60 42,55" fill="none" stroke="%230A0A0A" stroke-width="1.5" /><path d="M 50,72 Q 60,67 58,62" fill="none" stroke="%230A0A0A" stroke-width="1.5" /><text x="50" y="93" fill="%230A0A0A" font-family="'Plus Jakarta Sans', sans-serif" font-size="7" font-weight="bold" text-anchor="middle" letter-spacing="2">BLOOM</text></svg>`
  }
];

const STORAGE_KEY = "customon:custom-designs";

export function getCustomDesigns(): ReferenceDesign[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error("Failed to load custom designs from localStorage", e);
    return [];
  }
}

export function saveCustomDesign(name: string, svg: string): ReferenceDesign {
  const newDesign: ReferenceDesign = {
    id: `custom-design-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`,
    name,
    svg
  };

  if (typeof window !== "undefined") {
    try {
      const current = getCustomDesigns();
      const updated = [newDesign, ...current];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save custom design to localStorage", e);
    }
  }

  return newDesign;
}

export function getDesigns(): ReferenceDesign[] {
  const custom = getCustomDesigns();
  const defaultIds = new Set(DEFAULT_DESIGNS.map((d) => d.id));
  const filteredCustom = custom.filter((d) => !defaultIds.has(d.id));
  return [...filteredCustom, ...DEFAULT_DESIGNS];
}
