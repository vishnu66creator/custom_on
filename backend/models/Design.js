/**
 * Studio Custom Design Data Model
 */
export const DesignModel = {
  tableName: "designs",
  schema: {
    id: "string",
    customerId: "string",
    title: "string",
    garmentId: "string",
    color: "string",
    canvasData: "object", // text, stickers, placements
    previewImageUrl: "string",
    status: "string", // Pending | Approved | Rejected
    createdAt: "timestamp",
  },
};
