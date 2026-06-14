import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabase";
import { sendEmail, ADMIN_EMAIL } from "@/lib/emails/send-email";
import ConsultationConfirmation from "@/emails/consultation-confirmation";
import ConsultationReminder from "@/emails/consultation-reminder";
import * as React from "react";

const CALCOM_WEBHOOK_SECRET = process.env.CALCOM_WEBHOOK_SECRET ?? "";

function verifySignature(body: string, signature: string): boolean {
  if (!CALCOM_WEBHOOK_SECRET) return true;
  const expected = crypto
    .createHmac("sha256", CALCOM_WEBHOOK_SECRET)
    .update(body)
    .digest("hex");
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-cal-signature-256") ?? "";

  if (CALCOM_WEBHOOK_SECRET && !verifySignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: CalcomPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { triggerEvent, payload: data } = payload;

  if (!data) {
    return NextResponse.json({ received: true });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }

  const attendee = data.attendees?.[0];
  const studentName = attendee?.name ?? "Unknown";
  const studentEmail = attendee?.email ?? "";
  const meetingLink = data.videoCallData?.url ?? data.metadata?.videoCallUrl ?? null;
  const scheduledDate = data.startTime ? new Date(data.startTime).toISOString().slice(0, 10) : null;
  const scheduledTime = data.startTime ? new Date(data.startTime).toISOString().slice(11, 16) : null;
  const duration = data.length ?? 30;

  if (triggerEvent === "BOOKING_CREATED") {
    const { data: inquiry } = await supabaseAdmin
      .from("inquiries")
      .select("id, service_type")
      .eq("email", studentEmail)
      .order("created_at", { ascending: false })
      .limit(1)
      .single<{ id: string; service_type: string }>();

    const { data: consultation, error } = await supabaseAdmin
      .from("consultations")
      .insert({
        calcom_uid: data.uid,
        student_name: studentName,
        student_email: studentEmail,
        student_phone: null,
        inquiry_id: inquiry?.id ?? null,
        scheduled_date: scheduledDate,
        scheduled_time: scheduledTime,
        duration_minutes: duration,
        meeting_link: meetingLink,
        status: "scheduled",
        reminder_24h_sent: false,
        reminder_1h_sent: false,
      } as Record<string, unknown>)
      .select("id")
      .single();

    if (error) {
      console.error("[calcom-webhook] Insert error:", error.message);
      return NextResponse.json({ error: "DB error" }, { status: 500 });
    }

    if (inquiry?.id) {
      await supabaseAdmin
        .from("inquiries")
        .update({ status: "consultation_booked" } as Record<string, unknown>)
        .eq("id", inquiry.id);
    }

    if (studentEmail && scheduledDate && scheduledTime) {
      const dateLabel = new Date(data.startTime).toLocaleDateString("en-NG", {
        weekday: "long", year: "numeric", month: "long", day: "numeric",
      });
      const timeLabel = new Date(data.startTime).toLocaleTimeString("en-NG", {
        hour: "2-digit", minute: "2-digit", timeZone: attendee?.timeZone ?? "Africa/Lagos",
      });

      void Promise.allSettled([
        sendEmail({
          to: studentEmail,
          subject: "Consultation confirmed — MakeoverArena",
          react: React.createElement(ConsultationConfirmation, {
            studentName: studentName.split(" ")[0],
            date: dateLabel,
            time: timeLabel,
            timezone: attendee?.timeZone ?? "Africa/Lagos",
            meetingLink: meetingLink ?? undefined,
          }),
          consultationId: consultation?.id,
          templateName: "consultation-confirmation",
        }),
        sendEmail({
          to: ADMIN_EMAIL,
          subject: `New booking: ${studentName} — ${dateLabel}`,
          react: React.createElement(ConsultationReminder, {
            studentName,
            date: dateLabel,
            time: timeLabel,
            timezone: attendee?.timeZone ?? "Africa/Lagos",
            meetingLink: meetingLink ?? undefined,
            reminderType: "24h" as const,
          }),
          consultationId: consultation?.id,
          templateName: "booking-admin-notification",
        }),
      ]);
    }

    return NextResponse.json({ received: true, consultationId: consultation?.id }, { status: 201 });
  }

  if (triggerEvent === "BOOKING_RESCHEDULED") {
    await supabaseAdmin
      .from("consultations")
      .update({
        scheduled_date: scheduledDate,
        scheduled_time: scheduledTime,
        meeting_link: meetingLink,
        status: "rescheduled",
        reminder_24h_sent: false,
        reminder_1h_sent: false,
      } as Record<string, unknown>)
      .eq("calcom_uid", data.uid);

    return NextResponse.json({ received: true });
  }

  if (triggerEvent === "BOOKING_CANCELLED") {
    await supabaseAdmin
      .from("consultations")
      .update({ status: "cancelled" } as Record<string, unknown>)
      .eq("calcom_uid", data.uid);

    // Notify student of cancellation
    if (studentEmail) {
      void sendEmail({
        to: studentEmail,
        subject: "Your consultation has been cancelled — MakeoverArena",
        react: React.createElement(ConsultationConfirmation, {
          studentName: studentName.split(" ")[0],
          date: scheduledDate ?? "",
          time: scheduledTime ?? "",
          timezone: attendee?.timeZone ?? "Africa/Lagos",
          meetingLink: undefined,
          cancelled: true,
        }),
        templateName: "consultation-cancelled",
      }).catch((err) => console.error("[calcom] cancellation email failed:", err));
    }

    return NextResponse.json({ received: true });
  }

  return NextResponse.json({ received: true });
}

interface CalcomPayload {
  triggerEvent: string;
  payload?: {
    uid: string;
    title?: string;
    startTime: string;
    endTime?: string;
    length?: number;
    attendees?: Array<{
      name: string;
      email: string;
      timeZone?: string;
    }>;
    videoCallData?: { url: string };
    metadata?: { videoCallUrl?: string };
  };
}
