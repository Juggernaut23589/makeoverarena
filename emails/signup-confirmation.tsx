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
import { APP_URL } from "@/lib/site-url";

interface SignupConfirmationProps {
  studentName: string;
  dashboardUrl: string;
}

export default function SignupConfirmation({
  studentName = "Amara",
  dashboardUrl = `${APP_URL}/dashboard`,
}: SignupConfirmationProps) {
  return (
    <Html>
      <Head />
      <Preview>Your MakeoverArena dashboard is ready, {studentName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logoText}>MakeoverArena</Text>
          </Section>

          <Section style={heroSection}>
            <Heading style={h1}>You&apos;ve successfully signed up ✓</Heading>
            <Text style={heroText}>
              Hi {studentName}, welcome to MakeoverArena! Your dashboard is ready and waiting for you.
            </Text>
            <Text style={heroText}>
              Here&apos;s what to do next:
            </Text>
            <Text style={stepText}>1. Go to your dashboard and review your application details.</Text>
            <Text style={stepText}>2. Upload your required documents (transcripts, certificates, passport, etc.).</Text>
            <Text style={stepText}>3. Book your free 15-minute consultation with one of our advisors.</Text>
          </Section>

          <Hr style={hr} />

          <Section style={ctaSection}>
            <Button style={button} href={dashboardUrl}>
              Go to My Dashboard
            </Button>
          </Section>

          <Hr style={hr} />

          <Section style={footer}>
            <Text style={footerText}>
              Questions? Reply to this email or WhatsApp us at +234 800 000 0000.
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
const stepText = { color: "#0A1628", fontSize: "15px", lineHeight: "1.6", margin: "0 0 8px", paddingLeft: "8px", borderLeft: "3px solid #D4A853" };
const hr = { borderColor: "#E5E7EB", margin: "0" };
const ctaSection = { padding: "24px", textAlign: "center" as const };
const button = { backgroundColor: "#D4A853", color: "#0A1628", fontWeight: "700", fontSize: "14px", padding: "12px 28px", borderRadius: "8px", textDecoration: "none", display: "inline-block" };
const footer = { backgroundColor: "#F9FAFB", padding: "20px 24px", textAlign: "center" as const };
const footerText = { color: "#9CA3AF", fontSize: "12px", margin: "4px 0", lineHeight: "1.5" };
