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

interface ConsultationConfirmedProps {
  studentName: string;
  date: string;
  time: string;
  timezone: string;
  meetingLink?: string;
}

export default function ConsultationConfirmed({
  studentName = "Amara",
  date = "Monday, 23 June 2026",
  time = "10:00 AM",
  timezone = "Africa/Lagos",
  meetingLink,
}: ConsultationConfirmedProps) {
  return (
    <Html>
      <Head />
      <Preview>Your consultation is confirmed — {date} at {time}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logoText}>MakeoverArena</Text>
          </Section>

          <Section style={heroSection}>
            <Heading style={h1}>Consultation Confirmed ✓</Heading>
            <Text style={heroText}>
              Hi {studentName}, your free 15-minute consultation with a MakeoverArena advisor has been confirmed.
            </Text>
          </Section>

          <Section style={detailsBox}>
            <Text style={detailLabel}>Date</Text>
            <Text style={detailValue}>{date}</Text>
            <Text style={detailLabel}>Time</Text>
            <Text style={detailValue}>{time} ({timezone})</Text>
          </Section>

          {meetingLink && (
            <>
              <Hr style={hr} />
              <Section style={ctaSection}>
                <Text style={heroText}>Use the link below to join your consultation at the scheduled time:</Text>
                <Button style={button} href={meetingLink}>
                  Join Consultation →
                </Button>
              </Section>
            </>
          )}

          <Hr style={hr} />

          <Section style={footer}>
            <Text style={footerText}>
              If you need to reschedule, reply to this email or contact us on WhatsApp.
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
const logoText = { color: "#D4A853", fontSize: "22px", fontWeight: "700", margin: "0", letterSpacing: "-0.5px" };
const heroSection = { padding: "32px 24px 16px" };
const h1 = { color: "#0A1628", fontSize: "26px", fontWeight: "600", margin: "0 0 12px", lineHeight: "1.3" };
const heroText = { color: "#4B5563", fontSize: "15px", lineHeight: "1.6", margin: "0 0 12px" };
const detailsBox = { backgroundColor: "#F9FAFB", margin: "0 24px 24px", padding: "20px", borderRadius: "10px", border: "1px solid #E5E7EB" };
const detailLabel = { color: "#9CA3AF", fontSize: "11px", fontWeight: "600", textTransform: "uppercase" as const, letterSpacing: "0.05em", margin: "0 0 2px" };
const detailValue = { color: "#0A1628", fontSize: "16px", fontWeight: "600", margin: "0 0 12px" };
const hr = { borderColor: "#E5E7EB", margin: "0" };
const ctaSection = { padding: "24px", textAlign: "center" as const };
const button = { backgroundColor: "#D4A853", color: "#0A1628", fontWeight: "700", fontSize: "14px", padding: "12px 28px", borderRadius: "8px", textDecoration: "none", display: "inline-block" };
const footer = { backgroundColor: "#F9FAFB", padding: "20px 24px", textAlign: "center" as const };
const footerText = { color: "#9CA3AF", fontSize: "12px", margin: "4px 0", lineHeight: "1.5" };
