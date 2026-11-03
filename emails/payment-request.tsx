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

interface PaymentRequestProps {
  studentName: string;
  amount: number;
  currency: string;
  description: string;
}

export default function PaymentRequest({
  studentName = "Amara",
  amount = 50000,
  currency = "NGN",
  description = "Application Processing Fee",
}: PaymentRequestProps) {
  const formatted = new Intl.NumberFormat("en-NG", { style: "currency", currency }).format(amount);

  return (
    <Html>
      <Head />
      <Preview>A payment of {formatted} is ready for you — MakeoverArena</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Payment request</Heading>
          <Text style={text}>Hi {studentName},</Text>
          <Text style={text}>
            Your advisor has raised a new payment for your application. You can pay securely from
            your MakeoverArena dashboard.
          </Text>
          <Section style={box}>
            <Text style={boxLabel}>{description}</Text>
            <Text style={boxAmount}>{formatted}</Text>
          </Section>
          <Section style={{ textAlign: "center", margin: "28px 0" }}>
            <Button style={button} href={`${APP_URL}/dashboard`}>
              Pay now
            </Button>
          </Section>
          <Hr style={hr} />
          <Text style={footer}>
            Questions about this payment? Reply to this email and we&apos;ll help.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = { backgroundColor: "#f8f6f2", fontFamily: "'DM Sans', Helvetica, Arial, sans-serif" };
const container = { margin: "0 auto", padding: "32px 24px", maxWidth: "480px" };
const h1 = { color: "#0f1b33", fontSize: "22px", fontWeight: 700, marginBottom: "16px" };
const text = { color: "#374151", fontSize: "15px", lineHeight: "24px" };
const box = { backgroundColor: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "20px 24px", margin: "20px 0" };
const boxLabel = { color: "#6b7280", fontSize: "13px", margin: "0 0 4px" };
const boxAmount = { color: "#0f1b33", fontSize: "26px", fontWeight: 700, margin: 0 };
const button = { backgroundColor: "#dc2626", color: "#ffffff", fontSize: "15px", fontWeight: 600, padding: "12px 28px", borderRadius: "8px", textDecoration: "none" };
const hr = { borderColor: "#e5e7eb", margin: "24px 0" };
const footer = { color: "#9ca3af", fontSize: "13px", lineHeight: "20px" };
