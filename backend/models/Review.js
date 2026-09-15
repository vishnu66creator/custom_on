/**
 * Customer Review Data Model
 */
export const ReviewModel = {
  tableName: "reviews",
  schema: {
    id: "string",
    customerId: "string",
    productId: "string",
    rating: "number",
    comment: "string",
    status: "string", // Published | Pending | Hidden
    createdAt: "timestamp",
  },
};
