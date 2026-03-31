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

interface AdminNotificationProps {
  studentName: string;
  email: string;
  phone: string;
  serviceType: string;
  preferredCountries: string[];
  budgetRange: string;
  educationLevel: string;
  referralSource: string;
  inquiryId: string;
}

export default function AdminNotification({
  studentName = "Amara Okeke",
  email = "amara@example.com",
  phone = "+234 801 234 5678",
  serviceType = "Graduate Admissions",
  preferredCountries = ["United States", "United Kingdom"],
  budgetRange = "$20,000–$30,000",
  educationLevel = "Bachelor's Degree",
  referralSource = "Instagram",
  inquiryId = "12345",
}: AdminNotificationProps) {
  return (
    <Html>
      <Head />
      <Preview>
        🔔 New inquiry from {studentName} — {serviceType}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logoText}>MakeoverArena Admin</Text>
            <Text style={badgeText}>NEW INQUIRY</Text>
          </Section>

          <Section style={{ padding: "24px" }}>
            <Heading style={h1}>New Inquiry Received</Heading>
            <Text style={subText}>
              A new student application was submitted {new Date().toLocaleDateString("en-NG", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}.
            </Text>
          </Section>

          <Hr style={hr} />

          <Section style={{ padding: "0 24px 24px" }}>
            <Text style={sectionTitle}>Student Details</Text>
            <table style={table}>
              <tbody>
                {[
                  { label: "Full Name", value: studentName },
                  { label: "Email", value: email },
                  { label: "Phone", value: phone },
                  { label: "Service Requested", value: serviceType },
                  { label: "Target Countries", value: preferredCountries.join(", ") },
                  { label: "Budget Range", value: budgetRange },
                  { label: "Education Level", value: educationLevel },
                  { label: "Referred From", value: referralSource },
                ].map((row) => (
                  <tr key={row.label}>
                    <td style={tdLabel}>{row.label}</td>
                    <td style={tdValue}>{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          <Hr style={hr} />

          <Section style={{ padding: "24px", textAlign: "center" as const }}>
            <Text style={{ color: "#4B5563", fontSize: "14px", margin: "0 0 16px" }}>
              Review and action this inquiry in the admin dashboard.
            </Text>
            <Button
              style={button}
              href={`https://makeoverarena.com/admin/inquiries`}
            >
              Open Admin Dashboard →
            </Button>
          </Section>

          <Hr style={hr} />

          <Section style={footer}>
            <Text style={footerText}>
              Inquiry ID: {inquiryId} · MakeoverArena CRM
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = { backgroundColor: "#f5f5f0", fontFamily: "'DM Sans', Arial, sans-serif" };
const container = { maxWidth: "580px", margin: "0 auto", backgroundColor: "#ffffff", borderRadius: "12px", overflow: "hidden" };
const header = { backgroundColor: "#0A1628", padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" };
const logoText = { color: "#D4A853", fontSize: "18px", fontWeight: "700", margin: "0" };
const badgeText = { color: "#0A1628", backgroundColor: "#D4A853", fontSize: "10px", fontWeight: "800", letterSpacing: "1px", padding: "4px 10px", borderRadius: "99px", margin: "0" };
const h1 = { color: "#0A1628", fontSize: "22px", fontWeight: "600", margin: "0 0 8px" };
const subText = { color: "#6B7280", fontSize: "14px", margin: "0" };
const hr = { borderColor: "#E5E7EB", margin: "0" };
const sectionTitle = { color: "#0A1628", fontSize: "12px", fontWeight: "700", textTransform: "uppercase" as const, letterSpacing: "1px", margin: "0 0 12px" };
const table = { width: "100%", borderCollapse: "collapse" as const };
const tdLabel = { color: "#6B7280", fontSize: "13px", padding: "8px 0", width: "38%", borderBottom: "1px solid #F3F4F6", verticalAlign: "top" };
const tdValue = { color: "#111827", fontSize: "13px", fontWeight: "600", padding: "8px 0", borderBottom: "1px solid #F3F4F6", verticalAlign: "top" };
const button = { backgroundColor: "#0A1628", color: "#ffffff", fontWeight: "700", fontSize: "14px", padding: "12px 28px", borderRadius: "8px", textDecoration: "none", display: "inline-block" };
const footer = { backgroundColor: "#F9FAFB", padding: "16px 24px", textAlign: "center" as const };
const footerText = { color: "#9CA3AF", fontSize: "11px", margin: "0" };
