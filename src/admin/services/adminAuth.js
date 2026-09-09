/**
 * Admin Authentication Service
 */
import { loginAdminWithEmail, requestAdminPasswordResetOtp, verifyAdminPasswordResetOtp, resetAdminPasswordWithToken } from "@/lib/db/app-service";

export const adminAuthService = {
  async login(email, password) {
    return await loginAdminWithEmail({
      data: { email, password },
    });
  },

  async requestPasswordReset(email) {
    return await requestAdminPasswordResetOtp({
      data: { email },
    });
  },

  async verifyOtp(email, otp) {
    return await verifyAdminPasswordResetOtp({
      data: { email, otp },
    });
  },

  async resetPassword(email, resetToken, newPassword, confirmPassword) {
    return await resetAdminPasswordWithToken({
      data: { email, resetToken, newPassword, confirmPassword },
    });
  },
};
