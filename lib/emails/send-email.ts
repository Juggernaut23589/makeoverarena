import { Resend } from "resend";
import { supabaseAdmin } from "@/lib/supabase";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_ADDRESS = process.env.EMAIL_FROM ?? "MakeoverArena <onboarding@resend.dev>";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@makeoverarena.com";

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  react: React.ReactElement;
  inquiryId?: string;
  consultationId?: string;
  templateName: string;
}

export async function sendEmail(options: SendEmailOptions) {
  const { to, subject, react, inquiryId, consultationId, templateName } = options;

  const recipients = Array.isArray(to) ? to : [to];

  const { data, error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: recipients,
    subject,
    react,
  });

  if (error) {
    console.error(`[sendEmail] Failed to send "${templateName}":`, error);

    await logEmail({
      recipients,
      subject,
      templateName,
      status: "failed",
      inquiryId,
      consultationId,
      errorMessage: error.message,
    });

    throw new Error(`Email send failed: ${error.message}`);
  }

  await logEmail({
    recipients,
    subject,
    templateName,
    status: "sent",
    resendId: data?.id,
    inquiryId,
    consultationId,
  });

  return data;
}

async function logEmail(params: {
  recipients: string[];
  subject: string;
  templateName: string;
  status: "sent" | "failed";
  resendId?: string;
  inquiryId?: string;
  consultationId?: string;
  errorMessage?: string;
}) {
  try {
    if (!supabaseAdmin) return;
    
    await supabaseAdmin.from("email_logs").insert({
      recipient_email: params.recipients[0],
      subject: params.subject,
      template_name: params.templateName,
      status: params.status,
      resend_id: params.resendId ?? null,
      inquiry_id: params.inquiryId ?? null,
      consultation_id: params.consultationId ?? null,
      error_message: params.errorMessage ?? null,
    } as Record<string, unknown>);
  } catch (err) {
    console.error("[sendEmail] Failed to log email:", err);
  }
}

export { ADMIN_EMAIL };
