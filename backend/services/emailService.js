/**
 * Backend Transactional Email Service
 */
import { config } from "../config/environment.js";

export const emailService = {
  async sendOtpEmail(toEmail, otp) {
    if (!config.resendApiKey) {
      console.log(`[Email Mock] Dispatched OTP ${otp} to ${toEmail}`);
      return { success: true, mocked: true };
    }
    const { Resend } = await import("resend");
    const resend = new Resend(config.resendApiKey);
    return await resend.emails.send({
      from: config.emailFrom,
      to: toEmail,
      subject: "Your Custom On Verification Code",
      text: `Your verification code is: ${otp}. Valid for 10 minutes.`,
    });
  },
};
