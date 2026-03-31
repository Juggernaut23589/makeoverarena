import {
  Body, Button, Container, Head, Heading, Hr, Html, Preview, Section, Text,
} from "@react-email/components";
import * as React from "react";

interface NurtureWeek2Props {
  studentName: string;
}

export default function NurtureWeek2({ studentName = "Amara" }: NurtureWeek2Props) {
  const stories = [
    {
      name: "Kemi O.",
      outcome: "Chevening Scholar, University of Birmingham",
      quote: "I had a 3.2 GPA and no idea where to start. MakeoverArena helped me craft a Chevening application that stood out.",
    },
    {
      name: "Chukwuemeka A.",
      outcome: "MSc Computer Science, University of Toronto",
      quote: "From first call to offer letter in 4 months. The personal statement coaching made all the difference.",
    },
  ];

  return (
    <Html>
      <Head />
      <Preview>Real students. Real results. Could this be you?</Preview>
      <Body style={{ backgroundColor: "#F9F7F2", fontFamily: "'DM Sans', Arial, sans-serif", margin: 0, padding: "32px 0" }}>
        <Container style={{ maxWidth: 560, margin: "0 auto", backgroundColor: "#ffffff", borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 32px rgba(10,15,30,0.08)" }}>
          <Section style={{ backgroundColor: "#0A0F1E", padding: "32px 40px", textAlign: "center" }}>
            <Heading style={{ color: "#D4A853", fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 400, margin: 0 }}>
              MakeoverArena
            </Heading>
          </Section>

          <Section style={{ padding: "40px 40px 32px" }}>
            <Text style={{ color: "#6B7280", fontSize: 13, margin: "0 0 8px" }}>Week 2</Text>
            <Heading style={{ color: "#0A0F1E", fontFamily: "Georgia, serif", fontSize: 26, fontWeight: 400, margin: "0 0 20px", lineHeight: 1.3 }}>
              Students just like you are studying abroad right now
            </Heading>
            <Text style={{ color: "#374151", fontSize: 15, lineHeight: 1.7, margin: "0 0 24px" }}>
              Hi {studentName}, we wanted to share a couple of stories from students who were once in your exact position — wondering if studying abroad was really possible for them.
            </Text>

            {stories.map((s) => (
              <Section key={s.name} style={{ borderLeft: "3px solid #D4A853", paddingLeft: 20, margin: "0 0 24px" }}>
                <Text style={{ color: "#374151", fontSize: 14, fontStyle: "italic", lineHeight: 1.6, margin: "0 0 8px" }}>
                  &ldquo;{s.quote}&rdquo;
                </Text>
                <Text style={{ color: "#D4A853", fontSize: 13, fontWeight: 600, margin: 0 }}>
                  {s.name} — {s.outcome}
                </Text>
              </Section>
            ))}

            <Section style={{ backgroundColor: "#0A0F1E", borderRadius: 12, padding: "24px", margin: "8px 0 28px", textAlign: "center" }}>
              <Text style={{ color: "#D4A853", fontFamily: "Georgia, serif", fontSize: 32, fontWeight: 400, margin: "0 0 4px" }}>92%</Text>
              <Text style={{ color: "#ffffff", fontSize: 13, margin: 0 }}>of our students receive at least one admission offer</Text>
            </Section>

            <Text style={{ color: "#374151", fontSize: 15, lineHeight: 1.7, margin: "0 0 28px" }}>
              Your success story could be next. The first step is a free conversation with one of our advisors — no pressure, just clarity.
            </Text>

            <Button
              href="https://makeoverarena.com/apply"
              style={{ backgroundColor: "#D4A853", color: "#0A0F1E", borderRadius: 10, padding: "14px 28px", fontWeight: 700, fontSize: 14, textDecoration: "none", display: "inline-block" }}
            >
              Start Your Application →
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
