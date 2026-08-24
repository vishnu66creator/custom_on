export interface Review {
  id: string;
  productId: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
}

const DEFAULT_REVIEWS: Review[] = [
  {
    id: "rev-1",
    productId: "classic-tee",
    author: "Alex Miller",
    rating: 5,
    comment: "Excellent print quality! Fabric is super soft and breathable even after multiple wash cycles.",
    date: "2026-05-15T08:30:00.000Z",
  },
  {
    id: "rev-2",
    productId: "classic-tee",
    author: "Jessica T.",
    rating: 4,
    comment: "Nice standard fit. The custom text printed exactly how it looked on the studio preview.",
    date: "2026-06-02T14:22:00.000Z",
  },
  {
    id: "rev-3",
    productId: "comfort-hoodie",
    author: "Marcus Vance",
    rating: 5,
    comment: "This hoodie is incredibly thick and cozy. Perfect for winter customization. Highly recommend!",
    date: "2026-04-10T11:15:00.000Z",
  },
  {
    id: "rev-4",
    productId: "comfort-hoodie",
    author: "Elena R.",
    rating: 5,
    comment: "Great quality hoodie. The printing area is large and holds vector graphics beautifully.",
    date: "2026-06-11T16:45:00.000Z",
  },
  {
    id: "rev-5",
    productId: "comfort-hoodie",
    author: "David K.",
    rating: 3,
    comment: "Comfortable, but fits a little larger than expected. Go one size down.",
    date: "2026-06-18T09:12:00.000Z",
  },
  {
    id: "rev-6",
    productId: "athletic-polo",
    author: "Sarah Jenkins",
    rating: 4,
    comment: "Very professional look. Perfect for adding company logo embroidery.",
    date: "2026-05-28T12:05:00.000Z",
  },
  {
    id: "rev-7",
    productId: "streetwear-oversized",
    author: "Jordan Smith",
    rating: 5,
    comment: "Best oversized fit ever. Thick heavyweight cotton, dropping shoulders are perfect. Graphic looks amazing.",
    date: "2026-06-25T18:33:00.000Z",
  },
  {
    id: "rev-8",
    productId: "ceramic-mug",
    author: "Emma Watson",
    rating: 5,
    comment: "Microwave and dishwasher safe! The custom print wraps nicely around the surface and doesn't fade.",
    date: "2026-06-28T10:00:00.000Z",
  },
];

export function getReviews(productId: string): Review[] {
  if (typeof window === "undefined") return DEFAULT_REVIEWS.filter(r => r.productId === productId);
  try {
    const stored = localStorage.getItem("customon:reviews");
    const parsed: Review[] = stored ? JSON.parse(stored) : [];
    
    // Combine mock reviews and user reviews
    const allReviews = [...DEFAULT_REVIEWS, ...parsed];
    return allReviews.filter((r) => r.productId === productId);
  } catch {
    return DEFAULT_REVIEWS.filter((r) => r.productId === productId);
  }
}

export function addReview(productId: string, author: string, rating: number, comment: string): Review {
  const newReview: Review = {
    id: `rev-${Math.floor(100000 + Math.random() * 900000)}`,
    productId,
    author: author.trim() || "Anonymous Shopper",
    rating,
    comment: comment.trim(),
    date: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("customon:reviews");
      const parsed: Review[] = stored ? JSON.parse(stored) : [];
      parsed.push(newReview);
      localStorage.setItem("customon:reviews", JSON.stringify(parsed));
    } catch {
      // noop
    }
  }

  return newReview;
}

export interface RatingSummary {
  average: number;
  count: number;
}

export function getRatingSummary(productId: string): RatingSummary {
  const reviews = getReviews(productId);
  if (reviews.length === 0) {
    return { average: 5, count: 0 };
  }
  const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0);
  return {
    average: parseFloat((sum / reviews.length).toFixed(1)),
    count: reviews.length,
  };
}
