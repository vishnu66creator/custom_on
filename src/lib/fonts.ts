export type FontCategory =
  | "all"
  | "script"
  | "handwritten"
  | "bold"
  | "condensed"
  | "serif"
  | "elegant"
  | "modern"
  | "retro"
  | "display"
  | "classic";

export interface FontOption {
  id: string;
  label: string;
  value: string;
  category: FontCategory;
  sample?: string;
}

export const FONT_CATEGORIES: { id: FontCategory; label: string }[] = [
  { id: "all", label: "All" },
  { id: "script", label: "Script" },
  { id: "handwritten", label: "Handwritten" },
  { id: "bold", label: "Bold" },
  { id: "condensed", label: "Condensed" },
  { id: "serif", label: "Serif" },
  { id: "elegant", label: "Elegant" },
  { id: "modern", label: "Modern" },
  { id: "retro", label: "Retro" },
  { id: "display", label: "Display" },
  { id: "classic", label: "Classic" },
];

export const FONTS: FontOption[] = [
  // SCRIPT & CURSIVE
  { id: "great-vibes", label: "Great Vibes", value: "'Great Vibes', cursive", category: "script", sample: "Samantha" },
  { id: "dancing-script", label: "Dancing Script", value: "'Dancing Script', cursive", category: "script", sample: "Samantha" },
  { id: "pacifico", label: "Pacifico", value: "'Pacifico', cursive", category: "script", sample: "Samantha" },
  { id: "satisfy", label: "Satisfy", value: "'Satisfy', cursive", category: "script", sample: "Samantha" },
  { id: "sacramento", label: "Sacramento", value: "'Sacramento', cursive", category: "script", sample: "Samantha" },
  { id: "allura", label: "Allura", value: "'Allura', cursive", category: "script", sample: "Samantha" },
  { id: "alex-brush", label: "Alex Brush", value: "'Alex Brush', cursive", category: "script", sample: "Samantha" },
  { id: "kaushan-script", label: "Kaushan Script", value: "'Kaushan Script', cursive", category: "script", sample: "Samantha" },
  { id: "lobster", label: "Lobster", value: "'Lobster', cursive", category: "script", sample: "Samantha" },

  // HANDWRITTEN
  { id: "caveat", label: "Caveat", value: "'Caveat', cursive", category: "handwritten", sample: "Samantha" },
  { id: "kalam", label: "Kalam", value: "'Kalam', cursive", category: "handwritten", sample: "Samantha" },
  { id: "permanent-marker", label: "Permanent Marker", value: "'Permanent Marker', cursive", category: "handwritten", sample: "SAMANTHA" },
  { id: "patrick-hand", label: "Patrick Hand", value: "'Patrick Hand', cursive", category: "handwritten", sample: "Samantha" },
  { id: "indie-flower", label: "Indie Flower", value: "'Indie Flower', cursive", category: "handwritten", sample: "Samantha" },

  // BOLD & HEAVY
  { id: "anton", label: "Anton", value: "'Anton', sans-serif", category: "bold", sample: "SAMANTHA" },
  { id: "bebas-neue", label: "Bebas Neue", value: "'Bebas Neue', sans-serif", category: "bold", sample: "SAMANTHA" },
  { id: "russo-one", label: "Russo One", value: "'Russo One', sans-serif", category: "bold", sample: "SAMANTHA" },
  { id: "league-spartan", label: "League Spartan", value: "'League Spartan', sans-serif", category: "bold", sample: "SAMANTHA" },

  // CONDENSED
  { id: "oswald", label: "Oswald", value: "'Oswald', sans-serif", category: "condensed", sample: "SAMANTHA" },
  { id: "barlow-condensed", label: "Barlow Condensed", value: "'Barlow Condensed', sans-serif", category: "condensed", sample: "SAMANTHA" },
  { id: "archivo-narrow", label: "Archivo Narrow", value: "'Archivo Narrow', sans-serif", category: "condensed", sample: "SAMANTHA" },

  // SERIF & ELEGANT
  { id: "playfair-display", label: "Playfair Display", value: "'Playfair Display', serif", category: "serif", sample: "Samantha" },
  { id: "cinzel", label: "Cinzel", value: "'Cinzel', serif", category: "elegant", sample: "SAMANTHA" },
  { id: "cormorant-garamond", label: "Cormorant Garamond", value: "'Cormorant Garamond', serif", category: "serif", sample: "Samantha" },
  { id: "libre-baskerville", label: "Libre Baskerville", value: "'Libre Baskerville', serif", category: "serif", sample: "Samantha" },
  { id: "merriweather", label: "Merriweather", value: "'Merriweather', serif", category: "serif", sample: "Samantha" },

  // MODERN
  { id: "plus-jakarta-sans", label: "Plus Jakarta Sans", value: "'Plus Jakarta Sans', sans-serif", category: "modern", sample: "Samantha" },
  { id: "inter", label: "Inter", value: "'Inter', sans-serif", category: "modern", sample: "Samantha" },
  { id: "montserrat", label: "Montserrat", value: "'Montserrat', sans-serif", category: "modern", sample: "Samantha" },
  { id: "poppins", label: "Poppins", value: "'Poppins', sans-serif", category: "modern", sample: "Samantha" },
  { id: "raleway", label: "Raleway", value: "'Raleway', sans-serif", category: "modern", sample: "Samantha" },
  { id: "space-grotesk", label: "Space Grotesk", value: "'Space Grotesk', sans-serif", category: "modern", sample: "Samantha" },
  { id: "syne", label: "Syne", value: "'Syne', sans-serif", category: "modern", sample: "Samantha" },

  // RETRO & DISPLAY
  { id: "righteous", label: "Righteous", value: "'Righteous', display", category: "retro", sample: "Samantha" },
  { id: "bungee", label: "Bungee", value: "'Bungee', display", category: "display", sample: "SAMANTHA" },
  { id: "abril-fatface", label: "Abril Fatface", value: "'Abril Fatface', display", category: "display", sample: "Samantha" },
  { id: "orbitron", label: "Orbitron", value: "'Orbitron', sans-serif", category: "display", sample: "SAMANTHA" },
  { id: "monoton", label: "Monoton", value: "'Monoton', display", category: "display", sample: "SAMANTHA" },
  { id: "press-start-2p", label: "Press Start 2P", value: "'Press Start 2P', monospace", category: "retro", sample: "SAM" },
  { id: "pirata-one", label: "Pirata One", value: "'Pirata One', display", category: "retro", sample: "Samantha" },
  { id: "unifraktur", label: "Old English", value: "'UnifrakturMaguntia', serif", category: "retro", sample: "Samantha" },

  // CLASSIC
  { id: "dm-sans", label: "DM Sans", value: "'DM Sans', sans-serif", category: "classic", sample: "Samantha" },
  { id: "comfortaa", label: "Comfortaa", value: "'Comfortaa', display", category: "classic", sample: "Samantha" },
];

/** Utility to find font label by CSS value or ID */
export function getFontLabel(fontValue: string): string {
  const matched = FONTS.find((f) => f.value === fontValue || f.id === fontValue);
  return matched ? matched.label : fontValue.split(",")[0]?.replace(/['"]/g, "") ?? fontValue;
}
