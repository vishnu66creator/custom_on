/**
 * Admin Data Model Definition
 */
export const AdminModel = {
  tableName: "admins",
  schema: {
    id: "string",
    email: "string",
    passwordHash: "string",
    name: "string",
    role: "admin", // admin | shop-owner
    createdAt: "timestamp",
  },
};
