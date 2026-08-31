import { useId, type ReactNode } from "react";
import { getProductMedia, type Product } from "./products";

/**
 * Vector garment renderer.
 *
 * Every one of the 7 catalog products is drawn as a real SVG silhouette so
 * that:
 *  - the garment colour is a genuine `fill` (it always applies visibly),
 *  - front and back are distinct outlines with their own construction detail,
 *  - the print area is a known rectangle in view-box units, so the HTML design
 *    canvas can be overlaid on top of it accurately.
 *
 * Photographic mock-ups were deliberately dropped: a photo cannot be recoloured
 * or reshaped reliably, which was the source of the earlier "colour does not
 * apply" and "wing shaped sleeves" defects.
 */

export const VIEW_W = 500;
export const VIEW_H = 640;

export type GarmentSide = "front" | "back";
export type TargetGroup = "Men";

export type PrintArea = {
  /** All values are percentages of the garment view box. */
  left: number;
  top: number;
  width: number;
  height: number;
};

type Rect = { x: number; y: number; w: number; h: number };

const toPrintArea = (r: Rect): PrintArea => ({
  left: (r.x / VIEW_W) * 100,
  top: (r.y / VIEW_H) * 100,
  width: (r.w / VIEW_W) * 100,
  height: (r.h / VIEW_H) * 100,
});

/* ------------------------------------------------------------------ *
 * Outlines
 *
 * Shared anatomy (view box 500 x 640):
 *   neck opening  x 200 -> 300 at y 96
 *   shoulder tips x 164 / 336 at y 84
 *   armpits       x 158 / 342 at y 198
 *   hem           y 520 (tees) / 546 (hoodies)
 * ------------------------------------------------------------------ */

const NECK_FRONT = "C 222 148 278 148 292 110";
const NECK_BACK = "C 222 128 278 128 292 110";
const NECK_FLAT = "L 292 110";
const NECK_FRONT_WIDE = "C 220 152 280 152 294 110";
const NECK_BACK_WIDE = "C 220 130 280 130 294 110";

/** Short sleeve, straight body — the regular fit block. */
const teeBody = (neck: string) =>
  `M 208 110 ${neck}` +
  " C 322 112 356 116 380 124" +
  " C 424 140 456 176 472 214" +
  " L 424 282 C 408 274 392 258 382 240 L 378 234" +
  " C 386 330 388 430 386 500" +
  " C 320 516 180 516 114 500" +
  " C 112 430 114 330 122 234" +
  " L 118 240 C 108 258 92 274 76 282" +
  " L 28 214 C 44 176 76 140 120 124" +
  " C 144 116 178 112 208 110 Z";

const TEE_FRONT = teeBody(NECK_FRONT);
const TEE_BACK = teeBody(NECK_BACK);

/** Boxy body with a dropped shoulder and wider sleeve. */
const oversizedBody = (neck: string) =>
  `M 206 110 ${neck}` +
  " C 330 112 368 118 396 128" +
  " C 442 148 474 186 490 228" +
  " L 440 308 C 422 298 406 280 396 258 L 392 252" +
  " C 398 350 400 440 398 512" +
  " C 330 528 170 528 102 512" +
  " C 100 440 102 350 108 252" +
  " L 104 258 C 94 280 78 298 60 308" +
  " L 10 228 C 26 186 58 148 104 128" +
  " C 132 118 170 112 206 110 Z";

const OVERSIZED_FRONT = oversizedBody(NECK_FRONT_WIDE);
const OVERSIZED_BACK = oversizedBody(NECK_BACK_WIDE);

/** Long sleeves tapering into a rib cuff at the wrist. */
const fullSleeveBody = (neck: string) =>
  `M 208 110 ${neck}` +
  " C 322 112 356 116 380 124" +
  " C 424 140 456 176 472 214" +
  " L 486 404 C 488 418 480 428 466 430 L 430 432 C 419 430 412 422 410 410" +
  " L 382 240 L 378 234" +
  " C 386 330 388 430 386 500" +
  " C 320 516 180 516 114 500" +
  " C 112 430 114 330 122 234" +
  " L 118 240 L 90 410 C 88 422 81 430 70 432 L 34 430 C 20 428 12 418 14 404" +
  " L 28 214 C 44 176 76 140 120 124" +
  " C 144 116 178 112 208 110 Z";

const FULL_SLEEVE_FRONT = fullSleeveBody(NECK_FRONT);
const FULL_SLEEVE_BACK = fullSleeveBody(NECK_BACK);

