"use client";
import { useChat } from "@ai-sdk/react";
import { useAuth } from "@clerk/nextjs";
import { DefaultChatTransport } from "ai";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Bot,
	Send,
	User,
	Loader2,
	Sparkles,
	TriangleAlert,
} from "lucide-react";
import { Spinner } from "./ui/spinner";

export function Chat({ chatId }: { chatId: string }) {
	const [input, setInput] = useState("");
	const { getToken } = useAuth();
	const messagesEndRef = useRef<HTMLDivElement>(null);

	const { messages, sendMessage, status, error } = useChat({
		transport: new DefaultChatTransport({
			api: `${process.env.NEXT_PUBLIC_API_URL}/api/composio/${chatId}/messages`,
			headers: async () => {
				const token = await getToken();
				return { Authorization: `Bearer ${token}` };
			},
		}),
	});

	const isStreaming = status === "streaming" || status === "submitted";

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages, isStreaming]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!input.trim() || isStreaming) return;
		sendMessage({ text: input });
		setInput("");
	};

	return (
		<Card className="flex flex-col h-162.5 w-full max-w-4xl mx-auto shadow-sm border border-border/60">
			<CardHeader className="border-b border-border/40 py-3.5 px-6 flex flex-row items-center justify-between">
				<div className="flex items-center gap-2.5">
					<div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
						<Sparkles className="size-4" />
					</div>
					<div>
						<CardTitle className="text-base font-semibold leading-none">
							AI Assistant
						</CardTitle>
						<p className="text-xs text-muted-foreground mt-1">
							Connected tools agent ready to automate tasks
						</p>
					</div>
				</div>
				<div className="hidden items-center gap-1.5 text-xs text-emerald-600 sm:flex dark:text-emerald-400">
					<span className="size-1.5 rounded-full bg-emerald-500" />
					Ready
				</div>
			</CardHeader>

			<CardContent className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
				{messages.length === 0 ? (
					<div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
						<Bot className="size-12 stroke-[1.5] mb-3 text-muted-foreground/60" />
						<h3 className="font-medium text-foreground text-sm">
							No messages yet
						</h3>
						<p className="text-xs max-w-xs mt-1">
							Connect a tool above and start asking questions or automating
							tasks (e.g. &ldquo;Send an email to john@example.com&rdquo;).
						</p>
					</div>
				) : (
					messages.map((m) => {
						const isUser = m.role === "user";
						return (
							<div
								key={m.id}
								className={`flex gap-3 items-start ${
									isUser ? "flex-row-reverse" : "flex-row"
								}`}>
								<div
									className={`size-8 rounded-full flex items-center justify-center shrink-0 text-xs font-medium ${
										isUser
											? "bg-primary text-primary-foreground"
											: "bg-muted text-muted-foreground border border-border/50"
									}`}>
									{isUser ? (
										<User className="size-4" />
									) : (
										<Bot className="size-4" />
									)}
								</div>

								<div
									className={`rounded-2xl px-4 py-2.5 max-w-[80%] text-sm leading-relaxed ${
										isUser
											? "bg-primary text-primary-foreground"
											: "bg-muted/60 text-foreground border border-border/40"
									}`}>
									{m.parts?.map((part, i) => {
										if (part.type === "text") {
											return (
												<span key={i} className="whitespace-pre-wrap">
													{part.text}
												</span>
											);
										}
										return null;
									})}
								</div>
							</div>
						);
					})
				)}

				{isStreaming && (
					<div className="flex gap-3 items-start">
						<div className="size-8 rounded-full bg-muted text-muted-foreground border border-border/50 flex items-center justify-center shrink-0">
							<Bot className="size-4" />
						</div>
						<div className="rounded-2xl px-4 py-2.5 bg-muted/60 border border-border/40 flex items-center gap-2 text-muted-foreground text-xs">
														<Spinner/>

							<span>Thinking...</span>
						</div>
					</div>
				)}

				{error && (
					<div className="flex items-start gap-2 rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2 text-xs text-destructive">
						<TriangleAlert className="mt-0.5 size-3.5 shrink-0" />
						<span>
							{error.message ||
								"The assistant could not complete that request."}
						</span>
					</div>
				)}

				<div ref={messagesEndRef} />
			</CardContent>

			<CardFooter className="p-3 md:p-4 border-t border-border/40">
				<form onSubmit={handleSubmit} className="flex gap-2 w-full">
					<Input
						value={input}
						onChange={(e) => setInput(e.target.value)}
						placeholder='e.g. "Send an email to alex@example.com with tomorrow meeting notes"'
						className="flex-1 text-sm bg-background"
						disabled={isStreaming}
					/>
					<Button
						type="submit"
						size="default"
						disabled={isStreaming || !input.trim()}>
						{isStreaming ? (
							<Spinner/>
						) : (
							<>
								<Send className="size-4" />
								<span className="sr-only">Send</span>
							</>
						)}
					</Button>
				</form>
			</CardFooter>
		</Card>
	);
}
