"use client";

import { useEffect, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Sparkles, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { Spinner } from "./ui/spinner";

export function ChatWindow() {
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: `${process.env.NEXT_PUBLIC_API_URL}/api/chat`,
      credentials: "include",
    }),
  });

  const isStreaming = status === "submitted" || status === "streaming";
  const lastMessage = messages.at(-1);
  const lastMessageHasText = lastMessage?.parts?.some(
    (p) => p.type === "text" && p.text?.length
  );

  const isThinking =
    status === "submitted" ||
    (status === "streaming" && lastMessage?.role === "assistant" && !lastMessageHasText);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  function handleSend() {
    const text = inputRef.current?.value.trim();
    if (!text || isStreaming) return;
    sendMessage({ text });
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* ── Message list ───────────────────────────────────────────────── */}
      <ScrollArea className="flex-1 px-4 py-6">
        <div className="space-y-4">
          {messages.length === 0 && !isThinking && <EmptyState />}

          {messages.map((message, index) => {
            const isLast = index === messages.length - 1;
            const hasText = message.parts?.some(
              (p) => p.type === "text" && p.text?.length
            );

            // Skip rendering an empty assistant bubble while ThinkingIndicator is shown
            if (isLast && message.role === "assistant" && !hasText && isThinking) {
              return null;
            }

            return (
              <MessageBubble
                key={message.id}
                role={message.role}
                parts={message.parts}
                isStreaming={isStreaming && isLast}
              />
            );
          })}

          {isThinking && <ThinkingIndicator />}

          {error && (
            <p className="text-sm text-destructive text-center">
              Something went wrong. Please try again.
            </p>
          )}

          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* ── Input bar ──────────────────────────────────────────────────── */}
      <div className="border-t px-4 py-3">
        <div className="flex items-end gap-2">
          <Textarea
            ref={inputRef}
            rows={1}
            onKeyDown={handleKeyDown}
            disabled={isStreaming}
            placeholder="Ask the agent to do something…"
            className="flex-1 resize-none"
          />
          <Button onClick={handleSend} disabled={isStreaming} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}

// ─── Message bubble ───────────────────────────────────────────────────────────

function MessageBubble({
  role,
  parts,
  isStreaming,
}: {
  role: "user" | "assistant" | "system";
  parts: { type: string; text?: string }[];
  isStreaming: boolean;
}) {
  const isUser = role === "user";
  const text = parts
    .filter((p) => p.type === "text")
    .map((p) => p.text)
    .join("");

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
          isUser
            ? "bg-primary text-primary-foreground rounded-tr-sm whitespace-pre-wrap"
            : "bg-muted text-foreground rounded-tl-sm"
        )}
      >
        {isUser ? text : <MarkdownContent content={text} />}
        {isStreaming && text && <Cursor />}
      </div>
    </div>
  );
}

// ─── Markdown renderer ──────────────────────────────────────────────────────────

function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="space-y-2 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="leading-relaxed">{children}</p>,
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">{children}</strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
          h1: ({ children }) => (
            <h1 className="text-base font-semibold mt-3 mb-1">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-sm font-semibold mt-3 mb-1">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-sm font-semibold mt-3 mb-1">{children}</h3>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-5 space-y-1">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-5 space-y-1">{children}</ol>
          ),
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary underline underline-offset-2 hover:opacity-80"
            >
              {children}
              <ExternalLink className="h-3 w-3 shrink-0" />
            </a>
          ),
          code: ({ children, className }) => {
            const isBlock = className?.includes("language-");
            return isBlock ? (
              <code className="block bg-background/60 rounded-md p-3 text-xs overflow-x-auto font-mono">
                {children}
              </code>
            ) : (
              <code className="bg-background/60 rounded px-1 py-0.5 text-xs font-mono">
                {children}
              </code>
            );
          },
          pre: ({ children }) => <pre className="my-2">{children}</pre>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-border pl-3 italic text-muted-foreground">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="border-border my-3" />,
          table: ({ children }) => (
            <div className="overflow-x-auto">
              <table className="text-xs border-collapse">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-border px-2 py-1 text-left font-semibold">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-border px-2 py-1">{children}</td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

// ─── Thinking indicator ────────────────────────────────────────────────────────

function ThinkingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-2 rounded-2xl rounded-tl-sm bg-muted px-4 py-2.5 text-sm text-muted-foreground">
      <Spinner/>
        <span>Thinking</span>
        <BouncingDots />
      </div>
    </div>
  );
}

function BouncingDots() {
  return (
    <span className="flex gap-0.5">
      <span className="h-1 w-1 rounded-full bg-current animate-bounce [animation-delay:-0.3s]" />
      <span className="h-1 w-1 rounded-full bg-current animate-bounce [animation-delay:-0.15s]" />
      <span className="h-1 w-1 rounded-full bg-current animate-bounce" />
    </span>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Cursor() {
  return (
    <span className="inline-block w-1.5 h-4 bg-current rounded-sm animate-pulse ml-0.5 align-middle" />
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground gap-2 mt-24">
      <p className="text-base font-medium text-foreground">AI Agent ready</p>
      <p className="text-sm max-w-xs">
        Connect apps on the left, then ask me to send emails, create GitHub
        issues, post to Slack, and more.
      </p>
    </div>
  );
}