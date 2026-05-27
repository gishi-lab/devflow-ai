"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const EXAMPLE_QUESTIONS = [
  "What is the difference between useState and useEffect?",
  "How do I fetch data from an API in Next.js?",
  "Explain what a REST API is in simple terms",
  "What is TypeScript and why should I use it?",
];

const INITIAL_MESSAGES: Message[] = [
  {
    id: "welcome",
    role: "assistant",
    content: "Hi! I'm your AI assistant. I'm here to help you learn and build faster as a developer.\n\nYou can ask me about:\n• Programming concepts and terminology\n• How to debug errors in your code\n• Best practices and patterns\n• Next.js, React, TypeScript, and more\n\nWhat would you like to know?",
    timestamp: new Date(),
  },
];

function formatTime(date: Date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"} animate-fade-in-up`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
        isUser
          ? "bg-indigo-600 text-white"
          : "bg-slate-800 text-slate-300 border border-slate-700"
      }`}>
        {isUser ? (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        )}
      </div>

      {/* Bubble */}
      <div className={`max-w-[75%] ${isUser ? "items-end" : "items-start"} flex flex-col gap-1`}>
        <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? "bg-indigo-600 text-white rounded-tr-sm"
            : "bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm"
        }`}>
          {message.content}
        </div>
        <span className="text-xs text-slate-400 px-1">{formatTime(message.timestamp)}</span>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-3 animate-fade-in-up">
      <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center flex-shrink-0">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full bg-slate-400 typing-dot" />
        <div className="w-2 h-2 rounded-full bg-slate-400 typing-dot" />
        <div className="w-2 h-2 rounded-full bg-slate-400 typing-dot" />
      </div>
    </div>
  );
}

const MOCK_RESPONSES: Record<string, string> = {
  default: "That's a great question! To properly answer it, you'll need to connect the OpenAI API. Add your `OPENAI_API_KEY` to your `.env.local` file and implement the `/api/chat` route.\n\nFor now, I'm running in demo mode. Try asking me about React hooks, API concepts, or TypeScript!",
  react: "React is a JavaScript library for building user interfaces. It uses a component-based architecture, where UI is broken into reusable pieces.\n\nKey concepts:\n• **Components** — functions that return JSX (UI)\n• **State** — data that changes over time (useState)\n• **Props** — data passed between components\n• **Effects** — side effects like API calls (useEffect)\n\nHere's a simple component:\n```\nfunction Greeting({ name }) {\n  return <h1>Hello, {name}!</h1>;\n}\n```",
  api: "An API (Application Programming Interface) is a way for two software applications to communicate.\n\nThink of it like ordering at a restaurant:\n1. You (client) place an order\n2. The waiter (API) takes your request to the kitchen\n3. The kitchen (server) prepares it\n4. The waiter returns your food (response)\n\nIn web development, APIs usually communicate via HTTP requests:\n• **GET** — read data\n• **POST** — create data\n• **PUT/PATCH** — update data\n• **DELETE** — remove data",
  typescript: "TypeScript is JavaScript with type annotations. It catches errors before your code runs!\n\nWithout TypeScript:\n```js\nfunction add(a, b) {\n  return a + b;\n}\nadd('1', 2); // '12' — oops!\n```\n\nWith TypeScript:\n```ts\nfunction add(a: number, b: number): number {\n  return a + b;\n}\nadd('1', 2); // Error caught immediately!\n```\n\nBenefits: better IDE support, fewer bugs, easier refactoring.",
};

function getMockResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes("react") || lower.includes("usestate") || lower.includes("useeffect") || lower.includes("hook")) {
    return MOCK_RESPONSES.react;
  }
  if (lower.includes("api") || lower.includes("fetch") || lower.includes("rest") || lower.includes("http")) {
    return MOCK_RESPONSES.api;
  }
  if (lower.includes("typescript") || lower.includes("type")) {
    return MOCK_RESPONSES.typescript;
  }
  return MOCK_RESPONSES.default;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const sendMessage = async (content: string) => {
    const trimmed = content.trim();
    if (!trimmed || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: trimmed,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate AI response (replace with real API call)
    await new Promise((resolve) => setTimeout(resolve, 1200 + Math.random() * 800));

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: getMockResponse(trimmed),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, assistantMessage]);
    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const clearChat = () => {
    setMessages(INITIAL_MESSAGES);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] lg:h-screen bg-slate-50">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h1 className="text-slate-900 font-bold text-base">AI Assistant</h1>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-400 text-xs">Demo mode — connect OpenAI API to enable full AI</span>
            </div>
          </div>
        </div>
        <button
          onClick={clearChat}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
          title="Clear conversation"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5 max-w-3xl w-full mx-auto">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {isLoading && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Example questions */}
      {messages.length === 1 && (
        <div className="px-4 pb-4 max-w-3xl w-full mx-auto">
          <p className="text-slate-400 text-xs mb-3 px-1">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                className="text-xs bg-white border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 text-slate-600 px-3 py-1.5 rounded-xl transition-all"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="px-4 pb-6 max-w-3xl w-full mx-auto flex-shrink-0">
        <div className="relative bg-white rounded-2xl border border-slate-200 shadow-sm focus-within:border-indigo-300 focus-within:ring-1 focus-within:ring-indigo-300 transition-all">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything about development..."
            rows={1}
            disabled={isLoading}
            className="w-full px-4 py-3.5 pr-12 bg-transparent text-slate-900 placeholder-slate-400 focus:outline-none resize-none text-sm leading-relaxed max-h-32"
            style={{ overflow: "hidden" }}
            onInput={(e) => {
              const t = e.target as HTMLTextAreaElement;
              t.style.height = "auto";
              t.style.height = `${Math.min(t.scrollHeight, 128)}px`;
            }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isLoading}
            className="absolute right-2.5 bottom-2.5 w-8 h-8 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-200 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all"
          >
            {isLoading ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
        <p className="text-center text-slate-400 text-xs mt-2">
          Press <kbd className="bg-slate-100 px-1 py-0.5 rounded text-slate-500 text-xs">Enter</kbd> to send,{" "}
          <kbd className="bg-slate-100 px-1 py-0.5 rounded text-slate-500 text-xs">Shift+Enter</kbd> for new line
        </p>
      </div>
    </div>
  );
}
