import "dotenv/config";
import { Resend } from "resend";
import nodemailer from "nodemailer";

interface SendEmailParams {
  to: string;
  name: string;
  otp: string;
}

interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

function maskEmail(email: string): string {
  const parts = email.split("@");
  if (parts.length !== 2) return "***";
  const user = parts[0]!;
  const domain = parts[1]!;
  const visible = user.length > 2 ? user.slice(0, 2) : user.slice(0, 1);
  return `${visible}***@${domain}`;
}

/**
 * Shared email dispatcher: supports Gmail SMTP (EMAIL_USER / EMAIL_PASS),
 * Resend (RESEND_API_KEY), and developer console fallback.
 */
async function deliverEmail({
  to,
  subject,
  html,
  text,
  otp,
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
  otp: string;
}): Promise<SendEmailResult> {
  // Always log OTP prominently in console for development & debugging
  console.log(`\n==================================================`);
  console.log(`🔑 [CUSTOM ON OTP] To: ${to}`);
  console.log(`🔑 OTP Code: ${otp}`);
  console.log(`==================================================\n`);

  const gmailUser = process.env["EMAIL_USER"];
  const gmailPass = process.env["EMAIL_PASS"];
  const resendApiKey = process.env["RESEND_API_KEY"];
  const hasGmail = Boolean(gmailUser && gmailPass);
  const hasResend = Boolean(
    resendApiKey &&
      resendApiKey.trim().length > 0 &&
      !resendApiKey.includes("your_resend_api_key")
  );

  // 1. Gmail SMTP with App Password (Nodemailer)
  if (hasGmail) {
    try {
      console.log(`[Email Service] Delivering via Gmail SMTP (${gmailUser}) to: ${maskEmail(to)}`);
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: gmailUser,
          pass: gmailPass,
        },
      });

      const info = await transporter.sendMail({
        from: `"CustomON" <${gmailUser}>`,
        replyTo: gmailUser,
        to,
        subject,
        html,
        text: text || `Your CustomON verification code is: ${otp}. It is valid for 10 minutes.`,
      });

      console.log(`[Email Service] ✓ Gmail SMTP sent successfully! (Message ID: ${info.messageId})`);
      return { success: true, messageId: info.messageId };
    } catch (err: any) {
      console.error("[Email Service] ✗ Gmail SMTP delivery error:", err.message || err);
      // In development mode, don't block registration
      if (process.env["NODE_ENV"] !== "production") {
        console.warn("[Email Service] Dev fallback activated despite Gmail SMTP error. Use OTP logged above.");
        return { success: true, messageId: "dev-fallback" };
      }
      return {
        success: false,
        error: "Unable to send verification email via Gmail. Please try again.",
      };
    }
  }

  // 2. Resend API
  if (hasResend) {
    try {
      console.log(`[Email Service] Delivering via Resend to: ${maskEmail(to)}`);
      const resend = new Resend(resendApiKey);
      const fromAddress = process.env["EMAIL_FROM"] || "CustomON <onboarding@resend.dev>";
      const { data, error } = await resend.emails.send({
        from: fromAddress,
        to: [to],
        subject,
        html,
      });

      if (error) {
        console.error("[Email Service] Resend API error:", error.message || error);
        if (process.env["NODE_ENV"] !== "production") {
          console.warn("[Email Service] Dev fallback activated despite Resend error. Use OTP logged above.");
          return { success: true, messageId: "dev-fallback" };
        }
        return {
          success: false,
          error: error.message || "Email delivery failed. Please try again.",
        };
      }

      console.log(`[Email Service] ✓ Resend accepted email (ID: ${data?.id || "N/A"})`);
      return { success: true, messageId: data?.id };
    } catch (err: any) {
      console.error("[Email Service] Resend dispatch error:", err.message || err);
      if (process.env["NODE_ENV"] !== "production") {
        return { success: true, messageId: "dev-fallback" };
      }
      return { success: false, error: "Unable to send verification email." };
    }
  }

  // 3. Fallback when neither provider is configured
  console.warn("⚠️ [Email Service] No email provider configured (EMAIL_USER/EMAIL_PASS or RESEND_API_KEY).");
  if (process.env["NODE_ENV"] === "production") {
    return {
      success: false,
      error: "Email delivery service is currently not configured. Please contact support.",
    };
  }

  // In development, return success so testing OTP works seamlessly
  console.log(`[Email Service] Dev mode: check OTP above in terminal console.`);
  return { success: true, messageId: "dev-mock-otp" };
}

