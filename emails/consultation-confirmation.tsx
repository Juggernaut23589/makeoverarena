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

interface ConsultationConfirmationProps {
  studentName: string;
  date: string;
  time: string;
  timezone: string;
  meetingLink?: string;
  consultant?: string;
  cancelled?: boolean;
}

export default function ConsultationConfirmation({
  studentName = "Amara",
  date = "Wednesday, 24 January 2024",
  time = "2:00 PM",
  timezone = "Africa/Lagos (WAT)",
  meetingLink = "https://meet.google.com/abc-defg-hij",
  consultant = "Sarah",
  cancelled = false,
}: ConsultationConfirmationProps) {
  if (cancelled) {
    return (
      <Html>
        <Head />
        <Preview>Your consultation on {date} has been cancelled</Preview>
        <Body style={main}>
          <Container style={container}>
            <Section style={header}>
              <Text style={logoText}>MakeoverArena</Text>
            </Section>
            <Section style={{ padding: "32px 24px 24px" }}>
              <Heading style={h1}>Consultation Cancelled</Heading>
              <Text style={subText}>
                Hi {studentName}, your consultation scheduled for {date} at {time} ({timezone}) has been cancelled.
              </Text>
              <Text style={{ color: "#6B7280", fontSize: "14px", lineHeight: "1.6", marginTop: "16px" }}>
                To rebook, please visit{" "}
                <a href="https://makeoverarena.com/book" style={footerLink}>makeoverarena.com/book</a>
                {" "}or reply to this email and we will find a new time for you.
              </Text>
            </Section>
            <Hr style={hr} />
            <Section style={footer}>
              <Text style={footerText}>© {new Date().getFullYear()} MakeoverArena · Lagos, Nigeria</Text>
            </Section>
          </Container>
        </Body>
      </Html>
    );
  }

  return (
    <Html>
      <Head />
      <Preview>
        Your consultation is confirmed for {date} at {time}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logoText}>MakeoverArena</Text>
          </Section>

          <Section style={{ padding: "32px 24px 24px" }}>
            <Heading style={h1}>Consultation Confirmed 📅</Heading>
            <Text style={subText}>
              Hi {studentName}, your free 30-minute consultation has been
              confirmed. Here are your booking details.
            </Text>
          </Section>

          <Hr style={hr} />

          {/* Booking card */}
          <Section style={{ padding: "24px" }}>
            <div style={bookingCard}>
              <Text style={bookingDate}>{date}</Text>
              <Text style={bookingTime}>{time}</Text>
              <Text style={bookingMeta}>{timezone}</Text>
              {consultant && (
                <Text style={bookingMeta}>With {consultant}</Text>
              )}
            </div>
          </Section>

          {meetingLink && (
            <Section style={{ padding: "0 24px 24px", textAlign: "center" as const }}>
              <Button style={primaryButton} href={meetingLink}>
                Join Meeting →
              </Button>
              <Text style={{ color: "#9CA3AF", fontSize: "12px", margin: "12px 0 0" }}>
                {meetingLink}
              </Text>
            </Section>
          )}

          <Hr style={hr} />

          <Section style={{ padding: "24px" }}>
            <Text style={sectionTitle}>How to prepare</Text>
            {[
              "Think about your 2–3 top university choices (we'll help refine them)",
              "Have your most recent transcript or academic record handy",
              "Note any specific concerns — funding, visa, test scores",
              "Bring questions — the call is yours to use however is most useful",
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

          <Hr style={hr} />

          <Section style={{ padding: "24px" }}>
            <Text style={sectionTitle}>Need to reschedule?</Text>
            <Text style={{ color: "#6B7280", fontSize: "13px", lineHeight: "1.6", margin: "0 0 16px" }}>
              No problem — just reply to this email at least 4 hours before your
              scheduled time and we'll find another slot that works for you.
            </Text>
          </Section>

          <Hr style={hr} />

          <Section style={footer}>
            <Text style={footerText}>
              © {new Date().getFullYear()} MakeoverArena · Lagos, Nigeria
            </Text>
            <Text style={footerText}>
              <a href="https://makeoverarena.com" style={footerLink}>makeoverarena.com</a>
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
const h1 = { color: "#0A1628", fontSize: "26px", fontWeight: "600", margin: "0 0 12px" };
const subText = { color: "#4B5563", fontSize: "15px", lineHeight: "1.6", margin: "0" };
const hr = { borderColor: "#E5E7EB", margin: "0" };
const bookingCard = { backgroundColor: "#0A1628", borderRadius: "12px", padding: "24px", textAlign: "center" as const };
const bookingDate = { color: "#D4A853", fontSize: "14px", fontWeight: "600", margin: "0 0 4px", letterSpacing: "0.5px" };
const bookingTime = { color: "#ffffff", fontSize: "32px", fontWeight: "700", margin: "0 0 8px", fontFamily: "Georgia, serif" };
const bookingMeta = { color: "rgba(255,255,255,0.5)", fontSize: "13px", margin: "0 0 4px" };
const primaryButton = { backgroundColor: "#D4A853", color: "#0A1628", fontWeight: "700", fontSize: "14px", padding: "12px 28px", borderRadius: "8px", textDecoration: "none", display: "inline-block" };
const sectionTitle = { color: "#0A1628", fontSize: "12px", fontWeight: "700", textTransform: "uppercase" as const, letterSpacing: "1px", margin: "0 0 16px" };
const checkCell = { color: "#D4A853", fontSize: "14px", fontWeight: "700", width: "24px", verticalAlign: "top", paddingTop: "1px" };
const checkText = { color: "#4B5563", fontSize: "13px", lineHeight: "1.5", paddingLeft: "8px", verticalAlign: "top" };
const footer = { backgroundColor: "#F9FAFB", padding: "20px 24px", textAlign: "center" as const };
const footerText = { color: "#9CA3AF", fontSize: "12px", margin: "4px 0" };
const footerLink = { color: "#D4A853", textDecoration: "none" };
