import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decodeSession, COOKIE_NAME } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase";
import { sendEmail } from "@/lib/emails/send-email";
import ConsultationConfirmed from "@/emails/consultation-confirmed";
import * as React from "react";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  const session = token ? await decodeSession(token) : null;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!supabaseAdmin) return NextResponse.json({ error: "DB not configured" }, { status: 500 });

  const { data: consultation, error: fetchErr } = await supabaseAdmin
    .from("consultations")
    .select("id, student_name, student_email, scheduled_date, scheduled_time, meeting_link, status")
    .eq("id", id)
    .single();

  if (fetchErr || !consultation) {
    return NextResponse.json({ error: "Consultation not found" }, { status: 404 });
  }

  if (consultation.status === "confirmed") {
    return NextResponse.json({ error: "Already confirmed" }, { status: 400 });
  }

  const { error: updateErr } = await supabaseAdmin
    .from("consultations")
    .update({ status: "confirmed" })
    .eq("id", id);

  if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });

  if (consultation.student_email) {
    const date = consultation.scheduled_date
      ? new Date(consultation.scheduled_date + "T00:00:00").toLocaleDateString("en-NG", {
          weekday: "long", year: "numeric", month: "long", day: "numeric",
        })
      : "";
    const time = consultation.scheduled_time ?? "";

    await sendEmail({
      to: consultation.student_email,
      subject: "Your consultation is confirmed — MakeoverArena",
      templateName: "consultation-confirmed",
      react: React.createElement(ConsultationConfirmed, {
        studentName: (consultation.student_name as string).split(" ")[0],
        date,
        time,
        timezone: "Africa/Lagos",
        meetingLink: consultation.meeting_link ?? undefined,
      }),
    });
  }

  return NextResponse.json({ success: true });
}
