import {
  Body, Button, Container, Head, Heading, Hr, Html, Preview, Section, Text,
} from "@react-email/components";
import * as React from "react";

interface NurtureWeek4Props {
  studentName: string;
  preferredCountries?: string[];
}

export default function NurtureWeek4({
  studentName = "Amara",
  preferredCountries = ["United Kingdom", "Canada"],
}: NurtureWeek4Props) {
  const topCountries = preferredCountries.slice(0, 2);

  return (
    <Html>
      <Head />
      <Preview>One last thing before we wrap up, {studentName}</Preview>
      <Body style={{ backgroundColor: "#F9F7F2", fontFamily: "'DM Sans', Arial, sans-serif", margin: 0, padding: "32px 0" }}>
        <Container style={{ maxWidth: 560, margin: "0 auto", backgroundColor: "#ffffff", borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 32px rgba(10,15,30,0.08)" }}>
          <Section style={{ backgroundColor: "#0A0F1E", padding: "32px 40px", textAlign: "center" }}>
            <Heading style={{ color: "#D4A853", fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 400, margin: 0 }}>
              MakeoverArena
            </Heading>
          </Section>

          <Section style={{ padding: "40px 40px 32px" }}>
            <Text style={{ color: "#6B7280", fontSize: 13, margin: "0 0 8px" }}>Week 4 · Final message</Text>
            <Heading style={{ color: "#0A0F1E", fontFamily: "Georgia, serif", fontSize: 26, fontWeight: 400, margin: "0 0 20px", lineHeight: 1.3 }}>
              Your dream of studying in {topCountries.join(" or ")} is closer than you think
            </Heading>

            <Text style={{ color: "#374151", fontSize: 15, lineHeight: 1.7, margin: "0 0 20px" }}>
              Hi {studentName}, this is the last in our check-in series. We hope the emails have been helpful — we just genuinely care about students making this life-changing move.
            </Text>

            <Section style={{ backgroundColor: "#0A0F1E", borderRadius: 12, padding: "28px", margin: "0 0 28px" }}>
              <Text style={{ color: "#ffffff", fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 400, margin: "0 0 16px", lineHeight: 1.4 }}>
                &ldquo;The best time to start your study abroad application was last year. The second best time is today.&rdquo;
              </Text>
              <Text style={{ color: "#D4A853", fontSize: 13, fontWeight: 600, margin: 0 }}>
                — MakeoverArena Advisors
              </Text>
            </Section>

            <Text style={{ color: "#374151", fontSize: 15, lineHeight: 1.7, margin: "0 0 12px" }}>
              If you&apos;re ready to take action, here are your two options:
            </Text>

            <Section style={{ margin: "0 0 28px" }}>
              <Section style={{ backgroundColor: "#F9F7F2", borderRadius: 10, padding: "16px", marginBottom: 10 }}>
                <Text style={{ color: "#0A0F1E", fontWeight: 600, fontSize: 14, margin: "0 0 4px" }}>
                  Option A — Book a free consultation
                </Text>
                <Text style={{ color: "#374151", fontSize: 13, lineHeight: 1.5, margin: 0 }}>
                  30 minutes, no obligation. Just clarity on your options and a plan.
                </Text>
              </Section>
              <Section style={{ backgroundColor: "#F9F7F2", borderRadius: 10, padding: "16px" }}>
                <Text style={{ color: "#0A0F1E", fontWeight: 600, fontSize: 14, margin: "0 0 4px" }}>
                  Option B — Fill out the full application
                </Text>
                <Text style={{ color: "#374151", fontSize: 13, lineHeight: 1.5, margin: 0 }}>
                  Takes 5 minutes. We&apos;ll review your profile and send you a personalised plan.
                </Text>
              </Section>
            </Section>

            <Section style={{ display: "flex", gap: 12 }}>
              <Button
                href="https://makeoverarena.com/book"
                style={{ backgroundColor: "#D4A853", color: "#0A0F1E", borderRadius: 10, padding: "14px 24px", fontWeight: 700, fontSize: 14, textDecoration: "none", display: "inline-block", marginRight: 12 }}
              >
                Book Consultation
              </Button>
              <Button
                href="https://makeoverarena.com/apply"
                style={{ backgroundColor: "transparent", color: "#0A0F1E", borderRadius: 10, padding: "13px 24px", fontWeight: 600, fontSize: 14, textDecoration: "none", display: "inline-block", border: "2px solid #0A0F1E" }}
              >
                Start Application
              </Button>
            </Section>

            <Text style={{ color: "#9CA3AF", fontSize: 13, lineHeight: 1.6, margin: "28px 0 0" }}>
              Either way, we wish you the very best. Wherever you end up, we hope it&apos;s somewhere that transforms your life.
            </Text>
          </Section>

          <Hr style={{ borderColor: "#E5E7EB", margin: "0 40px" }} />
          <Section style={{ padding: "24px 40px", textAlign: "center" }}>
            <Text style={{ color: "#9CA3AF", fontSize: 12, margin: 0 }}>
              MakeoverArena · Lagos, Nigeria · makeoverarena.com
            </Text>
            <Text style={{ color: "#9CA3AF", fontSize: 12, margin: "4px 0 0" }}>
              This is the last email in this series. Reply anytime — we&apos;re always here.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
