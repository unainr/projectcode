"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { SignInButtonClerk } from "../clerk-sign-button/Sign-in-button";

import { ThemeSwitcher } from "../theme/mode-toggle";
import { MenuIcon, XIcon } from "lucide-react";
import { cn } from "@/lib/utils";


const menuItems = [
	{ name: "Forms", href: "/forms" },
	{ name: "Pricing", href: "/pricing" },
];

export function MainHeader() {
	const [menuOpen, setMenuOpen] = useState(false);
	const pathname = usePathname();

	const isActive = (href: string) =>
		href === "/" ? pathname === "/" : pathname.startsWith(href);

	return (
		<>
			<header className="fixed inset-x-0 top-0 z-50 h-14 border-b border-white/6 bg-background/50 backdrop-blur-xl">
				<div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-4 px-5">
					{/* LEFT — logo + separator + links */}
					<div className="flex h-full items-center">
						<Link
  href="/"
  className="flex items-center gap-2 pr-5 text-xl font-bold tracking-tight"
>
  <span className="text-foreground">Amanises</span>
</Link>

						{/* Separator */}
						<div className="hidden h-5 w-px bg-white/10 lg:block" />

						{/* Desktop links */}
						<ul className="ml-5 hidden h-full items-center lg:flex">
							{menuItems.map((item) => (
								<li key={item.href} className="h-full">
									<Link
										href={item.href}
										className={cn(
											"relative flex h-full items-center px-3.5 text-sm font-medium transition-colors duration-150",
											isActive(item.href)
												? "bg-[#8b0be0] bg-clip-text text-transparent after:absolute after:bottom-0 after:left-3.5 after:right-3.5 after:h-0.5 after:rounded-t after:bg-[#816cf8]"
												: "text-muted-foreground hover:text-foreground",
										)}>
										{item.name}
									</Link>
								</li>
							))}
						</ul>
					</div>

					{/* RIGHT — theme + separator + cta + mobile toggle */}
					<div className="flex items-center gap-2">
						<ThemeSwitcher />

						{/* Separator */}
						<div className="hidden h-5 w-px bg-white/10 lg:block" />

						<div className="hidden items-center gap-2 lg:flex">
							<SignInButtonClerk />
						</div>

						{/* Mobile toggle */}
						<button
							onClick={() => setMenuOpen(!menuOpen)}
							className="flex h-8.5 w-8.5 items-center justify-center rounded-lg border border-white/8 bg-transparent text-muted-foreground transition-colors hover:text-foreground lg:hidden"
							aria-label={menuOpen ? "Close menu" : "Open menu"}>
							{menuOpen ? (
								<XIcon className="size-4.5" />
							) : (
								<MenuIcon className="size-4.5" />
							)}
						</button>
					</div>
				</div>
			</header>

			{/* Mobile drawer */}
			{menuOpen && (
				<div className="fixed inset-x-0 top-14 z-40 border-b border-white/6 bg-background/95 backdrop-blur-xl lg:hidden">
					<nav className="flex flex-col gap-1 p-4">
						{menuItems.map((item) => (
							<Link
								key={item.href}
								href={item.href}
								onClick={() => setMenuOpen(false)}
								className={cn(
									"rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
									isActive(item.href)
										? "bg-[#9900ff] bg-clip-text text-transparent "
										: "text-muted-foreground hover:text-foreground",
								)}>
								{item.name}
							</Link>
						))}
						<div className="mt-3 flex gap-2 border-t border-white/6 pt-3">
							<SignInButtonClerk />
						</div>
					</nav>
				</div>
			)}
		</>
	);
}
