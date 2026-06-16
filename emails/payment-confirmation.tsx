import {
  Body,
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

interface PaymentConfirmationProps {
  studentName: string;
  amount: number;
  currency: string;
  description: string;
  agentName?: string | null;
  agentEmail?: string | null;
  agentPhone?: string | null;
  agentWhatsapp?: string | null;
  agentOnly?: boolean;
}

export default function PaymentConfirmation({
  studentName = "Amara",
  amount = 50000,
  currency = "NGN",
  description = "Application Processing Fee",
  agentName,
  agentEmail,
  agentPhone,
  agentWhatsapp,
  agentOnly = false,
}: PaymentConfirmationProps) {
  const hasAgent = Boolean(agentName);

  return (
    <Html>
      <Head />
      <Preview>{agentOnly ? "Your agent has been assigned" : `Payment received — ${description}`}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logoText}>MakeoverArena</Text>
          </Section>

          <Section style={heroSection}>
            {agentOnly ? (
              <>
                <Heading style={h1}>Your Agent Has Been Assigned</Heading>
                <Text style={heroText}>Hi {studentName}, here are your agent&apos;s contact details.</Text>
              </>
            ) : (
              <>
                <Heading style={h1}>Payment Received ✓</Heading>
                <Text style={heroText}>
                  Hi {studentName}, we&apos;ve received your payment of{" "}
                  <strong>
                    {currency} {amount.toLocaleString()}
                  </strong>{" "}
                  for {description}.
                </Text>
              </>
            )}
          </Section>

          <Hr style={hr} />

          {hasAgent ? (
            <Section style={{ padding: "24px" }}>
              <Text style={sectionTitle}>Your Assigned Agent</Text>
              <Text style={heroText}>
                {agentName} will be handling your application from here.
                Reach out anytime:
              </Text>
              <table style={summaryTable}>
                <tbody>
                  {agentEmail && (
                    <tr>
                      <td style={summaryLabel}>Email</td>
                      <td style={summaryValue}>{agentEmail}</td>
                    </tr>
                  )}
                  {agentPhone && (
                    <tr>
                      <td style={summaryLabel}>Phone</td>
                      <td style={summaryValue}>{agentPhone}</td>
                    </tr>
                  )}
                  {agentWhatsapp && (
                    <tr>
                      <td style={summaryLabel}>WhatsApp</td>
                      <td style={summaryValue}>
                        <a href={`https://wa.me/${agentWhatsapp.replace(/[^0-9]/g, "")}`} style={footerLink}>
                          Chat on WhatsApp
                        </a>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </Section>
          ) : (
            <Section style={{ padding: "24px" }}>
              <Text style={heroText}>
                An agent will be assigned to your application shortly — you&apos;ll
                receive their contact details once that happens.
              </Text>
            </Section>
          )}

          <Hr style={hr} />

          <Section style={footer}>
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
const heroSection = { padding: "32px 24px 24px" };
const h1 = { color: "#0A1628", fontSize: "26px", fontWeight: "600", margin: "0 0 12px", lineHeight: "1.3" };
const heroText = { color: "#4B5563", fontSize: "15px", lineHeight: "1.6", margin: "0 0 12px" };
const hr = { borderColor: "#E5E7EB", margin: "0" };
const sectionTitle = { color: "#0A1628", fontSize: "14px", fontWeight: "700", textTransform: "uppercase" as const, letterSpacing: "1px", margin: "0 0 16px" };
const summaryTable = { width: "100%", borderCollapse: "collapse" as const };
const summaryLabel = { color: "#6B7280", fontSize: "13px", padding: "8px 0", width: "30%", borderBottom: "1px solid #F3F4F6" };
const summaryValue = { color: "#111827", fontSize: "13px", fontWeight: "600", padding: "8px 0", borderBottom: "1px solid #F3F4F6" };
const footer = { backgroundColor: "#F9FAFB", padding: "20px 24px", textAlign: "center" as const };
const footerText = { color: "#9CA3AF", fontSize: "12px", margin: "4px 0", lineHeight: "1.5" };
const footerLink = { color: "#D4A853", textDecoration: "none" };
