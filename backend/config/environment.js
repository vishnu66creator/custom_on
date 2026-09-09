/**
 * Backend Environment Configuration
 */
import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  databaseUrl: process.env.DATABASE_URL || "",
  jwtSecret: process.env.JWT_SECRET || "customon_jwt_secret_key_2026",
  resendApiKey: process.env.RESEND_API_KEY || "",
  emailFrom: process.env.EMAIL_FROM || "CustomON <onboarding@resend.dev>",
  googleClientId: process.env.GOOGLE_CLIENT_ID || "",
};
