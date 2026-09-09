interface SendSmsParams {
  to: string;
  otp: string;
  message?: string;
}

export async function sendSmsOtp({ to, otp, message }: SendSmsParams): Promise<{ success: boolean; error?: string }> {
  const smsProvider = (process.env.SMS_PROVIDER || "").toLowerCase();
  const fast2SmsKey = process.env.FAST2SMS_API_KEY || process.env.SMS_API_KEY;
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = process.env.TWILIO_PHONE_NUMBER || process.env.SMS_SENDER_ID;
  const msg91AuthKey = process.env.MSG91_AUTH_KEY;
  const msg91TemplateId = process.env.MSG91_TEMPLATE_ID;
  const webhookUrl = process.env.SMS_WEBHOOK_URL;

  const defaultMessage = message || `Your CustomON verification code is ${otp}. Valid for 10 minutes. Do not share this OTP with anyone.`;

  // 1. Fast2SMS Provider (Popular in India for +91 numbers)
  if (smsProvider === "fast2sms" || (!smsProvider && fast2SmsKey && !twilioSid)) {
    if (!fast2SmsKey) {
      console.error("Fast2SMS error: FAST2SMS_API_KEY is not configured.");
      return { success: false, error: "We couldn't send the verification code. Please try again." };
    }

    try {
      // Strip +91 or non-digits for 10-digit Indian numbers
      const cleanPhone = to.replace(/\D/g, "").slice(-10);
      const res = await fetch("https://www.fast2sms.com/dev/bulkV2", {
        method: "POST",
        headers: {
          authorization: fast2SmsKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          variables_values: otp,
          route: "otp",
          numbers: cleanPhone,
        }),
      });

      const json = (await res.json()) as any;
      if (json.return) {
        return { success: true };
      }
      console.error("Fast2SMS dispatch error:", json);
      return { success: false, error: "We couldn't send the verification code. Please try again." };
    } catch (err) {
      console.error("Failed to send SMS via Fast2SMS:", err);
      return { success: false, error: "We couldn't send the verification code. Please try again." };
    }
  }

  // 2. Twilio Provider
  if (smsProvider === "twilio" || twilioSid) {
    if (!twilioSid || !twilioToken || !twilioFrom) {
      console.error("Twilio error: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, or TWILIO_PHONE_NUMBER missing.");
      return { success: false, error: "We couldn't send the verification code. Please try again." };
    }

    try {
      const auth = Buffer.from(`${twilioSid}:${twilioToken}`).toString("base64");
      const body = new URLSearchParams({
        To: to.startsWith("+") ? to : `+91${to.replace(/\D/g, "").slice(-10)}`,
        From: twilioFrom,
        Body: defaultMessage,
      });

      const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
      });

      if (res.ok) {
        return { success: true };
      }
      const json = await res.json();
      console.error("Twilio SMS dispatch error:", json);
      return { success: false, error: "We couldn't send the verification code. Please try again." };
    } catch (err) {
      console.error("Failed to send SMS via Twilio:", err);
      return { success: false, error: "We couldn't send the verification code. Please try again." };
    }
  }

  // 3. MSG91 Provider
  if (smsProvider === "msg91" || msg91AuthKey) {
    if (!msg91AuthKey) {
      console.error("MSG91 error: MSG91_AUTH_KEY is not configured.");
      return { success: false, error: "We couldn't send the verification code. Please try again." };
    }

    try {
      const cleanPhone = to.replace(/\D/g, "");
      const res = await fetch("https://control.msg91.com/api/v5/otp", {
        method: "POST",
        headers: {
          authkey: msg91AuthKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          template_id: msg91TemplateId,
          mobile: cleanPhone,
          otp,
        }),
      });

      const json = (await res.json()) as any;
      if (json.type === "success") {
        return { success: true };
      }
      console.error("MSG91 dispatch error:", json);
      return { success: false, error: "We couldn't send the verification code. Please try again." };
    } catch (err) {
      console.error("Failed to send SMS via MSG91:", err);
      return { success: false, error: "We couldn't send the verification code. Please try again." };
    }
  }

  // 4. Generic Webhook / Custom SMS Gateway
  if (webhookUrl) {
    try {
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(process.env.SMS_API_KEY ? { Authorization: `Bearer ${process.env.SMS_API_KEY}` } : {}),
        },
        body: JSON.stringify({
          to,
          otp,
          message: defaultMessage,
        }),
      });

      if (res.ok) {
        return { success: true };
      }
      return { success: false, error: "We couldn't send the verification code. Please try again." };
    } catch (err) {
      console.error("Custom SMS webhook dispatch error:", err);
      return { success: false, error: "We couldn't send the verification code. Please try again." };
    }
  }

  // Fallback notice if no SMS provider credentials are configured in .env
  console.warn("⚠️ Warning: No SMS provider configured (e.g. FAST2SMS_API_KEY, TWILIO_ACCOUNT_SID, MSG91_AUTH_KEY).");
  
  if (process.env.NODE_ENV === "production") {
    return { success: false, error: "SMS delivery service is not configured. Please contact support." };
  }

  // In development mode, if no SMS provider is configured, return success to allow local testing
  return { success: true };
}