/** Polo shares the tee block; the flat neckline carries a collar + placket. */
const POLO_FRONT = teeBody(NECK_FLAT);
const POLO_BACK = teeBody(NECK_BACK);

/** Heavyweight hoodie: lower shoulders, long sleeves, rib hem band. */
const hoodieBody = (neck: string) =>
  `M 204 136 ${neck}` +
  " C 324 138 362 144 388 154" +
  " C 432 174 462 210 476 250" +
  " L 492 412 C 494 426 486 436 472 438 L 434 440 C 423 438 416 430 414 418" +
  " L 396 276 L 392 270" +
  " C 398 370 400 452 398 520" +
  " C 330 536 170 536 102 520" +
  " C 100 452 102 370 108 270" +
  " L 104 276 L 86 418 C 84 430 77 438 66 440 L 28 438 C 14 436 6 426 8 412" +
  " L 24 250 C 38 210 68 174 112 154" +
  " C 138 144 176 138 204 136 Z";

const HOODIE_NECK_FRONT = "C 220 178 280 178 296 136";
const HOODIE_NECK_BACK = "C 220 156 280 156 296 136";
const HOODIE_FRONT = hoodieBody(HOODIE_NECK_FRONT);
const HOODIE_BACK = hoodieBody(HOODIE_NECK_BACK);

/* ------------------------------------------------------------------ *
 * Shared detail helpers
 * ------------------------------------------------------------------ */

const seam = "rgba(0,0,0,0.28)";
const seamSoft = "rgba(0,0,0,0.14)";

function Stitch({ d }: { d: string }) {
  return (
    <path
      d={d}
      fill="none"
      stroke={seamSoft}
      strokeWidth={2}
      strokeDasharray="7 5"
      strokeLinecap="round"
    />
  );
}

function NeckRib({ d }: { d: string }) {
  return (
    <>
      <path d={d} fill="none" stroke={seam} strokeWidth={11} strokeLinecap="round" />
      <path
        d={d}
        fill="none"
        stroke="rgba(255,255,255,0.14)"
        strokeWidth={4}
        strokeLinecap="round"
      />
    </>
  );
}

/* ------------------------------------------------------------------ *
 * Per-product specs
 * ------------------------------------------------------------------ */

type Spec = {
  front: string;
  back: string;
  printFront: Rect;
  printBack: Rect;
  behindFront?: (color: string) => ReactNode;
  behindBack?: (color: string) => ReactNode;
  detailsFront?: () => ReactNode;
  detailsBack?: () => ReactNode;
  folds?: string[];
};

const teeFolds = ["M 168 260 C 178 340 176 420 168 490", "M 332 260 C 322 340 324 420 332 490"];

const hoodieFolds = ["M 166 300 C 176 372 174 452 166 508", "M 334 300 C 324 372 326 452 334 508"];

const TEE_ARM_SEAMS = (
  <>
    <Stitch d="M 124 128 C 116 180 118 214 122 234" />
    <Stitch d="M 376 128 C 384 180 382 214 378 234" />
  </>
);

const TEE_CUFFS = (
  <>
    <path
      d="M 76 282 C 92 274 108 258 118 240"
      fill="none"
      stroke={seam}
      strokeWidth={4}
      strokeLinecap="round"
    />
    <path
      d="M 424 282 C 408 274 392 258 382 240"
      fill="none"
      stroke={seam}
      strokeWidth={4}
      strokeLinecap="round"
    />
  </>
);

const TEE_HEM = (
  <path d="M 114 486 C 180 502 320 502 386 486" fill="none" stroke={seamSoft} strokeWidth={3} />
);

const TEE_DETAILS_FRONT = () => (
  <>
    <NeckRib d={`M 208 110 ${NECK_FRONT}`} />
    {TEE_ARM_SEAMS}
    {TEE_CUFFS}
    {TEE_HEM}
  </>
);

const TEE_DETAILS_BACK = () => (
  <>
    <NeckRib d={`M 208 110 ${NECK_BACK}`} />
    <path d="M 250 126 L 250 168" stroke={seamSoft} strokeWidth={2} fill="none" />
    {TEE_ARM_SEAMS}
    {TEE_CUFFS}
    {TEE_HEM}
  </>
);

