# CustomON Cart and Studio Validation

## Changes validated

The Design Studio cart icon now navigates directly to `/cart` instead of opening the legacy embedded drawer. The Studio overlay now uses the full garment preview bounds (`inset: 0`) so text, uploaded graphics, and shapes can be positioned across the full front or back garment canvas rather than only within the previous product-specific print rectangle.

## Browser checks

1. Opened `/studio?productId=regular-tee` successfully.
2. Confirmed the visible `Open cart` control exists in the Studio header.
3. Clicked the Studio cart icon and confirmed the browser navigated to `/cart`.
4. Returned to the Studio and clicked `Add to cart`; confirmed navigation to `/cart` with the new Regular Fit T-Shirt item present.
5. Confirmed the production build passed with `npm run check` after the changes.

## Notes

The old cart drawer component remains in the source file as unused legacy code, but it is no longer reachable from the Studio UI. The dedicated cart page is the active cart destination for both the header cart icon and Studio add-to-cart action.

Validation date: 2026-08-30
