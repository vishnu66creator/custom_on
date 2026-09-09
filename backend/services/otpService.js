/**
 * OTP Generation & Verification Service
 */
import crypto from "node:crypto";

export const otpService = {
  generateOtp() {
    return crypto.randomInt(100000, 1000000).toString();
  },

  hashOtp(otp, identifier) {
    return crypto.createHash("sha256").update(`${otp}:${identifier.toLowerCase()}`).digest("hex");
  },
};