const HOOD_FRONT = (split: boolean) => (color: string) => (
  <>
    <path
      d="M 182 152 C 168 44 332 44 318 152 C 296 186 204 186 182 152 Z"
      fill={color}
      stroke={seam}
      strokeWidth={3}
    />
    <path
      d="M 200 146 C 194 82 306 82 300 146"
      fill="none"
      stroke="rgba(0,0,0,0.22)"
      strokeWidth={2.5}
    />
    <path
      d="M 182 152 C 168 44 332 44 318 152 C 296 186 204 186 182 152 Z"
      fill="rgba(0,0,0,0.18)"
    />
    {split && (
      <path d="M 250 96 L 250 180" stroke="rgba(0,0,0,0.28)" strokeWidth={2.5} fill="none" />
    )}
  </>
);

const HOOD_BACK_DRAPE = (split: boolean) => (color: string) => (
  <>
    {/* Draped hood sitting behind the shoulders on the back view. */}
    <path
      d="M 172 172 C 154 34 346 34 328 172 C 296 208 204 208 172 172 Z"
      fill={color}
      stroke={seam}
      strokeWidth={3}
    />
    <path
      d="M 190 164 C 178 62 322 62 310 164"
      fill="none"
      stroke="rgba(0,0,0,0.24)"
      strokeWidth={2.5}
    />
    <path
      d="M 208 156 C 200 92 300 92 292 156"
      fill="none"
      stroke="rgba(0,0,0,0.16)"
      strokeWidth={2}
    />
    <path
      d="M 172 172 C 154 34 346 34 328 172 C 296 208 204 208 172 172 Z"
      fill="rgba(0,0,0,0.14)"
    />
    {split && (
      <path d="M 250 48 L 250 196" stroke="rgba(0,0,0,0.3)" strokeWidth={2.5} fill="none" />
    )}
  </>
);

const Drawstrings = () => (
  <>
    <path
      d="M 226 168 C 230 226 226 262 224 292"
      fill="none"
      stroke="rgba(255,255,255,0.82)"
      strokeWidth={5}
      strokeLinecap="round"
    />
    <path
      d="M 274 168 C 270 226 274 262 276 292"
      fill="none"
      stroke="rgba(255,255,255,0.82)"
      strokeWidth={5}
      strokeLinecap="round"
    />
    <circle cx={224} cy={296} r={5} fill="#b8b8b8" stroke="rgba(0,0,0,0.4)" strokeWidth={1.5} />
    <circle cx={276} cy={296} r={5} fill="#b8b8b8" stroke="rgba(0,0,0,0.4)" strokeWidth={1.5} />
  </>
);

const HoodieRibs = () => (
  <>
    {/* Cuff ribs */}
    <path d="M 8 412 L 84 420" stroke={seam} strokeWidth={4} strokeLinecap="round" fill="none" />
    <path d="M 492 412 L 416 420" stroke={seam} strokeWidth={4} strokeLinecap="round" fill="none" />
    {/* Hem band */}
    <path d="M 102 498 C 170 514 330 514 398 498" fill="none" stroke={seam} strokeWidth={4} />
    <path d="M 102 512 C 170 528 330 528 398 512" fill="none" stroke={seamSoft} strokeWidth={2.5} />
    {/* Raglan-ish shoulder seams */}
    <Stitch d="M 114 162 C 106 228 108 254 108 270" />
    <Stitch d="M 386 162 C 394 228 392 254 392 270" />
  </>
);

