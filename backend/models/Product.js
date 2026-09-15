/**
 * Apparel Product Data Model
 */
export const ProductModel = {
  tableName: "products",
  schema: {
    id: "string",
    name: "string",
    category: "string",
    price: "number",
    description: "string",
    image: "string",
    colors: "array",
    sizes: "array",
    createdAt: "timestamp",
  },
};
