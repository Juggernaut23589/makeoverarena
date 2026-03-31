import {
  Body, Button, Container, Head, Heading, Hr, Html, Preview, Section, Text,
} from "@react-email/components";
import * as React from "react";

interface NurtureWeek1Props {
  studentName: string;
  serviceType?: string;
}

export default function NurtureWeek1({
  studentName = "Amara",
  serviceType = "study abroad",
}: NurtureWeek1Props) {
  return (
    <Html>
      <Head />
      <Preview>Is studying abroad still on your mind, {studentName}?</Preview>
      <Body style={{ backgroundColor: "#F9F7F2", fontFamily: "'DM Sans', Arial, sans-serif", margin: 0, padding: "32px 0" }}>
        <Container style={{ maxWidth: 560, margin: "0 auto", backgroundColor: "#ffffff", borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 32px rgba(10,15,30,0.08)" }}>
          {/* Header */}
          <Section style={{ backgroundColor: "#0A0F1E", padding: "32px 40px", textAlign: "center" }}>
            <Heading style={{ color: "#D4A853", fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 400, margin: 0 }}>
              MakeoverArena
            </Heading>
          </Section>

          {/* Body */}
          <Section style={{ padding: "40px 40px 32px" }}>
            <Text style={{ color: "#6B7280", fontSize: 13, margin: "0 0 8px" }}>Week 1</Text>
            <Heading style={{ color: "#0A0F1E", fontFamily: "Georgia, serif", fontSize: 26, fontWeight: 400, margin: "0 0 20px", lineHeight: 1.3 }}>
              You took the first step, {studentName}. What comes next?
            </Heading>
            <Text style={{ color: "#374151", fontSize: 15, lineHeight: 1.7, margin: "0 0 20px" }}>
              A week ago you reached out to us about {serviceType}. We just wanted to check in and make sure you have a clear picture of what working with MakeoverArena looks like.
            </Text>

            <Section style={{ backgroundColor: "#F9F7F2", borderRadius: 12, padding: "24px", margin: "24px 0" }}>
              <Text style={{ color: "#0A0F1E", fontWeight: 600, fontSize: 14, margin: "0 0 12px" }}>
                Here is how our process works:
              </Text>
              {[
                ["1", "Free consultation (30 min)", "We understand your goals and profile"],
                ["2", "University shortlist", "We identify the best-fit schools for you"],
                ["3", "Application prep", "Personal statement, documents, and deadlines"],
                ["4", "Submission & follow-up", "We submit and track your applications"],
                ["5", "Offer & visa", "We support you right through to your visa"],
              ].map(([num, title, desc]) => (
                <Section key={num} style={{ display: "flex", marginBottom: 10 }}>
                  <Text style={{ color: "#D4A853", fontWeight: 700, fontSize: 13, margin: "0 12px 0 0", minWidth: 20 }}>{num}.</Text>
                  <Text style={{ color: "#374151", fontSize: 13, margin: 0 }}>
                    <strong>{title}</strong> — {desc}
                  </Text>
                </Section>
              ))}
            </Section>

            <Text style={{ color: "#374151", fontSize: 15, lineHeight: 1.7, margin: "0 0 28px" }}>
              The earlier you start, the more options you have. Many top university deadlines open in September and close in January — now is the perfect time to begin.
            </Text>

            <Button
              href="https://makeoverarena.com/book"
              style={{ backgroundColor: "#D4A853", color: "#0A0F1E", borderRadius: 10, padding: "14px 28px", fontWeight: 700, fontSize: 14, textDecoration: "none", display: "inline-block" }}
            >
              Book Your Free Consultation →
            </Button>
          </Section>

          <Hr style={{ borderColor: "#E5E7EB", margin: "0 40px" }} />
          <Section style={{ padding: "24px 40px", textAlign: "center" }}>
            <Text style={{ color: "#9CA3AF", fontSize: 12, margin: 0 }}>
              MakeoverArena · Lagos, Nigeria · makeoverarena.com
            </Text>
            <Text style={{ color: "#9CA3AF", fontSize: 12, margin: "4px 0 0" }}>
              You&apos;re receiving this because you submitted an inquiry. Reply to unsubscribe.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
