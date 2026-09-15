/**
 * Customer Apparel Order Data Model
 */
export const OrderModel = {
  tableName: "orders",
  schema: {
    id: "string",
    customerId: "string",
    status: "string", // paid | processing | shipped | delivered | cancelled
    total: "number",
    items: "array",
    shippingAddress: "object",
    createdAt: "timestamp",
  },
};
