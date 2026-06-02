import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";

// The OpenAI client automatically reads OPENAI_API_KEY from process.env.
// Never put the key in client-side code — this file runs on the server only.
const openai = new OpenAI();

// ─── System prompt ────────────────────────────────────────────────────────────
//
// This tells the AI who it is and how to behave.
// Keeping it here (server-side) means it can't be inspected by the browser.

const SYSTEM_PROMPT = `You are DevFlow AI, a friendly and knowledgeable assistant for beginner indie developers.

Your role:
- Explain programming concepts clearly and simply
- Help debug code errors with step-by-step guidance
- Give practical advice on Next.js, React, TypeScript, Supabase, and modern web dev
- Encourage beginners without being condescending
- Keep answers concise but complete — use examples when helpful

Formatting:
- Use plain text for conversational answers
- Use code blocks with language hints for any code: \`\`\`tsx ... \`\`\`
- Use bullet points (•) for lists
- Keep paragraphs short for readability

When you don't know something, say so honestly rather than guessing.`;

// ─── Request body type ────────────────────────────────────────────────────────

interface RequestBody {
  messages: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function POST(request: Request): Promise<Response> {
  // 1. Verify the user is authenticated — never skip this
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return new Response("Unauthorized", { status: 401 });
  }

  // 2. Parse and validate the request body
  let body: RequestBody;
  try {
    body = await request.json();
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }

  const { messages } = body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response("messages array is required", { status: 400 });
  }

  // Limit conversation history to the last 20 messages to control token usage
  const recentMessages = messages.slice(-20);

  // 3. Call OpenAI with streaming enabled
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",   // Fast and affordable; swap for "gpt-4o" for higher quality
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...recentMessages,
      ],
      stream: true,
      max_tokens: 1500,
      temperature: 0.7,
    });

    // 4. Pipe the OpenAI stream into a Web ReadableStream so the browser can
    //    read tokens as they arrive (no waiting for the full response).
    const readable = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of completion) {
            const text = chunk.choices[0]?.delta?.content ?? "";
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        // These headers tell browsers and proxies not to buffer the stream
        "Cache-Control": "no-cache, no-transform",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (err: unknown) {
    // OpenAI API errors carry a numeric `status` field we can inspect safely
    const status =
      typeof err === "object" && err !== null && "status" in err
        ? (err as { status: unknown }).status
        : undefined;

    if (status === 401) {
      return new Response("Invalid OpenAI API key. Check your OPENAI_API_KEY.", { status: 500 });
    }
    if (status === 429) {
      return new Response("OpenAI rate limit reached. Please try again in a moment.", { status: 429 });
    }

    console.error("[/api/chat] error:", err);
    return new Response("AI service error. Please try again.", { status: 500 });
  }
}
