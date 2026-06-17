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

interface StaffApprovedProps {
  staffName: string;
  loginUrl: string;
}

export default function StaffApproved({
  staffName = "Team Member",
  loginUrl = "https://makeoverarena.com/staff/login",
}: StaffApprovedProps) {
  return (
    <Html>
      <Head />
      <Preview>Your MakeoverArena staff account is approved</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logoText}>MakeoverArena</Text>
          </Section>

          <Section style={heroSection}>
            <Heading style={h1}>You&apos;re approved ✓</Heading>
            <Text style={heroText}>
              Hi {staffName}, your staff account has been reviewed and activated by the super admin.
              You can now sign in to the staff portal and access your assigned tools.
            </Text>
          </Section>

          <Hr style={hr} />

          <Section style={ctaSection}>
            <Button style={button} href={loginUrl}>
              Sign In to Staff Portal
            </Button>
          </Section>

          <Hr style={hr} />

          <Section style={footer}>
            <Text style={footerText}>
              If you didn&apos;t register for a MakeoverArena staff account, please ignore this email.
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
const heroSection = { padding: "32px 24px 24px" };
const h1 = { color: "#0A1628", fontSize: "26px", fontWeight: "600", margin: "0 0 12px", lineHeight: "1.3" };
const heroText = { color: "#4B5563", fontSize: "15px", lineHeight: "1.6", margin: "0 0 12px" };
const hr = { borderColor: "#E5E7EB", margin: "0" };
const ctaSection = { padding: "24px", textAlign: "center" as const };
const button = { backgroundColor: "#D4A853", color: "#0A1628", fontWeight: "700", fontSize: "14px", padding: "12px 28px", borderRadius: "8px", textDecoration: "none", display: "inline-block" };
const footer = { backgroundColor: "#F9FAFB", padding: "20px 24px", textAlign: "center" as const };
const footerText = { color: "#9CA3AF", fontSize: "12px", margin: "4px 0", lineHeight: "1.5" };
