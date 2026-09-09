import { Resend } from "resend";

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
 * Sends a clean, responsive, production-ready CustomON OTP verification email using Resend.
 */
export async function sendVerificationEmail({
  to,
  name,
  otp,
}: SendEmailParams): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromAddress = process.env.EMAIL_FROM || "CustomON <onboarding@resend.dev>";
  const isKeyConfigured = Boolean(apiKey && apiKey.trim().length > 0 && !apiKey.includes("your_resend_api_key"));

  console.log(`[Email Service] Verification email requested for: ${maskEmail(to)}`);
  console.log(`[Email Service] RESEND_API_KEY configured: ${isKeyConfigured}`);
  console.log(`[Email Service] EMAIL_FROM: ${fromAddress}`);

  if (!isKeyConfigured) {
    console.error(
      "[Email Service] Resend API key missing or placeholder. Please configure a valid RESEND_API_KEY in your .env file."
    );
    return {
      success: false,
      error: "Email delivery service is currently not configured. Please add a valid RESEND_API_KEY to your server .env file.",
    };
  }

  try {
    const resend = new Resend(apiKey);
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
      font-weight: 800;
      color: #ffffff;
      margin-top: 0;
      margin-bottom: 16px;
      letter-spacing: -0.02em;
    }
    p {
      font-size: 14px;
      line-height: 1.6;
      color: #a1a1aa;
      margin: 0 0 16px;
    }
    .otp-container {
      margin: 28px 0;
      text-align: center;
    }
    .otp-box {
      display: inline-block;
      background: #09090b;
      border: 2px solid #f97316;
      color: #ffffff;
      font-size: 32px;
      font-weight: 800;
      letter-spacing: 8px;
      padding: 14px 28px;
      border-radius: 14px;
      box-shadow: 0 0 25px rgba(249, 115, 22, 0.2);
      font-family: 'Courier New', Courier, monospace;
    }
    .warning-box {
      background: #27272a40;
      border-left: 3px solid #f97316;
      padding: 12px 16px;
      border-radius: 6px;
      margin: 20px 0;
    }
    .warning-text {
      font-size: 12px;
      color: #d4d4d8;
      margin: 0;
    }
    .footer {
      background: #121215;
      padding: 24px 32px;
      text-align: center;
      border-top: 1px solid #27272a;
    }
    .footer-text {
      font-size: 11px;
      color: #71717a;
      margin: 0;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo-text">CUSTOM<span class="logo-orange">ON</span></div>
    </div>
    <div class="content">
      <h1>Verify your CustomON account</h1>
      <p>Hello <strong>${recipientName}</strong>,</p>
      <p>Welcome to <strong>CustomON</strong>! Please use the 6-digit verification code below to activate your customer account:</p>
      
      <div class="otp-container">
        <div class="otp-box">${otp}</div>
      </div>
      
      <div class="warning-box">
        <p class="warning-text">⏱ This verification code will expire in <strong>10 minutes</strong>. Do not share this code with anyone.</p>
      </div>

      <p>If you did not create a CustomON account, you can safely ignore this email.</p>
      
      <p style="margin-top: 24px;">Regards,<br><strong style="color: #ffffff;">CustomON Team</strong></p>
    </div>
    <div class="footer">
      <p class="footer-text">© ${new Date().getFullYear()} CustomON Apparels. All rights reserved.<br>This is an automated transactional security message.</p>
    </div>
  </div>
</body>
</html>
    `;

    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: [to],
      subject: "Verify your CustomON account",
      html: htmlContent,
    });

    if (error) {
      console.error("[Email Service] Resend API error:", error.message || error);
      return {
        success: false,
        error: error.message || "We couldn't send the verification email. Please check the address or try again.",
      };
    }

    console.log(`[Email Service] Verification email accepted by Resend (Message ID: ${data?.id || "N/A"})`);
    return { success: true, messageId: data?.id };
  } catch (err) {
    console.error("[Email Service] Failed to send verification email:", err);
    return {
      success: false,
      error: "Unable to send verification email at this moment. Please try again.",
    };
  }
}

/**
 * Sends a clean, responsive CustomON Password Reset OTP email using Resend.
 */
export async function sendPasswordResetEmail({
  to,
  name,
  otp,
}: SendEmailParams): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromAddress = process.env.EMAIL_FROM || "CustomON <onboarding@resend.dev>";
  const isKeyConfigured = Boolean(apiKey && apiKey.trim().length > 0 && !apiKey.includes("your_resend_api_key"));

  console.log(`[Email Service] Password reset email requested for: ${maskEmail(to)}`);
  console.log(`[Email Service] RESEND_API_KEY configured: ${isKeyConfigured}`);
  console.log(`[Email Service] EMAIL_FROM: ${fromAddress}`);

  if (!isKeyConfigured) {
    console.error(
      "[Email Service] Resend API key missing or placeholder. Please configure a valid RESEND_API_KEY in your .env file."
    );
    return {
      success: false,
      error: "Email delivery service is currently not configured. Please add a valid RESEND_API_KEY to your server .env file.",
    };
  }

  try {
    const resend = new Resend(apiKey);
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
      font-weight: 800;
      color: #ffffff;
      margin-top: 0;
      margin-bottom: 16px;
      letter-spacing: -0.02em;
    }
    p {
      font-size: 14px;
      line-height: 1.6;
      color: #a1a1aa;
      margin: 0 0 16px;
    }
    .otp-container {
      margin: 28px 0;
      text-align: center;
    }
    .otp-box {
      display: inline-block;
      background: #09090b;
      border: 2px solid #f97316;
      color: #ffffff;
      font-size: 32px;
      font-weight: 800;
      letter-spacing: 8px;
      padding: 14px 28px;
      border-radius: 14px;
      box-shadow: 0 0 25px rgba(249, 115, 22, 0.2);
      font-family: 'Courier New', Courier, monospace;
    }
    .warning-box {
      background: #27272a40;
      border-left: 3px solid #f97316;
      padding: 12px 16px;
      border-radius: 6px;
      margin: 20px 0;
    }
    .warning-text {
      font-size: 12px;
      color: #d4d4d8;
      margin: 0;
    }
    .footer {
      background: #121215;
      padding: 24px 32px;
      text-align: center;
      border-top: 1px solid #27272a;
    }
    .footer-text {
      font-size: 11px;
      color: #71717a;
      margin: 0;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo-text">CUSTOM<span class="logo-orange">ON</span></div>
    </div>
    <div class="content">
      <h1>Reset your CustomON password</h1>
      <p>Hello <strong>${recipientName}</strong>,</p>
      <p>We received a request to reset the password for your CustomON account. Please use the 6-digit verification code below to proceed:</p>
      
      <div class="otp-container">
        <div class="otp-box">${otp}</div>
      </div>
      
      <div class="warning-box">
        <p class="warning-text">⏱ This verification code will expire in <strong>10 minutes</strong>. Do not share this code with anyone.</p>
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

    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: [to],
      subject: "Reset your CustomON password",
      html: htmlContent,
    });

    if (error) {
      console.error("[Email Service] Resend API error:", error.message || error);
      return {
        success: false,
        error: error.message || "We couldn't send the password reset email. Please check the address or try again.",
      };
    }

    console.log(`[Email Service] Password reset email accepted by Resend (Message ID: ${data?.id || "N/A"})`);
    return { success: true, messageId: data?.id };
  } catch (err) {
    console.error("[Email Service] Failed to send password reset email:", err);
    return {
      success: false,
      error: "Unable to send password reset email at this moment. Please try again.",
    };
  }
}
