import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";

// ─── OpenAI client ────────────────────────────────────────────────────────────
//
// Initialized lazily inside each request handler (not at module level) so that
// process.env is always read at call time, not at server startup.
// This prevents "undefined key" bugs when env vars load after module import.
//
// If you see "Invalid API key" errors:
//   1. Make sure .env.local exists in the project root
//   2. Make sure it contains:  OPENAI_API_KEY=sk-proj-...
//   3. Restart the dev server after editing .env.local

function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;

  // Log key presence on every request (safe — never prints the actual key)
  console.log(
    "[/api/chat] OPENAI_API_KEY present:",
    !!apiKey,
    "| length:",
    apiKey?.length ?? 0,
    "| starts with sk-:",
    apiKey?.startsWith("sk-") ?? false
  );

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set. Add it to .env.local and restart the dev server.");
  }

  return new OpenAI({ apiKey });
}

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
  const MODEL = "gpt-4o-mini";

  try {
    const openai = getOpenAIClient();

    console.log("[/api/chat] Calling OpenAI model:", MODEL);

    const completion = await openai.chat.completions.create({
      model: MODEL,
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
    // ── Detailed error logging ──────────────────────────────────────────────
    // OpenAI SDK errors are instances of APIError and carry structured fields.
    // We cast to a loose shape so TypeScript lets us read them safely.
    const e = err as {
      message?: string;
      status?: number;
      code?: string;
      type?: string;
      error?: unknown;
    };

    console.error("[/api/chat] OPENAI ERROR", {
      message: e.message,
      status:  e.status,
      code:    e.code,
      type:    e.type,
      model:   MODEL,
      error:   err,          // full object — includes headers, request id, etc.
    });

    // ── User-facing responses ────────────────────────────────────────────────
    // In development we surface the real OpenAI message so you can debug fast.
    // In production a generic message is shown so internals stay private.
    const isDev = process.env.NODE_ENV === "development";
    const devDetail = isDev && e.message ? ` — ${e.message}` : "";

    if (e.status === 401) {
      return new Response(
        `Invalid OpenAI API key. Check your OPENAI_API_KEY.${devDetail}`,
        { status: 500 }
      );
    }
    if (e.status === 429) {
      return new Response(
        `OpenAI rate limit reached. Please try again in a moment.${devDetail}`,
        { status: 429 }
      );
    }
    if (e.status === 404) {
      return new Response(
        `Model not found: "${MODEL}". ${isDev ? e.message ?? "" : "Check the model name."}`,
        { status: 500 }
      );
    }
    if (e.status === 400) {
      return new Response(
        `Bad request to OpenAI.${devDetail}`,
        { status: 500 }
      );
    }

    // Config error (missing API key before the request was sent)
    if (err instanceof Error && err.message.includes("OPENAI_API_KEY")) {
      return new Response(err.message, { status: 500 });
    }

    return new Response(
      isDev
        ? `AI service error: ${e.message ?? String(err)}`
        : "AI service error. Please try again.",
      { status: 500 }
    );
  }
}
