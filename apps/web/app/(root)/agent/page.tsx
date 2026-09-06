import { ChatWindow } from "@/components/chat-window";
import { ToolkitPanel } from "@/components/toolkit-panel";
import { ChatSidebar } from "@/components/chat-sidebar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

/**
 * /agent
 *
 * Left:  Tabs — ChatSidebar (conversation history) | ToolkitPanel (connect/disconnect apps)
 * Right: ChatWindow — streaming chat with the agent
 */
export default function AgentPage() {
  return (
    // Subtract your actual header height. Measure it in devtools if unsure —
    // looked like ~64px in your screenshot, adjust if different.
    <div className="flex h-[calc(100vh-64px)] bg-background py-10">
      {/* Sidebar */}
      <div className="w-72 shrink-0 border-r flex flex-col bg-background">
        <Tabs defaultValue="apps" className="flex flex-col h-full gap-0">
          <div className="px-3 pt-3 pb-2 border-b">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="chats">Chats</TabsTrigger>
              <TabsTrigger value="apps">Apps</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent
            value="chats"
            className="flex-1 overflow-hidden mt-0 data-[state=inactive]:hidden"
          >
            <ChatSidebar />
          </TabsContent>

          <TabsContent
            value="apps"
            className="flex-1 overflow-y-auto p-3 mt-0 data-[state=inactive]:hidden"
          >
            <ToolkitPanel />
          </TabsContent>
        </Tabs>
      </div>

      {/* Chat */}
      <div className="flex-1 overflow-hidden">
        <ChatWindow />
      </div>
    </div>
  );
}