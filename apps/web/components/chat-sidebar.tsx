"use client";

import { MessageSquare, Plus, Trash2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useChats, useDeleteChat } from "@/hooks/use-chat";

export function ChatSidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeChatId = searchParams.get("chat");

  const { data, isLoading } = useChats();
  const deleteChat = useDeleteChat();
  const chats = data?.chats ?? [];

  function goToChat(chatId: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (chatId) {
      params.set("chat", chatId);
    } else {
      params.delete("chat");
    }
    router.push(`/agent${params.toString() ? `?${params.toString()}` : ""}`);
  }

  function handleDelete(e: React.MouseEvent, chatId: string) {
    e.stopPropagation();
    deleteChat.mutate(chatId, {
      onSuccess: () => {
        if (activeChatId === chatId) goToChat(null);
      },
    });
  }

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="p-3 border-b">
        <Button
          onClick={() => goToChat(null)}
          variant="secondary"
          className="w-full justify-start gap-2"
        >
          <Plus className="h-4 w-4" />
          New chat
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {isLoading && (
            <p className="text-xs text-muted-foreground text-center py-4">
              Loading…
            </p>
          )}

          {!isLoading && chats.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">
              No conversations yet
            </p>
          )}

          {chats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => goToChat(chat.id)}
              className={cn(
                "group flex items-center gap-2 w-full rounded-lg px-3 py-2 text-left text-sm transition-colors",
                activeChatId === chat.id
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              <MessageSquare className="h-3.5 w-3.5 shrink-0" />
              <span className="flex-1 truncate">
                {chat.title || "New chat"}
              </span>
              <Trash2
                className="h-3.5 w-3.5 shrink-0 opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity"
                onClick={(e) => handleDelete(e, chat.id)}
              />
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}