const SPECS: Record<string, Spec> = {
  "regular-tee": {
    front: TEE_FRONT,
    back: TEE_BACK,
    printFront: { x: 166, y: 212, w: 168, h: 216 },
    printBack: { x: 164, y: 182, w: 172, h: 248 },
    detailsFront: TEE_DETAILS_FRONT,
    detailsBack: TEE_DETAILS_BACK,
    folds: teeFolds,
  },
  "oversized-tee": {
    front: OVERSIZED_FRONT,
    back: OVERSIZED_BACK,
    printFront: { x: 152, y: 220, w: 196, h: 232 },
    printBack: { x: 150, y: 190, w: 200, h: 258 },
    detailsFront: () => (
      <>
        <NeckRib d={`M 206 110 ${NECK_FRONT_WIDE}`} />
        <Stitch d="M 110 134 C 100 196 104 232 108 252" />
        <Stitch d="M 390 134 C 400 196 396 232 392 252" />
        <path
          d="M 60 308 C 78 298 94 280 104 258"
          fill="none"
          stroke={seam}
          strokeWidth={4}
          strokeLinecap="round"
        />
        <path
          d="M 440 308 C 422 298 406 280 396 258"
          fill="none"
          stroke={seam}
          strokeWidth={4}
          strokeLinecap="round"
        />
        <path
          d="M 102 498 C 170 514 330 514 398 498"
          fill="none"
          stroke={seamSoft}
          strokeWidth={3}
        />
      </>
    ),
    detailsBack: () => (
      <>
        <NeckRib d={`M 206 110 ${NECK_BACK_WIDE}`} />
        <Stitch d="M 110 134 C 100 196 104 232 108 252" />
        <Stitch d="M 390 134 C 400 196 396 232 392 252" />
        <path
          d="M 102 498 C 170 514 330 514 398 498"
          fill="none"
          stroke={seamSoft}
          strokeWidth={3}
        />
      </>
    ),
    folds: ["M 188 260 C 196 330 194 420 188 512", "M 312 260 C 304 330 306 420 312 512"],
  },
  "polo-tee": {
    front: POLO_FRONT,
    back: POLO_BACK,
    printFront: { x: 170, y: 244, w: 160, h: 186 },
    printBack: { x: 164, y: 182, w: 172, h: 244 },
    detailsFront: () => (
      <>
        {/* Ribbed polo collar */}
        <path
          d="M 212 110 L 250 150 L 288 110 L 294 82 C 268 68 232 68 206 82 Z"
          fill="rgba(0,0,0,0.12)"
          stroke={seam}
          strokeWidth={3}
        />
        {/* Placket + buttons */}
        <path
          d="M 234 144 L 234 232 L 266 232 L 266 144"
          fill="rgba(0,0,0,0.06)"
          stroke={seam}
          strokeWidth={3}
        />
        <circle
          cx={250}
          cy={170}
          r={5}
          fill="rgba(255,255,255,0.7)"
          stroke={seam}
          strokeWidth={1.5}
        />
        <circle
          cx={250}
          cy={206}
          r={5}
          fill="rgba(255,255,255,0.7)"
          stroke={seam}
          strokeWidth={1.5}
        />
        {TEE_ARM_SEAMS}
        {TEE_CUFFS}
        <path
          d="M 114 486 C 180 502 320 502 386 486"
          fill="none"
          stroke={seamSoft}
          strokeWidth={3}
        />
      </>
    ),
    detailsBack: () => (
      <>
        <path
          d="M 206 82 C 232 68 268 68 294 82 L 294 114 C 268 128 232 128 206 114 Z"
          fill="rgba(0,0,0,0.12)"
          stroke={seam}
          strokeWidth={3}
        />
        {TEE_ARM_SEAMS}
        {TEE_CUFFS}
        <path
          d="M 114 486 C 180 502 320 502 386 486"
          fill="none"
          stroke={seamSoft}
          strokeWidth={3}
        />
      </>
    ),
    folds: teeFolds,
  },
  "full-sleeve-tee": {
    front: FULL_SLEEVE_FRONT,
    back: FULL_SLEEVE_BACK,
    printFront: { x: 166, y: 212, w: 168, h: 216 },
    printBack: { x: 164, y: 182, w: 172, h: 248 },
    detailsFront: () => (
      <>
        <NeckRib d={`M 208 110 ${NECK_FRONT}`} />
        {TEE_ARM_SEAMS}
        <path
          d="M 14 404 L 88 414"
          stroke={seam}
          strokeWidth={4}
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 486 404 L 412 414"
          stroke={seam}
          strokeWidth={4}
          strokeLinecap="round"
          fill="none"
        />
        {TEE_HEM}
      </>
    ),
    detailsBack: () => (
      <>
        <NeckRib d={`M 208 110 ${NECK_BACK}`} />
        {TEE_ARM_SEAMS}
        <path
          d="M 14 404 L 88 414"
          stroke={seam}
          strokeWidth={4}
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 486 404 L 412 414"
          stroke={seam}
          strokeWidth={4}
          strokeLinecap="round"
          fill="none"
        />
        {TEE_HEM}
      </>
    ),
    folds: teeFolds,
  },
  "pullover-hoodie": {
    front: HOODIE_FRONT,
    back: HOODIE_BACK,
    printFront: { x: 172, y: 254, w: 156, h: 162 },
    printBack: { x: 162, y: 222, w: 176, h: 240 },
    behindFront: HOOD_FRONT(false),
    behindBack: HOOD_BACK_DRAPE(false),
    detailsFront: () => (
      <>
        <path
          d="M 204 136 C 220 178 280 178 296 136"
          fill="none"
          stroke={seam}
          strokeWidth={7}
          strokeLinecap="round"
        />
        <Drawstrings />
        {/* Kangaroo pocket */}
        <path
          d="M 176 420 L 324 420 L 336 496 L 164 496 Z"
          fill="rgba(0,0,0,0.07)"
          stroke={seam}
          strokeWidth={3}
        />
        <path d="M 176 430 L 324 430" stroke={seamSoft} strokeWidth={2} fill="none" />
        <HoodieRibs />
      </>
    ),
    detailsBack: () => (
      <>
        <path
          d="M 204 136 C 220 156 280 156 296 136"
          fill="none"
          stroke={seam}
          strokeWidth={6}
          strokeLinecap="round"
        />
        <HoodieRibs />
      </>
    ),
    folds: hoodieFolds,
  },
  "zip-up-hoodie": {
    front: HOODIE_FRONT,
    back: HOODIE_BACK,
    printFront: { x: 268, y: 256, w: 76, h: 158 },
    printBack: { x: 162, y: 222, w: 176, h: 240 },
    behindFront: HOOD_FRONT(true),
    behindBack: HOOD_BACK_DRAPE(true),
    detailsFront: () => (
      <>
        <path
          d="M 204 136 C 220 178 280 178 296 136"
          fill="none"
          stroke={seam}
          strokeWidth={7}
          strokeLinecap="round"
        />
        {/* Full-length centre zip */}
        <path d="M 250 172 L 250 520" stroke="rgba(0,0,0,0.35)" strokeWidth={12} />
        <path d="M 250 172 L 250 520" stroke="#c9ced6" strokeWidth={7} />
        <path d="M 250 172 L 250 520" stroke="#5b636e" strokeWidth={2} strokeDasharray="4 4" />
        <rect
          x={243}
          y={232}
          width={14}
          height={26}
          rx={4}
          fill="#9aa2ad"
          stroke="#3c434c"
          strokeWidth={1.6}
        />
        <path d="M 250 258 L 250 286" stroke="#3c434c" strokeWidth={2.5} strokeLinecap="round" />
        <Drawstrings />
        {/* Split hand pockets */}
        <path
          d="M 170 428 L 240 428 L 240 494 L 160 494 Z"
          fill="rgba(0,0,0,0.06)"
          stroke={seam}
          strokeWidth={3}
        />
        <path
          d="M 260 428 L 330 428 L 340 494 L 260 494 Z"
          fill="rgba(0,0,0,0.06)"
          stroke={seam}
          strokeWidth={3}
        />
        <HoodieRibs />
      </>
    ),
    detailsBack: () => (
      <>
        <path
          d="M 204 136 C 220 156 280 156 296 136"
          fill="none"
          stroke={seam}
          strokeWidth={6}
          strokeLinecap="round"
        />
        <HoodieRibs />
      </>
    ),
    folds: hoodieFolds,
  },
};

