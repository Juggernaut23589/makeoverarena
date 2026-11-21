import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { checkChatbotLimit, getIp } from "@/lib/rate-limit";
import { supabaseAdmin } from "@/lib/supabase";

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

const SYSTEM_PROMPT = `You are a helpful assistant for MakeoverArena, a scholarship database platform serving African students pursuing study abroad.

WHAT WE OFFER:
- A searchable, continuously-updated database of verified scholarship opportunities
- Coverage: US, UK, Canada, Australia, Germany, France, Netherlands, and other destinations
- Filter by country, field of study, funding type, and deadline
- Save/bookmark and download scholarship details
- Notifications for renewals, expiry, and new matches to your profile

KEY INFORMATION:
- Access is sold as Basic, Standard, and Premium tiers over a fixed period (e.g. 1, 3, or 6 months)
- Every listing goes through a staged research, verification, and approval process before publishing
- Pricing is shown on the Scholarships page (/services/scholarships) and at signup (/signup)

YOUR ROLE:
- Answer questions about the database, access tiers, and pricing
- Help students understand what each tier unlocks
- Guide them to create an account (/signup) or view plans (/services/scholarships)
- Be friendly, encouraging, and professional
- Use short, conversational responses (2-4 sentences max per message)
- If you don't know something specific, direct them to email info@makeoverarena.com

IMPORTANT RULES:
- Don't make up specific scholarship names, amounts, or deadlines — direct them to search the live database instead
- Don't guarantee funding outcomes
- Always offer to escalate to a human (email) if the question is complex
- Keep responses concise and warm`;

export async function POST(request: NextRequest) {
  try {
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

    const recentMessages = messages.slice(-10);

    const openaiKey = process.env.OPENAI_API_KEY ?? "";
    const openaiReady = openaiKey.startsWith("sk-") && !/your|placeholder|xxxx|here/i.test(openaiKey);
    if (!openaiReady) {
      return NextResponse.json(
        { error: "The assistant is offline right now. Please email info@makeoverarena.com." },
        { status: 503 }
      );
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

    if (sessionId && typeof sessionId === "string" && supabaseAdmin) {
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
    if (!supabaseAdmin) return;
    
    const allMessages = [
      ...messages,
      { role: "assistant", content: assistantReply },
    ];

    await supabaseAdmin.from("chat_conversations").upsert(
      {
        session_id: sessionId,
        messages: allMessages,
        message_count: allMessages.length,
        updated_at: new Date().toISOString(),
      } as Record<string, unknown>,
      { onConflict: "session_id" }
    );
  } catch (err) {
    console.error("[chatbot] Failed to persist conversation:", err);
  }
}
