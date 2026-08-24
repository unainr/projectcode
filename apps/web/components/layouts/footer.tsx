// components/marketing/footer.tsx
import Link from "next/link"
import Image from "next/image"

const footerLinks = {
  Product: [
    { label: "Home", href: "/" },
    { label: "Pricing", href: "/pricing" },
  ],
  Legal: [
    { label: "Privacy", href: "#" },
    { label: "Terms", href: "#" },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-6 py-19">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo.svg"
                alt="Seerforge Logo"
                width={800}
                height={800}
                loading="eager"
                className="hidden h-8 w-auto object-contain dark:block"
              />
              <Image
                src="/logo1.svg"
                alt="Seerforge Logo"
                width={800}
                height={800}
                loading="eager"
                className="block h-8 w-auto object-contain dark:hidden"
              />
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Build AI agent workflows your whole team can see, test, and ship together.
            </p>
          </div>

          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{heading}</p>
              <ul className="my-3 space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Seerforge. All rights reserved.
          </p>
          <p className="text-xs  text-muted-foreground">
            Made by <span className="font-medium uppercase text-foreground">Unain</span>
          </p>
        </div>
      </div>
    </footer>
  )
}