const FALLBACK_SPEC_ID = "regular-tee";

function specFor(productId: string): Spec {
  const direct = SPECS[productId];
  if (direct) return direct;
  const id = (productId || "").toLowerCase();
  if (id.includes("zip")) return SPECS["zip-up-hoodie"]!;
  if (id.includes("hood")) return SPECS["pullover-hoodie"]!;
  if (id.includes("polo")) return SPECS["polo-tee"]!;
  if (id.includes("sleeve")) return SPECS["full-sleeve-tee"]!;
  if (id.includes("oversized")) return SPECS["oversized-tee"]!;
  return SPECS[FALLBACK_SPEC_ID]!;
}

export function getPrintArea(productId: string, side: GarmentSide): PrintArea {
  const spec = specFor(productId);
  return toPrintArea(side === "front" ? spec.printFront : spec.printBack);
}

export function fitScaleFor(_group: TargetGroup): { scaleX: number; scaleY: number } {
  return { scaleX: 1, scaleY: 1 };
}

export function sizeScaleFor(size: string): { scaleX: number; scaleY: number } {
  const scales: Record<string, number> = { S: 0.92, M: 1, L: 1.05 };
  const scale = scales[size] ?? 1;
  return { scaleX: scale, scaleY: scale };
}

/**
 * Relative luminance based contrast helper — used for text/ink on a garment.
 */
