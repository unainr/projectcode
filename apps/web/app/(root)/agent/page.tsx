import { ChatWindow } from "@/components/chat-window";
import { ToolkitPanel } from "@/components/toolkit-panel";


/**
 * /agent
 *
 * Left:  ToolkitPanel  — list apps, connect / disconnect
 * Right: ChatWindow    — streaming chat with the agent
 */
export default function AgentPage() {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar — fixed width */}
      <div className="w-72 shrink-0 border-r overflow-y-auto p-4">
        <ToolkitPanel />
      </div>

      {/* Chat — fills remaining space */}
      <div className="flex-1 overflow-hidden">
        <ChatWindow />
      </div>
    </div>
  );
}
