"use client";
import { useEffect, useState } from "react";
import { ToolkitList } from "@/components/toolkit-list";
import { Chat } from "@/components/chat";
import { useCreateChat } from "@/hooks/use-toolkits";
import {
	Loader2,
	MessageSquare,
	AlertCircle,
	ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ChatPage() {
	const [chatId, setChatId] = useState<string | null>(null);
	const createChat = useCreateChat();

	const handleStartChat = () => {
		createChat
			.mutateAsync()
			.then((result) => {
				if (result && "chat" in result && result.chat?.id) {
					setChatId(result.chat.id);
				} else {
					console.error("Unexpected createChat shape:", result);
				}
			})
			.catch((err) => {
				console.error("createChat failed:", err);
			});
	};

	useEffect(() => {
		handleStartChat();
	}, []);

	return (
		<div className="min-h-[calc(100vh-4rem)] bg-[radial-gradient(circle_at_top_right,oklch(0.93_0.08_155/.55),transparent_35%),linear-gradient(to_bottom,transparent,oklch(0.97_0.02_95/.45))]">
			<div className="mx-auto max-w-6xl px-4 py-8 md:px-8 lg:py-12">
				<div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
					<div>
						<div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-primary">
							<MessageSquare className="size-3.5" />
							Workspace agent
						</div>
						<h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
							Make work move.
						</h1>
						<p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
							Connect your tools, then ask the assistant to find, update, and
							coordinate work across them.
						</p>
					</div>
					<div className="hidden items-center gap-1 text-xs text-muted-foreground md:flex">
						Securely scoped to your account{" "}
						<ArrowUpRight className="size-3.5" />
					</div>
				</div>

				<div className="grid gap-5 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:items-start">
					<ToolkitList />

					<div>
						{chatId ? (
							<Chat chatId={chatId} />
						) : createChat.isError ? (
							<div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
								<AlertCircle className="mx-auto mb-2 size-8 text-destructive" />
								<p className="mb-3 text-sm font-medium text-destructive">
									Failed to initialize chat session.
								</p>
								<Button variant="outline" size="sm" onClick={handleStartChat}>
									Try Again
								</Button>
							</div>
						) : (
							<div className="flex min-h-[520px] flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-background/50 p-8">
								<Loader2 className="mb-3 size-8 animate-spin text-primary" />
								<p className="text-sm font-medium text-foreground">
									Starting chat session...
								</p>
								<p className="mt-1 text-xs text-muted-foreground">
									Connecting to workspace agent
								</p>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
