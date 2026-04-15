import "server-only";

import { createResendClient, getEmailFromAddress } from "@/lib/email";

export async function sendInviteEmail(params: {
  email: string;
  fullName: string;
  inviteUrl: string;
}) {
  const resend = createResendClient();

  await resend.emails.send({
    from: getEmailFromAddress(),
    to: params.email,
    subject: "You’ve been invited to the Affordable Housing Portal",
    text: `Hello ${params.fullName},\n\nYou’ve been invited to the Affordable Housing Portal. Use the link below to create your password and activate your account:\n\n${params.inviteUrl}\n\nIf you were not expecting this invite, you can ignore this email.`,
    html: `<p>Hello ${escapeHtml(params.fullName)},</p><p>You’ve been invited to the Affordable Housing Portal.</p><p><a href="${params.inviteUrl}">Create your password and activate your account</a></p><p>If you were not expecting this invite, you can ignore this email.</p>`,
  });
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
