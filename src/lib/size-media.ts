export type SizeMedia = {
  frontImage: string;
  backImage: string;
  frontMaskImage: string;
  backMaskImage: string;
};

const media = (product: string, size: string): SizeMedia => ({
  frontImage: `/assets/size_catalog/${product}/${size.toLowerCase()}-front.png`,
  backImage: `/assets/size_catalog/${product}/${size.toLowerCase()}-back.png`,
  frontMaskImage: `/assets/size_catalog/${product}/${size.toLowerCase()}-front-mask.png`,
  backMaskImage: `/assets/size_catalog/${product}/${size.toLowerCase()}-back-mask.png`,
});

export const SIZE_MEDIA: Record<string, Record<string, SizeMedia>> = {
  "regular-tee": {
    S: media("regular-tee", "S"),
    M: media("regular-tee", "M"),
    L: media("regular-tee", "L"),
  },
  "oversized-tee": {
    S: media("oversized-tee", "S"),
    M: media("oversized-tee", "M"),
    L: media("oversized-tee", "L"),
  },
  "polo-tee": { S: media("polo-tee", "S"), M: media("polo-tee", "M"), L: media("polo-tee", "L") },
  "full-sleeve-tee": {
    S: media("full-sleeve-tee", "S"),
    M: media("full-sleeve-tee", "M"),
    L: media("full-sleeve-tee", "L"),
  },
  "pullover-hoodie": {
    S: media("pullover-hoodie", "S"),
    M: media("pullover-hoodie", "M"),
    L: media("pullover-hoodie", "L"),
  },
  "zip-up-hoodie": {
    S: media("zip-up-hoodie", "S"),
    M: media("zip-up-hoodie", "M"),
    L: media("zip-up-hoodie", "L"),
  },
};