/**
 * Sends a clean, responsive, production-ready CustomON OTP verification email.
 */
export async function sendVerificationEmail({
  to,
  name,
  otp,
}: SendEmailParams): Promise<SendEmailResult> {
  const recipientName = name ? name.trim() : "Valued Customer";

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify your CustomON account</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #0c0c0e;
      color: #f4f4f5;
      margin: 0;
      padding: 0;
      -webkit-text-size-adjust: none;
    }
    .container {
      max-width: 560px;
      margin: 30px auto;
      background: #18181b;
      border: 1px solid #27272a;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5);
    }
    .header {
      background: #121215;
      padding: 28px 32px;
      text-align: center;
      border-bottom: 1px solid #27272a;
    }
    .logo-text {
      font-size: 26px;
      font-weight: 900;
      letter-spacing: 0.05em;
      color: #ffffff;
      text-transform: uppercase;
      text-decoration: none;
    }
    .logo-orange {
      color: #f97316;
    }
    .content {
      padding: 36px 32px;
    }
    h1 {
      font-size: 20px;
      font-weight: 700;
      color: #ffffff;
      margin-top: 0;
      margin-bottom: 16px;
    }
    p {
      font-size: 15px;
      line-height: 1.6;
      color: #a1a1aa;
      margin-top: 0;
      margin-bottom: 20px;
    }
    .otp-wrapper {
      background: #09090b;
      border: 1px solid #27272a;
      border-radius: 14px;
      padding: 24px;
      text-align: center;
      margin: 28px 0;
    }
    .otp-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      font-weight: 700;
      color: #f97316;
      margin-bottom: 10px;
    }
    .otp-code {
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
      font-size: 38px;
      font-weight: 800;
      letter-spacing: 0.25em;
      color: #ffffff;
      margin: 0;
      padding-left: 0.25em;
    }
    .otp-subtext {
      font-size: 13px;
      color: #71717a;
      margin-top: 10px;
      margin-bottom: 0;
    }
    .alert-box {
      background: rgba(249, 115, 22, 0.06);
      border-left: 3px solid #f97316;
      padding: 12px 16px;
      border-radius: 0 8px 8px 0;
      margin: 24px 0;
    }
    .alert-text {
      font-size: 13px;
      color: #fdba74;
      margin: 0;
      line-height: 1.5;
    }
    .footer {
      background: #121215;
      padding: 24px 32px;
      text-align: center;
      border-top: 1px solid #27272a;
    }
    .footer-text {
      font-size: 12px;
      color: #52525b;
      margin: 0;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span class="logo-text">Custom<span class="logo-orange">ON</span></span>
    </div>
    <div class="content">
      <h1>Verify your email address</h1>
      <p>Hello ${recipientName},</p>
      <p>Thank you for signing up with <strong>CustomON</strong>. To finish setting up your account, please enter the following single-use verification code:</p>

      <div class="otp-wrapper">
        <div class="otp-label">Your Verification Code</div>
        <div class="otp-code">${otp}</div>
        <p class="otp-subtext">This code will expire in <strong>10 minutes</strong>.</p>
      </div>

      <div class="alert-box">
        <p class="alert-text"><strong>Security Notice:</strong> Never share this code with anyone. CustomON staff will never ask for your verification code.</p>
      </div>

      <p>If you did not request this email, please safely disregard it.</p>
      
      <p style="margin-top: 24px;">Warm regards,<br><strong style="color: #ffffff;">CustomON Team</strong></p>
    </div>
    <div class="footer">
      <p class="footer-text">© ${new Date().getFullYear()} CustomON Apparels. All rights reserved.<br>This is an automated transactional security message.</p>
    </div>
  </div>
</body>
</html>
  `;

  return deliverEmail({
    to,
    subject: "Verify your CustomON account",
    html: htmlContent,
    text: `Hello ${recipientName},\n\nYour CustomON verification code is: ${otp}\nThis code is valid for 10 minutes.\n\nCustomON Team`,
    otp,
  });
}

/**
 * Sends a clean, responsive CustomON Password Reset OTP email.
 */
export async function sendPasswordResetEmail({
  to,
  name,
  otp,
}: SendEmailParams): Promise<SendEmailResult> {
  const recipientName = name ? name.trim() : "Valued Customer";

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset your CustomON password</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #0c0c0e;
      color: #f4f4f5;
      margin: 0;
      padding: 0;
      -webkit-text-size-adjust: none;
    }
    .container {
      max-width: 560px;
      margin: 30px auto;
      background: #18181b;
      border: 1px solid #27272a;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5);
    }
    .header {
      background: #121215;
      padding: 28px 32px;
      text-align: center;
      border-bottom: 1px solid #27272a;
    }
    .logo-text {
      font-size: 26px;
      font-weight: 900;
      letter-spacing: 0.05em;
      color: #ffffff;
      text-transform: uppercase;
      text-decoration: none;
    }
    .logo-orange {
      color: #f97316;
    }
    .content {
      padding: 36px 32px;
    }
    h1 {
      font-size: 20px;
      font-weight: 700;
      color: #ffffff;
      margin-top: 0;
      margin-bottom: 16px;
    }
    p {
      font-size: 15px;
      line-height: 1.6;
      color: #a1a1aa;
      margin-top: 0;
      margin-bottom: 20px;
    }
    .otp-wrapper {
      background: #09090b;
      border: 1px solid #27272a;
      border-radius: 14px;
      padding: 24px;
      text-align: center;
      margin: 28px 0;
    }
    .otp-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      font-weight: 700;
      color: #f97316;
      margin-bottom: 10px;
    }
    .otp-code {
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
      font-size: 38px;
      font-weight: 800;
      letter-spacing: 0.25em;
      color: #ffffff;
      margin: 0;
      padding-left: 0.25em;
    }
    .otp-subtext {
      font-size: 13px;
      color: #71717a;
      margin-top: 10px;
      margin-bottom: 0;
    }
    .alert-box {
      background: rgba(239, 68, 68, 0.08);
      border-left: 3px solid #ef4444;
      padding: 12px 16px;
      border-radius: 0 8px 8px 0;
      margin: 24px 0;
    }
    .alert-text {
      font-size: 13px;
      color: #fca5a5;
      margin: 0;
      line-height: 1.5;
    }
    .footer {
      background: #121215;
      padding: 24px 32px;
      text-align: center;
      border-top: 1px solid #27272a;
    }
    .footer-text {
      font-size: 12px;
      color: #52525b;
      margin: 0;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span class="logo-text">Custom<span class="logo-orange">ON</span></span>
    </div>
    <div class="content">
      <h1>Password Reset Request</h1>
      <p>Hello ${recipientName},</p>
      <p>We received a request to reset the password for your <strong>CustomON</strong> account. Use the one-time code below to reset your password:</p>

      <div class="otp-wrapper">
        <div class="otp-label">Password Reset Code</div>
        <div class="otp-code">${otp}</div>
        <p class="otp-subtext">Valid for <strong>10 minutes</strong>.</p>
      </div>

      <div class="alert-box">
        <p class="alert-text"><strong>Security Alert:</strong> If you did not request a password reset, your account is still secure. Please disregard this email.</p>
      </div>

      <p>If you did not request a password reset, you can safely ignore this email.</p>
      
      <p style="margin-top: 24px;">Regards,<br><strong style="color: #ffffff;">CustomON Team</strong></p>
    </div>
    <div class="footer">
      <p class="footer-text">© ${new Date().getFullYear()} CustomON Apparels. All rights reserved.<br>This is an automated transactional security message.</p>
    </div>
  </div>
</body>
</html>
  `;

  return deliverEmail({
    to,
    subject: "Reset your CustomON password",
    html: htmlContent,
    text: `Hello ${recipientName},\n\nYour CustomON password reset code is: ${otp}\nValid for 10 minutes.\n\nCustomON Team`,
    otp,
  });
}
