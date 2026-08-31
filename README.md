# CustomON Apparel Customizer

CustomON is an existing TanStack Start, React, TypeScript, Tailwind CSS, Drizzle, and PostgreSQL apparel-customization application. This repository preserves the existing storefront, Design Studio, cart, order, wishlist, and owner-dashboard architecture while finalizing the production apparel foundation.

## Final catalog policy

The customer-facing catalog is intentionally fixed to exactly six Men&apos;s apparel blanks:

| Product | Category | Supported colors | Supported sizes |
|---|---|---|---|
| Regular Fit T-Shirt | T-Shirts | Black, White | S, M, L |
| Oversized T-Shirt | T-Shirts | Black, White | S, M, L |
| Polo T-Shirt | T-Shirts | Black, White | S, M, L |
| Full-Sleeve T-Shirt | T-Shirts | Black, White | S, M, L |
| Pullover Hoodie | Hoodies | Black, White | S, M, L |
| Zip-Up Hoodie | Hoodies | Black, White | S, M, L |

Each product uses distinct product-specific front and back media. The high-resolution source assets are stored under `public/assets/size_catalog/`, with matching transparent recoloring masks for every supported size and side. Garment recoloring is clipped to the mask, so the preview frame and background remain unchanged while fabric texture, folds, and shadows are preserved.

The shared catalog definitions live in `src/lib/products.ts`. The size-specific media map is in `src/lib/size-media.ts`, the rendering and mask compositing logic is in `src/lib/garments.tsx`, and the Studio state and controls are in `src/routes/studio.tsx`. The database seed and runtime database/local-storage fallbacks are also constrained to the same six products, Black/White colors, and S/M/L sizes.

## Development

Install dependencies with Node.js and npm, then start the development server:

```sh
npm install
npm run dev
```

Run the final production check with:

```sh
npm run check
```

The application can run with graceful static-catalog fallback when a live PostgreSQL database is unavailable. Database access is isolated to server-side functions and does not require a local database for the storefront preview.

## Project status

The final validation pass confirms that the storefront renders six products, exposes only S/M/L and Black/White filters, and that the Studio can load all 72 approved product/size/color/side combinations. All 36 size-specific front/back image pairs and their masks are present at 1600×2000 pixels, with distinct front and back files for each product and size.
