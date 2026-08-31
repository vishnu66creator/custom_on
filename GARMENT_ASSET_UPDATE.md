# CustomON Garment Asset Update

This project package uses the uploaded individual garment images for the six approved products: Regular Fit T-Shirt, Oversized T-Shirt, Polo T-Shirt, Full-Sleeve T-Shirt, Pullover Hoodie, and Zip-Up Hoodie. Each product includes separate S, M, and L front/back images under `public/assets/size_catalog/`.

Matching garment-only alpha masks were regenerated with general object segmentation, moderate alpha-threshold cleanup, largest-component isolation, and light edge smoothing. This fixes black recoloring on the replacement photos: the overlay follows the complete garment silhouette, keeps collar/hood/zipper construction visible, and leaves transparent background pixels unchanged. The existing application architecture and image path contract were preserved.

Validation completed:

| Check | Result |
|---|---|
| Replacement image/mask pairs | 36 image pairs and 36 matching masks validated |
| Image dimensions | 1600 × 2000 for all supported images |
| Mask checks | 36 non-empty garment silhouettes; transparent-pixel recolor validation passed |
| Supported sizes | S, M, L only in the shipped size catalog |
| Production build | `npm run check` passed |
| Development server | Started successfully on Vite and served representative routes/assets with HTTP 200 |
| Lint | Existing Prettier-formatting errors remain in the source archive; no application source was changed for this asset-only update |
