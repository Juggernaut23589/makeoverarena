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

interface InquiryFollowupProps {
  studentName: string;
  serviceType: string;
}

export default function InquiryFollowup({
  studentName = "Amara",
  serviceType = "Graduate Admissions",
}: InquiryFollowupProps) {
  return (
    <Html>
      <Head />
      <Preview>
        Still thinking about studying abroad, {studentName}? We'd love to chat.
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logoText}>MakeoverArena</Text>
          </Section>

          <Section style={{ padding: "32px 24px 24px" }}>
            <Heading style={h1}>Still thinking about it?</Heading>
            <Text style={bodyText}>
              Hi {studentName}, you submitted an application for{" "}
              <strong>{serviceType}</strong> a couple of days ago and we wanted
              to check in.
            </Text>
            <Text style={bodyText}>
              Our team has reviewed your profile and we think we can do great
              things together. If you have any questions or hesitations, we'd
              love to answer them — no pressure, no sales pitch.
            </Text>
            <Text style={bodyText}>
              A 30-minute free consultation costs you nothing and gives you a
              clearer picture of exactly what's possible for your profile.
            </Text>
          </Section>

          <Hr style={hr} />

          <Section style={{ padding: "24px", textAlign: "center" as const }}>
            <Button style={button} href="https://makeoverarena.com/book">
              Book Free 30-Min Call →
            </Button>
            <Text style={{ color: "#9CA3AF", fontSize: "12px", margin: "12px 0 0" }}>
              No commitment. Just a conversation.
            </Text>
          </Section>

          <Hr style={hr} />

          <Section style={{ padding: "0 24px 24px" }}>
            <Text style={sectionTitle}>Common concerns we hear</Text>
            {[
              { q: "Am I eligible?", a: "We've placed students from all academic backgrounds. Tell us your GPA and we'll be honest about your options." },
              { q: "Can I afford it?", a: "65% of our scholarship applicants received funding. The application itself costs nothing." },
              { q: "Is it too late?", a: "Probably not. Most intakes are 6–12 months away. Let's check your timeline together." },
            ].map((item) => (
              <div key={item.q} style={faqItem}>
                <Text style={faqQ}>{item.q}</Text>
                <Text style={faqA}>{item.a}</Text>
              </div>
            ))}
          </Section>

          <Hr style={hr} />

          <Section style={footer}>
            <Text style={footerText}>
              © {new Date().getFullYear()} MakeoverArena · Lagos, Nigeria
            </Text>
            <Text style={footerText}>
              You're receiving this because you submitted an inquiry at makeoverarena.com.{" "}
              <a href="#" style={footerLink}>Unsubscribe</a>
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
const h1 = { color: "#0A1628", fontSize: "24px", fontWeight: "600", margin: "0 0 16px" };
const bodyText = { color: "#4B5563", fontSize: "15px", lineHeight: "1.7", margin: "0 0 16px" };
const hr = { borderColor: "#E5E7EB", margin: "0" };
const button = { backgroundColor: "#D4A853", color: "#0A1628", fontWeight: "700", fontSize: "14px", padding: "12px 28px", borderRadius: "8px", textDecoration: "none", display: "inline-block" };
const sectionTitle = { color: "#0A1628", fontSize: "12px", fontWeight: "700", textTransform: "uppercase" as const, letterSpacing: "1px", margin: "0 0 16px" };
const faqItem = { marginBottom: "16px", padding: "16px", backgroundColor: "#F9FAFB", borderRadius: "8px", borderLeft: "3px solid #D4A853" };
const faqQ = { color: "#0A1628", fontSize: "14px", fontWeight: "700", margin: "0 0 6px" };
const faqA = { color: "#6B7280", fontSize: "13px", lineHeight: "1.5", margin: "0" };
const footer = { backgroundColor: "#F9FAFB", padding: "20px 24px", textAlign: "center" as const };
const footerText = { color: "#9CA3AF", fontSize: "12px", margin: "4px 0" };
const footerLink = { color: "#D4A853", textDecoration: "none" };
