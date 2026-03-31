import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface InquiryConfirmationProps {
  studentName: string;
  serviceType: string;
  preferredCountries: string[];
  intakePeriod: string;
}

export default function InquiryConfirmation({
  studentName = "Amara",
  serviceType = "Graduate Admissions",
  preferredCountries = ["United States", "United Kingdom"],
  intakePeriod = "September 2025",
}: InquiryConfirmationProps) {
  return (
    <Html>
      <Head />
      <Preview>
        We received your application, {studentName} — here's what happens next
      </Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={logoText}>MakeoverArena</Text>
          </Section>

          {/* Hero */}
          <Section style={heroSection}>
            <Heading style={h1}>Application Received ✓</Heading>
            <Text style={heroText}>
              Hi {studentName}, your application has been received and our team
              has been notified. We review every submission within 24 hours.
            </Text>
          </Section>

          <Hr style={hr} />

          {/* Summary */}
          <Section style={summarySection}>
            <Text style={sectionTitle}>Your Application Summary</Text>
            <table style={summaryTable}>
              <tbody>
                <tr>
                  <td style={summaryLabel}>Service</td>
                  <td style={summaryValue}>{serviceType}</td>
                </tr>
                <tr>
                  <td style={summaryLabel}>Target Countries</td>
                  <td style={summaryValue}>{preferredCountries.join(", ")}</td>
                </tr>
                <tr>
                  <td style={summaryLabel}>Intake Period</td>
                  <td style={summaryValue}>{intakePeriod}</td>
                </tr>
              </tbody>
            </table>
          </Section>

          <Hr style={hr} />

          {/* Next steps */}
          <Section style={{ padding: "0 24px" }}>
            <Text style={sectionTitle}>What happens next</Text>
            {[
              {
                step: "1",
                title: "Profile Review (within 24 hours)",
                desc: "Our admissions team will review your profile and assess the best universities and strategy for your goals.",
              },
              {
                step: "2",
                title: "Consultation Scheduling",
                desc: "We'll reach out to schedule your free 30-minute strategy call. You can also book directly at makeoverarena.com/book.",
              },
              {
                step: "3",
                title: "Personalised Roadmap",
                desc: "After your consultation, we'll send you a custom university shortlist and application timeline.",
              },
            ].map((item) => (
              <table key={item.step} style={stepTable}>
                <tbody>
                  <tr>
                    <td style={stepNumber}>{item.step}</td>
                    <td style={stepContent}>
                      <Text style={stepTitle}>{item.title}</Text>
                      <Text style={stepDesc}>{item.desc}</Text>
                    </td>
                  </tr>
                </tbody>
              </table>
            ))}
          </Section>

          <Hr style={hr} />

          {/* CTA */}
          <Section style={ctaSection}>
            <Text style={ctaText}>
              Want to speed things up? Book your free consultation now.
            </Text>
            <Button style={button} href="https://makeoverarena.com/book">
              Book Free Consultation
            </Button>
          </Section>

          <Hr style={hr} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Questions? Reply to this email or WhatsApp us at +234 800 000 0000.
            </Text>
            <Text style={footerText}>
              © {new Date().getFullYear()} MakeoverArena · Lagos, Nigeria
            </Text>
            <Text style={footerText}>
              <a href="https://makeoverarena.com" style={footerLink}>
                makeoverarena.com
              </a>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = { backgroundColor: "#f5f5f0", fontFamily: "'DM Sans', Arial, sans-serif" };
const container = { maxWidth: "580px", margin: "0 auto", backgroundColor: "#ffffff", borderRadius: "12px", overflow: "hidden" };
const header = { backgroundColor: "#0A1628", padding: "24px", textAlign: "center" as const };
const logoText = { color: "#D4A853", fontSize: "22px", fontWeight: "700", margin: "0", letterSpacing: "-0.5px" };
const heroSection = { padding: "32px 24px 24px" };
const h1 = { color: "#0A1628", fontSize: "26px", fontWeight: "600", margin: "0 0 12px", lineHeight: "1.3" };
const heroText = { color: "#4B5563", fontSize: "15px", lineHeight: "1.6", margin: "0" };
const hr = { borderColor: "#E5E7EB", margin: "0" };
const summarySection = { padding: "24px" };
const sectionTitle = { color: "#0A1628", fontSize: "14px", fontWeight: "700", textTransform: "uppercase" as const, letterSpacing: "1px", margin: "0 0 16px" };
const summaryTable = { width: "100%", borderCollapse: "collapse" as const };
const summaryLabel = { color: "#6B7280", fontSize: "13px", padding: "8px 0", width: "40%", borderBottom: "1px solid #F3F4F6" };
const summaryValue = { color: "#111827", fontSize: "13px", fontWeight: "600", padding: "8px 0", borderBottom: "1px solid #F3F4F6" };
const stepTable = { width: "100%", marginBottom: "16px" };
const stepNumber = { width: "32px", height: "32px", backgroundColor: "#D4A853", color: "#0A1628", borderRadius: "50%", textAlign: "center" as const, fontWeight: "700", fontSize: "14px", verticalAlign: "top", paddingTop: "6px" };
const stepContent = { paddingLeft: "16px", verticalAlign: "top" };
const stepTitle = { color: "#0A1628", fontSize: "14px", fontWeight: "600", margin: "0 0 4px" };
const stepDesc = { color: "#6B7280", fontSize: "13px", lineHeight: "1.5", margin: "0" };
const ctaSection = { padding: "24px", textAlign: "center" as const };
const ctaText = { color: "#4B5563", fontSize: "14px", margin: "0 0 16px" };
const button = { backgroundColor: "#D4A853", color: "#0A1628", fontWeight: "700", fontSize: "14px", padding: "12px 28px", borderRadius: "8px", textDecoration: "none", display: "inline-block" };
const footer = { backgroundColor: "#F9FAFB", padding: "20px 24px", textAlign: "center" as const };
const footerText = { color: "#9CA3AF", fontSize: "12px", margin: "4px 0", lineHeight: "1.5" };
const footerLink = { color: "#D4A853", textDecoration: "none" };