export function contrastInk(hex: string): string {
  const clean = (hex || "#ffffff").replace("#", "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean.padEnd(6, "0");
  const num = Number.parseInt(full.slice(0, 6), 16);
  if (Number.isNaN(num)) return "#0A0A0A";
  const r = (num >> 16) & 0xff;
  const g = (num >> 8) & 0xff;
  const b = num & 0xff;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 140 ? "#FFFFFF" : "#0A0A0A";
}

export function GarmentSvg({
  productId,
  side,
  color,
  className,
}: {
  productId: string;
  side: GarmentSide;
  color: string;
  className?: string;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const spec = specFor(productId);
  const body = side === "front" ? spec.front : spec.back;
  const behind = side === "front" ? spec.behindFront : spec.behindBack;
  const details = side === "front" ? spec.detailsFront : spec.detailsBack;

  const gradSide = `g-side-${uid}`;
  const gradVert = `g-vert-${uid}`;
  const clip = `clip-${uid}`;
  const shadow = `shadow-${uid}`;

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      className={className}
      role="img"
      aria-label={`${productId} ${side} view`}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id={gradSide} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#000" stopOpacity="0.22" />
          <stop offset="16%" stopColor="#000" stopOpacity="0.06" />
          <stop offset="36%" stopColor="#fff" stopOpacity="0.14" />
          <stop offset="52%" stopColor="#fff" stopOpacity="0.05" />
          <stop offset="74%" stopColor="#000" stopOpacity="0.05" />
          <stop offset="88%" stopColor="#000" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.24" />
        </linearGradient>
        <linearGradient id={gradVert} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.1" />
          <stop offset="50%" stopColor="#fff" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.12" />
        </linearGradient>
        <clipPath id={clip}>
          <path d={body} />
        </clipPath>
        <filter id={shadow} x="-25%" y="-25%" width="150%" height="150%">
          <feDropShadow dx="0" dy="14" stdDeviation="16" floodColor="#000" floodOpacity="0.5" />
        </filter>
      </defs>

      <g filter={`url(#${shadow})`}>
        {behind ? behind(color) : null}
        <path d={body} fill={color} />
      </g>

      <g clipPath={`url(#${clip})`}>
        <path d={body} fill={`url(#${gradSide})`} />
        <path d={body} fill={`url(#${gradVert})`} />
        {(spec.folds ?? []).map((d, i) => (
          <path
            key={i}
            d={d}
            fill="none"
            stroke="#000"
            strokeOpacity={0.05}
            strokeWidth={20}
            strokeLinecap="round"
          />
        ))}
      </g>

      <path d={body} fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth={2.5} />
      <g clipPath={`url(#${clip})`}>{details ? details() : null}</g>
    </svg>
  );
}

/**
 * Real apparel preview used by the customer-facing catalog and Design Studio.
 * The photo remains the base layer; the clipped color wash changes the garment
 * tone while preserving highlights, shadows, folds, and fabric texture.
 */
export function getProductMask(product: Product, side: GarmentSide, size?: string): string {
  const selected = size ? product.sizeMedia?.[size] : undefined;
  if (side === "front") {
    return (
      selected?.frontMaskImage ?? product.frontMaskImage ?? product.frontImage ?? product.image
    );
  }
  return selected?.backMaskImage ?? product.backMaskImage ?? product.frontImage ?? product.image;
}

export function GarmentImage({
  product,
  side,
  size,
  color,
  className,
}: {
  product: Product;
  side: GarmentSide;
  size?: string;
  color?: string;
  className?: string;
}) {
  const image = getProductMedia(product, side, size);
  const maskImage = getProductMask(product, side, size);

  return (
    <div
      className={`relative overflow-hidden ${className ?? ""}`}
      role="img"
      aria-label={`${product.name} ${side} view`}
    >
      <img
        src={image}
        alt={`${product.name} ${side} view`}
        className="absolute inset-0 h-full w-full object-contain"
        draggable={false}
      />
      {color && (
        <>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundColor: color,
              opacity: 0.62,
              mixBlendMode: "color",
              WebkitMaskImage: `url(${maskImage})`,
              maskImage: `url(${maskImage})`,
              WebkitMaskSize: "contain",
              maskSize: "contain",
              WebkitMaskPosition: "center",
              maskPosition: "center",
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
            }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundColor: color,
              opacity: 0.72,
              mixBlendMode: "multiply",
              WebkitMaskImage: `url(${maskImage})`,
              maskImage: `url(${maskImage})`,
              WebkitMaskSize: "contain",
              maskSize: "contain",
              WebkitMaskPosition: "center",
              maskPosition: "center",
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
            }}
          />
        </>
      )}
    </div>
  );
}
