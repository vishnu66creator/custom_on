import { addProductReview, listReviews } from "./db/app-service";

export interface Review {
  id: string;
  productId: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
}

export async function getReviews(productId: string): Promise<Review[]> {
  const stored = await listReviews({ data: { productId } });
  return stored.map((review) => ({
    id: review.id,
    productId: review.productId,
    author: review.author,
    rating: review.rating,
    comment: review.comment,
    date: review.createdAt.toISOString(),
  }));
}

export async function addReview(
  productId: string,
  author: string,
  rating: number,
  comment: string,
): Promise<Review> {
  const review = await addProductReview({
    data: {
      productId,
      author: author.trim() || "Anonymous Shopper",
      rating,
      comment: comment.trim(),
    },
  });
  return { ...review, date: review.createdAt.toISOString() };
}

export interface RatingSummary {
  average: number;
  count: number;
}

export async function getRatingSummary(productId: string): Promise<RatingSummary> {
  const reviews = await getReviews(productId);
  if (reviews.length === 0) return { average: 5, count: 0 };
  const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0);
  return { average: parseFloat((sum / reviews.length).toFixed(1)), count: reviews.length };
}
