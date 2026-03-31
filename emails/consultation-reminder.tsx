import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface ConsultationReminderProps {
  studentName: string;
  date: string;
  time: string;
  timezone: string;
  meetingLink?: string;
  reminderType: "24h" | "1h";
}

export default function ConsultationReminder({
  studentName = "Amara",
  date = "Today, Wednesday 24 January",
  time = "2:00 PM",
  timezone = "Africa/Lagos (WAT)",
  meetingLink = "https://meet.google.com/abc-defg-hij",
  reminderType = "24h",
}: ConsultationReminderProps) {
  const is1h = reminderType === "1h";

  return (
    <Html>
      <Head />
      <Preview>
        {is1h
          ? `⏰ Your consultation starts in 1 hour — ${time}`
          : `📅 Reminder: consultation tomorrow at ${time}`}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logoText}>MakeoverArena</Text>
          </Section>

          <Section style={{ padding: "32px 24px 24px" }}>
            <Heading style={h1}>
              {is1h ? "⏰ Starting in 1 hour" : "📅 Consultation Tomorrow"}
            </Heading>
            <Text style={subText}>
              Hi {studentName},{" "}
              {is1h
                ? "your consultation starts in about 1 hour. Here's your joining link."
                : "just a reminder that you have a free consultation with us tomorrow."}
            </Text>
          </Section>

          <Hr style={hr} />

          <Section style={{ padding: "24px" }}>
            <div style={bookingCard}>
              <Text style={bookingDate}>{date}</Text>
              <Text style={bookingTime}>{time}</Text>
              <Text style={bookingMeta}>{timezone}</Text>
            </div>
          </Section>

          {meetingLink && (
            <Section style={{ padding: "0 24px 24px", textAlign: "center" as const }}>
              <Button style={primaryButton} href={meetingLink}>
                Join Meeting →
              </Button>
              <Text style={{ color: "#9CA3AF", fontSize: "12px", margin: "10px 0 0" }}>
                {meetingLink}
              </Text>
            </Section>
          )}

          <Hr style={hr} />

          {!is1h && (
            <Section style={{ padding: "24px" }}>
              <Text style={sectionTitle}>Quick preparation checklist</Text>
              {[
                "Think about 2–3 universities you're interested in",
                "Have your academic record or transcript handy",
                "Note down any specific questions or concerns",
              ].map((item, i) => (
                <table key={i} style={{ width: "100%", marginBottom: "8px" }}>
                  <tbody>
                    <tr>
                      <td style={checkCell}>✓</td>
                      <td style={checkText}>{item}</td>
                    </tr>
                  </tbody>
                </table>
              ))}
            </Section>
          )}

          <Hr style={hr} />

          <Section style={footer}>
            <Text style={footerText}>
              Need to reschedule? Reply to this email at least 4 hours before the call.
            </Text>
            <Text style={footerText}>
              © {new Date().getFullYear()} MakeoverArena · Lagos, Nigeria
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = { backgroundColor: "#f5f5f0", fontFamily: "'DM Sans', Arial, sans-serif" };
const container = { maxWidth: "580px", margin: "0 auto", backgroundColor: "#ffffff", borderRadius: "12px", overflow: "hidden" };
const header = { backgroundColor: "#0A1628", padding: "24px", textAlign: "center" as const };
const logoText = { color: "#D4A853", fontSize: "22px", fontWeight: "700", margin: "0" };
const h1 = { color: "#0A1628", fontSize: "24px", fontWeight: "600", margin: "0 0 12px" };
const subText = { color: "#4B5563", fontSize: "15px", lineHeight: "1.6", margin: "0" };
const hr = { borderColor: "#E5E7EB", margin: "0" };
const bookingCard = { backgroundColor: "#0A1628", borderRadius: "12px", padding: "24px", textAlign: "center" as const };
const bookingDate = { color: "#D4A853", fontSize: "14px", fontWeight: "600", margin: "0 0 4px" };
const bookingTime = { color: "#ffffff", fontSize: "32px", fontWeight: "700", margin: "0 0 8px", fontFamily: "Georgia, serif" };
const bookingMeta = { color: "rgba(255,255,255,0.5)", fontSize: "13px", margin: "0" };
const primaryButton = { backgroundColor: "#D4A853", color: "#0A1628", fontWeight: "700", fontSize: "14px", padding: "12px 28px", borderRadius: "8px", textDecoration: "none", display: "inline-block" };
const sectionTitle = { color: "#0A1628", fontSize: "12px", fontWeight: "700", textTransform: "uppercase" as const, letterSpacing: "1px", margin: "0 0 16px" };
const checkCell = { color: "#D4A853", fontSize: "14px", fontWeight: "700", width: "24px", verticalAlign: "top" };
const checkText = { color: "#4B5563", fontSize: "13px", lineHeight: "1.5", paddingLeft: "8px", verticalAlign: "top" };
const footer = { backgroundColor: "#F9FAFB", padding: "20px 24px", textAlign: "center" as const };
const footerText = { color: "#9CA3AF", fontSize: "12px", margin: "4px 0" };
