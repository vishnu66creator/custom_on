/**
 * User Customer Data Model
 */
export const UserModel = {
  tableName: "customers",
  schema: {
    id: "string",
    username: "string",
    email: "string",
    passwordHash: "string",
    role: "customer",
    name: "string",
    phone: "string",
    emailVerified: "boolean",
    createdAt: "timestamp",
  },
};
