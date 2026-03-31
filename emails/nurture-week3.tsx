import {
  Body, Button, Container, Head, Heading, Hr, Html, Preview, Section, Text,
} from "@react-email/components";
import * as React from "react";

interface NurtureWeek3Props {
  studentName: string;
}

export default function NurtureWeek3({ studentName = "Amara" }: NurtureWeek3Props) {
  const myths = [
    {
      myth: "\"My grades aren't good enough\"",
      truth: "Universities evaluate your whole profile — work experience, personal statement, motivation, and trajectory matter as much as your GPA.",
    },
    {
      myth: "\"I can't afford it\"",
      truth: "65% of our students receive scholarship funding. We help you identify and apply for awards that can cover tuition, accommodation, and living costs.",
    },
    {
      myth: "\"The process is too complicated\"",
      truth: "That's exactly what we're here for. We handle the complexity so you can focus on preparing for the life-changing experience ahead.",
    },
    {
      myth: "\"It's too late to apply\"",
      truth: "There are multiple intake windows every year — Fall, Spring, and Summer for many universities. We match you to the right window for your timeline.",
    },
  ];

  return (
    <Html>
      <Head />
      <Preview>4 myths about studying abroad — busted</Preview>
      <Body style={{ backgroundColor: "#F9F7F2", fontFamily: "'DM Sans', Arial, sans-serif", margin: 0, padding: "32px 0" }}>
        <Container style={{ maxWidth: 560, margin: "0 auto", backgroundColor: "#ffffff", borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 32px rgba(10,15,30,0.08)" }}>
          <Section style={{ backgroundColor: "#0A0F1E", padding: "32px 40px", textAlign: "center" }}>
            <Heading style={{ color: "#D4A853", fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 400, margin: 0 }}>
              MakeoverArena
            </Heading>
          </Section>

          <Section style={{ padding: "40px 40px 32px" }}>
            <Text style={{ color: "#6B7280", fontSize: 13, margin: "0 0 8px" }}>Week 3</Text>
            <Heading style={{ color: "#0A0F1E", fontFamily: "Georgia, serif", fontSize: 26, fontWeight: 400, margin: "0 0 20px", lineHeight: 1.3 }}>
              4 myths that might be holding you back, {studentName}
            </Heading>
            <Text style={{ color: "#374151", fontSize: 15, lineHeight: 1.7, margin: "0 0 28px" }}>
              We hear these concerns every week. Let us address them honestly:
            </Text>

            {myths.map(({ myth, truth }, i) => (
              <Section key={i} style={{ backgroundColor: i % 2 === 0 ? "#F9F7F2" : "#ffffff", borderRadius: 12, padding: "20px", marginBottom: 12 }}>
                <Text style={{ color: "#EF4444", fontSize: 14, fontWeight: 600, margin: "0 0 8px" }}>
                  ✗ {myth}
                </Text>
                <Text style={{ color: "#374151", fontSize: 14, lineHeight: 1.6, margin: 0 }}>
                  <span style={{ color: "#059669", fontWeight: 600 }}>✓ Reality: </span>
                  {truth}
                </Text>
              </Section>
            ))}

            <Text style={{ color: "#374151", fontSize: 15, lineHeight: 1.7, margin: "28px 0" }}>
              The only barrier is waiting too long. Our advisors can give you a clear, honest assessment of your profile in a 30-minute call — for free.
            </Text>

            <Button
              href="https://makeoverarena.com/book"
              style={{ backgroundColor: "#D4A853", color: "#0A0F1E", borderRadius: 10, padding: "14px 28px", fontWeight: 700, fontSize: 14, textDecoration: "none", display: "inline-block" }}
            >
              Get Your Free Assessment →
            </Button>
          </Section>

          <Hr style={{ borderColor: "#E5E7EB", margin: "0 40px" }} />
          <Section style={{ padding: "24px 40px", textAlign: "center" }}>
            <Text style={{ color: "#9CA3AF", fontSize: 12, margin: 0 }}>
              MakeoverArena · Lagos, Nigeria · makeoverarena.com
            </Text>
            <Text style={{ color: "#9CA3AF", fontSize: 12, margin: "4px 0 0" }}>
              Reply to unsubscribe from these updates.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
