import { Resend } from "resend";

/**
 * Send a password reset email containing the reset link.
 */
export async function sendPasswordResetEmail(
  to: string,
  name: string,
  resetToken: string
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not set");
  }

  // Instantiate lazily so missing key only throws at call-time, not module load
  const resend = new Resend(apiKey);
  const baseUrl = process.env.FRONTEND_URL ?? "http://localhost:3000";
  const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;
  const from = process.env.RESEND_FROM ?? "Intellia360 <noreply@intellia360.com>";

  const { error } = await resend.emails.send({
    from,
    to,
    subject: "Reset your Intellia360 password",
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <h2 style="color: #2563eb;">Password Reset</h2>
        <p>Hi ${name},</p>
        <p>We received a request to reset your password. Click the link below to set a new one:</p>
        <a href="${resetUrl}"
           style="display:inline-block;margin:24px 0;padding:14px 28px;background:#2563eb;color:#fff;border-radius:10px;text-decoration:none;font-weight:600;">
          Reset Password
        </a>
        <p style="color:#64748b;font-size:14px;">
          This link expires in <strong>1 hour</strong>. If you didn't request a password reset, you can safely ignore this email.
        </p>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />
        <p style="color:#94a3b8;font-size:12px;">© 2026 Intellia360 · All rights reserved.</p>
      </div>
    `,
  });

  if (error) {
    throw new Error(`Resend error: ${error.message}`);
  }
}
