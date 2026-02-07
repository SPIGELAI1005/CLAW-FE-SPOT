"use client";

import { useState, useRef, useCallback } from "react";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import type { SpotMessage, SpotMode } from "@/lib/spotTypes";

interface PresenceUser {
  userId: string;
  displayName: string;
  isTyping: boolean;
}

interface ConversationPanelProps {
  messages: SpotMessage[];
  spotMode: SpotMode;
  onSend?: (content: string) => void;
  presenceUsers?: PresenceUser[];
  onTypingChange?: (isTyping: boolean) => void;
}

export function ConversationPanel({
  messages,
  spotMode,
  onSend,
  presenceUsers = [],
  onTypingChange,
}: ConversationPanelProps) {
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTyping = useCallback(
    (value: string) => {
      setDraft(value);
      if (onTypingChange) {
        onTypingChange(true);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
          onTypingChange(false);
        }, 2000);
      }
    },
    [onTypingChange],
  );

  async function handleSend() {
    if (!draft.trim() || !onSend) return;
    setIsSending(true);
    try {
      await onSend(draft.trim());
      setDraft("");
      onTypingChange?.(false);
    } finally {
      setIsSending(false);
    }
  }

  const typingUsers = presenceUsers.filter((u) => u.isTyping);
  const onlineUsers = presenceUsers.filter((u) => !u.isTyping);

  return (
    <Card className="flex flex-col">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-xs font-semibold uppercase tracking-wider text-stone-400">
          Conversation
        </div>
        {onlineUsers.length > 0 && (
          <div className="flex items-center gap-1.5 text-[10px] text-stone-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
            {onlineUsers.length} online
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="space-y-4 overflow-y-auto" style={{ maxHeight: "400px" }}>
        {messages.length === 0 ? (
          <p className="py-8 text-center text-sm text-stone-400">
            No messages yet. Start the conversation.
          </p>
        ) : (
          messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))
        )}
      </div>

      {/* Typing indicator */}
      {typingUsers.length > 0 && (
        <div className="mt-2 flex items-center gap-2 text-xs text-stone-400">
          <div className="flex gap-0.5">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-stone-400 [animation-delay:0ms]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-stone-400 [animation-delay:150ms]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-stone-400 [animation-delay:300ms]" />
          </div>
          {typingUsers.map((u) => u.displayName).join(", ")}{" "}
          {typingUsers.length === 1 ? "is" : "are"} typing...
        </div>
      )}

      {/* Input */}
      <div className="mt-4 flex gap-2 border-t border-stone-100 pt-4 dark:border-stone-800">
        <input
          type="text"
          value={draft}
          onChange={(e) => handleTyping(e.target.value)}
          placeholder={
            spotMode === "discuss"
              ? "Type a message..."
              : "Type a message or command..."
          }
          aria-label="Message input"
          className="h-10 flex-1 rounded-xl border border-stone-200 bg-transparent px-3 text-sm outline-none placeholder:text-stone-400 focus:border-amber-400 dark:border-stone-800 dark:placeholder:text-stone-600 dark:focus:border-amber-600"
          onKeyDown={(e) => {
            if (e.key === "Enter" && draft.trim()) handleSend();
          }}
          disabled={isSending}
        />
        <button
          onClick={handleSend}
          disabled={!draft.trim() || isSending}
          aria-label="Send message"
          className="inline-flex h-10 items-center justify-center rounded-xl bg-stone-900 px-4 text-sm font-medium text-white transition-colors hover:bg-stone-800 disabled:opacity-40 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white"
        >
          {isSending ? "..." : "Send"}
        </button>
      </div>
    </Card>
  );
}

function MessageBubble({ message }: { message: SpotMessage }) {
  const isSystem = message.type === "system";
  const isAgent = message.type === "agent";

  if (isSystem) {
    return (
      <div className="flex items-center gap-2 text-xs text-stone-400">
        <div className="h-px flex-1 bg-stone-100 dark:bg-stone-800" />
        <span>{message.content}</span>
        <div className="h-px flex-1 bg-stone-100 dark:bg-stone-800" />
      </div>
    );
  }

  return (
    <div className={`flex gap-3 ${isAgent ? "" : "flex-row-reverse"}`}>
      <Avatar name={message.senderName} size="sm" />
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
          isAgent
            ? "bg-stone-100 text-stone-900 dark:bg-stone-900 dark:text-stone-100"
            : "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900"
        }`}
      >
        <div className="mb-1 text-[10px] font-medium opacity-60">
          {message.senderName}
        </div>
        <div className="whitespace-pre-wrap">{message.content}</div>
      </div>
    </div>
  );
}
