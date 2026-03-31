import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { checkChatbotLimit, getIp } from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase/server";

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

const SYSTEM_PROMPT = `You are a helpful assistant for MakeoverArena, a study abroad consultancy based in Nigeria.

SERVICES WE OFFER:
- Undergraduate admissions to US, UK, Canada, Australia, Europe
- Graduate/Masters admissions
- PhD admissions
- Scholarship assistance
- Visa support

KEY INFORMATION:
- We help students from Nigeria and Africa get admitted to top universities
- Free initial 30-minute consultation
- Typical pricing: ₦150,000 - ₦500,000 depending on service
- Application time: 3-6 months
- We partner with 200+ universities
- 92% student success rate
- 65% of scholarship applicants received funding

YOUR ROLE:
- Answer questions about services, pricing, requirements, timeline
- Help students determine which service they need
- Guide them to submit application form (/apply) or book consultation (/book)
- Be friendly, encouraging, and professional
- Use short, conversational responses (2-4 sentences max per message)
- If you don't know something specific, direct them to book a consultation

IMPORTANT RULES:
- Don't make up specific university names or scholarship amounts
- Don't guarantee admission — say "we maximise your chances"
- Always offer to escalate to human if question is complex
- Keep responses concise and warm`;

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = getIp(request);
    const { allowed } = await checkChatbotLimit(ip);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many messages. Please wait a moment." },
        { status: 429 }
      );
    }

    const { messages, sessionId } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages" }, { status: 400 });
    }

    // Limit to last 10 messages to avoid token overflow
    const recentMessages = messages.slice(-10);

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "Chatbot unavailable" }, { status: 503 });
    }

    const completion = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...recentMessages,
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    const content =
      completion.choices[0]?.message?.content ??
      "I'm sorry, I couldn't generate a response.";

    // Persist conversation asynchronously (non-blocking)
    if (sessionId && typeof sessionId === "string") {
      void persistConversation(sessionId, messages, content);
    }

    return NextResponse.json({ content });
  } catch (err) {
    console.error("Chatbot error:", err);
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}

async function persistConversation(
  sessionId: string,
  messages: Array<{ role: string; content: string }>,
  assistantReply: string
) {
  try {
    const supabase = await createAdminClient();
    const allMessages = [
      ...messages,
      { role: "assistant", content: assistantReply },
    ];

    // Upsert: create on first message, update thereafter
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("chat_conversations").upsert(
      {
        session_id: sessionId,
        messages: allMessages,
        message_count: allMessages.length,
        updated_at: new Date().toISOString(),
      } as any,
      { onConflict: "session_id" }
    );
  } catch (err) {
    // Non-fatal — don't affect the response
    console.error("[chatbot] Failed to persist conversation:", err);
  }
}
