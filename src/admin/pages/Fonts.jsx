import React from "react";
import { Type } from "lucide-react";

export function Fonts() {
  const fonts = [
    { name: "Bebas Neue", family: "Bebas Neue", category: "Display / Bold", sample: "VINTAGE STREETWEAR" },
    { name: "Inter", family: "Inter", category: "Sans-Serif", sample: "Clean Modern Merchandise" },
    { name: "Playfair Display", family: "Playfair Display", category: "Serif / Luxury", sample: "Haute Couture Aesthetic" },
    { name: "Montserrat", family: "Montserrat", category: "Geometric", sample: "ATHLETIC CLUB 1984" },
    { name: "Permanent Marker", family: "Permanent Marker", category: "Handwritten", sample: "Urban Graffiti Tag" },
    { name: "Orbitron", family: "Orbitron", category: "Futuristic / Sci-Fi", sample: "CYBER DYNAMICS CORP" },
  ];

  return (
    <div className="space-y-6 text-white animate-fade-in">
      <div>
        <h2 className="font-display text-xl font-bold uppercase tracking-tight">Studio Typography & Fonts</h2>
        <p className="text-xs text-white/50">Active Google Fonts and custom typographic weights available in the text canvas editor.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fonts.map((f, idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5 shadow-lg flex flex-col justify-between hover:border-white/20 transition"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-brand-orange/10 flex items-center justify-center text-brand-orange">
                  <Type className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-bold text-xs text-white">{f.name}</div>
                  <div className="text-[10px] text-white/40">{f.category}</div>
                </div>
              </div>
              <span className="text-[10px] font-mono text-brand-orange bg-brand-orange/10 px-2 py-0.5 rounded-full border border-brand-orange/20">
                Active in Studio
              </span>
            </div>

            <div
              className="p-4 rounded-xl bg-black/40 border border-white/5 text-lg text-white/90 text-center tracking-wide"
              style={{ fontFamily: f.family }}
            >
              {f.sample}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
