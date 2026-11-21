import { Body, Container, Head, Heading, Hr, Html, Preview, Section, Text, Link } from "@react-email/components";
import * as React from "react";

interface NewScholarshipMatchProps {
  studentName: string;
  scholarshipName: string;
  institutionName?: string | null;
  destinationCountry?: string | null;
  applicationDeadline?: string | null;
  dashboardUrl: string;
}

export default function NewScholarshipMatch({
  studentName = "Amara",
  scholarshipName = "Chevening Scholarship",
  institutionName,
  destinationCountry,
  applicationDeadline,
  dashboardUrl = "https://www.makeoverarena.com/dashboard",
}: NewScholarshipMatchProps) {
  return (
    <Html>
      <Head />
      <Preview>New scholarship match: {scholarshipName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logoText}>MakeoverArena</Text>
          </Section>

          <Section style={heroSection}>
            <Heading style={h1}>A new scholarship matches your profile</Heading>
            <Text style={heroText}>
              Hi {studentName}, we&apos;ve just verified and published a scholarship that fits your
              academic profile:
            </Text>
          </Section>

          <Hr style={hr} />

          <Section style={{ padding: "24px" }}>
            <Text style={sectionTitle}>{scholarshipName}</Text>
            {(institutionName || destinationCountry) && (
              <Text style={heroText}>
                {[institutionName, destinationCountry].filter(Boolean).join(" · ")}
              </Text>
            )}
            {applicationDeadline && (
              <Text style={heroText}>
                Deadline: <strong>{applicationDeadline}</strong>
              </Text>
            )}
            <Link href={dashboardUrl} style={ctaButton}>
              View on your dashboard
            </Link>
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

const main = { backgroundColor: "#f5f5f0", fontFamily: "'DM Sans', Arial, sans-serif" };
const container = { maxWidth: "580px", margin: "0 auto", backgroundColor: "#ffffff", borderRadius: "12px", overflow: "hidden" };
const header = { backgroundColor: "#0A1628", padding: "24px", textAlign: "center" as const };
const logoText = { color: "#D4A853", fontSize: "22px", fontWeight: "700", margin: "0", letterSpacing: "-0.5px" };
const heroSection = { padding: "32px 24px 24px" };
const h1 = { color: "#0A1628", fontSize: "24px", fontWeight: "600", margin: "0 0 12px", lineHeight: "1.3" };
const heroText = { color: "#4B5563", fontSize: "15px", lineHeight: "1.6", margin: "0 0 12px" };
const hr = { borderColor: "#E5E7EB", margin: "0" };
const sectionTitle = { color: "#0A1628", fontSize: "18px", fontWeight: "700", margin: "0 0 8px" };
const ctaButton = { display: "inline-block", marginTop: "12px", backgroundColor: "#D4A853", color: "#0A1628", fontSize: "14px", fontWeight: "700", padding: "12px 22px", borderRadius: "8px", textDecoration: "none" };
const footer = { backgroundColor: "#F9FAFB", padding: "20px 24px", textAlign: "center" as const };
const footerText = { color: "#9CA3AF", fontSize: "12px", margin: "4px 0", lineHeight: "1.5" };
